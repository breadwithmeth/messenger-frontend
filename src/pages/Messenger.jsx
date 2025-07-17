import React, { useEffect, useState, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  CircularProgress,
  Fade,
} from "@mui/material";
import api from "../api";
import ChatSidebar from "../components/ChatSidebar";
import ChatInfoSidebar from "../components/ChatInfoSidebar";
import ChatBubble from "../components/ChatBubble"; // Импортируем правильный компонент
import MessageGroupHeader from "../components/MessageGroupHeader";
import TopBar from "../components/TopBar";
import ChatInput from "../components/ChatInput";
import { useNotification } from "../context/NotificationContext";
import { useAudioNotification } from "../hooks/useAudioNotification";

function ChatMessages({ messages, userId, loading, isFirstLoad, onFirstLoadComplete }) {
  const theme = useTheme();
  const containerRef = useRef(null);

  useEffect(() => {
    // Прокручиваем вниз только при первой загрузке сообщений
    if (containerRef.current && isFirstLoad && messages.length > 0) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
      onFirstLoadComplete();
    }
  }, [messages, isFirstLoad, onFirstLoadComplete]);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  // Убираем автоматическое прокручивание при каждом обновлении
  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

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
          {grouped[date].map((msg, index) => {
            // Если в сообщении нет quotedContent, но есть quotedMessageId, ищем его вручную
            const finalQuotedContent = msg.quotedContent || findQuotedMessageContent(msg.quotedMessageId);
            const messageWithQuote = { ...msg, quotedContent: finalQuotedContent };

            const prevMsg = index > 0 ? grouped[date][index - 1] : null;
            
            // Определяем, нужно ли показывать информацию об отправителе
            const showSenderInfo = msg.fromMe && msg.senderUser && (
              !prevMsg || 
              !prevMsg.fromMe || 
              prevMsg.senderUserId !== msg.senderUserId ||
              (new Date(msg.timestamp) - new Date(prevMsg.timestamp)) > 5 * 60 * 1000 // 5 минут
            );

            return (
              <React.Fragment key={msg.id}>
                {/* Показываем заголовок группы сообщений */}
                {showSenderInfo && (
                  <MessageGroupHeader 
                    key={`header-${msg.id}`}
                    senderUser={msg.senderUser} 
                    timestamp={msg.timestamp}
                  />
                )}
                <ChatBubble 
                  key={`bubble-${msg.id}`}
                  message={messageWithQuote} 
                  isMe={msg.fromMe || msg.senderId === userId} 
                />
              </React.Fragment>
            );
          })}
        </React.Fragment>
      ))}
    </Box>
  );
}



