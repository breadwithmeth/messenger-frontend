import React, { useEffect, useState, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Fade,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import api from "../api";
import ChatSidebar from "../components/ChatSidebar";
import ChatInfoSidebar from "../components/ChatInfoSidebar";
import ChatBubble from "../components/ChatBubble"; // Импортируем правильный компонент
import TopBar from "../components/TopBar";

function ChatMessages({ messages, userId, loading }) {
  const theme = useTheme();
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      // Плавная прокрутка
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const findQuotedMessageContent = (quotedId) => {
    if (!quotedId || !messages) return null;
    // Ищем сообщение, чей whatsappMessageId совпадает с quotedId
    const quotedMsg = messages.find(m => m.whatsappMessageId === quotedId);
    if (!quotedMsg) return null;

    if (quotedMsg.content) {
      return quotedMsg.content;
    }
    if (quotedMsg.mimeType) {
      if (quotedMsg.mimeType.startsWith('image/')) return '🖼️ Изображение';
      if (quotedMsg.mimeType.startsWith('video/')) return '📹 Видео';
      if (quotedMsg.mimeType.startsWith('audio/')) return '🎵 Аудио';
      return `📄 ${quotedMsg.filename || 'Файл'}`;
    }
    return null;
  };

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
      ref={containerRef}
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
          {grouped[date].map(msg => {
            // Если в сообщении нет quotedContent, но есть quotedMessageId, ищем его вручную
            const finalQuotedContent = msg.quotedContent || findQuotedMessageContent(msg.quotedMessageId);
            const messageWithQuote = { ...msg, quotedContent: finalQuotedContent };

            // Убедимся, что мы передаем все нужные пропсы в импортированный ChatBubble
            return <ChatBubble key={msg.id} message={messageWithQuote} isMe={msg.fromMe || msg.senderId === userId} />;
          })}
        </React.Fragment>
      ))}
    </Box>
  );
}

