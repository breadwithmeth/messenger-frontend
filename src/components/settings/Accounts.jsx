import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box, Typography, List, ListItem, ListItemButton, ListItemText,
  Divider, Button, Dialog, DialogTitle, DialogContent, TextField,
  DialogActions, IconButton, Tooltip, CircularProgress, Alert,
  ListItemIcon,
  Menu,
  MenuItem
} from '@mui/material';
import { Add, QrCode, CheckCircle, Error, Refresh, MoreVert } from '@mui/icons-material';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';

const STATUS_COLORS = {
  connected: 'success',
  disconnected: 'error',
  pending: 'warning',
  logged_out: 'default'
};

const STATUS_LABELS = {
  connected: 'Подключен',
  disconnected: 'Отключен',
  pending: 'Ожидает подключения',
  logged_out: 'Выход выполнен'
};

function Accounts() {
  const theme = useTheme();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [connectingId, setConnectingId] = useState(null);
  const { showNotification } = useNotification();

  // State for menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuAccountId, setMenuAccountId] = useState(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await api.getWhatsAppAccounts();
      setAccounts(data);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить аккаунты.');
      showNotification('Не удалось загрузить аккаунты', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    const interval = setInterval(fetchAccounts, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewAccountName('');
  };

  const handleCreate = async () => {
    if (!newAccountName.trim()) {
      showNotification('Название аккаунта не может быть пустым', 'warning');
      return;
    }
    try {
      await api.createWhatsAppAccount({ name: newAccountName });
      handleClose();
      fetchAccounts();
      showNotification('Аккаунт успешно создан', 'success');
    } catch (err) {
      showNotification(err.message || 'Не удалось создать аккаунт', 'error');
    }
  };

  const handleConnect = async (accountId) => {
    setConnectingId(accountId);
    setQrLoading(true);
    setQrCode(null);
    setSelectedAccountId(accountId);
    try {
      const data = await api.connectWhatsAppAccount(accountId);
      if (data.qr) {
        setQrCode(data.qr);
        showNotification('Отсканируйте QR-код в приложении WhatsApp', 'info');
      } else {
        showNotification('Не удалось получить QR-код, попробуйте еще раз', 'warning');
      }
    } catch (err) {
      showNotification(err.message || 'Ошибка при подключении', 'error');
    } finally {
      setQrLoading(false);
      setConnectingId(null);
    }
  };

  const handleMenuOpen = (event, accountId) => {
    setAnchorEl(event.currentTarget);
    setMenuAccountId(accountId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuAccountId(null);
  };

  const handleDisconnect = async () => {
    if (!menuAccountId) return;
    try {
      await api.disconnectWhatsAppAccount(menuAccountId);
      fetchAccounts();
      showNotification('Аккаунт успешно отключен', 'success');
    } catch (err) {
      showNotification(err.message || 'Не удалось отключить аккаунт', 'error');
    } finally {
      handleMenuClose();
    }
  };

  const handleDelete = async () => {
    if (!menuAccountId) return;
    if (!window.confirm('Вы уверены, что хотите удалить этот аккаунт? Это действие необратимо.')) {
        return;
    }
    try {
      await api.deleteWhatsAppAccount(menuAccountId);
      fetchAccounts();
      showNotification('Аккаунт успешно удален', 'success');
    } catch (err) {
      showNotification(err.message || 'Не удалось удалить аккаунт', 'error');
    } finally {
      handleMenuClose();
    }
  };


  if (loading && accounts.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Управление аккаунтами WhatsApp
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        startIcon={<Add />}
        sx={{ mb: 3 }}
      >
        Добавить аккаунт
      </Button>

      <List>
        {accounts.map((account) => (
          <ListItem
            key={account.id}
            secondaryAction={
              <Box>
                <IconButton
                  edge="end"
                  aria-label="more"
                  onClick={(e) => handleMenuOpen(e, account.id)}
                >
                  <MoreVert />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl) && menuAccountId === account.id}
                  onClose={handleMenuClose}
                >
                  <MenuItem
                    onClick={() => {
                      handleDisconnect();
                      handleMenuClose();
                    }}
                  >
                    Отключить
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleDelete();
                      handleMenuClose();
                    }}
                  >
                    Удалить
                  </MenuItem>
                </Menu>
              </Box>
            }
          >
            <ListItemButton
              onClick={() => handleConnect(account.id)}
              disabled={account.status === 'connected' || connectingId === account.id}
              sx={{
                border: '1px solid',
                borderColor: 'rgba(148, 163, 184, 0.2)',
                borderRadius: 2,
                p: 2,
                bgcolor: account.status === 'connected' ? 'rgba(76, 175, 80, 0.1)' : 'inherit',
                transition: 'background-color 0.3s',
                '&:hover': {
                  bgcolor: account.status === 'connected' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(148, 163, 184, 0.04)',
                },
              }}
            >
              <ListItemIcon>
                {account.status === 'connected' ? <CheckCircle color="success" /> : <QrCode color="action" />}
              </ListItemIcon>
              <ListItemText
                primary={account.name}
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {account.status === 'connected' ? 'Подключен' : 'Ожидает сканирования QR-кода'}
                  </Typography>
                }
              />
              {account.status === 'connected' && (
                <CheckCircle color="success" sx={{ ml: 1 }} />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Добавить новый аккаунт</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название аккаунта"
            fullWidth
            variant="outlined"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Отмена
          </Button>
          <Button onClick={handleCreate} color="primary">
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={qrLoading}
        onClose={() => setQrLoading(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 3,
            bgcolor: 'background.paper',
            maxWidth: '400px',
            width: '100%'
          }
        }}
      >
        <DialogContent sx={{ textAlign: 'center', p: 2 }}>
          <Typography variant="body1" align="center" sx={{ mb: 2 }}>
            {qrCode ? 'Отсканируйте QR-код в приложении WhatsApp для подключения' : 'Генерация QR-кода...'}
          </Typography>
          {qrCode && (
            <Box sx={{ 
              p: 4, 
              border: '1px solid',
              borderColor: 'rgba(148, 163, 184, 0.2)',
              borderRadius: 2, 
              display: 'inline-block',
              bgcolor: '#FFFFFF',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}>
              <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" style={{ width: '100%', height: 'auto' }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={() => setQrLoading(false)}
            variant="outlined"
            sx={{
              borderColor: 'rgba(148, 163, 184, 0.2)',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'rgba(148, 163, 184, 0.3)',
                bgcolor: 'rgba(148, 163, 184, 0.1)',
              },
            }}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Accounts;