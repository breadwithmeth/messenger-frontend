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
        p: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      {currentUser?.role === 'admin' && (
        <Button 
          variant="text" 
          color="primary" 
          onClick={() => navigate('/settings')}
          sx={{ 
            mr: 1,
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: 'rgba(0, 122, 255, 0.04)',
            }
          }}
        >
          Настройки
        </Button>
      )}
      <Button 
        variant="outlined" 
        color="error" 
        onClick={handleLogoutClick}
        sx={{
          borderRadius: '20px',
          textTransform: 'none',
          fontWeight: 500,
          borderWidth: '1px',
          '&:hover': {
            backgroundColor: 'rgba(244, 67, 54, 0.04)',
            borderWidth: '1px',
          }
        }}
      >
        Выйти
      </Button>
    </Box>
  );
}
