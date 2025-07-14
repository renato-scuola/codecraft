'use client';

import { useState } from 'react';

interface WebsitePreviewProps {
  html: string;
  onClose: () => void;
  onHtmlUpdate: (newHtml: string) => void;
}

export const WebsitePreview: React.FC<WebsitePreviewProps> = ({ html, onClose, onHtmlUpdate }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentMode, setCurrentMode] = useState<'preview' | 'edit'>('preview');
  const [editedHtml, setEditedHtml] = useState(html);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditingWithAI, setIsEditingWithAI] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [pendingMode, setPendingMode] = useState<'preview' | 'edit' | null>(null);
  const [aiResponse, setAiResponse] = useState('');

  const handleDownload = () => {
    setIsDownloading(true);
    
    const blob = new Blob([editedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codecraft-website-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setTimeout(() => setIsDownloading(false), 1000);
  };

  const handleModeSwitch = (mode: 'preview' | 'edit') => {
    if (currentMode === 'edit' && mode === 'preview' && hasUnsavedChanges) {
      setPendingMode(mode);
      setShowSaveModal(true);
    } else {
      setCurrentMode(mode);
    }
  };

  const handleCodeChange = (newCode: string) => {
    setEditedHtml(newCode);
    setHasUnsavedChanges(newCode !== html);
  };

  const handleAIEdit = async () => {
    if (!editPrompt.trim()) return;

    setIsEditingWithAI(true);
    setAiResponse('');

    try {
      const aiPrompt = `You are an expert web developer. Here is the current HTML code:

${editedHtml}

USER REQUEST: ${editPrompt}

INSTRUCTIONS:
- Modify the existing HTML code based on the user's request
- Maintain the overall structure and functionality
- Keep the same styling approach and responsive design
- If the user explicitly requests a specific theme/color scheme (light, bright, colorful, etc.), apply that theme instead of the default dark theme
- If no specific theme is mentioned, maintain the current theme
- Return ONLY the modified HTML code, no explanations
- Start directly with <!DOCTYPE html> and end with </html>

Generate the updated website code:`;

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to edit website');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let fullResponse = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        
        // Prova a parsare ogni chunk per vedere se è un messaggio completo
        try {
          const lines = fullResponse.split('\n').filter(line => line.trim());
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              
              if (data.type === 'explanation') {
                // Mostra la spiegazione dell'AI in tempo reale
                setAiResponse(data.content);
              } else if (data.type === 'html') {
                // Ricevuto l'HTML finale
                setEditedHtml(data.html);
                onHtmlUpdate(data.html);
                setHasUnsavedChanges(false);
                setEditPrompt('');
                setAiResponse('');
                
                setTimeout(() => {
                  setCurrentMode('preview');
                }, 600);
                return; // Esci dal loop
              }
            } catch (_e) {
              // Chunk non completo, continua
            }
          }
        } catch (_e) {
          // Fallback: prova il metodo originale se il nuovo formato fallisce
          if (fullResponse.includes('{"html"')) {
            try {
              const data = JSON.parse(fullResponse);
              if (data.html) {
                setEditedHtml(data.html);
                onHtmlUpdate(data.html);
                setHasUnsavedChanges(false);
                setEditPrompt('');
                setAiResponse('');
                
                setTimeout(() => {
                  setCurrentMode('preview');
                }, 600);
                return;
              }
            } catch (_parseError) {
              // Continua se non riesce a parsare
            }
          }
        }
      }
    } catch (error) {
      console.error('Error editing website:', error);
      setAiResponse('Error occurred while editing the website. Please try again.');
      setTimeout(() => {
        setAiResponse('');
      }, 3000);
    } finally {
      setIsEditingWithAI(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg animate-fade-in-up">
      {/* Clean modern toolbar */}
      <div className="glass-card border-b border-white/10 m-2 rounded-t-2xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="hidden md:block h-4 w-px bg-white/20"></div>
            
            {/* Mode Switcher */}
            <div className="flex items-center bg-black/30 rounded-xl p-1">
              <button
                onClick={() => handleModeSwitch('preview')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentMode === 'preview'
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="hidden sm:inline">Preview</span>
                </div>
              </button>
              <button
                onClick={() => handleModeSwitch('edit')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentMode === 'edit'
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="hidden sm:inline">Edit</span>
                </div>
              </button>
            </div>
            
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-orange-200 text-xs font-medium">Unsaved changes</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`glass-button flex items-center justify-center gap-2 px-4 py-2 h-10 rounded-xl text-sm font-medium transition-all ${
                isDownloading ? 'opacity-50 cursor-not-allowed' : 'text-white'
              }`}
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                  <span className="hidden sm:inline">Downloading...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline">Download HTML</span>
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              className="glass-button flex items-center justify-center gap-2 px-4 py-2 h-10 text-white rounded-xl text-sm font-medium transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="h-[calc(100vh-104px)] m-2 mt-0">
        <div className="h-full glass-card rounded-b-2xl overflow-hidden border border-white/10">
          {currentMode === 'preview' ? (
            /* Preview Mode */
            <div className="w-full h-full bg-black/30 backdrop-blur-sm p-3">
              <div className="w-full h-full bg-black/40 rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                <iframe
                  srcDoc={editedHtml}
                  title="Generated Website"
                  className="w-full h-full border-0 bg-white rounded-xl"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <div className="w-full h-full flex flex-col bg-black/20 backdrop-blur-sm">
              {/* Code Editor */}
              <div className="flex-1 p-4">
                <div className="h-full bg-black/40 rounded-xl border border-white/10 overflow-hidden relative">
                  <div className="h-8 bg-black/50 border-b border-white/10 flex items-center px-4">
                    <span className="text-white/70 text-xs font-medium">HTML Code</span>
                    {isEditingWithAI && (
                      <div className="ml-auto flex items-center gap-2 text-blue-400">
                        <div className="animate-spin h-3 w-3 border border-blue-400/30 border-t-blue-400 rounded-full"></div>
                        <span className="text-xs">AI Editing...</span>
                      </div>
                    )}
                  </div>
                  
                  {/* iOS 26 Glassmorphism Overlay */}
                  {isEditingWithAI && (
                    <div className="absolute inset-0 top-8 z-20 bg-black/30 backdrop-blur-xl flex items-center justify-center animate-ai-blur-in">
                      <div className="glass-card rounded-3xl p-6 flex flex-col gap-4 max-w-2xl mx-4 border border-white/20 shadow-2xl max-h-[70%] overflow-hidden">
                        {/* Header with AI status */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                              <div className="absolute inset-1 w-6 h-6 border border-blue-400/40 border-b-blue-400 rounded-full animate-spin" 
                                   style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                            </div>
                            <div>
                              <div className="text-white font-semibold">AI Assistant</div>
                              <div className="text-blue-400 text-xs">Processing your request...</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-blue-400 text-xs">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                            <span>Live response</span>
                          </div>
                        </div>
                        
                        {/* AI Response in tempo reale */}
                        <div className="flex-1 overflow-y-auto">
                          {aiResponse ? (
                            <div className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                              {aiResponse}
                              <span className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-pulse"></span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-32">
                              <div className="text-white/60 text-sm">Waiting for AI response...</div>
                            </div>
                          )}
                        </div>
                        
                        {/* Footer */}
                        <div className="border-t border-white/10 pt-3">
                          <div className="text-white/50 text-xs text-center">
                            The AI will automatically save and show the preview when ready
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <textarea
                    value={editedHtml}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    className={`w-full h-[calc(100%-2rem)] bg-transparent text-white p-4 text-sm font-mono resize-none border-0 outline-none transition-all duration-500 ${
                      isEditingWithAI ? 'blur-sm opacity-30 pointer-events-none' : 'blur-0 opacity-100'
                    }`}
                    placeholder="HTML code will appear here..."
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* AI Edit Panel */}
              <div className="p-4 border-t border-white/10 bg-black/30">
                <div className="glass-card rounded-2xl p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-white font-medium">AI Assistant</span>
                  </div>
                  
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="Describe what you want to change (e.g., 'Change the header color to blue')"
                      className="flex-1 glass-input rounded-xl px-4 py-3 text-white text-sm placeholder-gray-400"
                      disabled={isEditingWithAI}
                      onKeyDown={(e) => e.key === 'Enter' && !isEditingWithAI && handleAIEdit()}
                    />
                    
                    <button
                      onClick={handleAIEdit}
                      disabled={!editPrompt.trim() || isEditingWithAI}
                      className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                        !editPrompt.trim() || isEditingWithAI
                          ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                          : 'glass-button text-white hover:scale-105'
                      }`}
                    >
                      {isEditingWithAI ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                          <span>Editing...</span>
                        </div>
                      ) : (
                        'Ask to Edit'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Save Changes Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 max-w-md w-full border border-white/20 shadow-2xl animate-scale-up">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Unsaved Changes</h3>
                <p className="text-white/70 text-sm">
                  You have unsaved changes to the HTML code. What would you like to do?
                </p>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowSaveModal(false);
                    // Continue with the original action without saving
                    if (pendingMode) {
                      setCurrentMode(pendingMode);
                      setPendingMode(null);
                      setHasUnsavedChanges(false);
                    }
                  }}
                  className="flex-1 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 rounded-xl text-sm font-medium transition-all"
                >
                  Discard Changes
                </button>
                
                <button
                  onClick={() => {
                    setShowSaveModal(false);
                    // Save changes and continue
                    onHtmlUpdate(editedHtml);
                    setHasUnsavedChanges(false);
                    if (pendingMode) {
                      setCurrentMode(pendingMode);
                      setPendingMode(null);
                    }
                  }}
                  className="flex-1 px-4 py-2.5 glass-button text-white rounded-xl text-sm font-medium transition-all"
                >
                  Save & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
