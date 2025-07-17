import React, { useState, useEffect } from "react";
import { 
  Box, 
  TextField, 
  Button, 
  Menu, 
  MenuItem, 
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  Typography,
  CircularProgress
} from "@mui/material";
import { Send as SendIcon } from '@mui/icons-material';

export default function ChatInput({ value, onChange, onSend, disabled, onRewrite, isRewriting }) {
  const [templates, setTemplates] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // State for the rewrite options dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [textToRewrite, setTextToRewrite] = useState(null);
  const [tone, setTone] = useState('professional');
  const [style, setStyle] = useState('friendly');
  const [length, setLength] = useState('same');

  useEffect(() => {
    const storedTemplates = JSON.parse(localStorage.getItem('messageTemplates') || '[]');
    setTemplates(storedTemplates);
  }, []);

  const handleClick = (event) => {
    // Обновляем шаблоны перед открытием меню
    const storedTemplates = JSON.parse(localStorage.getItem('messageTemplates') || '[]');
    setTemplates(storedTemplates);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setTextToRewrite(null);
    // Сбрасываем значения при закрытии
    setTone('professional');
    setStyle('friendly');
    setLength('same');
  };

  const handleSelectTemplate = (template) => {
    setTextToRewrite(template.text);
    setDialogOpen(true);
    handleClose();
  };

  const handleImproveMessage = () => {
    if (!value.trim()) return;
    setTextToRewrite(value);
    setDialogOpen(true);
  };

  const handleConfirmRewrite = () => {
    if (!textToRewrite) return;
    if (onRewrite) {
      onRewrite({
        text: textToRewrite,
        tone,
        style,
        length,
      });
    }
    handleDialogClose();
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSend(e);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSend(e);
    }
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 3,
          borderTop: '2px solid',
          borderColor: 'primary.main',
          bgcolor: 'background.paper',
          gap: 2,
        }}
      >
        {/* Template Button */}
        <Button 
          onClick={handleClick} 
          disabled={disabled} 
          variant="outlined" 
          color="primary" 
          sx={{ 
            p: '12px 16px', 
            minWidth: 'auto',
            borderRadius: 0,
            textTransform: 'uppercase',
            fontWeight: 500,
            letterSpacing: '0.08em',
            fontSize: '0.75rem',
          }}
        >
          Шаблон
        </Button>
        
        {/* Templates Menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          {templates.length > 0 ? (
            templates.map(template => (
              <MenuItem key={template.id} onClick={() => handleSelectTemplate(template)}>
                {template.title}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>Нет сохраненных шаблонов</MenuItem>
          )}
        </Menu>

        {/* Message Input */}
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={isRewriting ? "УЛУЧШАЕМ ТЕКСТ..." : "ВВЕДИТЕ СООБЩЕНИЕ..."}
          disabled={disabled}
          autoFocus
          variant="outlined"
          size="medium"
          sx={{ 
            mr: 1,
            ml: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: 0, // Swiss style: rectangular
              backgroundColor: '#FFFFFF',
              border: '2px solid #000000',
              '& fieldset': {
                border: 'none',
              },
              '&:hover': {
                backgroundColor: '#F8F8F8',
              },
              '&.Mui-focused': {
                backgroundColor: '#FFFFFF',
                borderColor: '#FF0000', // Swiss red focus
                '& .MuiOutlinedInput-notchedOutline': {
                  border: '2px solid #FF0000',
                },
              },
            }
          }}
          InputProps={{
            endAdornment: isRewriting && <CircularProgress size={20} sx={{ mr: 1 }} color="secondary" />
          }}
        />

        {/* Improve Button */}
        {onRewrite && (
          <Button 
            onClick={handleImproveMessage} 
            disabled={disabled || !value.trim()} 
            variant="outlined" 
            color="primary" 
            sx={{ 
              p: '12px 16px', 
              minWidth: 'auto',
              borderRadius: 0, // Swiss style
              textTransform: 'uppercase',
              fontWeight: 500,
              letterSpacing: '0.08em',
              fontSize: '0.75rem',
              '&:hover': {
                backgroundColor: '#F0F0F0',
              }
            }}
          >
            Улучшить
          </Button>
        )}

        {/* Send Button */}
        <Button
          type="submit"
          disabled={disabled || !value.trim()}
          color="primary"
          variant="contained"
          sx={{ 
            p: '12px 24px', 
            borderRadius: 0, // Swiss style: rectangular
            textTransform: 'uppercase',
            fontWeight: 500,
            letterSpacing: '0.08em',
            fontSize: '0.875rem',
            boxShadow: 'none',
            minWidth: '120px',
            border: '2px solid #000000',
            backgroundColor: '#000000',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#FFFFFF',
              color: '#000000',
              boxShadow: 'none',
            },
            '&:disabled': {
              backgroundColor: '#E0E0E0',
              color: '#CCCCCC',
              border: '2px solid #E0E0E0',
            }
          }}
        >
          Отправить
        </Button>
      </Box>

      {/* Rewrite Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontWeight: 'bold' }}>
          Улучшить текст
        </DialogTitle>
        <DialogContent>
          <Typography 
            variant="body1" 
            gutterBottom 
            sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: 'action.hover', 
              borderRadius: 0, 
              border: '2px dashed #000000', 
              borderColor: '#000000' 
            }}
          >
            {textToRewrite}
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel id="tone-select-label">Тон</InputLabel>
            <Select
              labelId="tone-select-label"
              value={tone}
              label="Тон"
              onChange={(e) => setTone(e.target.value)}
            >
              <MenuItem value="professional">Официальный</MenuItem>
              <MenuItem value="casual">Неформальный</MenuItem>
              <MenuItem value="humorous">С юмором</MenuItem>
              <MenuItem value="empathetic">Эмпатичный</MenuItem>
              <MenuItem value="passive-aggressive">Пассивно-агрессивный</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="style-select-label">Стиль</InputLabel>
            <Select
              labelId="style-select-label"
              value={style}
              label="Стиль"
              onChange={(e) => setStyle(e.target.value)}
            >
              <MenuItem value="professional">Профессиональный</MenuItem>
              <MenuItem value="friendly">Дружелюбный</MenuItem>
              <MenuItem value="poetic">Поэтичный</MenuItem>
              <MenuItem value="simple">Простой</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="length-select-label">Длина</InputLabel>
            <Select
              labelId="length-select-label"
              value={length}
              label="Длина"
              onChange={(e) => setLength(e.target.value)}
            >
              <MenuItem value="shorter">Короче</MenuItem>
              <MenuItem value="same">Та же</MenuItem>
              <MenuItem value="longer">Длиннее</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button 
            onClick={handleDialogClose} 
            variant="outlined"
            sx={{ borderRadius: 0 }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleConfirmRewrite} 
            variant="contained"
            sx={{ borderRadius: 0 }}
          >
            Улучшить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
