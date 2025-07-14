import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Divider
} from "@mui/material";
import { Settings, LogOut } from "lucide-react";

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
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Настройки">
            <IconButton
              onClick={() => navigate("/settings")}
              size="small"
              color="inherit"
            >
              <Settings />
            </IconButton>
          </Tooltip>
          <Tooltip title="Выйти">
            <IconButton
              onClick={handleLogout}
              size="small"
              color="error"
            >
              <LogOut />
            </IconButton>
          </Tooltip>
        </Box>
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
            <ListItemText
              primary={
                <Typography variant="subtitle2" noWrap>
                  {chat.name || chat.remoteJid || chat.receivingPhoneJid}
                </Typography>
              }
              secondary={
                <Typography
                  variant="body2"
                  color="text.secondary"
                  noWrap
                  sx={{ mt: 0.5 }}
                >
                  {chat.lastMessage ? chat.lastMessage.content : "Нет сообщений"}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
