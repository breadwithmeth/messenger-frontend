import React from 'react';
import { Box, Typography } from '@mui/material';
import UserAvatar from './UserAvatar';

export default function MessageGroupHeader({ senderUser, timestamp }) {
  if (!senderUser) return null;

  const displayName = senderUser.name || senderUser.email.split('@')[0];
  const time = new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        mb: 0.5,
        alignSelf: 'flex-end',
        mr: 1
      }}
    >
      <UserAvatar user={senderUser} size={20} />
      <Typography 
        variant="caption" 
        sx={{ 
          color: 'text.secondary',
          fontWeight: 500,
          fontSize: '0.85rem' /* Увеличено для лучшей читаемости */
        }}
      >
        {displayName}
      </Typography>
      <Typography 
        variant="caption" 
        sx={{ 
          color: 'text.secondary',
          fontSize: '0.8rem', /* Увеличено */
          opacity: 0.7
        }}
      >
        {time}
      </Typography>
    </Box>
  );
}
