import React, { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function TopBar({ onLogout }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await api.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error('Ошибка при загрузке пользователя:', err);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        p: 2,
        borderBottom: '2px solid',
        borderColor: 'primary.main',
        bgcolor: 'background.paper',
        boxShadow: 'none',
      }}
    >
      {currentUser?.role === 'admin' && (
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => navigate('/settings')}
          sx={{ 
            mr: 2,
            borderRadius: 0,
            textTransform: 'uppercase',
            fontWeight: 500,
            letterSpacing: '0.08em',
            fontSize: '0.75rem',
            padding: '8px 16px',
          }}
        >
          Настройки
        </Button>
      )}
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleLogoutClick}
        sx={{
          borderRadius: 0,
          textTransform: 'uppercase',
          fontWeight: 500,
          letterSpacing: '0.08em',
          fontSize: '0.75rem',
          padding: '8px 16px',
        }}
      >
        Выйти
      </Button>
    </Box>
  );
}
