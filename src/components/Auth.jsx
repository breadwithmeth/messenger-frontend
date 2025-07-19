// whatsapp-frontend/src/components/Auth.js
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress
} from '@mui/material';
import api from '../api';

function Auth({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(email, password);
      localStorage.setItem('jwtToken', data.token);
      // Сохраняем пользователя в localStorage для фильтрации чатов
      if (data.user) {
        localStorage.setItem('currentUser', JSON.stringify(data.user));
      }
      onLoginSuccess();
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || 'Произошла ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          borderRadius: 0,
          boxShadow: 'none',
          border: '2px solid',
          borderColor: 'primary.main'
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom align="center" fontWeight="500" color="text.primary"
          sx={{ 
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontSize: '1.25rem'
          }}
        >
          Вход в систему
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            margin="normal"
            variant="outlined"
          />
          
          <TextField
            fullWidth
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            margin="normal"
            variant="outlined"
          />

          {error && (
            <Typography color="error" align="center" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ 
              mt: 3,
              borderRadius: 0,
              textTransform: 'uppercase',
              fontSize: '0.875rem',
              fontWeight: 500,
              letterSpacing: '0.08em',
              boxShadow: 'none',
              padding: '12px 24px',
              '&:hover': {
                boxShadow: 'none',
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Войти'
            )}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default Auth;