export default function Messenger({ onLogout }) {
  const theme = useTheme();
  const { showNotification } = useNotification();
  const { playNotificationSound, enableAudio, isAudioEnabled, hasUserInteracted } = useAudioNotification();
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
  const [isFirstMessageLoad, setIsFirstMessageLoad] = useState(true);
  const lastProcessedMessageIdRef = React.useRef(null);
  
  // Для уведомлений о новых сообщениях
  const [lastKnownMessageCounts, setLastKnownMessageCounts] = useState({});
  const [newMessageCounts, setNewMessageCounts] = useState({});
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchChats = async () => {
      try {
        const data = await api.getChats();
        
        // Проверяем новые сообщения для уведомлений
        if (initialLoadComplete) {
          const newCounts = { ...newMessageCounts };
          
          data.forEach(chat => {
            const chatId = chat.id;
            const lastMessage = chat.lastMessage;
            
            if (lastMessage && !lastMessage.fromMe) {
              const lastKnown = lastKnownMessageCounts[chatId];
              const currentMessageId = lastMessage.id;
              
              // Если это новое сообщение от клиента
              if (lastKnown && lastKnown !== currentMessageId) {
                // Если мы не в этом чате, увеличиваем счетчик
                if (selectedChat?.id !== chatId) {
                  newCounts[chatId] = (newCounts[chatId] || 0) + 1;
                  
                  // Показываем уведомление
                  const chatName = chat.name || chat.remoteJid?.split('@')[0] || 'Неизвестный чат';
                  const messagePreview = lastMessage.content?.length > 50 
                    ? lastMessage.content.slice(0, 50) + '...' 
                    : lastMessage.content || 'Новое сообщение';
                  
                  showNotification(
                    `${chatName}: ${messagePreview}`,
                    'info'
                  );
                  
                  // Воспроизводим звук уведомления (Swiss Style: функциональность без излишеств)
                  playNotificationSound();
                }
              }
            }
          });
          
          setNewMessageCounts(newCounts);
        }
        
        // Обновляем счетчики сообщений
        const updatedMessageCounts = {};
        data.forEach(chat => {
          if (chat.lastMessage) {
            updatedMessageCounts[chat.id] = chat.lastMessage.id;
          }
        });
        setLastKnownMessageCounts(updatedMessageCounts);
        
        // Сортируем чаты по времени от новых к старым
        const sorted = [...data].sort((a, b) => {
          // Сначала сортируем по статусу ответа (неотвеченные сверху)
          const aIsUnread = a.lastMessage && !a.lastMessage.fromMe;
          const bIsUnread = b.lastMessage && !b.lastMessage.fromMe;
          
          if (aIsUnread && !bIsUnread) return -1;
          if (!aIsUnread && bIsUnread) return 1;
          
          // Затем по времени последнего сообщения (от новых к старым)
          const getTime = chat => {
            const timestamp = chat.lastMessage?.timestamp || chat.lastMessageAt || chat.createdAt;
            return timestamp ? new Date(timestamp).getTime() : 0;
          };
          return getTime(b) - getTime(a);
        });
        
        if (isMounted) {
          setChats(sorted);
          if (!initialLoadComplete) {
            setInitialLoadComplete(true);
          }
        }
      } catch {
        if (isMounted) {
          console.error('Не удалось загрузить чаты');
        }
      }
    };
    fetchChats();
    // Обновляем чаты каждые 2 секунды
    const interval = setInterval(fetchChats, 2000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [selectedChat, initialLoadComplete, lastKnownMessageCounts, newMessageCounts, showNotification, playNotificationSound]);

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
    
    // Периодическое обновление без индикатора загрузки (каждые 2 секунды)
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 2000);
    
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
      const geminiApiKey = localStorage.getItem('gemini_api_key');
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
      // Отправка сообщения
      const organizationPhoneId = selectedChat.organizationPhone?.id || selectedChat.organizationPhoneId;
      const receiverJid = selectedChat.remoteJid;
      
      if (!organizationPhoneId || !receiverJid) {
        throw new Error('Недостаточно данных для отправки сообщения');
      }
      
      // Отправка сообщения
      const sentMessage = await api.sendTextMessage({ 
        organizationPhoneId, 
        receiverJid, 
        text: message 
      });
      
      // Обновление UI
      setMessages(prev => [...prev, sentMessage]);
      setMessage('');
      setSuggestedReplies([]); // Очищаем подсказки после отправки
      lastProcessedMessageIdRef.current = null; // Сбрасываем ID, чтобы не блокировать новые подсказки

      // Обновляем список чатов, чтобы актуализировать последнее сообщение
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
    setIsFirstMessageLoad(true); // Сбрасываем флаг при выборе нового чата
    
    // Очищаем счетчик новых сообщений для выбранного чата
    if (newMessageCounts[chat.id] > 0) {
      setNewMessageCounts(prev => ({
        ...prev,
        [chat.id]: 0
      }));
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      <ChatSidebar
        chats={chats}
        selectedChat={selectedChat}
        onSelect={handleSelectChat}
        newMessageCounts={newMessageCounts}
      />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <TopBar 
          onLogout={onLogout} 
          audioControls={{
            enableAudio,
            isAudioEnabled,
            hasUserInteracted
          }}
        />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
            {selectedChat ? (
              <>
                <ChatMessages 
                  messages={messages} 
                  userId={null} 
                  loading={loading} 
                  isFirstLoad={isFirstMessageLoad}
                  onFirstLoadComplete={() => setIsFirstMessageLoad(false)}
                />
                {loadingSuggestions && (
                  <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                    <CircularProgress size={20} />
                    <Typography variant="caption" color="text.secondary">Генерируем подсказки...</Typography>
                  </Box>
                )}
                {suggestedReplies.length > 0 && (
                  <Box sx={{ 
                    p: 1.5, 
                    display: 'flex', 
                    gap: 1, 
                    flexWrap: 'wrap', 
                    justifyContent: 'center', 
                    borderTop: '1px solid', 
                    borderColor: 'divider',
                    backgroundColor: '#FAFAFA'
                  }}>
                    {suggestedReplies.map((reply, index) => (
                      <Button 
                        key={index} 
                        variant="outlined" 
                        size="small" 
                        onClick={() => setMessage(reply)}
                        sx={{
                          borderRadius: 0, // Swiss style: rectangular
                          textTransform: 'none',
                          fontSize: '0.875rem',
                          fontWeight: 400,
                          border: '1px solid #000000',
                          color: '#000000',
                          padding: '8px 16px',
                          '&:hover': {
                            backgroundColor: '#F0F0F0',
                            borderColor: '#000000',
                          }
                        }}
                      >
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
