import React from 'react';
import { Avatar, Box } from '@mui/material';

export default function UserAvatar({ user, size = 32 }) {
  if (!user) return null;

  const getInitials = (name, email) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return '?';
  };

  const getColorFromString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  const displayName = user.name || user.email;
  const initials = getInitials(user.name, user.email);
  const backgroundColor = getColorFromString(displayName);

  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.45, /* Увеличено с 0.4 для лучшей читаемости */
        fontWeight: 600,
        backgroundColor,
        color: 'white',
      }}
    >
      {initials}
    </Avatar>
  );
}
