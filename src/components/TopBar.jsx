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
        borderBottom: '2px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {currentUser?.role === 'admin' && (
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={() => navigate('/settings')}
          sx={{ mr: 1 }}
        >
          Настройки
        </Button>
      )}
      <Button 
        variant="outlined" 
        color="error" 
        onClick={handleLogoutClick}
      >
        Выйти
      </Button>
    </Box>
  );
}
