import React, { useState } from 'react';
import { Paper, List, ListItem, Typography, Box } from '@mui/material';
import UserAvatar from './UserAvatar';

function ChatSidebar({ chats, selectedChat, onSelect }) {
  const [filter, setFilter] = useState('all'); // all | mine | unassigned
  // Получаем текущего пользователя из localStorage (или можно пробросить пропсом)
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

  // Фильтрация
  const filteredChats = chats.filter(chat => {
    if (filter === 'mine') {
      if (!currentUser || !currentUser.id) return false;
      return chat.assignedUserId && String(chat.assignedUserId) === String(currentUser.id);
    }
    if (filter === 'unassigned') return !chat.assignedUserId;
    return true;
  });
  // Сортировка по времени последнего сообщения (новые сверху)
  const sortedChats = [...filteredChats].sort((a, b) => {
    const getTime = (chat) => {
      if (chat.lastMessage && chat.lastMessage.timestamp) return new Date(chat.lastMessage.timestamp).getTime();
      if (chat.lastMessageAt) return new Date(chat.lastMessageAt).getTime();
      if (chat.createdAt) return new Date(chat.createdAt).getTime();
      return 0;
    };
    return getTime(b) - getTime(a);
  });
  return (
    <Paper elevation={2} sx={{ width: 320, height: '100vh', display: 'flex', flexDirection: 'column', borderRadius: 0, borderRight: '1px solid #E0E0E0', bgcolor: '#FAFAFA' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #E0E0E0', bgcolor: '#F5F5F5' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: 1, color: '#212121', fontFamily: 'Roboto, Helvetica, Arial, sans-serif', mb: 1 }}>
          Чаты
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: 4,
              background: filter === 'all' ? '#1976D2' : '#E3EAF2',
              color: filter === 'all' ? '#fff' : '#1976D2',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              transition: 'background 0.2s',
            }}
          >Все</button>
          <button
            onClick={() => setFilter('mine')}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: 4,
              background: filter === 'mine' ? '#1976D2' : '#E3EAF2',
              color: filter === 'mine' ? '#fff' : '#1976D2',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              transition: 'background 0.2s',
            }}
          >Назначенные Мне</button>
          <button
            onClick={() => setFilter('unassigned')}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: 4,
              background: filter === 'unassigned' ? '#1976D2' : '#E3EAF2',
              color: filter === 'unassigned' ? '#fff' : '#1976D2',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              transition: 'background 0.2s',
            }}
          >Не назначенные</button>
        </Box>
      </Box>
      <List sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {sortedChats.map((chat) => {
          const isUnread = chat.lastMessage && !chat.lastMessage.fromMe;
          const unreadCount = chat.unreadCount || 0;
          const showBadge = unreadCount > 0;
          return (
            <ListItem
              key={chat.id}
              button
              selected={selectedChat?.id === chat.id}
              onClick={() => onSelect(chat)}
              sx={{
                borderRadius: 0,
                mb: 0,
                position: 'relative',
                borderBottom: '1px solid #E0E0E0',
                transition: 'background-color 0.2s ease',
                '&:hover': { backgroundColor: '#F8F8F8' },
                '&.Mui-selected': {
                  backgroundColor: '#1976D2',
                  color: '#FFFFFF',
                  '&:hover': { backgroundColor: '#1565C0' },
                  '& .MuiTypography-root': { color: '#FFFFFF !important' },
                  '& *': { color: '#FFFFFF !important' },
                },
                ...(showBadge && {
                  backgroundColor: 'rgba(255, 0, 0, 0.04)',
                  borderLeft: '4px solid #FF0000',
                }),
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" noWrap sx={{ fontWeight: showBadge ? 600 : 500, flex: 1, fontSize: '1rem', color: '#212121', fontFamily: 'Roboto, Helvetica, Arial, sans-serif' }}>
                    {chat.name || chat.remoteJid || chat.receivingPhoneJid}
                  </Typography>
                  {showBadge && (
                    <Box sx={{ minWidth: unreadCount > 0 ? 24 : 20, height: 20, backgroundColor: '#FF0000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: 10, px: unreadCount > 9 ? 0.5 : 0 }}>
                      <Typography variant="caption" sx={{ color: '#FFFFFF', fontSize: unreadCount > 0 ? '0.6rem' : '0.7rem', fontWeight: 'bold', lineHeight: 1 }}>
                        {unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : '•'}
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Typography variant="body2" noWrap sx={{ mb: 0.5, fontWeight: showBadge ? 500 : 400, color: showBadge ? '#424242' : '#757575', fontSize: '0.9rem', fontFamily: 'Roboto, Helvetica, Arial, sans-serif' }}>
                  {chat.lastMessage ? chat.lastMessage.content : "Нет сообщений"}
                </Typography>
                <Typography variant="caption" sx={{ mb: 0.5, fontStyle: 'normal', color: chat.assignedUser ? '#2196F3' : '#9E9E9E', fontSize: '0.75rem', fontWeight: chat.assignedUser ? 500 : 400, fontFamily: 'Roboto, Helvetica, Arial, sans-serif' }}>
                  {chat.assignedUser ? `Назначен: ${chat.assignedUser.name || chat.assignedUser.email}` : 'Чат свободен'}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" noWrap sx={{ color: '#757575', fontSize: '0.75rem', fontFamily: 'Roboto, Helvetica, Arial, sans-serif' }}>
                    {chat.organizationPhone?.displayName || ''}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {chat.lastMessage?.fromMe && chat.lastMessage?.senderUser && (
                      <UserAvatar user={chat.lastMessage.senderUser} size={16} />
                    )}
                    <Typography variant="caption" noWrap sx={{ fontWeight: isUnread ? 600 : 400, color: isUnread ? '#FF5722' : '#757575', fontSize: '0.75rem', fontFamily: 'Roboto Mono, Courier New, monospace' }}>
                      {chat.lastMessage?.timestamp ? (() => {
                        const messageDate = new Date(chat.lastMessage.timestamp);
                        const today = new Date();
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        if (messageDate.toDateString() === today.toDateString()) {
                          return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        } else if (messageDate.toDateString() === yesterday.toDateString()) {
                          return 'Вчера';
                        } else if (messageDate.getFullYear() === today.getFullYear()) {
                          return messageDate.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
                        } else {
                          return messageDate.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
                        }
                      })() : ''}
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

export default React.memo(ChatSidebar);
