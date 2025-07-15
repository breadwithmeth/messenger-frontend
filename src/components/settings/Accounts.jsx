import React, { useState, useEffect } from 'react';
import {
  Box, Typography, List, ListItem, ListItemButton, ListItemText,
  Divider, Button, Dialog, DialogTitle, DialogContent, TextField,
  DialogActions, CircularProgress, Alert,
  ListItemIcon,
  Menu,
  MenuItem
} from '@mui/material';
import { Add, QrCode, CheckCircle, Error, Refresh, MoreVert } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import api from '../../api';
import QRCode from 'qrcode';

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
  const [newAccountJid, setNewAccountJid] = useState(''); // Новое состояние для JID
  const [qrCode, setQrCode] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [connectingId, setConnectingId] = useState(null);

  // State for menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuAccountId, setMenuAccountId] = useState(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await api.getOrganizationPhones(); // Используем новый эндпоинт
      setAccounts(data);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить аккаунты.');
      console.error('Не удалось загрузить аккаунты', err);
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
    setNewAccountJid(''); // Сбрасываем JID
  };

  const handleCreate = async () => {
    if (!newAccountName.trim() || !newAccountJid.trim()) {
      alert('Название и номер аккаунта не могут быть пустыми');
      return;
    }
    try {
      // Отправляем и имя, и JID
      await api.createWhatsAppAccount({ displayName: newAccountName, phoneJid: newAccountJid });
      handleClose();
      fetchAccounts();
      alert('Аккаунт успешно создан');
    } catch (err) {
      alert(err.message || 'Не удалось создать аккаунт');
    }
  };

  const handleConnect = async (accountId) => {
    setConnectingId(accountId);
    setQrLoading(true);
    setQrCode(null);
    setSelectedAccountId(accountId);

    try {
      // Находим аккаунт в текущем состоянии
      const account = accounts.find(acc => acc.id === accountId);

      // Проверяем, есть ли уже QR-код
      if (account && account.qrCode) {
        const qrDataURL = await QRCode.toDataURL(account.qrCode, {
          width: 256,
          margin: 2,
        });
        setQrCode(qrDataURL);
        alert('Отсканируйте QR-код в приложении WhatsApp');
      } else {
        // Если QR-кода нет, запрашиваем его
        alert('QR-код не найден, запрашиваем новый...');
        const data = await api.connectWhatsAppAccount(accountId);
        if (data.qr) {
          const qrDataURL = await QRCode.toDataURL(data.qr, {
            width: 256,
            margin: 2,
          });
          setQrCode(qrDataURL);
          alert('Отсканируйте QR-код в приложении WhatsApp');
          fetchAccounts(); // Обновляем список аккаунтов, чтобы получить свежий QR
        } else if (data.message) {
            alert(data.message);
            handleQrDialogClose();
        } else {
          alert('Не удалось получить QR-код, попробуйте еще раз');
        }
      }
    } catch (err) {
      alert(err.message || 'Ошибка при подключении');
    } finally {
      setQrLoading(false);
      setConnectingId(null);
    }
  };

  const handleQrDialogClose = () => {
    setQrCode(null);
    setSelectedAccountId(null);
  };

  const handleMenuOpen = (event, accountId) => {
    setAnchorEl(event.currentTarget);
    setMenuAccountId(accountId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuAccountId(null);
  };

  const handleResync = async () => {
    if (!menuAccountId) return;
    // Сначала вызываем connect, чтобы сгенерировать новый QR-код на бэкенде
    try {
      alert('Запрашиваем новый QR-код...');
      const connectResponse = await api.connectWhatsAppAccount(menuAccountId);
      
      // Если бэкенд вернул сообщение (например, "already connected"), покажем его
      if (connectResponse && connectResponse.message) {
          alert(connectResponse.message);
      }

      // Затем обновляем данные
      await fetchAccounts();

      // Если в ответе был QR, покажем его
      if (connectResponse && connectResponse.qr) {
          handleConnect(menuAccountId);
      }

    } catch (err) {
       alert(err.message || 'Ошибка при пересинхронизации');
    } finally {
        handleMenuClose();
    }
  };

  const handleDisconnect = async () => {
    if (!menuAccountId) return;
    try {
      await api.disconnectWhatsAppAccount(menuAccountId);
      fetchAccounts();
      alert('Аккаунт успешно отключен');
    } catch (err) {
      alert(err.message || 'Не удалось отключить аккаунт');
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
      alert('Аккаунт успешно удален');
    } catch (err) {
      alert(err.message || 'Не удалось удалить аккаунт');
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
        sx={{ mb: 3 }}
      >
        Добавить аккаунт
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <List sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 2 }}>
        {accounts.map((account) => (
          <ListItem
            key={account.id}
            sx={{
              p: 0,
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: 1,
              transition: 'box-shadow 0.3s',
              '&:hover': {
                boxShadow: 3,
              }
            }}
          >
            <Box sx={{ p: 2, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                {account.displayName || 'Без имени'}
              </Typography>
              <Button
                aria-label="more"
                onClick={(e) => handleMenuOpen(e, account.id)}
                size="small"
              >
                Меню
              </Button>
            </Box>
            <Divider sx={{ width: '100%' }} />
            <Box sx={{ p: 2, width: '100%' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                JID: {account.phoneJid}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Статус: <Box component="span" sx={{ color: `${STATUS_COLORS[account.status]}.main`, fontWeight: 'bold' }}>
                  {STATUS_LABELS[account.status] || account.status}
                </Box>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Последнее подключение: {account.lastConnectedAt ? new Date(account.lastConnectedAt).toLocaleString() : 'Никогда'}
              </Typography>
            </Box>
            <Divider sx={{ width: '100%' }} />
            <Box sx={{ p: 2, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {account.status !== 'connected' && (
                <Button
                  onClick={() => handleConnect(account.id)}
                  disabled={connectingId === account.id}
                >
                  {(connectingId === account.id || qrLoading) ? 'Загрузка QR' : 'Подключить'}
                </Button>
              )}
            </Box>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl) && menuAccountId === account.id}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleResync}>
                Пересинхронизировать
              </MenuItem>
              <MenuItem onClick={handleDisconnect}>
                Отключить
              </MenuItem>
              <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                Удалить
              </MenuItem>
            </Menu>
          </ListItem>
        ))}
      </List>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Добавить новый аккаунт</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Название аккаунта"
            type="text"
            fullWidth
            variant="standard"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
          />
          <TextField
            margin="dense"
            id="jid"
            label="Номер телефона (JID)"
            placeholder="77051234567"
            type="text"
            fullWidth
            variant="standard"
            value={newAccountJid}
            onChange={(e) => setNewAccountJid(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button onClick={handleCreate} variant="contained">
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!qrCode} onClose={handleQrDialogClose}>
        <DialogTitle>Сканируйте QR-код</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          {qrLoading ? <CircularProgress /> : <img src={qrCode} alt="QR Code" />}
          <Typography variant="body2" sx={{ mt: 2 }}>
            Откройте WhatsApp на своем телефоне, перейдите в "Связанные устройства" и отсканируйте код.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleQrDialogClose}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Accounts;