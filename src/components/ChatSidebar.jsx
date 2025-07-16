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

export default function ChatSidebar({ chats, selectedChat, onSelect }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    window.location.reload();
  };

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
        borderRight: 1,
        borderColor: 'divider',
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
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '64px',
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Чаты
        </Typography>
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
          
          return (
            <ListItem
              key={chat.id}
              button
              selected={selectedChat?.id === chat.id}
              onClick={() => onSelect(chat)}
              sx={{
                borderRadius: '8px',
                mb: 0.5,
                position: 'relative',
                '&:hover': {
                  backgroundColor: 'rgba(0, 122, 255, 0.04)',
                  transform: 'translateX(2px)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(0, 122, 255, 0.08)',
                  borderLeft: '2px solid',
                  borderLeftColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 122, 255, 0.12)',
                  },
                },
                // Подсвечиваем неотвеченные чаты минималистично
                ...(isUnread && {
                  backgroundColor: 'rgba(255, 152, 0, 0.04)',
                  borderLeft: '2px solid',
                  borderLeftColor: 'warning.main',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 152, 0, 0.08)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255, 152, 0, 0.12)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 152, 0, 0.16)',
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
                      fontWeight: isUnread ? 'bold' : 'normal',
                      flex: 1 
                    }}
                  >
                    {chat.name || chat.remoteJid || chat.receivingPhoneJid}
                  </Typography>
                  {isUnread && (
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: 'warning.main',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  noWrap
                  sx={{ 
                    mb: 0.5,
                    fontWeight: isUnread ? 'medium' : 'normal',
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
