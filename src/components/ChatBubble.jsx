import React from "react";
import { Box, Typography, Menu, MenuItem } from "@mui/material";

const API_URL_ROOT = (import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000/').replace(/\/$/, '');

const MediaContent = ({ message }) => {
  if (!message.mediaUrl || !message.mimeType) {
    return null;
  }

  const fullMediaUrl = `${API_URL_ROOT}${message.mediaUrl}`;
  console.log('Attempting to load media from URL:', fullMediaUrl); // Для отладки

  if (message.mimeType.startsWith('image/')) {
    return (
      <Box
        component="img"
        src={fullMediaUrl}
        alt={message.filename || 'image'}
        sx={{
          maxWidth: '100%',
          maxHeight: '300px',
          borderRadius: '1rem',
          mt: message.content ? 1 : 0,
          cursor: 'pointer',
        }}
        onClick={() => window.open(fullMediaUrl, '_blank')}
      />
    );
  }

  if (message.mimeType.startsWith('video/')) {
    return (
      <Box
        component="video"
        controls
        src={fullMediaUrl}
        sx={{
          maxWidth: '100%',
          maxHeight: '300px',
          borderRadius: '1rem',
          mt: message.content ? 1 : 0,
        }}
      />
    );
  }
  
  if (message.mimeType.startsWith('audio/')) {
    return (
       <Box
        component="audio"
        controls
        src={fullMediaUrl}
        sx={{
          width: '100%',
          mt: message.content ? 1 : 0,
        }}
      />
    );
  }

  // Fallback for other file types
  return (
    <Box sx={{ mt: message.content ? 1 : 0 }}>
      <a href={fullMediaUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
        <Typography variant="body2">
          {message.filename || 'Скачать файл'}
        </Typography>
      </a>
    </Box>
  );
};


export default function ChatBubble({ message, isMe, showTime }) {
  const [contextMenu, setContextMenu] = React.useState(null);

  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other browsers might not behave the same.
          // With this behavior we prevent contextmenu from appearing again.
          null,
    );
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  const handleDebugMessage = () => {
    console.log('DEBUG MESSAGE:', message);
    alert('Сообщение выведено в консоль разработчика');
    handleClose();
  };

  return (
    <Box
      onContextMenu={handleContextMenu}
      sx={{
        maxWidth: '75%',
        minWidth: '60px',
        p: '0.875rem 1.25rem',
        mb: '0.5rem',
        borderRadius: '1.25rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        fontSize: '0.9375rem',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        position: 'relative',
        transition: 'all 0.2s',
        alignSelf: isMe ? 'flex-end' : 'flex-start',
        bgcolor: isMe ? 'primary.main' : 'background.paper',
        color: isMe ? 'common.white' : 'text.primary',
        border: theme => isMe ? 'none' : `1px solid ${theme.palette.divider}`
      }}
    >
      {/* Больше не показываем имя отправителя внутри bubble, 
          так как это делается в ChatMessages */}
      
      {message.quotedContent && (
        <Box
          sx={{
            p: 1.5,
            mb: 1,
            bgcolor: isMe ? 'rgba(0,0,0,0.15)' : 'action.hover',
            borderRadius: '1rem',
            borderLeft: '3px solid',
            borderColor: isMe ? 'rgba(255,255,255,0.5)' : 'primary.main',
          }}
        >
          <Typography variant="caption" sx={{ opacity: 0.8, wordBreak: 'break-all' }}>
            {message.quotedContent}
          </Typography>
        </Box>
      )}
      <MediaContent message={message} />
      <Typography variant="body1" component="div" sx={{ fontFamily: 'Tektur, sans-serif' }}>
        {message.content}
      </Typography>
      {showTime && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'right',
            fontSize: '0.75rem',
            mt: 1,
            opacity: 0.7,
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      )}
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleDebugMessage}>Вывести в консоль</MenuItem>
      </Menu>
    </Box>
  );
}
