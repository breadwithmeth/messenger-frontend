import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Paper, List, ListItemButton, ListItemIcon, ListItemText, Typography, Button, Divider, CircularProgress, Alert } from '@mui/material';
import { Users, MessageSquareText, KeyRound, ArrowLeft, BrainCircuit, Smartphone } from 'lucide-react';
import Accounts from '../components/settings/Accounts';
import Templates from '../components/settings/Templates';
import ApiKeys from '../components/settings/ApiKeys';
import AiSettings from '../components/settings/AiSettings';
import UsersPage from '../components/settings/Users';
import api from '../api';

const navLinkStyles = {
  '&.active': {
    backgroundColor: 'action.selected',
    '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
      color: 'primary.main',
      fontWeight: '600',
    },
  },
};

export default function Settings({ onLogout }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await api.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        setError('Не удалось загрузить информацию о пользователе');
        console.error('Ошибка при загрузке пользователя:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (currentUser?.role !== 'admin') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 2 }}>
        <Alert severity="warning">
          У вас нет прав доступа к настройкам. Только администраторы могут просматривать эту страницу.
          <Button onClick={() => navigate('/messenger')} sx={{ ml: 2 }}>
            Вернуться к мессенджеру
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* Settings Sidebar */}
      <Paper
        elevation={2}
        sx={{
          width: 280,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button onClick={() => navigate('/messenger')} startIcon={<ArrowLeft />} size="small">
              Назад
            </Button>
          <Typography variant="h6" fontWeight="bold">
            Настройки
          </Typography>
        </Box>
        <Divider />
        <List component="nav" sx={{ p: 1 }}>
          <ListItemButton component={NavLink} to="accounts" sx={navLinkStyles}>
            <ListItemIcon>
              <Smartphone />
            </ListItemIcon>
            <ListItemText primary="Аккаунты" />
          </ListItemButton>
          <ListItemButton component={NavLink} to="users" sx={navLinkStyles}>
            <ListItemIcon>
              <Users />
            </ListItemIcon>
            <ListItemText primary="Пользователи" />
          </ListItemButton>
          <ListItemButton component={NavLink} to="templates" sx={navLinkStyles}>
            <ListItemIcon>
              <MessageSquareText />
            </ListItemIcon>
            <ListItemText primary="Шаблоны" />
          </ListItemButton>
          <ListItemButton component={NavLink} to="api-keys" sx={navLinkStyles}>
            <ListItemIcon>
              <KeyRound />
            </ListItemIcon>
            <ListItemText primary="API Ключи" />
          </ListItemButton>
          <ListItemButton component={NavLink} to="ai-settings" sx={navLinkStyles}>
            <ListItemIcon>
              <BrainCircuit />
            </ListItemIcon>
            <ListItemText primary="Настройки AI" />
          </ListItemButton>
        </List>
      </Paper>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
        <Routes>
          <Route path="/" element={<Navigate to="accounts" replace />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="templates" element={<Templates />} />
          <Route path="api-keys" element={<ApiKeys />} />
          <Route path="ai-settings" element={<AiSettings />} />
        </Routes>
      </Box>
    </Box>
  );
}