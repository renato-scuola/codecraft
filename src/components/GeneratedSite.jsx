import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

const GeneratedSite = ({ htmlContent, isFullscreen = false }) => {
  const iframeRef = useRef(null);
  
  useEffect(() => {
    // If we don't have an iframe reference yet, don't do anything
    if (!iframeRef.current) return;
    
    try {
      // Set the content of the iframe
      const iframe = iframeRef.current;
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
      
      // Default HTML to show when no content is available yet
      const defaultHtml = `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Generated Website</title>
            <style>
              body { 
                background-color: white; 
                margin: 0; 
                padding: 20px; 
                font-family: Arial, sans-serif;
                color: #333;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div>Preparing your website preview...</div>
          </body>
        </html>`;
      
      // Clear previous content and set proper background
      iframeDocument.open();
      
      // Determine which HTML to use
      const contentToRender = !htmlContent ? defaultHtml : (
        htmlContent.includes('<!DOCTYPE') || htmlContent.includes('<html')
          ? htmlContent // If it's already a complete HTML document, use it as is
          : `<!DOCTYPE html>
              <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Generated Website</title>
                  <style>
                    body { 
                      background-color: white; 
                      margin: 0; 
                      padding: 20px; 
                      font-family: Arial, sans-serif;
                      color: #333;
                    }
                  </style>
                </head>
                <body>${htmlContent}</body>
              </html>`
      );
      
      // Write the HTML content
      iframeDocument.write(contentToRender);
      
      // Close the document
      iframeDocument.close();
      
      // Make sure the iframe is visible with explicit background color
      iframe.style.backgroundColor = 'white';
      
    } catch (error) {
      console.error('Error setting iframe content:', error);
    }
  }, [htmlContent]);
  return (
    <Box 
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="generated-site-container"
      sx={{ 
        width: isFullscreen ? '100vw' : '100%', 
        height: '100%',
        overflow: 'hidden',
        borderRadius: isFullscreen ? 0 : 2,
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        pt: 0,
        pb: 0,
        margin: 0,
        maxWidth: 'none',
      }}
    >      
      <iframe
        ref={iframeRef}
        className="generated-site-iframe"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: isFullscreen ? '0' : '8px',
          backgroundColor: '#ffffff',
          boxShadow: isFullscreen ? 'none' : '0 0 20px rgba(0,0,0,0.05)',
        }}
        title="Generated Website Preview"
        sandbox="allow-scripts allow-forms allow-same-origin"
      />
    </Box>
  );
};

export default GeneratedSite;
