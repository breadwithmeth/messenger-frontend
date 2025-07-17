import React, { useState, useEffect } from 'react';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { VolumeUp, VolumeOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function TopBar({ onLogout, audioControls }) {
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
      {/* Кнопка управления звуковыми уведомлениями */}
      {audioControls && (
        <Tooltip title={audioControls.isAudioEnabled ? 'Отключить звук' : 'Включить звук'}>
          <IconButton
            onClick={audioControls.enableAudio}
            sx={{
              color: audioControls.isAudioEnabled ? '#FF0000' : '#666666',
              borderRadius: 0, // Swiss Style
              border: '1px solid',
              borderColor: audioControls.isAudioEnabled ? '#FF0000' : '#666666',
              width: 36,
              height: 36,
              mr: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 0, 0, 0.04)',
                borderColor: '#FF0000',
                color: '#FF0000',
              }
            }}
          >
            {audioControls.isAudioEnabled ? <VolumeUp fontSize="small" /> : <VolumeOff fontSize="small" />}
          </IconButton>
        </Tooltip>
      )}

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
            fontSize: '0.875rem', /* Увеличено для лучшей читаемости */
            padding: '8px 16px',
            lineHeight: 1.4,
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
          fontSize: '0.875rem', /* Увеличено для лучшей читаемости */
          padding: '8px 16px',
          lineHeight: 1.4,
        }}
      >
        Выйти
      </Button>
    </Box>
  );
}
