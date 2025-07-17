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

export default function ChatSidebar({ chats, selectedChat, onSelect, newMessageCounts = {} }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    window.location.reload();
  };

  // Вычисляем общее количество новых сообщений
  const totalNewMessages = Object.values(newMessageCounts).reduce((sum, count) => sum + count, 0);

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="h6" 
            fontWeight="500"
            sx={{
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontSize: '1rem'
            }}
          >
            Чаты
          </Typography>
          {totalNewMessages > 0 && (
            <Box
              sx={{
                minWidth: 20,
                height: 20,
                backgroundColor: '#FF0000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: totalNewMessages > 9 ? 0.5 : 0,
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
                {totalNewMessages > 99 ? '99+' : totalNewMessages}
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
          // Определяем количество новых сообщений для этого чата
          const newMessageCount = newMessageCounts[chat.id] || 0;
          // Показываем badge если есть новые сообщения или чат неотвеченный
          const showBadge = isUnread || newMessageCount > 0;
          
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
                transition: 'all 0.15s ease-in-out',
                '&:hover': {
                  backgroundColor: '#F8F8F8',
                  transform: 'none',
                },
                '&.Mui-selected': {
                  backgroundColor: '#000000',
                  color: '#FFFFFF',
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
                // Подсвечиваем неотвеченные чаты и чаты с новыми сообщениями в Swiss Style
                ...(showBadge && {
                  backgroundColor: 'rgba(255, 0, 0, 0.04)',
                  borderLeft: '4px solid #FF0000',
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
                    variant="subtitle2" 
                    noWrap
                    sx={{ 
                      fontWeight: showBadge ? 'bold' : 'normal',
                      flex: 1 
                    }}
                  >
                    {chat.name || chat.remoteJid || chat.receivingPhoneJid}
                  </Typography>
                  {showBadge && (
                    <Box
                      sx={{
                        minWidth: newMessageCount > 0 ? 24 : 20,
                        height: 20,
                        backgroundColor: '#FF0000', // Swiss style red
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        position: 'relative',
                        px: newMessageCount > 9 ? 0.5 : 0,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#FFFFFF',
                          fontSize: newMessageCount > 0 ? '0.6rem' : '0.7rem',
                          fontWeight: 'bold',
                          lineHeight: 1,
                        }}
                      >
                        {newMessageCount > 0 ? (newMessageCount > 99 ? '99+' : newMessageCount) : '•'}
                      </Typography>
                      {/* Пульсирующий эффект для Swiss Style только при новых сообщениях */}
                      {newMessageCount > 0 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: '#FF0000',
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                              '0%': {
                                opacity: 1,
                                transform: 'scale(1)',
                              },
                              '50%': {
                                opacity: 0.7,
                                transform: 'scale(1.1)',
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
                  color="text.secondary"
                  noWrap
                  sx={{ 
                    mb: 0.5,
                    fontWeight: showBadge ? 'medium' : 'normal',
                  }}
                >
                  {/* Показываем префикс отправителя */}
                  {chat.lastMessage && chat.lastMessage.fromMe && chat.lastMessage.senderUser && (
                    <Typography 
                      component="span" 
                      variant="caption" 
                      sx={{ 
                        opacity: 0.7,
                        fontWeight: 500,
                        mr: 0.5 
                      }}
                    >
                      {chat.lastMessage.senderUser.name || chat.lastMessage.senderUser.email.split('@')[0]}:
                    </Typography>
                  )}
                  {chat.lastMessage ? chat.lastMessage.content : "Нет сообщений"}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {chat.organizationPhone?.displayName || ''}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {/* Показываем аватар отправителя последнего сообщения */}
                    {chat.lastMessage?.fromMe && chat.lastMessage?.senderUser && (
                      <UserAvatar user={chat.lastMessage.senderUser} size={16} />
                    )}
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      noWrap
                      sx={{ 
                        fontWeight: isUnread ? 'bold' : 'normal',
                        color: isUnread ? 'warning.main' : 'text.secondary'
                      }}
                    >
                      {chat.lastMessage?.timestamp ? new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
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
