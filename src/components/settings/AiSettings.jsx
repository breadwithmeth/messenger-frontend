import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useNotification } from '../../context/NotificationContext';

export default function AiSettings() {
  const [context, setContext] = useState('');
  const { showNotification } = useNotification();

  useEffect(() => {
    const savedContext = localStorage.getItem('aiContext');
    if (savedContext) {
      setContext(savedContext);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('aiContext', context);
    showNotification('Контекст AI сохранен!', 'success');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Настройки AI-помощника
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Этот контекст будет использоваться AI для генерации ответов, чтобы они лучше соответствовали вашей манере общения. Вы можете указать здесь информацию о себе, вашей компании или специфике общения.
      </Typography>
      <TextField
        label="Контекст для AI"
        multiline
        rows={6}
        fullWidth
        value={context}
        onChange={(e) => setContext(e.target.value)}
        variant="outlined"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        sx={{ mt: 2 }}
      >
        Сохранить контекст
      </Button>
    </Box>
  );
}
