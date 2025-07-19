import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider
} from "@mui/material";
import UserAvatar from "./UserAvatar";

function ChatSidebar({ chats, selectedChat, onSelect }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    window.location.reload();
  };

  // Вычисляем общее количество непрочитанных сообщений
  const totalUnreadMessages = chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);

  // Сортируем чаты по времени от новых к старым
  const sortedChats = [...chats].sort((a, b) => {
    // Сортируем по времени последнего сообщения (от новых к старым)
    const getTime = chat => {
      const timestamp = chat.lastMessage?.timestamp || chat.lastMessageAt || chat.createdAt;
      return timestamp ? new Date(timestamp).getTime() : 0;
    };
    return getTime(b) - getTime(a);
  });

  return (
    <Paper
      elevation={0}
      square
      sx={{
        width: 320,
        height: '100vh',
        borderRight: 2,
        borderColor: 'primary.main',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        bgcolor: 'background.paper',
        position: 'sticky',
        top: 0,
      }}
    >
      <Box
        sx={{
          p: 3,
          borderBottom: 2,
          borderColor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '64px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>        <Typography 
          variant="h6" 
          fontWeight="600"
          sx={{
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '1.1rem',
            color: '#212121',
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
          }}
        >
          Чаты
        </Typography>
          {totalUnreadMessages > 0 && (
            <Box
              sx={{
                minWidth: 20,
                height: 20,
                backgroundColor: '#FF0000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: totalUnreadMessages > 9 ? 0.5 : 0,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: '#FFFFFF',
                  fontSize: '0.6rem',
                  fontWeight: 'bold',
                  lineHeight: 1,
                }}
              >
                {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
              </Typography>
            </Box>
          )}
        </Box>
        {/* <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={() => navigate("/settings")}
              size="small"
              color="inherit"
              variant="text"
            >
              Настройки
            </Button>
            <Button
              onClick={handleLogout}
              size="small"
              color="error"
              variant="text"
            >
              Выйти
            </Button>
        </Box> */}
      </Box>

      <List sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {sortedChats.map((chat) => {
          // Определяем, является ли чат неотвеченным (последнее сообщение не от нас)
          const isUnread = chat.lastMessage && !chat.lastMessage.fromMe;
          // Определяем количество непрочитанных сообщений для этого чата
          const unreadCount = chat.unreadCount || 0;
          // Показываем badge только если есть непрочитанные сообщения
          const showBadge = unreadCount > 0;
          
          return (
            <ListItem
              key={chat.id}
              button
              selected={selectedChat?.id === chat.id}
              onClick={() => onSelect(chat)}
              sx={{
                borderRadius: 0, // Swiss style: no rounded corners
                mb: 0,
                position: 'relative',
                borderBottom: '1px solid #E0E0E0',
                transition: 'background-color 0.2s ease', // Упрощенная анимация
                '&:hover': {
                  backgroundColor: '#F8F8F8',
                },
                '&.Mui-selected': {
                  backgroundColor: '#1976D2',
                  color: '#FFFFFF',
                  '&:hover': {
                    backgroundColor: '#1565C0',
                  },
                  '& .MuiTypography-root': {
                    color: '#FFFFFF !important',
                  },
                  '& *': {
                    color: '#FFFFFF !important',
                  },
                },
                // Подсвечиваем неотвеченные чаты и чаты с новыми сообщениями в Swiss Style
                ...(showBadge && {
                  backgroundColor: 'rgba(255, 0, 0, 0.04)',
                  borderLeft: '4px solid #FF0000',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { boxShadow: '0 0 0 0 rgba(255, 0, 0, 0.4)' },
                    '70%': { boxShadow: '0 0 0 8px rgba(255, 0, 0, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(255, 0, 0, 0)' },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 0, 0, 0.08)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#000000',
                    borderLeft: '4px solid #FF0000',
                    '&:hover': {
                      backgroundColor: '#333333',
                    },
                    '& .MuiTypography-root': {
                      color: '#FFFFFF !important',
                    },
                    '& *': {
                      color: '#FFFFFF !important',
                    },
                  },
                }),
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography 
                    variant="subtitle1" 
                    noWrap
                    sx={{ 
                      fontWeight: showBadge ? 600 : 500,
                      flex: 1,
                      fontSize: '1rem',
                      color: '#212121',
                      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                    }}
                  >
                    {chat.name || chat.remoteJid || chat.receivingPhoneJid}
                  </Typography>
                  {showBadge && (
                    <Box
                      sx={{
                        minWidth: unreadCount > 0 ? 24 : 20,
                        height: 20,
                        backgroundColor: '#FF0000', // Swiss style red
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        position: 'relative',
                        px: unreadCount > 9 ? 0.5 : 0,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#FFFFFF',
                          fontSize: unreadCount > 0 ? '0.6rem' : '0.7rem',
                          fontWeight: 'bold',
                          lineHeight: 1,
                        }}
                      >
                        {unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : '•'}
                      </Typography>
                      {/* Пульсирующий эффект для Swiss Style только при новых сообщениях */}
                      {unreadCount > 0 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: '#FF0000',
                            animation: 'ripple 2s infinite',
                            '@keyframes ripple': {
                              '0%': {
                                opacity: 1,
                                transform: 'scale(1)',
                              },
                              '50%': {
                                opacity: 0.7,
                                transform: 'scale(1.2)',
                              },
                              '100%': {
                                opacity: 1,
                                transform: 'scale(1)',
                              },
                            },
                          }}
                        />
                      )}
                    </Box>
                  )}
                </Box>
                <Typography
                  variant="body2"
                  noWrap
                  sx={{ 
                    mb: 0.5,
                    fontWeight: showBadge ? 500 : 400,
                    color: showBadge ? '#424242' : '#757575',
                    fontSize: '0.9rem',
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                  }}
                >
                  {/* Показываем префикс отправителя */}
                  {chat.lastMessage && chat.lastMessage.fromMe && chat.lastMessage.senderUser && (
                    <Typography 
                      component="span" 
                      variant="caption" 
                      sx={{ 
                        opacity: 0.8,
                        fontWeight: 600,
                        mr: 0.5,
                        color: '#2196F3',
                        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                      }}
                    >
                      {chat.lastMessage.senderUser.name || chat.lastMessage.senderUser.email.split('@')[0]}:
                    </Typography>
                  )}
                  {chat.lastMessage ? chat.lastMessage.content : "Нет сообщений"}
                </Typography>
                
                {/* Информация о назначении чата */}
                <Typography
                  variant="caption"
                  sx={{ 
                    mb: 0.5,
                    fontStyle: 'normal',
                    color: chat.assignedUser ? '#2196F3' : '#9E9E9E',
                    fontSize: '0.75rem',
                    fontWeight: chat.assignedUser ? 500 : 400,
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                  }}
                >
                  {chat.assignedUser 
                    ? `Назначен: ${chat.assignedUser.name || chat.assignedUser.email}`
                    : 'Чат свободен'
                  }
                </Typography>                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography 
                    variant="caption" 
                    noWrap
                    sx={{ 
                      color: '#757575',
                      fontSize: '0.75rem',
                      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                    }}
                  >
                    {chat.organizationPhone?.displayName || ''}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {/* Показываем аватар отправителя последнего сообщения */}
                    {chat.lastMessage?.fromMe && chat.lastMessage?.senderUser && (
                      <UserAvatar user={chat.lastMessage.senderUser} size={16} />
                    )}
                    <Typography 
                      variant="caption" 
                      noWrap
                      sx={{ 
                        fontWeight: isUnread ? 600 : 400,
                        color: isUnread ? '#FF5722' : '#757575',
                        fontSize: '0.75rem',
                        fontFamily: '"Roboto Mono", "Courier New", monospace'
                      }}
                    >
                      {chat.lastMessage?.timestamp ? (() => {
                        const messageDate = new Date(chat.lastMessage.timestamp);
                        const today = new Date();
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        
                        if (messageDate.toDateString() === today.toDateString()) {
                          // Сегодня - показываем время
                          return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        } else if (messageDate.toDateString() === yesterday.toDateString()) {
                          // Вчера
                          return 'Вчера';
                        } else if (messageDate.getFullYear() === today.getFullYear()) {
                          // Этот год - показываем день и месяц
                          return messageDate.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
                        } else {
                          // Другой год - показываем полную дату
                          return messageDate.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
                        }
                      })() : ''}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
}

export default React.memo(ChatSidebar);
