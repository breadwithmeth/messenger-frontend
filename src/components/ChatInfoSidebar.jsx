import React, { useState, useEffect } from 'react';
import { useTheme } from "@mui/material/styles";
import api from '../api';
import {
  Box,
  Typography,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

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

export default function ChatInfoSidebar({ chat, onPhoneUpdate }) {
  const theme = useTheme();
  const [phoneInfo, setPhoneInfo] = useState(null);

  // Загрузка и обновление информации о телефоне
  useEffect(() => {
    if (!chat) {
      setPhoneInfo(null);
      return;
    }

    let isMounted = true;

    const fetchPhoneInfo = async () => {
      try {
        const phones = await api.getOrganizationPhones();
        const phoneId = chat.organizationPhone?.id || chat.organizationPhoneId;
        const phone = phones.find(p => p.id === phoneId);
        if (isMounted && phone) {
          setPhoneInfo(phone);
          if (onPhoneUpdate) onPhoneUpdate(phone);
        }
      } catch (err) {
        console.error('Ошибка при загрузке информации о телефоне:', err);
      }
    };

    fetchPhoneInfo();
    const interval = setInterval(fetchPhoneInfo, 10000); // Обновление каждые 10 секунд

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [chat, onPhoneUpdate]);

  return (
    <Box
      sx={{
        width: 300,
        minWidth: 300,
        borderLeft: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        height: '100%', // Изменено на 100%
        position: 'sticky',
        top: 0,
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', minHeight: '64px', display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6">
          Информация
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {chat ? (
          <>
            <Box mb={3}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Получатель
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {chat?.name || chat?.remoteJid?.split('@')[0] || 'Неизвестно'}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box mb={3}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Номер WhatsApp
              </Typography>
              {phoneInfo ? (
                <List disablePadding>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={phoneInfo.displayName}
                      secondary={phoneInfo.phoneJid?.split('@')[0]}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <Chip
                      size="small"
                      label={STATUS_LABELS[phoneInfo.status] || 'Неизвестен'}
                      color={STATUS_COLORS[phoneInfo.status] || 'default'}
                      variant="outlined"
                    />
                  </ListItem>
                  {phoneInfo.lastConnectedAt && (
                    <ListItem sx={{ px: 0 }}>
                      <Typography variant="caption" color="text.secondary">
                        Последнее подключение:<br />
                        {new Date(phoneInfo.lastConnectedAt).toLocaleString()}
                      </Typography>
                    </ListItem>
                  )}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">Загрузка...</Typography>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Статистика
              </Typography>
              <List disablePadding>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Создан"
                    secondary={chat?.createdAt ? new Date(chat.createdAt).toLocaleDateString() : 'Неизвестно'}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Последнее сообщение"
                    secondary={
                      chat?.lastMessage?.timestamp 
                        ? new Date(chat.lastMessage.timestamp).toLocaleString() 
                        : 'Нет сообщений'
                    }
                  />
                </ListItem>
              </List>
            </Box>
          </>
        ) : (
          <Box sx={{textAlign: 'center', mt: 4}}>
            <Typography color="text.secondary">
              Выберите чат для просмотра информации
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
