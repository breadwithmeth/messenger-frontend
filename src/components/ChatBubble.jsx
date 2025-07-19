import React from "react";
import { Box, Typography, Menu, MenuItem } from "@mui/material";
import { areMessagesPropsEqual } from "../utils/messageComparison";

const API_URL_ROOT = (import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000/').replace(/\/$/, '');

const MediaContent = React.memo(({ message }) => {
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
          borderRadius: 0, // Swiss style: no rounded corners
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
          borderRadius: 0, // Swiss style: no rounded corners
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
      <Box
        onClick={() => {
          // Показываем подтверждение перед скачиванием
          if (window.confirm(`Скачать файл ${message.filename || 'файл'}?`)) {
            window.open(fullMediaUrl, '_blank');
          }
        }}
        sx={{
          cursor: 'pointer',
          p: 1,
          border: '1px solid #ccc',
          borderRadius: 0,
          '&:hover': {
            backgroundColor: '#f5f5f5'
          }
        }}
      >
        <Typography variant="body2">
          📁 {message.filename || 'Скачать файл'}
        </Typography>
      </Box>
    </Box>
  );
});



function ChatBubble({ message, isMe, showTime }) {
  const [contextMenu, setContextMenu] = React.useState(null);

  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null,
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

  // Внешний контейнер для управления выравниванием
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', width: '100%' }}>
      <Box
        onContextMenu={handleContextMenu}
        sx={{
          maxWidth: '75%',
          minWidth: '60px',
          p: '1rem 1.5rem',
          mb: '0.5rem',
          borderRadius: 0, // Swiss style: rectangular bubbles
          boxShadow: 'none',
          fontSize: '1rem',
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          position: 'relative',
          transition: 'none', // No animations in Swiss style
          bgcolor: isMe ? '#1976D2' : '#FFFFFF',
          color: isMe ? '#FFFFFF' : '#212121',
          border: isMe ? '2px solid #1976D2' : '2px solid #E0E0E0',
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
        }}
      >
        {/* Больше не показываем имя отправителя внутри bubble, 
            так как это делается в ChatMessages */}
        {message.quotedContent && (
          <Box
            sx={{
              p: 1.5,
              mb: 1,
              bgcolor: isMe ? 'rgba(255,255,255,0.15)' : '#F5F5F5',
              borderRadius: 0, // Swiss style: rectangular quotes
              borderLeft: '4px solid',
              borderColor: isMe ? 'rgba(255,255,255,0.8)' : '#2196F3',
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                opacity: 0.9, 
                wordBreak: 'break-all',
                fontStyle: 'italic',
                color: isMe ? '#FFFFFF' : '#424242',
                fontSize: '0.9rem',
                fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
              }}
            >
              {message.quotedContent}
            </Typography>
          </Box>
        )}
        <MediaContent message={message} />
        <Typography 
          variant="body1" 
          component="div" 
          sx={{ 
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            fontSize: '1rem',
            lineHeight: 1.5,
            color: isMe ? '#FFFFFF' : '#212121'
          }}
        >
          {message.content}
        </Typography>
        {showTime && message.timestamp && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'right',
              fontSize: '0.75rem',
              mt: 1.5,
              opacity: 0.8,
              fontFamily: '"Roboto Mono", "Courier New", monospace', // Swiss style: monospace for time
              letterSpacing: '0.5px',
              color: isMe ? '#E3F2FD' : '#757575',
              fontWeight: 500
            }}
          >
            {new Date(message.timestamp).toLocaleTimeString('ru-RU', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
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
    </Box>
  );
}

export default React.memo(ChatBubble, (prevProps, nextProps) => {
  // Сравниваем основные пропсы
  if (prevProps.isMe !== nextProps.isMe) return false;
  if (prevProps.showTime !== nextProps.showTime) return false;
  
  // Используем утилиту для сравнения сообщений
  return areMessagesPropsEqual(prevProps.message, nextProps.message);
});