function ChatInput({ value, onChange, onSend, disabled, onRewrite, isRewriting }) {
  const theme = useTheme();
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
    onRewrite({
      text: textToRewrite,
      tone,
      style,
      length,
    });
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

  return (
    <>
      <Box
        component="form"
        onSubmit={onSend}
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          gap: 1,
        }}
      >
        <Button onClick={handleClick} disabled={disabled} variant="text" color="primary" sx={{ p: '8px 16px', minWidth: 'auto' }}>
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
              borderRadius: '0px',
              borderWidth: '2px',
            }
          }}
          InputProps={{
            endAdornment: isRewriting && <CircularProgress size={20} sx={{ mr: 1 }} color="secondary" />
          }}
        />
        <Button onClick={handleImproveMessage} disabled={disabled || !value.trim()} variant="text" color="primary" sx={{ p: '8px 16px', minWidth: 'auto' }}>
          Улучшить
        </Button>
        <Button
          type="submit"
          disabled={disabled || !value.trim()}
          color="primary"
          variant="contained"
          sx={{ p: '8px 16px', borderRadius: '20px' }}
        >
          Отправить
        </Button>
      </Box>
      <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{fontFamily: '"Press Start 2P", cursive'}}>Улучшить текст</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1, border: '2px dashed', borderColor: 'divider' }}>
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
        <DialogActions sx={{p: '16px 24px'}}>
          <Button onClick={handleDialogClose} variant="outlined">Отмена</Button>
          <Button onClick={handleConfirmRewrite} variant="contained">Улучшить</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function Messenger({ onLogout }) {
  const theme = useTheme();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [phoneInfo, setPhoneInfo] = useState(null);
  const [phoneInfoLoading, setPhoneInfoLoading] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const lastProcessedMessageIdRef = React.useRef(null);

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
          console.error('Не удалось загрузить чаты');
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
    
    // Сбрасываем ID обработанного сообщения при смене чата
    lastProcessedMessageIdRef.current = null;
    setSuggestedReplies([]);

    // Показываем загрузку только при первоначальном выборе чата
    setLoading(true);
    
    const fetchMessages = async (isInitial = false) => {
      try {
        const data = await api.getMessagesByChatId(selectedChat.id);
        console.log('Fetched messages:', data);
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
          console.error('Не удалось загрузить сообщения');
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

  // Генерация подсказок при обновлении сообщений
  useEffect(() => {
    if (!messages || messages.length === 0) {
      setSuggestedReplies([]);
      return;
    }

    const lastMessage = messages[messages.length - 1];
    
    // Генерируем подсказки только если:
    // 1. Последнее сообщение существует
    // 2. Оно не от нас
    // 3. Мы еще не обрабатывали это сообщение
    if (lastMessage && !lastMessage.fromMe && lastMessage.id !== lastProcessedMessageIdRef.current) {
      const generateReplies = async () => {
        // Запоминаем ID сообщения, которое мы *начинаем* обрабатывать
        const messageIdToProcess = lastMessage.id;
        lastProcessedMessageIdRef.current = messageIdToProcess;
        setLoadingSuggestions(true);
        
        try {
          const context = localStorage.getItem('aiContext') || '';
          // Берем последние 5 сообщений для контекста
          const history = messages.slice(-5);
          const replies = await api.suggestRepliesWithGemini(history, context);

          // Проверяем, что мы все еще в том же чате и обрабатываем то же сообщение
          if (lastProcessedMessageIdRef.current === messageIdToProcess) {
            setSuggestedReplies(replies);
          }
        } catch (error) {
          console.error("Ошибка при генерации подсказок:", error);
          // Не показываем уведомление пользователю, чтобы не мешать
        } finally {
          // Проверяем, что мы все еще в том же чате и обрабатываем то же сообщение
          if (lastProcessedMessageIdRef.current === messageIdToProcess) {
            setLoadingSuggestions(false);
          }
        }
      };
      generateReplies();
    } else if (lastMessage && lastMessage.fromMe) {
      // Если последнее сообщение от нас, очищаем подсказки
      setSuggestedReplies([]);
    }
  }, [messages]);


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
          console.error('Не удалось загрузить информацию о телефоне');
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

  const handleRewrite = async (options) => {
    const { text, tone, style, length } = options;
    if (!text) return;

    setIsRewriting(true);
    try {
      const geminiApiKey = localStorage.getItem('geminiApiKey');
      if (!geminiApiKey) {
        alert('API ключ для Gemini не найден. Добавьте его в настройках.');
        setIsRewriting(false);
        return;
      }
      const rewrittenText = await api.rewriteWithGemini(text, tone, style, length);
      setMessage(rewrittenText);
      alert('Текст успешно улучшен!');
    } catch (error) {
      console.error("Ошибка при переписывании текста:", error);
      if (error.message && error.message.includes('429')) {
          alert('Слишком много запросов к Gemini. Попробуйте позже.');
      } else {
          alert('Не удалось улучшить текст.');
      }
      // В случае ошибки вставляем оригинальный текст
      setMessage(text);
    } finally {
      setIsRewriting(false);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    setSending(true);

    try {
      // 1. Проверка сообщения перед отправкой
      const geminiApiKey = localStorage.getItem('geminiApiKey');
      if (geminiApiKey) {
        const analysis = await api.analyzeMessageWithGemini(message);
        if (analysis.has_errors || analysis.is_inappropriate) {
          let warningMessage = "Обнаружены возможные проблемы: ";
          const issues = [];
          if (analysis.has_errors) issues.push("ошибки");
          if (analysis.is_inappropriate) issues.push("нецензурная лексика");
          warningMessage += issues.join(', ') + ".";
          alert(warningMessage);
          // Мы не блокируем отправку, просто предупреждаем
        }
      }

      // 2. Отправка сообщения
      const organizationPhoneId = selectedChat.organizationPhone?.id || selectedChat.organizationPhoneId;
      const receiverJid = selectedChat.remoteJid;
      
      if (!organizationPhoneId || !receiverJid) {
        throw new Error('Недостаточно данных для отправки сообщения');
      }
      
      const sentMessage = await api.sendTextMessage({ 
        organizationPhoneId, 
        receiverJid, 
        text: message 
      });
      
      // 3. Обновление UI
      setMessages(prev => [...prev, sentMessage]);
      setMessage('');
      setSuggestedReplies([]); // Очищаем подсказки после отправки
      lastProcessedMessageIdRef.current = null; // Сбрасываем ID, чтобы не блокировать новые подсказки

      // 4. Обновляем список чатов, чтобы актуализировать последнее сообщение
       const updatedChats = await api.getChats();
       const sorted = [...updatedChats].sort((a, b) => {
         const getTime = chat => chat.lastMessage?.timestamp || chat.lastMessageAt || chat.createdAt || 0;
         return new Date(getTime(b)) - new Date(getTime(a));
       });
       setChats(sorted);


    } catch (error) {
      console.error("Ошибка при отправке сообщения:", error);
      alert('Не удалось отправить сообщение');
    } finally {
      setSending(false);
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      <ChatSidebar
        chats={chats}
        selectedChat={selectedChat}
        onSelect={handleSelectChat}
      />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <TopBar onLogout={onLogout} />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
            {selectedChat ? (
              <>
                <ChatMessages messages={messages} userId={null} loading={loading} />
                {loadingSuggestions && (
                  <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                    <CircularProgress size={20} />
                    <Typography variant="caption" color="text.secondary">Генерируем подсказки...</Typography>
                  </Box>
                )}
                {suggestedReplies.length > 0 && (
                  <Box sx={{ p: 1, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                    {suggestedReplies.map((reply, index) => (
                      <Button key={index} variant="outlined" size="small" onClick={() => setMessage(reply)}>
                        {reply}
                      </Button>
                    ))}
                  </Box>
                )}
                <ChatInput
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onSend={handleSendMessage}
                  disabled={sending || isRewriting}
                  onRewrite={handleRewrite}
                  isRewriting={isRewriting}
                />
              </>
            ) : (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Выберите чат, чтобы начать переписку
                </Typography>
              </Box>
            )}
          </Box>
          <ChatInfoSidebar chat={selectedChat} phoneInfo={phoneInfo} loading={phoneInfoLoading} />
        </Box>
      </Box>
    </Box>
  );
}
