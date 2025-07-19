import React, { useEffect, useState, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  CircularProgress,
  Fade,
  Button,
} from "@mui/material";
import api from "../api";
import ChatSidebar from "../components/ChatSidebar";
import ChatInfoSidebar from "../components/ChatInfoSidebar";
import ChatBubble from "../components/ChatBubble"; // Импортируем правильный компонент
import MessageGroupHeader from "../components/MessageGroupHeader";
import TopBar from "../components/TopBar";
import ChatInput from "../components/ChatInput";


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
      if (!msg.timestamp) return;
      
      const messageDate = new Date(msg.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dateKey;
      if (messageDate.toDateString() === today.toDateString()) {
        dateKey = 'Сегодня';
      } else if (messageDate.toDateString() === yesterday.toDateString()) {
        dateKey = 'Вчера';
      } else if (messageDate.getFullYear() === today.getFullYear()) {
        // Этот год - показываем день и месяц
        dateKey = messageDate.toLocaleDateString('ru-RU', { 
          day: 'numeric', 
          month: 'long' 
        });
      } else {
        // Другой год - показываем полную дату
        dateKey = messageDate.toLocaleDateString('ru-RU', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        });
      }
      
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(msg);
    });
    return groups;
  };
  const grouped = groupByDate(messages);
  const dates = Object.keys(grouped).sort((a, b) => {
    // Специальная сортировка для текстовых дат
    const getDateValue = (dateStr) => {
      if (dateStr === 'Сегодня') return new Date().getTime();
      if (dateStr === 'Вчера') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.getTime();
      }
      // Для остальных дат пытаемся найти первое сообщение этой группы
      const firstMsg = grouped[dateStr]?.[0];
      return firstMsg?.timestamp ? new Date(firstMsg.timestamp).getTime() : 0;
    };
    return getDateValue(a) - getDateValue(b);
  });
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
            key={`date-header-${date}`}
            variant="body2"
            component="div"
            align="center"
            sx={{ 
              my: 3,
              py: 1.5,
              px: 3,
              backgroundColor: '#F5F5F5',
              color: '#333333',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.8rem',
              borderRadius: 0, // Swiss style
              border: '1px solid #D0D0D0',
              maxWidth: 250,
              mx: 'auto',
              fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
            }}
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
              <React.Fragment key={`msg-fragment-${msg.id}`}>
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
                  showTime={true}
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
  const [currentUser, setCurrentUser] = useState(null);
  const lastProcessedMessageIdRef = React.useRef(null);

  // Получаем информацию о текущем пользователе
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await api.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Ошибка при загрузке текущего пользователя:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchChats = async () => {
      try {
        // Получаем назначенные чаты за последние 24 часа
        const data = await api.getMyAssignedChats();
        const recieved_chats = Array.isArray(data.chats) ? data.chats : []; // Обрабатываем данные как массив чатов
        
        // Сортируем чаты по времени от новых к старым
        const sorted = Array.isArray(recieved_chats) ? [...recieved_chats].sort((a, b) => {
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
        }) : [];
        
        if (isMounted) {
          setChats(sorted);
        }
      } catch (error) {
        console.error("Ошибка при загрузке чатов:", error);
        
        if (isMounted) {
          console.error('Не удалось загрузить чаты');
        }
      }
    };
    fetchChats();
    // Обновляем чаты каждые 2 секунды
    const interval = setInterval(fetchChats, 2000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [selectedChat]);

  // Функция для принудительного обновления чатов (для использования в TopBar)
  const handleChatUpdated = async () => {
    try {
      // Получаем назначенные чаты за последние 24 часа
      const data = await api.getMyAssignedChats();
      const recieved_chats = Array.isArray(data.chats) ? data.chats : [];
      
      const sorted = Array.isArray(recieved_chats) ? [...recieved_chats].sort((a, b) => {
        const aIsUnread = a.lastMessage && !a.lastMessage.fromMe;
        const bIsUnread = b.lastMessage && !b.lastMessage.fromMe;
        
        if (aIsUnread && !bIsUnread) return -1;
        if (!aIsUnread && bIsUnread) return 1;
        
        const getTime = chat => {
          const timestamp = chat.lastMessage?.timestamp || chat.lastMessageAt || chat.createdAt;
          return timestamp ? new Date(timestamp).getTime() : 0;
        };
        return getTime(b) - getTime(a);
      }) : [];
      
      setChats(sorted);
      
      // Обновляем selectedChat, если он существует
      if (selectedChat) {
        const updatedSelectedChat = sorted.find(chat => chat.id === selectedChat.id);
        if (updatedSelectedChat) {
          setSelectedChat(updatedSelectedChat);
        }
      }
    } catch (error) {
      console.error("Error updating chats:", error);
    }
  };

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
            // Отмечаем сообщения как прочитанные при первоначальной загрузке
            api.markChatAsRead(selectedChat.id).catch(error => {
              console.error('Ошибка при отметке сообщений как прочитанных:', error);
            });
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

    // Проверяем права доступа к чату
    if (!canWriteToChat(selectedChat, currentUser)) {
      alert('Вы не можете писать в этот чат. Чат назначен на другого оператора.');
      return;
    }

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

      // Отмечаем сообщения как прочитанные после отправки
      if (selectedChat.id) {
        api.markChatAsRead(selectedChat.id).catch(error => {
          console.error('Ошибка при отметке сообщений как прочитанных:', error);
        });
      }

      // Обновляем список чатов, чтобы актуализировать последнее сообщение
       const updatedChats = await api.getMyAssignedChats();
       const sorted = [...(updatedChats.chats || [])].sort((a, b) => {
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

  const handleSendMedia = async (file, mediaType, caption = '') => {
    if (!selectedChat) return;

    // Проверяем права доступа к чату
    if (!canWriteToChat(selectedChat, currentUser)) {
      alert('Вы не можете писать в этот чат. Чат назначен на другого оператора.');
      return;
    }

    try {
      console.log('Sending media file:', file.name, 'to chat:', selectedChat.id, 'type:', mediaType);
      
      await api.sendMediaMessage({
        chatId: selectedChat.id,
        file,
        mediaType,
        caption
      });

      // Обновляем сообщения после отправки
      const updatedMessages = await api.getMessagesByChatId(selectedChat.id);
      const msgs = Array.isArray(updatedMessages) ? updatedMessages : (updatedMessages?.messages || []);
      setMessages(msgs);

      // Отмечаем сообщения как прочитанные
      if (selectedChat.id) {
        api.markChatAsRead(selectedChat.id).catch(error => {
          console.error('Ошибка при отметке сообщений как прочитанных:', error);
        });
      }

      // Обновляем список чатов
      const updatedChats = await api.getMyAssignedChats();
      const receivedChats = Array.isArray(updatedChats.chats) ? updatedChats.chats : [];
      const sorted = [...receivedChats].sort((a, b) => {
        const getTime = chat => chat.lastMessage?.timestamp || chat.lastMessageAt || chat.createdAt || 0;
        return new Date(getTime(b)) - new Date(getTime(a));
      });
      setChats(sorted);

    } catch (error) {
      console.error("Ошибка при отправке медиафайла:", error);
      alert('Не удалось отправить медиафайл: ' + (error.message || 'Неизвестная ошибка'));
    }
  };

  // Функция для проверки, может ли текущий пользователь писать в чат
  const canWriteToChat = (chat, user) => {
    if (!chat || !user) return false;
    
    // Если у чата нет assignedUser, значит чат свободен и в него можно писать
    if (!chat.assignedUser) return true;
    
    // Если есть assignedUser, проверяем совпадение ID
    return chat.assignedUser.id === user.id;
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setIsFirstMessageLoad(true); // Сбрасываем флаг при выборе нового чата
    
    // Отмечаем сообщения как прочитанные
    if (chat.id) {
      api.markChatAsRead(chat.id).catch(error => {
        console.error('Ошибка при отметке сообщений как прочитанных:', error);
      });
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      <ChatSidebar
        chats={chats}
        selectedChat={selectedChat}
        onSelect={handleSelectChat}
      />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <TopBar 
          onLogout={onLogout} 
          selectedChat={selectedChat}
          onChatUpdated={handleChatUpdated}
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
                  <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'center' }}>
                    <CircularProgress size={20} sx={{ color: '#2196F3' }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#424242',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                      }}
                    >
                      Генерируем подсказки...
                    </Typography>
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
                        key={`reply-${index}-${reply.slice(0, 10)}`} 
                        variant="outlined" 
                        size="small" 
                        onClick={() => setMessage(reply)}
                        sx={{
                          borderRadius: 0, // Swiss style: rectangular
                          textTransform: 'none',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          border: '2px solid #2196F3',
                          color: '#1976D2',
                          backgroundColor: '#FFFFFF',
                          padding: '10px 20px',
                          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                          '&:hover': {
                            backgroundColor: '#E3F2FD',
                            borderColor: '#1976D2',
                            color: '#0D47A1',
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
                  disabled={sending || isRewriting || !canWriteToChat(selectedChat, currentUser)}
                  onRewrite={handleRewrite}
                  isRewriting={isRewriting}
                  onMediaSend={handleSendMedia}
                />
                {selectedChat && currentUser && !canWriteToChat(selectedChat, currentUser) && (
                  <Box sx={{ 
                    p: 3, 
                    bgcolor: '#FFF3E0', 
                    borderTop: '3px solid #FF9800',
                    borderBottom: '1px solid #FFB74D'
                  }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#E65100',
                        fontWeight: 500,
                        textAlign: 'center',
                        fontSize: '0.95rem',
                        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                      }}
                    >
                      Этот чат назначен на другого оператора ({selectedChat.assignedUser?.email}). 
                      Для отправки сообщений необходимо забрать чат.
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: '#616161',
                    fontWeight: 400,
                    fontSize: '1.25rem',
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                  }}
                >
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
