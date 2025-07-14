import React from 'react';
import { NavLink, Outlet, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Paper, List, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, Tooltip, Divider } from '@mui/material';
import { Users, MessageSquareText, KeyRound, ArrowLeft } from 'lucide-react';
import Accounts from '../components/settings/Accounts';
import Templates from '../components/settings/Templates';
import ApiKeys from '../components/settings/ApiKeys';

const navLinkStyles = {
  '&.active': {
    backgroundColor: 'action.selected',
    '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
      color: 'primary.main',
      fontWeight: '600',
    },
  },
};

export default function Settings() {
  const navigate = useNavigate();

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
          <Tooltip title="Назад в мессенджер">
            <IconButton onClick={() => navigate('/messenger')}>
              <ArrowLeft />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" fontWeight="bold">
            Настройки
          </Typography>
        </Box>
        <Divider />
        <List component="nav" sx={{ p: 1 }}>
          <ListItemButton component={NavLink} to="accounts" sx={navLinkStyles}>
            <ListItemIcon>
              <Users />
            </ListItemIcon>
            <ListItemText primary="Аккаунты" />
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
        </List>
      </Paper>

      {/* Content Area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        <Routes>
          <Route path="/" element={<Navigate to="accounts" replace />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="templates" element={<Templates />} />
          <Route path="api-keys" element={<ApiKeys />} />
        </Routes>
      </Box>
    </Box>
  );
}