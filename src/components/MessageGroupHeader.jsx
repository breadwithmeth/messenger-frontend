import React from 'react';
import { Box, Typography } from '@mui/material';
import UserAvatar from './UserAvatar';

function MessageGroupHeader({ senderUser, timestamp }) {
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
        mr: 1,
      }}
    >
      <UserAvatar user={senderUser} size={20} />
      <Typography 
        variant="body2" 
        sx={{ 
          color: '#424242',
          fontWeight: 600,
          fontSize: '0.9rem',
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
        }}
      >
        {displayName}
      </Typography>
      <Typography 
        variant="caption" 
        sx={{ 
          color: '#757575',
          fontSize: '0.8rem',
          fontFamily: '"Roboto Mono", "Courier New", monospace',
          fontWeight: 500
        }}
      >
        {time}
      </Typography>
    </Box>
  );
}

export default React.memo(MessageGroupHeader);
