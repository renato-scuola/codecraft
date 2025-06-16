import { useState, useEffect } from 'react';
import { Box, useTheme, TextField } from '@mui/material';
import { motion } from 'framer-motion';

// A code display/editing component with basic syntax highlighting
const OutputDisplay = ({ code, editable = true, onCodeChange }) => {
  const theme = useTheme();
  const [codeValue, setCodeValue] = useState(code || '');
  
  useEffect(() => {
    if (code !== undefined) {
      setCodeValue(code);
    }
  }, [code]);
  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCodeValue(newCode);
    if (onCodeChange) {
      onCodeChange(newCode);
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      sx={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        borderRadius: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#282c34' : '#f5f7fa',
        position: 'relative',
      }}
    >
      <TextField
        multiline
        fullWidth
        value={codeValue}
        onChange={handleCodeChange}
        variant="outlined"
        disabled={!editable}
        InputProps={{
          sx: {
            fontFamily: '"Consolas", monospace',
            fontSize: '0.875rem',
            padding: 0,
            height: '100%',
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            color: theme.palette.mode === 'dark' ? '#abb2bf' : '#383a42',
          }
        }}
        sx={{
          height: '100%',
          '& .MuiInputBase-root': {
            height: '100%',
          },
          '& .MuiInputBase-input': {
            height: '100% !important',
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.mode === 'dark' ? '#555' : '#ccc',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },
          }
        }}
      />
    </Box>
  );
};

export default OutputDisplay;
