import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';

const storageKey = 'gemini_api_key';

export default function ApiKeys() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const storedKey = localStorage.getItem(storageKey);
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(storageKey, apiKey);
    setSnackbar({ open: true, message: 'API ключ сохранен!', severity: 'success' });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6">API Ключи</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Укажите ваш API ключ для доступа к функциям на базе Gemini. Ключ хранится локально в вашем браузере и никуда не передается, кроме как для прямого запроса к Google AI.
        </Typography>
        <Box component="form" noValidate autoComplete="off" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            label="Gemini API Key"
            variant="outlined"
            fullWidth
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    onClick={() => setShowApiKey(!showApiKey)}
                    onMouseDown={(e) => e.preventDefault()}
                    size="small"
                    variant="text"
                  >
                    {showApiKey ? 'Скрыть' : 'Показать'}
                  </Button>
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" onClick={handleSave}>
            Сохранить
          </Button>
        </Box>
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
