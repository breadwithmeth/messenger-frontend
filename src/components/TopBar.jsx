import React, { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function TopBar({ onLogout, selectedChat, onChatUpdated }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);

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

  const handleTakeChat = async () => {
    if (!selectedChat || !currentUser || isAssigning) return;
    
    setIsAssigning(true);
    try {
      await api.takeChat(selectedChat.id);
      console.log('Чат успешно назначен на текущего пользователя');
      // Вызываем callback для обновления чатов
      if (onChatUpdated) {
        onChatUpdated();
      }
    } catch (error) {
      console.error('Ошибка при назначении чата:', error);
      alert('Ошибка при назначении чата: ' + (error.message || 'Неизвестная ошибка'));
    } finally {
      setIsAssigning(false);
    }
  };

  const handleReleaseChat = async () => {
    if (!selectedChat || !currentUser || isAssigning) return;
    
    setIsAssigning(true);
    try {
      await api.unassignChat(selectedChat.id);
      console.log('Чат успешно отпущен');
      // Вызываем callback для обновления чатов
      if (onChatUpdated) {
        onChatUpdated();
      }
    } catch (error) {
      console.error('Ошибка при отпускании чата:', error);
      alert('Ошибка при отпускании чата: ' + (error.message || 'Неизвестная ошибка'));
    } finally {
      setIsAssigning(false);
    }
  };

  // Функция для проверки, может ли текущий пользователь писать в чат
  const canWriteToChat = (chat, user) => {
    if (!chat || !user) return false;
    if (!chat.assignedUser) return true;
    return chat.assignedUser.id === user.id;
  };

  // Показываем кнопку "Забрать чат" если:
  // 1. Чат свободен (assignedUser === null)
  // 2. Чат назначен на другого пользователя
  const shouldShowTakeChatButton = selectedChat && currentUser && (
    !selectedChat.assignedUser || // чат свободен
    (selectedChat.assignedUser && selectedChat.assignedUser.id !== currentUser.id) // назначен на другого
  );
  
  // Показываем кнопку "Отпустить чат" только если чат назначен на текущего пользователя
  const shouldShowReleaseChatButton = selectedChat && currentUser && 
    selectedChat.assignedUser && selectedChat.assignedUser.id === currentUser.id;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        borderBottom: '2px solid',
        borderColor: 'primary.main',
        bgcolor: 'background.paper',
        boxShadow: 'none',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {shouldShowTakeChatButton && (
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={handleTakeChat}
            disabled={isAssigning}
            sx={{ 
              borderRadius: 0,
              textTransform: 'uppercase',
              fontWeight: 500,
              letterSpacing: '0.08em',
              fontSize: '0.875rem',
              padding: '8px 16px',
              lineHeight: 1.4,
            }}
          >
            {isAssigning ? 'Назначение...' : 'Забрать чат'}
          </Button>
        )}
        
        {shouldShowReleaseChatButton && (
          <Button 
            variant="outlined" 
            color="warning" 
            onClick={handleReleaseChat}
            disabled={isAssigning}
            sx={{ 
              borderRadius: 0,
              textTransform: 'uppercase',
              fontWeight: 500,
              letterSpacing: '0.08em',
              fontSize: '0.875rem',
              padding: '8px 16px',
              lineHeight: 1.4,
            }}
          >
            {isAssigning ? 'Отпускание...' : 'Отпустить чат'}
          </Button>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {currentUser?.role === 'admin' && (
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => navigate('/settings')}
            sx={{ 
              borderRadius: 0,
              textTransform: 'uppercase',
              fontWeight: 500,
              letterSpacing: '0.08em',
              fontSize: '0.875rem',
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
            fontSize: '0.875rem',
            padding: '8px 16px',
            lineHeight: 1.4,
          }}
        >
          Выйти
        </Button>
      </Box>
    </Box>
  );
}
