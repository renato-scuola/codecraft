import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Tabs,
  Tab,
  Button,
  DialogActions,
  Typography,
  IconButton,
  CircularProgress,
  Divider,
  useTheme,
  Zoom,
  Fab,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import CodeIcon from '@mui/icons-material/Code';
import { motion, AnimatePresence } from 'framer-motion';

import OutputDisplay from './OutputDisplay';
import GeneratedSite from './GeneratedSite';

const CodeGenerationDialog = ({
  open,
  onClose,
  isGenerating,
  generatedCode,
  onCodeChange,
  onDownload,
  currentProgress,
  generationPhase = 0
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [code, setCode] = useState(generatedCode || '');  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setCode(generatedCode);
  }, [generatedCode]);  // Effect per gestire la progress bar basata sulle fasi di generazione
  useEffect(() => {
    // Calcola il progresso in base alla fase di generazione
    // Fase 0: Inizializzazione (0-20%)
    // Fase 1: HTML Structure (20-40%)
    // Fase 2: CSS Styling (40-60%)
    // Fase 3: JavaScript (60-80%)
    // Fase 4: Completamento (80-100%)
    
    if (isGenerating) {
      if (generationPhase === 0) {
        // Fase iniziale, aumenta gradualmente fino al 20%
        const targetProgress = 20;
        setProgress(oldProgress => {
          if (oldProgress < targetProgress) {
            return oldProgress + 0.5;
          }
          return oldProgress;
        });
      } else if (generationPhase === 1) {
        // HTML Structure, progresso tra 20% e 40%
        setProgress(20 + Math.random() * 20);
      } else if (generationPhase === 2) {
        // CSS Styling, progresso tra 40% e 60%
        setProgress(40 + Math.random() * 20);
      } else if (generationPhase === 3) {
        // JavaScript, progresso tra 60% e 80%
        setProgress(60 + Math.random() * 20);
      }
    } else if (generatedCode) {
      // Generazione completata
      setProgress(100);
    }
  }, [isGenerating, generatedCode, generationPhase]);
  useEffect(() => {
    // Auto-switch to website tab and go fullscreen when generation is complete
    if (!isGenerating && generatedCode) {
      const timer = setTimeout(() => {
        setActiveTab(1);
        setIsFullscreen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isGenerating, generatedCode]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (onCodeChange) {
      onCodeChange(newCode);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Set fullscreen when switching to website tab
    if (newValue === 1 && !isGenerating) {
      setIsFullscreen(true);
    } else {
      setIsFullscreen(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };  return (    <Dialog
      open={open}
      onClose={isGenerating ? undefined : onClose}
      maxWidth={isGenerating ? "md" : "xl"}
      fullWidth
      fullScreen={isFullscreen}
      sx={{
        position: 'fixed',
        zIndex: 1300,
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        },
        '& .MuiDialog-container': {
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          width: isFullscreen ? '100vw' : '100%',
        },
        '& .MuiDialog-paper': {
          margin: isFullscreen ? '0' : '32px'
        },
        ...(isFullscreen && {
          '& .MuiPaper-root': {
            maxWidth: 'none !important',
            width: '100vw !important'
          }
        })
      }}
      PaperProps={{
        sx: {
          borderRadius: isGenerating || !isFullscreen ? 4 : 0,
          minHeight: isGenerating ? '480px' : isFullscreen ? '100vh' : '70vh',
          maxHeight: isGenerating ? '520px' : isFullscreen ? '100vh' : '80vh',
          width: isGenerating ? '500px' : isFullscreen ? '100vw' : 'auto',
          margin: 'auto',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          bgcolor: theme.palette.background.paper,
          boxShadow: theme.shadows[isGenerating ? 24 : 4],
          transform: 'translateY(0)',
          ...(activeTab === 1 && !isGenerating && isFullscreen && {
            margin: 0,
            width: '100vw',
            height: '100vh',
            maxWidth: 'none !important'
          })
        }
      }}      // Rimossi movimenti obsoleti per migliorare le prestazioni
    >      {/* Loading animation for generating state */}      {isGenerating ? (          <div 
            className="loading-dialog-container"
            style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '2rem',
            paddingTop: '1.5rem',
            textAlign: 'center',
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            zIndex: 10
          }}
        >
          <DialogTitle 
            sx={{ 
              fontWeight: 600, 
              fontSize: '1.75rem', 
              pb: 2,
              textAlign: 'center',
              width: '100%',
              paddingX: 0
            }}
          >
            Generating Your Website
          </DialogTitle>
            <Box 
            className="loading-progress"
            sx={{ 
              position: 'relative', 
              mb: 5, 
              mt: 4,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 120,
              width: 120
            }}
          >
            <CircularProgress
              size={90}
              thickness={3.5}
              sx={{
                color: theme.palette.primary.main,
                opacity: 0.9
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CodeIcon 
                sx={{
                  fontSize: '2.5rem',
                  color: theme.palette.primary.main
                }}
              />
            </Box>
          </Box>
          
          <Box 
            className="progress-container"
            sx={{ 
            width: '100%', 
            mx: 'auto', 
            px: 3,
            mb: 4
          }}>
            <Box sx={{ width: '100%' }}>              <Typography 
                variant="h5" 
                className="progress-message"
                sx={{ 
                  py: 4,
                  px: 4,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', 
                  borderRadius: 3,
                  mt: 1,
                  mb: 4,
                  fontFamily: '"Roboto", sans-serif',
                  fontSize: '1.4rem',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
                  lineHeight: 1.5
                }}
              >
                {currentProgress}
              </Typography>
              
              <Box 
                sx={{ 
                  width: '100%',
                  position: 'relative',
                  mb: 1
                }}
              >
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: 14, 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                    borderRadius: 7,
                    overflow: 'hidden'
                  }}
                >
                  <Box 
                    sx={{ 
                      height: '100%', 
                      width: `${progress}%`,
                      bgcolor: theme.palette.primary.main,
                      borderRadius: 7
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </div>
      ) : (
        <>          <DialogTitle
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              py: isFullscreen ? 1.5 : 2,
              px: isFullscreen ? 3 : 3,
              bgcolor: theme.palette.mode === 'dark' 
                ? theme.palette.background.paper 
                : theme.palette.background.paper,
              color: 'inherit',
              boxShadow: isFullscreen ? theme.shadows[1] : 'none',
              zIndex: 10,
              borderBottom: `1px solid ${theme.palette.divider}`,
              height: isFullscreen ? '64px' : 'auto',
              minHeight: '64px',
              '&.MuiDialogTitle-root': {
                padding: isFullscreen ? '0 24px' : '16px 24px',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>              <Typography 
                variant="h6" 
                component="div"
                sx={{ 
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontSize: { xs: '0.85rem', sm: isFullscreen ? '1.1rem' : '1rem' },
                  color: theme.palette.mode === 'dark' ? 
                    theme.palette.primary.light : 
                    theme.palette.primary.main,
                  maxWidth: { xs: '170px', sm: 'auto' },
                  whiteSpace: { xs: 'nowrap', sm: 'normal' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {isFullscreen && activeTab === 1 ? (
                  <>
                    <CodeIcon fontSize="small" />
                    Generated Website
                  </>
                ) : (
                  <>
                    <CodeIcon fontSize="small" />
                    Generated Code
                  </>
                )}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>              {activeTab === 1 && !isGenerating && (
                <Tooltip title="Download HTML">
                  <IconButton 
                    color="primary" 
                    onClick={onDownload} 
                    aria-label="download"
                    size="medium"
                    sx={{ 
                      ml: 1,
                      borderRadius: '12px',
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(187, 134, 252, 0.08)' : 'rgba(98, 0, 238, 0.05)',
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(187, 134, 252, 0.15)' : 'rgba(98, 0, 238, 0.1)'
                      }
                    }}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {!isGenerating && activeTab === 1 && (
                <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                  <IconButton 
                    color="primary"
                    onClick={toggleFullscreen} 
                    aria-label="toggle fullscreen"
                    size="medium"
                    sx={{ 
                      ml: 1,
                      borderRadius: '12px',
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(187, 134, 252, 0.08)' : 'rgba(98, 0, 238, 0.05)',
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(187, 134, 252, 0.15)' : 'rgba(98, 0, 238, 0.1)'
                      }
                    }}
                  >
                    {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              )}              <Tooltip title="Close and Reload">
                <IconButton 
                  edge="end" 
                  color="primary" 
                  onClick={() => {
                    onClose(); // First close the dialog
                    window.location.reload(); // Then reload the page
                  }}
                  aria-label="close"
                  size="medium"
                  sx={{ 
                    ml: 1,
                    borderRadius: '12px',
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(187, 134, 252, 0.08)' : 'rgba(98, 0, 238, 0.05)',
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(187, 134, 252, 0.15)' : 'rgba(98, 0, 238, 0.1)'
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </DialogTitle>

          <Divider />
        </>
      )}      {!isGenerating && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: theme.palette.primary.main,
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.95rem',
                padding: '12px 16px',
                transition: 'all 0.3s ease',
                opacity: 0.7,
                '&.Mui-selected': {
                  opacity: 1,
                  fontWeight: 600
                }
              }
            }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EditIcon sx={{ mr: 1 }} />
                  <Typography>Code</Typography>
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PlayArrowIcon sx={{ mr: 1 }} />
                  <Typography>Website</Typography>
                </Box>
              }
              disabled={isGenerating || !generatedCode}
            />
          </Tabs>
        </Box>
      )}      <DialogContent 
        sx={{ 
          flex: 1, 
          p: 0, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: activeTab === 1 ? '#ffffff' : theme.palette.background.paper,
          width: isFullscreen && activeTab === 1 ? '100vw' : '100%',
          height: isFullscreen && activeTab === 1 ? 'calc(100vh - 64px)' : '100%',
          maxWidth: '100%'
        }}
      >
        {/* Rimosso AnimatePresence per migliorare le prestazioni */}
          {activeTab === 0 ? (
            <Box
              key="code-tab"
              sx={{                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                height: '100%',
                p: 0
              }}
            >
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <OutputDisplay 
                  code={code} 
                  editable={!isGenerating}
                  onCodeChange={handleCodeChange} 
                />
              </Box>
            </Box>
          ) : (
              <Box
                key="website-tab"
              sx={{ 
                flex: 1, 
                height: '100%',
                width: '100%',
                overflow: 'hidden',
                display: 'flex',
                bgcolor: '#ffffff',
                borderRadius: 0,
                p: 0,
                m: 0,                position: 'absolute',
                top: '64px',
                left: 0,
                right: 0,
                bottom: 0
              }}
            >
              <Box
                sx={{
                  width: isFullscreen ? '100vw' : '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'flex-start',
                  overflow: 'hidden',
                  maxWidth: 'none'
                }}
              >
                <GeneratedSite 
                  htmlContent={code} 
                  isFullscreen={isFullscreen} 
                />
              </Box>
            </Box>
          )}
      </DialogContent>
        {!isFullscreen && <Divider />}      {!isFullscreen && !isGenerating && (
        <DialogActions className="dialog-actions" sx={{ p: { xs: 1.5, sm: 2 }, gap: { xs: 1, sm: 1 } }}>
          <Button 
            variant="outlined"
            size="medium"
            fullWidth
            onClick={() => {
              onClose(); // Close the dialog
              window.location.reload(); // Reload the page
            }}
            sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
          >
            Close & Reload
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            fullWidth
            startIcon={<DownloadIcon />}
            onClick={onDownload}
            disabled={!code}
            sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
          >
            Download HTML
          </Button>
        </DialogActions>
      )}{/* No floating action buttons in fullscreen mode as per requirement */}
      {/* We now handle all actions in the top toolbar when in fullscreen mode */}
    </Dialog>
  );
};

export default CodeGenerationDialog;
