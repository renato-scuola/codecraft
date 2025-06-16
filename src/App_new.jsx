import React, { useState, useEffect } from 'react';
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
  IconButton
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import './App.css';

function App() {
  // State for dark mode
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Create theme based on dark mode
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
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: theme.palette.background.default,
          color: theme.palette.text.primary,
          p: 3
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 4
            }}
          >
            <Typography variant="h4" component="h1" fontWeight="bold">
              CodeCraft AI
            </Typography>
            <IconButton onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>

          {/* Main content */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h2" component="h2" gutterBottom>
              Create Web Sites with AI
            </Typography>
            <Typography variant="h5" color="text.secondary" paragraph>
              Describe what you want, and let AI build it for you
            </Typography>
          </Box>

          {/* Input section */}
          <Paper 
            elevation={3}
            sx={{ 
              p: 3, 
              borderRadius: 2, 
              bgcolor: theme.palette.background.paper 
            }}
          >
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Describe the website you want to create..."
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                color="primary"
                size="large"
              >
                Generate Website
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
