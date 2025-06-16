import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import { motion } from 'framer-motion';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const ApiKeyDialog = ({ 
  open, 
  apiKey, 
  onSave, 
  onClose, 
  isLocal = false, 
  isRateLimitExceeded = false,
  isAuthError = false
}) => {
  const [key, setKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!key.trim()) {
      setError('Please enter a valid API key');
      return;
    }
    
    // Simple validation to check if the key looks like a token
    if (!key.match(/^[a-zA-Z0-9_-]{10,}$/)) {
      setError('This doesn\'t look like a valid API key format');
      return;
    }

    onSave(key);
  };

  const handleClose = () => {
    // Only allow closing if not in forced modes and if we have an existing API key
    if (apiKey && !isLocal && !isRateLimitExceeded && !isAuthError) {
      onClose();
    }
  };

  // Determine what message to show based on the scenario
  const getMessage = () => {
    if (isRateLimitExceeded) {
      return (
        <>
          <Typography variant="body1" color="error" paragraph fontWeight="bold">
            Rate limit exceeded!
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Your current API key has exceeded its rate limit. Please enter a different OpenRouter API key with access to the DeepSeek Coder model to continue.
          </Typography>
        </>
      );
    } else if (isAuthError) {
      return (
        <>
          <Typography variant="body1" color="error" paragraph fontWeight="bold">
            Authentication error!
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Your API key appears to be invalid or has expired. Please enter a valid OpenRouter API key with access to the DeepSeek Coder model.
          </Typography>
        </>
      );
    } else if (isLocal) {
      return (
        <Typography variant="body2" color="text.secondary" paragraph>
          You're running this app locally. Please enter your OpenRouter API key to use the DeepSeek Coder model.
        </Typography>
      );
    } else {
      return (
        <>
          <Typography variant="body2" color="text.secondary" paragraph>
            To use this tool, you need an OpenRouter API key that has access to the DeepSeek Coder model.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            If you don't have an API key yet, you can{' '}
            <Link 
              href="https://openrouter.ai/keys" 
              target="_blank" 
              rel="noopener"
            >
              create one on OpenRouter.ai
            </Link>
          </Typography>
        </>
      );
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperComponent={motion.div}
      PaperProps={{
        initial: { y: 50, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        transition: { type: 'spring', stiffness: 300, damping: 30 }
      }}
      // Prevent closing by escape key or clicking outside when forced open
      disableEscapeKeyDown={isLocal || isRateLimitExceeded || isAuthError}
      disableBackdropClick={isLocal || isRateLimitExceeded || isAuthError}
    >
      <DialogTitle>
        {isRateLimitExceeded ? "API Rate Limit Exceeded" : 
         isAuthError ? "API Authentication Error" : "OpenRouter API Key"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          {getMessage()}
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        
        <TextField
          autoFocus
          margin="dense"
          id="api-key"
          label="OpenRouter API Key"
          type={showKey ? 'text' : 'password'}
          fullWidth
          variant="outlined"
          value={key}
          onChange={(e) => {
            setKey(e.target.value);
            setError('');
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle key visibility"
                  onClick={() => setShowKey(!showKey)}
                  edge="end"
                >
                  {showKey ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        {apiKey && !isLocal && !isRateLimitExceeded && !isAuthError && (
          <Button onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button 
          variant="contained" 
          onClick={handleSave}
          color="primary"
        >
          Save API Key
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApiKeyDialog;
