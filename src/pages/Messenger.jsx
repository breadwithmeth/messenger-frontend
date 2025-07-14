import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Fade,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { Send as SendIcon, Article as TemplateIcon } from '@mui/icons-material';
import api from "../api";
import ChatSidebar from "../components/ChatSidebar";
import ChatInfoSidebar from "../components/ChatInfoSidebar";
import { useNotification } from "../context/NotificationContext";

function ChatBubble({ message, isMe }) {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        alignSelf: isMe ? 'flex-end' : 'flex-start',
        bgcolor: isMe ? 'primary.main' : 'background.paper',
        color: isMe ? theme.palette.getContrastText(theme.palette.primary.main) : theme.palette.text.primary,
        p: '12px 16px',
        borderRadius: '16px',
        mb: 1,
        maxWidth: '75%',
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
        position: 'relative',
        wordBreak: 'break-word',
      }}
    >
      <Typography variant="body1" color={isMe ? 'common.white' : 'text.primary'}>
        {message.content}
      </Typography>
      <Typography 
        variant="caption" 
        color={isMe ? 'rgba(255,255,255,0.8)' : 'text.secondary'}
        sx={{ 
          mt: 0.5,
          display: 'block',
          textAlign: isMe ? 'right' : 'left'
        }}
      >
        {message.timestamp && new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Typography>
    </Box>
  );
}

function ChatMessages({ messages, userId, loading }) {
  const theme = useTheme();
  
  if (loading) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'transparent'
        }}
      >
        <Fade in={loading} style={{ transitionDelay: '500ms' }}>
          <CircularProgress />
        </Fade>
      </Box>
    );
  }

  const groupByDate = (msgs) => {
    const groups = {};
    msgs.forEach(msg => {
      const date = msg.timestamp ? new Date(msg.timestamp).toLocaleDateString() : '';
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };
  const grouped = groupByDate(messages);
  const dates = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));
  return (
    <Box
      sx={{
        flex: 1,
        p: 3,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default'
      }}
    >
      {dates.map(date => (
        <React.Fragment key={date}>
          <Typography
            variant="caption"
            component="div"
            align="center"
            color="text.secondary"
            sx={{ my: 2 }}
          >
            {date}
          </Typography>
          {grouped[date].map(msg => (
            <ChatBubble key={msg.id} message={msg} isMe={msg.fromMe || msg.senderId === userId} />
          ))}
        </React.Fragment>
      ))}
    </Box>
  );
}

