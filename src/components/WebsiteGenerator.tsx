'use client';

import { useState, useRef, useEffect } from 'react';

// Deployment refresh: 2025-07-14 20:15 UTC
interface WebsiteGeneratorProps {
  onWebsiteGenerated: (html: string) => void;
}

export const WebsiteGenerator: React.FC<WebsiteGeneratorProps> = ({ onWebsiteGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('no-css');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const generateButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (generateButtonRef.current) {
        const rect = generateButtonRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const button = generateButtonRef.current;
    if (button) {
      button.addEventListener('mousemove', handleMouseMove);
      return () => button.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setProgress('Starting generation...');

    try {
      // Create the full prompt
      const stylePrompt = {
        'no-css': 'no CSS',
        'simple-style': 'simple style',
        'crazy-style': 'crazy style'
      }[selectedStyle];

      const fullPrompt = `Create a complete website: ${prompt}

STYLE REQUIREMENTS:
- Apply ${stylePrompt} styling
${selectedStyle === 'no-css' ? '- Use NO CSS at all, only plain HTML' : '- Include modern CSS styling'}
- Dark theme as default
- Single page design
- Responsive for both mobile and desktop

OUTPUT REQUIREMENTS:
- Return ONLY the HTML code, no explanations
- Complete website in a single HTML file
- Include HTML structure, ${selectedStyle !== 'no-css' ? 'CSS styles, ' : ''}and JavaScript if needed
- Start directly with <!DOCTYPE html>
- End with </html>

Generate the website now:`;

      setProgress('Connecting to AI...');

      // Call OpenRouter directly for GitHub Pages compatibility
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'CodeCraft AI'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat-v3-0324:free',
          messages: [
            {
              role: 'user',
              content: fullPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000,
          stream: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate website');
      }

      setProgress('Analyzing requirements...');

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      let fullResponse = '';
      let hasHtmlStarted = false;
      let hasCssStarted = false;
      let hasJsStarted = false;

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;
          
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                const content = data.choices[0].delta.content;
                fullResponse += content;
                
                // Progressive feedback based on content
                if (!hasHtmlStarted && (content.includes('<!DOCTYPE') || content.includes('<html') || fullResponse.includes('<!DOCTYPE'))) {
                  hasHtmlStarted = true;
                  setProgress('🏗️ Building HTML structure...');
                }
                
                if (!hasCssStarted && hasHtmlStarted && (content.includes('<style') || content.includes('CSS') || fullResponse.includes('<style'))) {
                  hasCssStarted = true;
                  setProgress('🎨 Styling with CSS...');
                }
                
                if (!hasJsStarted && hasCssStarted && (content.includes('<script') || content.includes('JavaScript') || fullResponse.includes('<script'))) {
                  hasJsStarted = true;
                  setProgress('⚡ Adding JavaScript functionality...');
                }
                
                // Generic progress updates
                if (fullResponse.length > 500 && !hasHtmlStarted) {
                  setProgress('📝 Generating content...');
                }
                if (fullResponse.length > 1500 && hasHtmlStarted && !hasCssStarted) {
                  setProgress('🏗️ Structuring components...');
                }
                if (fullResponse.length > 3000 && hasCssStarted && !hasJsStarted) {
                  setProgress('✨ Finalizing styles...');
                }
                if (fullResponse.length > 4000) {
                  setProgress('🚀 Completing website...');
                }
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }

      setProgress('Processing final result...');
      setProgress('Processing final result...');
      
      // Extract HTML content from the full response
      let html = fullResponse;
      
      // Find the start of HTML content
      const htmlStart = fullResponse.indexOf('<!DOCTYPE html>') !== -1 
        ? fullResponse.indexOf('<!DOCTYPE html>')
        : fullResponse.indexOf('<html');
      
      if (htmlStart !== -1) {
        html = fullResponse.substring(htmlStart);
        
        // Find the end of HTML content
        const htmlEnd = html.lastIndexOf('</html>');
        if (htmlEnd !== -1) {
          html = html.substring(0, htmlEnd + 7); // +7 for '</html>'
        }
      }
      
      // Clean up any remaining non-HTML text
      html = html.trim();
      
      if (html) {
        setProgress('Finalizing website...');
        await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for UX
        onWebsiteGenerated(html);
        setPrompt('');
      } else {
        throw new Error('No HTML content received');
      }
    } catch (error) {
      console.error('Error generating website:', error);
      setProgress('Error occurred during generation');
      setTimeout(() => setProgress(''), 3000);
    } finally {
      setIsGenerating(false);
      setProgress('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Clean, modern header */}
      <div className="text-center space-y-4 animate-fade-in-up">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
          CodeCraft AI
        </h1>
        <p className="text-gray-400 text-lg font-light">
          AI Website Generator powered by DeepSeek V3
        </p>
      </div>

      {/* Main glass card */}
      <div className="glass-card rounded-3xl p-8 space-y-8 animate-slide-up-blur">
        
        {/* Description input */}
        <div className="space-y-4">
          <label className="block text-white/90 text-sm font-medium">
            Describe your website
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Create a modern landing page for a tech startup with hero section, features, and contact form..."
            className="glass-input w-full h-32 rounded-2xl px-6 py-4 text-white text-base placeholder-gray-400 resize-none"
            disabled={isGenerating}
          />
        </div>

        {/* Style selection */}
        <div className="space-y-4">
          <label className="block text-white/90 text-sm font-medium">
            Choose your style
          </label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'no-css', label: 'No CSS', desc: 'Faster generation' },
              { id: 'simple-style', label: 'Modern', desc: 'Elegant Design' },
              { id: 'crazy-style', label: 'Creative', desc: 'AKA Crazy style' }
            ].map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`glass-button p-4 rounded-2xl text-center transition-all duration-300 transform active:scale-95 hover:scale-105 ${
                  selectedStyle === style.id
                    ? 'ring-2 ring-white/30 bg-white/20 scale-105'
                    : 'hover:bg-white/10'
                }`}
                disabled={isGenerating}
              >
                <div className="text-white font-medium text-sm">{style.label}</div>
                <div className="text-gray-400 text-xs mt-1">{style.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate button con progress integrato */}
        <button
          ref={generateButtonRef}
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className={`w-full py-4 rounded-2xl font-medium text-base transition-all duration-300 relative overflow-hidden ${
            !prompt.trim() || isGenerating
              ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
              : 'glass-button text-white hover:scale-[1.02]'
          }`}
          style={{
            background: !prompt.trim() || isGenerating 
              ? undefined 
              : `radial-gradient(circle 150px at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 50%, transparent 100%), linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)`
          }}
        >
          <span className="flex items-center justify-center gap-3">
            {isGenerating ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
                {progress || 'Generating your website...'}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Website
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
};
