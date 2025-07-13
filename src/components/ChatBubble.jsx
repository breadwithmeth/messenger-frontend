import React from "react";
import { Box, Typography } from "@mui/material";

export default function ChatBubble({ message, isMe, showTime }) {
  return (
    <Box
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
      <Typography variant="body1">{message.content}</Typography>
      {showTime && message.timestamp && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            color: isMe ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary',
            textAlign: isMe ? 'right' : 'left'
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Typography>
      )}
    </Box>
  );
}
