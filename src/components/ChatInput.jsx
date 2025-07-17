import React from "react";
import { Box, TextField, Button } from "@mui/material";
import { Send as SendIcon } from '@mui/icons-material';

export default function ChatInput({ value, onChange, onSend, disabled }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSend(e);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 2,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      <TextField
        fullWidth
        value={value}
        onChange={onChange}
        placeholder="Введите сообщение..."
        disabled={disabled}
        autoFocus
        variant="outlined"
        size="small"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 0, // Swiss style: rectangular input
          }
        }}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={disabled || !value.trim()}
        endIcon={<SendIcon />}
        sx={{
          minWidth: 110,
          borderRadius: 0, // Swiss style: rectangular send button
          textTransform: 'none'
        }}
      >
        Отправить
      </Button>
    </Box>
  );
}