function ChatInput({ value, onChange, onSend, disabled, onTemplateSelect, isRewriting }) {
  const theme = useTheme();
  const [templates, setTemplates] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // State for the rewrite options dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
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
    setSelectedTemplate(null);
    // Сбрасываем значения при закрытии
    setTone('professional');
    setStyle('friendly');
    setLength('same');
  };

  const handleSelect = (template) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
    handleClose();
  };

  const handleRewrite = () => {
    if (!selectedTemplate) return;
    onTemplateSelect({
      text: selectedTemplate.text,
      tone,
      style,
      length,
    });
    handleDialogClose();
  };
  
  return (
    <>
      <Box
        component="form"
        onSubmit={onSend}
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Tooltip title="Использовать шаблон">
          <IconButton onClick={handleClick} disabled={disabled} sx={{ pb: 0.5 }}>
            <TemplateIcon />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          {templates.length > 0 ? (
            templates.map(template => (
              <MenuItem key={template.id} onClick={() => handleSelect(template)}>
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
          onChange={onChange}
          placeholder={isRewriting ? "Улучшаем текст..." : "Введите сообщение..."}
          disabled={disabled}
          autoFocus
          variant="outlined"
          size="medium"
          sx={{ 
            mr: 1,
            ml: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
            }
          }}
          InputProps={{
            endAdornment: isRewriting && <CircularProgress size={20} sx={{ mr: 1 }} />
          }}
        />
        <IconButton
          type="submit"
          disabled={disabled || !value.trim()}
          color="primary"
          size="large"
          sx={{ pb: 0.5 }}
        >
          <SendIcon />
        </IconButton>
      </Box>
      <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Улучшить текст шаблона</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            {selectedTemplate?.text}
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
          <Button onClick={handleDialogClose}>Отмена</Button>
          <Button onClick={handleRewrite} variant="contained">Улучшить</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function Messenger() {
  const theme = useTheme();
  const { showNotification } = useNotification();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [phoneInfo, setPhoneInfo] = useState(null);
  const [phoneInfoLoading, setPhoneInfoLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchChats = async () => {
      try {
        const data = await api.getChats();
        const sorted = [...data].sort((a, b) => {
          const getTime = chat => chat.lastMessage?.timestamp || chat.lastMessageAt || chat.createdAt || 0;
          return new Date(getTime(b)) - new Date(getTime(a));
        });
        if (isMounted) setChats(sorted);
      } catch {
        if (isMounted) {
          showNotification('Не удалось загрузить чаты', 'error');
        }
      }
    };
    fetchChats();
    const interval = setInterval(fetchChats, 5000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  useEffect(() => {
    if (!selectedChat) return;
    let isMounted = true;
    
    // Показываем загрузку только при первоначальном выборе чата
    setLoading(true);
    
    const fetchMessages = async (isInitial = false) => {
      try {
        const data = await api.getMessagesByChatId(selectedChat.id);
        let msgs = Array.isArray(data) ? data : data.messages;
        msgs = msgs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        if (isMounted) {
          setMessages(msgs);
          // Убираем индикатор загрузки только после первоначальной загрузки
          if (isInitial) {
            setLoading(false);
          }
        }
      } catch {
        if (isMounted) {
          showNotification('Не удалось загрузить сообщения', 'error');
          if (isInitial) {
            setLoading(false);
          }
        }
      }
    };

    // Первоначальная загрузка с индикатором
    fetchMessages(true);
    
    // Периодическое обновление без индикатора загрузки
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 5000);
    
    return () => { 
      isMounted = false; 
      clearInterval(interval); 
    };
  }, [selectedChat]);

  // Загрузка информации о телефоне при выборе чата
  useEffect(() => {
    if (!selectedChat) {
      setPhoneInfo(null);
      return;
    }

    let isMounted = true;

    const fetchPhoneInfo = async () => {
      try {
        setPhoneInfoLoading(true);
        const phones = await api.getOrganizationPhones();
        const phoneId = selectedChat.organizationPhone?.id || selectedChat.organizationPhoneId;
        const phone = phones.find(p => p.id === phoneId);
        if (isMounted) {
          if (phone) {
            setPhoneInfo(phone);
          }
          setPhoneInfoLoading(false);
        }
      } catch (err) {
        console.error('Ошибка при загрузке информации о телефоне:', err);
        if (isMounted) {
          showNotification('Не удалось загрузить информацию о телефоне', 'error');
          setPhoneInfoLoading(false);
        }
      }
    };

    // Начальная загрузка
    fetchPhoneInfo();

    // Обновление каждые 10 секунд
    const interval = setInterval(fetchPhoneInfo, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedChat]);

  const handleTemplateSelect = async (options) => {
    const { text, tone, style, length } = options;
    setIsRewriting(true);
    try {
      const rewrittenText = await api.rewriteWithGemini(text, { tone, style, length });
      setMessage(rewrittenText);
      showNotification('Текст успешно улучшен!', 'success');
    } catch (error) {
      console.error("Ошибка при переписывании шаблона:", error);
      showNotification(error.message || 'Ошибка при улучшении текста', 'error');
      // В случае ошибки просто вставляем исходный текст шаблона
      setMessage(text);
    } finally {
      setIsRewriting(false);
    }
  };

  const handlePhoneUpdate = (updatedPhone) => {
    setPhoneInfo(updatedPhone);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;
    setSending(true);
    try {
      await api.sendTextMessage({
        organizationPhoneId: selectedChat.organizationPhone?.id || selectedChat.organizationPhoneId,
        receiverJid: selectedChat.remoteJid,
        text: message,
      });
      setMessage('');
      // Не показываем уведомление об успешной отправке, чтобы не засорять интерфейс
    } catch {
      showNotification('Ошибка при отправке сообщения', 'error');
    }
    setSending(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      <ChatSidebar chats={chats} selectedChat={selectedChat} onSelect={setSelectedChat} />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0
        }}
      >
        {selectedChat ? (
          <>
            <Box
              sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                minHeight: '64px',
              }}
            >
              <Typography variant="h6" fontWeight="medium" noWrap>
                {selectedChat.name || selectedChat.remoteJid || selectedChat.receivingPhoneJid}
              </Typography>
            </Box>
            <ChatMessages messages={messages} userId={null} loading={loading} />
            <ChatInput
              value={message}
              onChange={e => setMessage(e.target.value)}
              onSend={handleSend}
              disabled={sending || isRewriting}
              onTemplateSelect={handleTemplateSelect}
              isRewriting={isRewriting}
            />
          </>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="subtitle1" color="text.secondary">
              Выберите чат слева
            </Typography>
          </Box>
        )}
      </Box>
      <ChatInfoSidebar chat={selectedChat} onPhoneUpdate={handlePhoneUpdate} />
    </Box>
  );
}
