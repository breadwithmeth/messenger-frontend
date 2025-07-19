import React, { useState, useEffect, useRef, useCallback, useDeferredValue } from "react";
import { useOptimizedInput } from '../hooks/useOptimizedInput';
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
  CircularProgress,
  IconButton
} from "@mui/material";
import { Send as SendIcon, AttachFile as AttachFileIcon } from '@mui/icons-material';

// Константы для ограничений загрузки файлов
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Максимально оптимизированный компонент для устранения лага ввода

const ChatInput = React.memo(function ChatInput({ onSend, disabled, onRewrite, isRewriting, onMediaSend }) {
  const [templates, setTemplates] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const fileInputRef = useRef(null);

  // Локальное состояние для input
  const { value, deferredValue, handleChange, reset } = useOptimizedInput('', { debounceDelay: 0 });

  // Минимальный state для диалога
  const [dialogOpen, setDialogOpen] = useState(false);
  const [textToRewrite, setTextToRewrite] = useState(null);
  const [tone, setTone] = useState('professional');
  const [style, setStyle] = useState('friendly');
  const [length, setLength] = useState('same');

  // Оптимизированная загрузка шаблонов только при открытии меню
  const loadTemplates = useCallback(() => {
    try {
      const storedTemplates = JSON.parse(localStorage.getItem('messageTemplates') || '[]');
      setTemplates(storedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates([]);
    }
  }, []);

  // Максимально оптимизированные обработчики с useCallback
  const handleClick = useCallback((event) => {
    loadTemplates(); // Загружаем шаблоны только при открытии
    setAnchorEl(event.currentTarget);
  }, [loadTemplates]);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setTextToRewrite(null);
    setTone('professional');
    setStyle('friendly');
    setLength('same');
  }, []);

  const handleSelectTemplate = useCallback((template) => {
    setTextToRewrite(template.text);
    setDialogOpen(true);
    handleClose();
  }, [handleClose]);

  const handleImproveMessage = useCallback(() => {
    if (!value.trim()) return;
    setTextToRewrite(value);
    setDialogOpen(true);
  }, [value]);

  const handleConfirmRewrite = useCallback(() => {
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
  }, [textToRewrite, onRewrite, tone, style, length, handleDialogClose]);

  // Критично оптимизированный обработчик отправки
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (deferredValue.trim() && !disabled) {
      if (typeof onSend === 'function') {
        onSend(deferredValue);
      }
      reset();
    }
  }, [deferredValue, disabled, onSend, reset]);

  const handleFileSelect = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file || !onMediaSend) return;

    if (file.size > MAX_FILE_SIZE) {
      alert(`Файл слишком большой. Максимальный размер: ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`);
      return;
    }

    setIsUploadingMedia(true);
    try {
      let mediaType = 'document';
      if (file.type.startsWith('image/')) {
        mediaType = 'image';
      } else if (file.type.startsWith('video/')) {
        mediaType = 'video';
      } else if (file.type.startsWith('audio/')) {
        mediaType = 'audio';
      }

      await onMediaSend(file, mediaType);
    } catch (error) {
      console.error('Ошибка при отправке медиафайла:', error);
      alert('Ошибка при отправке файла');
    } finally {
      setIsUploadingMedia(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  }, [onMediaSend]);

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          gap: 1.5,
        }}
      >
        <Button 
          onClick={handleClick} 
          disabled={disabled} 
          variant="outlined" 
          size="small"
        >
          Шаблон
        </Button>
        
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

        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={value}
          onChange={handleChange}
          placeholder="Введите сообщение..."
          disabled={disabled}
          variant="outlined"
          size="small"
          inputProps={{
            style: {
              resize: 'none'
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 0,
              transition: 'none',
              '& fieldset': {
                transition: 'none'
              },
              '&:hover fieldset': {
                transition: 'none'
              },
              '&.Mui-focused fieldset': {
                transition: 'none'
              }
            },
            '& .MuiInputBase-input': {
              transition: 'none',
              fontSize: '16px',
            }
          }}
        />

        {onRewrite && (
          <Button 
            onClick={handleImproveMessage} 
            disabled={disabled || !value.trim()} 
            variant="outlined" 
            size="small"
          >
            Улучшить
          </Button>
        )}

        {onMediaSend && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.mp4,.avi,.mov,.wmv,.webm,.mp3,.wav,.ogg,.m4a,.aac,.pdf,.txt,.doc,.docx,.xls,.xlsx"
            />
            <IconButton
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploadingMedia}
              size="small"
            >
              {isUploadingMedia ? (
                <CircularProgress size={16} />
              ) : (
                <AttachFileIcon fontSize="small" />
              )}
            </IconButton>
          </>
        )}

        <Button
          type="submit"
          disabled={disabled || !value.trim()}
          variant="contained"
          size="small"
        >
          Отправить
        </Button>
      </Box>

      <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>
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
        <DialogActions>
          <Button 
            onClick={handleDialogClose} 
            variant="outlined"
          >
            Отмена
          </Button>
          <Button 
            onClick={handleConfirmRewrite} 
            variant="contained"
          >
            Улучшить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

export default ChatInput;
