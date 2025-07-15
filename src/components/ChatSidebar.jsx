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

export default function ChatSidebar({ chats, selectedChat, onSelect }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    window.location.reload();
  };

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
        {chats.map((chat) => (
          <ListItem
            key={chat.id}
            button
            selected={selectedChat?.id === chat.id}
            onClick={() => onSelect(chat)}
            sx={{
              borderRadius: '8px',
              mb: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(77, 171, 247, 0.1)',
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(77, 171, 247, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(77, 171, 247, 0.25)',
                },
              },
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {chat.name || chat.remoteJid || chat.receivingPhoneJid}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                sx={{ mb: 0.5 }}
              >
                {chat.lastMessage ? chat.lastMessage.content : "Нет сообщений"}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {chat.organizationPhone?.displayName || ''}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {chat.lastMessage?.timestamp ? new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </Typography>
              </Box>
            </Box>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
