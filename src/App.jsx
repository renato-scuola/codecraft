import { useState, useEffect } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  CircularProgress, 
  IconButton, 
  InputAdornment, 
  Divider,
  Snackbar,
  Alert,
  useMediaQuery,
  Tooltip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import DownloadIcon from '@mui/icons-material/Download';
import CodeIcon from '@mui/icons-material/Code';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import GitHubIcon from '@mui/icons-material/GitHub';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './App.css';

// Components
import OutputDisplay from './components/OutputDisplay';
import GeneratedSite from './components/GeneratedSite';
import CodeGenerationDialog from './components/CodeGenerationDialog';
import ApiKeyDialog from './components/ApiKeyDialog';

function App() {  
  const [prompt, setPrompt] = useState('');
  const [apiKey, setApiKey] = useState(() => {
    // Cerca prima in localStorage, poi nella variabile d'ambiente
    return localStorage.getItem('openrouter_api_key') || import.meta.env.VITE_OPENROUTER_API_KEY || '';
  });
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('Preparing to generate code...');
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [generationPhase, setGenerationPhase] = useState(0);  
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });  
  const [selectedStyle, setSelectedStyle] = useState('simple'); // 'no-css', 'simple', or 'colorful'
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [isRateLimitExceeded, setIsRateLimitExceeded] = useState(false);
  const [isLocal, setIsLocal] = useState(false);
  const [isAuthError, setIsAuthError] = useState(false);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);
  
  // Detect if we're running locally
  useEffect(() => {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || 
                        hostname === '127.0.0.1' || 
                        hostname.startsWith('192.168.') ||
                        hostname.startsWith('10.') || 
                        hostname.endsWith('.local');
    
    setIsLocal(isLocalhost);
  }, []);
  
  // Verifica se l'API key è presente
  useEffect(() => {
    if (!apiKey) {
      setShowApiKeyDialog(true);
    }
  }, [apiKey]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#bb86fc' : '#6200ee',
      },
      secondary: {
        main: darkMode ? '#03dac6' : '#03dac5',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 28,
            textTransform: 'none',
            fontWeight: 500,
            padding: '10px 24px',
          },
          containedPrimary: {
            boxShadow: darkMode ? '0 4px 10px rgba(187, 134, 252, 0.3)' : '0 4px 10px rgba(98, 0, 238, 0.3)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 12,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
            },
          },
        },
      },
    },
  });
  const handleGenerateCode = async () => {
    if (!prompt.trim()) {
      setNotification({
        open: true,
        message: 'Please enter a prompt before generating',
        severity: 'warning'
      });
      return;
    }
    
    if (!apiKey) {
      setShowApiKeyDialog(true);
      setNotification({
        open: true,
        message: 'Please enter your OpenRouter API Key first',
        severity: 'warning'
      });
      return;
    }// First set the empty code and progress state
    setGeneratedCode('');
    setGenerationProgress('Starting generation...');
    setGenerationPhase(0);
    
    // Then open the dialog
    setShowCodeDialog(true);
    
    // Finally set generating state (this should come after showing the dialog)
    setTimeout(() => {
      setIsGenerating(true);
    }, 100);    try {
      // Prepare the style instructions based on the selected style
      let styleInstructions = '';
      let cssInstruction = 'Create the HTML, CSS and JavaScript code and put it all into one HTML file.';
      
      switch (selectedStyle) {
        case 'no-css':
          styleInstructions = 'Do not use any CSS styling, focus only on functionality. Keep it simple and fast to generate.';
          cssInstruction = 'Create only HTML and JavaScript code and put it all into one HTML file. Do not include any CSS.';
          break;
        case 'simple':
          styleInstructions = 'Use modern CSS for styling and make it visually appealing with a clean, professional design. the least amount of colors and gentle animations';
          break;
        case 'colorful':
          styleInstructions = 'Use vibrant colors, gradients, animations and interactive elements. Make the design colorful, playful and dynamic with bouncy animations.';
          break;
        default:
          styleInstructions = 'Use modern CSS for styling and make it visually appealing with a clean, professional design. the least amount of colors and gentle animations';
      }

      const promptForAI = `Generate HTML code for a site that: ${prompt}.
        ${cssInstruction}
        The code should be just the HTML file content with ${selectedStyle === 'no-css' ? 'JavaScript only, no CSS' : 'inline CSS and JavaScript'}.
        Make sure the code is complete, functional, and well-designed.
        Start the response with <!DOCTYPE html> and include a proper HTML structure. DO NOT explain anything, start with the code
        ${styleInstructions}
        ${selectedStyle !== 'no-css' ? 'Include responsive design so it works on mobile devices too.' : ''}
        Do not include any explanations or markdown formatting in the response, just output the raw HTML code.`;

      setGenerationProgress('Connecting to AI model...');
      
      // Use the specified DeepSeek model
      const selectedModel = "deepseek/deepseek-r1-0528:free";
      
      console.log("Using model:", selectedModel);
      setGenerationProgress('Connecting to DeepSeek AI...');
      
      // Make the API call to OpenRouter with streaming - exact format for DeepSeek
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'CodeCraft AI'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "user", content: promptForAI }
          ],
          stream: true,
          max_tokens: 4000,
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        // Try to get more detailed error information from the response
        let errorDetail = '';
        try {
          const errorJson = await response.json();
          errorDetail = JSON.stringify(errorJson);
          console.error('API Error JSON:', errorJson);
        } catch (e) {
          // If we can't parse JSON, use text
          try {
            errorDetail = await response.text();
            console.error('API Error Text:', errorDetail);
          } catch (e2) {
            errorDetail = 'Could not retrieve error details';
            console.error('Could not retrieve API error details');
          }
        }
        
        // Log the request details for debugging (except API key)
        console.error('Request details:', {
          url: 'https://openrouter.ai/api/v1/chat/completions',
          model: selectedModel,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries([...response.headers].map(h => [h[0], h[1]]))
        });
        
        throw new Error(`API request failed with status: ${response.status}. Details: ${errorDetail}`);
      }
      
      if (!response.body) {
        throw new Error("ReadableStream not supported in this browser.");
      }
      
      // Process the streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulatedCode = '';
      let accumulatedResponse = '';
      
      setGenerationProgress('Receiving code from DeepSeek AI...');
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        
        // Decode the stream chunk
        const chunk = decoder.decode(value, { stream: true });
        
        // Split by lines (SSE format sends data: prefix)
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(5);
            
            // Skip keep-alive and handle completion
            if (data === '[DONE]') {
              continue;
            }
            
            try {
              // Parse the JSON response
              const parsedData = JSON.parse(data);
              
              // Get the token from the response - specific to DeepSeek format via OpenRouter
              // DeepSeek models via OpenRouter use the delta.content format
              const token = parsedData.choices?.[0]?.delta?.content || '';
              
              if (token) {
                // Log first few tokens for debugging
                if (accumulatedResponse.length === 0) {
                  console.log('First token received:', token.substring(0, 100));
                }
                
                // Accumulate response text
                accumulatedResponse += token;
                  // Update progress based on content indicators
                if (accumulatedResponse.includes('<html') && !accumulatedResponse.includes('<style')) {
                  setGenerationProgress('Creating HTML structure...');
                  setGenerationPhase(1);
                } else if (accumulatedResponse.includes('<style') && !accumulatedResponse.includes('</style>')) {
                  setGenerationProgress('Adding CSS styling...');
                  setGenerationPhase(2);
                } else if (accumulatedResponse.includes('</style>') && !accumulatedResponse.includes('<script>')) {
                  setGenerationProgress('Building HTML content...');
                  setGenerationPhase(2);
                } else if (accumulatedResponse.includes('<script>')) {
                  setGenerationProgress('Adding JavaScript functionality...');
                  setGenerationPhase(3);
                }
                
                // Extract actual HTML code from response
                // Here we're assuming that deepseek-coder will return valid HTML
                // If it includes code blocks or explanations, we'd need additional parsing
                if (token.includes('```html') || token.includes('```')) {
                  // Remove markdown code blocks if present
                  accumulatedCode = accumulatedResponse.replace(/```html|```/g, '').trim();
                } else {
                  // Otherwise use the entire response
                  accumulatedCode = accumulatedResponse;
                }
                
                // Durante la generazione, non aggiorniamo l'UI con il codice intermedio
                // Lo mostreremo solo alla fine
              }
            } catch (e) {
              console.error('Error parsing SSE:', e);
            }
          }
        }
      }
      
      // Clean up code if needed (remove markdown indicators if any)
      let cleanedCode = accumulatedCode;
      
      // Remove markdown code blocks if present
      cleanedCode = cleanedCode.replace(/```html|```/g, '').trim();
      
      // Remove any extra text that might appear before <!DOCTYPE html> if present
      const doctypeIndex = cleanedCode.indexOf('<!DOCTYPE html>');
      if (doctypeIndex > 0) {
        cleanedCode = cleanedCode.substring(doctypeIndex);
      }
      
      console.log('Final code starts with:', cleanedCode.substring(0, 100));
      
      // Attendiamo un piccolo delay prima di mostrare il risultato finale
      // per una migliore esperienza utente
      setTimeout(() => {
        setGeneratedCode(cleanedCode);
      }, 800);
      
      // Set generation progress to complete
      setGenerationProgress('Generation complete!');
      
      // Format and clean the final code
      let finalCode = cleanedCode;
      
      // Ensure the code includes proper HTML structure
      if (!finalCode.includes('<!DOCTYPE html>')) {
        // Wrap content in a basic HTML structure if it's not a full HTML document
        if (!finalCode.includes('<html') && !finalCode.includes('<body')) {
          finalCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${prompt}</title>
</head>
<body>
  ${finalCode}
</body>
</html>`;
        }
      }
        setGeneratedCode(finalCode);
      setGenerationPhase(4);
      setNotification({
        open: true,
        message: 'Code generated successfully!',
        severity: 'success'
      });

    } catch (error) {
      console.error('Error generating code:', error);
      setGenerationProgress('Error occurred during generation');
      
      let errorMessage = 'An error occurred while generating code';
      let isRateLimit = false;
      let isAuth = false;
      
      if (error.response) {
        // Axios error format
        errorMessage = error.response.data.error?.message || 'API Error: ' + (error.response.status || 'Unknown');
        isRateLimit = error.response.status === 429 || errorMessage.toLowerCase().includes('rate limit');
        isAuth = error.response.status === 401 || 
                 error.response.status === 403 || 
                 errorMessage.toLowerCase().includes('authentication') ||
                 errorMessage.toLowerCase().includes('unauthorized') ||
                 errorMessage.toLowerCase().includes('permission');
      } else if (error.message) {
        // Native fetch or general error
        errorMessage = error.message;
        
        // Add more details for common errors
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network Error')) {
          errorMessage = 'Network connection error. Please check your internet connection and try again.';
        } else if (
          errorMessage.includes('401') || 
          errorMessage.includes('403') || 
          errorMessage.toLowerCase().includes('auth') || 
          errorMessage.toLowerCase().includes('unauthorized')
        ) {
          errorMessage = 'API authentication error. Please check your API key and try again.';
          isAuth = true;
        } else if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('rate limit')) {
          errorMessage = 'Rate limit exceeded. Please try again later or use a different API key.';
          isRateLimit = true;
        }
      }

      // Handle rate limit errors specifically
      if (isRateLimit) {
        setIsRateLimitExceeded(true);
        setIsAuthError(false);
        setShowApiKeyDialog(true);
      } 
      // Handle authentication errors
      else if (isAuth) {
        setIsAuthError(true);
        setIsRateLimitExceeded(false);
        setShowApiKeyDialog(true);
      }

      setGeneratedCode(''); // Clear any partial code
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      // Set a delay before completing the generation process
      // This ensures the transition is smooth and the UI doesn't jump
      setGenerationProgress('Generation complete!');
      
      setTimeout(() => {
        setIsGenerating(false);
      }, 1000); // Give enough time for the UI to transition
    }
  };

  const handleDownloadCode = () => {
    if (!generatedCode) return;
    
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-site.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setNotification({
      open: true,
      message: 'HTML file downloaded',
      severity: 'info'
    });
  };
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  const handleSaveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('openrouter_api_key', key);
    setShowApiKeyDialog(false);
    // Reset error flags when a new key is provided
    setIsRateLimitExceeded(false);
    setIsAuthError(false);
    setNotification({
      open: true,
      message: 'API Key saved successfully',
      severity: 'success'
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: theme.palette.background.default,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            mb: 2,
          }}
        >
          <Typography
            variant="h5"
            component={motion.h1}
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            sx={{ fontWeight: 700, color: theme.palette.primary.main }}
          >
            CodeCraft AI
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              onClick={() => setDarkMode(!darkMode)}
              aria-label="toggle dark mode"
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <IconButton 
              href="https://github.com/renato-scuola/codecraft" 
              target="_blank" 
              aria-label="CodeCraft GitHub"
            >
              <GitHubIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Container maxWidth="lg">
          <Box 
            component={motion.div}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            sx={{ mb: 4 }}
          >
            <Typography variant="h3" align="center" gutterBottom sx={{ mb: 1 }}>
              Create Web Sites with AI
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 4 }}>
              Describe what you want, and let AI build it for you
            </Typography>
            <Paper 
              elevation={3} 
              component={motion.div}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
              sx={{ 
                p: 4, 
                borderRadius: 4,
                background: theme.palette.background.paper,
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 8px 32px rgba(0, 0, 0, 0.5)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                placeholder="Describe the website you want to create. For example: 'Create a site that adds a hyphen to prompts that I enter'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
                sx={{ mb: 2 }}
              />
              
              {/* Style Selection Section */}
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    mb: 1, 
                    textAlign: 'center',
                    fontWeight: 500, 
                    color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main 
                  }}
                >
                  Style
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  gap: { xs: 1, sm: 2 },
                  flexWrap: 'wrap',
                  mx: 'auto'
                }}>
                  <Button
                    variant={selectedStyle === 'no-css' ? 'contained' : 'outlined'}
                    onClick={() => setSelectedStyle('no-css')}
                    disabled={isGenerating}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      width: { xs: '90px', sm: '120px' }, // Dimensione responsiva
                      height: { xs: '70px', sm: '80px' }, // Dimensione responsiva
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 0.5,
                      p: 1,
                      opacity: selectedStyle === 'no-css' ? 1 : 0.8,
                      border: selectedStyle === 'no-css' ? 'none' : `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box sx={{ 
                      fontSize: { xs: '20px', sm: '24px' },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: selectedStyle === 'no-css' ? '#fff' : theme.palette.text.primary,
                    }}>
                      <span>{'</>'}</span>
                    </Box>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: { xs: '10px', sm: '12px' },
                        textAlign: 'center',
                        lineHeight: 1
                      }}
                    >
                      No CSS
                    </Typography>
                  </Button>
                  
                  <Button
                    variant={selectedStyle === 'simple' ? 'contained' : 'outlined'}
                    onClick={() => setSelectedStyle('simple')}
                    disabled={isGenerating}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      width: { xs: '90px', sm: '120px' }, // Dimensione responsiva
                      height: { xs: '70px', sm: '80px' }, // Dimensione responsiva
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 0.5,
                      p: 1,
                      opacity: selectedStyle === 'simple' ? 1 : 0.8,
                      border: selectedStyle === 'simple' ? 'none' : `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box sx={{ 
                      fontSize: { xs: '20px', sm: '24px' },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: selectedStyle === 'simple' ? '#fff' : theme.palette.text.primary,
                    }}>
                      <span>✨</span>
                    </Box>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: { xs: '10px', sm: '12px' },
                        textAlign: 'center',
                        lineHeight: 1
                      }}
                    >
                      Simple
                    </Typography>
                  </Button>
                  
                  <Button
                    variant={selectedStyle === 'colorful' ? 'contained' : 'outlined'}
                    onClick={() => setSelectedStyle('colorful')}
                    disabled={isGenerating}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      width: { xs: '90px', sm: '120px' }, // Dimensione responsiva
                      height: { xs: '70px', sm: '80px' }, // Dimensione responsiva
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 0.5,
                      p: 1,
                      opacity: selectedStyle === 'colorful' ? 1 : 0.8,
                      border: selectedStyle === 'colorful' ? 'none' : `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box sx={{ 
                      fontSize: { xs: '20px', sm: '24px' },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: selectedStyle === 'colorful' ? '#fff' : theme.palette.text.primary,
                    }}>
                      <span>🎨</span>
                    </Box>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: { xs: '10px', sm: '12px' },
                        textAlign: 'center',
                        lineHeight: 1
                      }}
                    >
                      Colorful
                    </Typography>
                  </Button>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={isGenerating || !prompt.trim()}
                  onClick={handleGenerateCode}
                  startIcon={isGenerating ? <CircularProgress size={20} /> : <CodeIcon />}
                  sx={{ px: 4, py: 1.5 }}
                >
                  {isGenerating ? 'Generating...' : 'Generate Website'}
                </Button>
              </Box>
            </Paper>
          </Box>
            {/* Real-time code generation dialog */}
          <CodeGenerationDialog
            open={showCodeDialog}
            onClose={() => setShowCodeDialog(false)}
            isGenerating={isGenerating}
            generatedCode={generatedCode}
            onCodeChange={(newCode) => setGeneratedCode(newCode)}
            onDownload={handleDownloadCode}
            currentProgress={generationProgress}            generationPhase={generatedCode ? 4 : generationPhase}
          />
        </Container>
      </Box>
        <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* API Key Dialog */}
      <ApiKeyDialog 
        open={showApiKeyDialog} 
        apiKey={apiKey} 
        onSave={handleSaveApiKey} 
        onClose={() => {
          // Only allow closing if we have a key and it's not a forced dialog
          if (apiKey && !isRateLimitExceeded && !isLocal && !isAuthError) {
            setShowApiKeyDialog(false);
          }
        }} 
        isLocal={isLocal}
        isRateLimitExceeded={isRateLimitExceeded}
        isAuthError={isAuthError}
      />
    </ThemeProvider>
  );
}

export default App;