import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Chip, 
  Button,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../api';

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

export default function Accounts() {
  const theme = useTheme();
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQR, setSelectedQR] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchPhones = async () => {
      try {
        setError(null);
        const data = await api.getOrganizationPhones();
        if (isMounted) {
          setPhones(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Ошибка при загрузке аккаунтов:', err);
          setError(err.message || 'Не удалось загрузить список аккаунтов');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPhones();
    // Обновляем список каждые 30 секунд для проверки статусов
    const interval = setInterval(fetchPhones, 30000);
    return () => { 
      isMounted = false; 
      clearInterval(interval); 
    };
  }, []);

  const handleAddAccount = async () => {
    if (!newAccountName.trim() || !newPhoneNumber.trim()) return;
    
    setIsSubmitting(true);
    try {
      const phoneJid = `${newPhoneNumber.replace(/\D/g, '')}@s.whatsapp.net`;
      const newPhone = await api.createOrganizationPhone({
        phoneJid,
        displayName: newAccountName
      });
      setPhones(prev => [...prev, newPhone]);
      setIsAddDialogOpen(false);
      setNewAccountName('');
      setNewPhoneNumber('');
    } catch (err) {
      console.error('Ошибка при создании аккаунта:', err);
      setError(err.message || 'Не удалось создать аккаунт');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 4, borderRadius: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography color="error">Ошибка: {error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      sx={{ 
        p: 4, 
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'rgba(148, 163, 184, 0.1)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4
      }}>
        <Typography variant="h4" sx={{ color: 'text.primary' }}>
          Управление аккаунтами WhatsApp
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => setIsAddDialogOpen(true)}
          startIcon={<span>+</span>}
          sx={{
            px: 3,
            py: 1,
            fontSize: '0.95rem'
          }}
        >
          Добавить аккаунт
        </Button>
      </Box>

      <List sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
        {phones.map((phone) => (
          <ListItem
            key={phone.id}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'rgba(148, 163, 184, 0.1)',
              borderRadius: 2,
              bgcolor: 'background.paper',
              transition: 'all 0.2s ease-in-out',
              backdropFilter: 'blur(8px)',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 20px -4px ${theme.palette.primary.main}40`
              }
            }}
          >
            <ListItemText
              primary={
                <Typography variant="h6" component="div">
                  {phone.displayName}
                </Typography>
              }
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {phone.phoneJid.split('@')[0]}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      label={STATUS_LABELS[phone.status]}
                      color={STATUS_COLORS[phone.status]}
                      size="small"
                    />
                    {phone.lastConnectedAt && (
                      <Typography variant="caption" color="text.secondary">
                        Последнее подключение: {new Date(phone.lastConnectedAt).toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                </Box>
              }
            />
            <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
              {phone.status === 'disconnected' && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={async () => {
                    try {
                      setError(null);
                      const updatedPhone = await api.connectOrganizationPhone(phone.id);
                      setPhones(prev => prev.map(p => 
                        p.id === updatedPhone.id ? updatedPhone : p
                      ));
                    } catch (err) {
                      console.error('Ошибка при подключении:', err);
                      setError(err.message || 'Ошибка при подключении телефона');
                    }
                  }}
                  color="primary"
                  sx={{ 
                    borderColor: 'primary.main',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      backgroundColor: 'primary.dark'
                    }
                  }}
                >
                  Подключить
                </Button>
              )}
              {phone.status === 'pending' && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    console.log('QR Code:', phone.qrCode); // Для отладки
                    setSelectedQR(phone.qrCode);
                  }}
                  color="primary"
                  disabled={!phone.qrCode}
                  sx={{ 
                    borderColor: 'primary.main',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      backgroundColor: 'rgba(124, 58, 237, 0.04)'
                    }
                  }}
                >
                  {phone.qrCode ? 'Показать QR-код' : 'QR-код загружается...'}
                </Button>
              )}
            </Box>
          </ListItem>
        ))}
      </List>

      <Dialog 
        open={!!selectedQR} 
        onClose={() => setSelectedQR(null)}
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
          <Box sx={{ 
            p: 4, 
            border: '1px solid',
            borderColor: 'rgba(148, 163, 184, 0.2)',
            borderRadius: 2, 
            display: 'inline-block',
            bgcolor: '#FFFFFF',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}>
            <QRCodeSVG
              value={selectedQR || ''}
              size={256}
              level="H"
              includeMargin={true}
            />
          </Box>
          <Typography 
            variant="body1" 
            align="center" 
            sx={{ 
              mt: 3,
              color: 'text.secondary',
              lineHeight: 1.5
            }}
          >
            Отсканируйте этот QR-код в приложении WhatsApp для подключения
          </Typography>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={isAddDialogOpen} 
        onClose={() => !isSubmitting && setIsAddDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: 'background.paper',
            maxWidth: '400px',
            width: '100%'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          pt: 3,
          px: 3,
          typography: 'h6',
          fontWeight: 600 
        }}>
          Добавить новый аккаунт WhatsApp
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Номер телефона"
            fullWidth
            value={newPhoneNumber}
            onChange={(e) => setNewPhoneNumber(e.target.value)}
            disabled={isSubmitting}
            variant="outlined"
            placeholder="7705XXXXXXX"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(148, 163, 184, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(148, 163, 184, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
          <TextField
            margin="dense"
            label="Название аккаунта"
            fullWidth
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            disabled={isSubmitting}
            variant="outlined"
            sx={{
              mt: 1,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(148, 163, 184, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(148, 163, 184, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button 
            onClick={() => {
              setIsAddDialogOpen(false);
              setNewAccountName('');
              setNewPhoneNumber('');
            }} 
            disabled={isSubmitting}
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
            Отмена
          </Button>
          <Button 
            onClick={handleAddAccount} 
            disabled={!newAccountName.trim() || !newPhoneNumber.trim() || isSubmitting}
            variant="contained"
            sx={{
              minWidth: '100px',
            }}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}