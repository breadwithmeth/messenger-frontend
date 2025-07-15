import React, { useState, useEffect } from 'react';
import {
  Box, Typography, List, ListItem, ListItemText,
  Divider, Button, Dialog, DialogTitle, DialogContent, TextField,
  DialogActions, CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel, Paper, ListItemIcon
} from '@mui/material';
import { Add, Person } from '@mui/icons-material';
import api from '../../api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  
  // New user form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organizationId, setOrganizationId] = useState('1'); // Default to 1 as per example
  const [role, setRole] = useState('operator');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      const errorMsg = 'Не удалось загрузить пользователей.';
      setError(errorMsg);
      console.error(errorMsg, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpen = () => setOpen(true);
  
  const handleClose = () => {
    setOpen(false);
    // Reset form
    setEmail('');
    setPassword('');
    setName('');
    setOrganizationId('1');
    setRole('operator');
  };

  const handleCreate = async () => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      alert('Все поля должны быть заполнены');
      return;
    }
    try {
      await api.createUser({
        email,
        password,
        name,
        organizationId: parseInt(organizationId, 10),
        role,
      });
      handleClose();
      fetchUsers();
      alert('Пользователь успешно создан');
    } catch (err) {
      alert(err.response?.data?.message || 'Не удалось создать пользователя');
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Пользователи
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpen}
        >
          Добавить пользователя
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Paper>
        <List>
          {users.map((user) => (
            <ListItem key={user.id}>
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText
                primary={user.name || user.email}
                secondary={`${user.email} - ${user.role}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Add User Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Добавить нового пользователя</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Имя"
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Пароль"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="role-select-label">Роль</InputLabel>
            <Select
              labelId="role-select-label"
              value={role}
              label="Роль"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="operator">Оператор</MenuItem>
              <MenuItem value="admin">Администратор</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="ID Организации"
            type="number"
            fullWidth
            variant="outlined"
            value={organizationId}
            onChange={(e) => setOrganizationId(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={handleClose} variant="outlined">Отмена</Button>
          <Button onClick={handleCreate} variant="contained">Создать</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
