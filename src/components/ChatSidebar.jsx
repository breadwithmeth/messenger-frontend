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
                    color: '#FFFFFF',
                  },
                },
                // Подсвечиваем неотвеченные чаты в Swiss Style
                ...(isUnread && {
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
                        width: 8,
                        height: 8,
                        backgroundColor: '#FF0000', // Swiss style red
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
