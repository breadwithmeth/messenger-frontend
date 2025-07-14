import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Fade
} from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import api from "../api";
import ChatSidebar from "../components/ChatSidebar";
import ChatInfoSidebar from "../components/ChatInfoSidebar";

function ChatBubble({ message, isMe }) {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        alignSelf: isMe ? 'flex-end' : 'flex-start',
        bgcolor: isMe ? 'primary.dark' : 'background.paper',
        p: 2,
        borderRadius: 2,
        mb: 1,
        maxWidth: '75%',
        boxShadow: 1,
        position: 'relative'
      }}
    >
      <Typography variant="body1" color={isMe ? 'common.white' : 'text.primary'}>
        {message.content}
      </Typography>
      <Typography 
        variant="caption" 
        color={isMe ? 'primary.light' : 'text.secondary'}
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
          bgcolor: 'background.default'
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
        p: 2,
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

function ChatInput({ value, onChange, onSend, disabled }) {
  const theme = useTheme();
  
  return (
    <Box
      component="form"
      onSubmit={onSend}
      sx={{
        display: 'flex',
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
        size="small"
        sx={{ mr: 1 }}
      />
      <IconButton
        type="submit"
        disabled={disabled || !value.trim()}
        color="primary"
        size="large"
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
}

export default function Messenger() {
  const theme = useTheme();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
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
      } catch {}
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
        if (isMounted && isInitial) {
          setLoading(false);
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
    } catch {}
    setSending(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        bgcolor: 'background.default'
      }}
    >
      <ChatSidebar chats={chats} selectedChat={selectedChat} onSelect={setSelectedChat} />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: 1,
          borderColor: 'divider',
          minWidth: 0 // Важно для корректного переноса контента
        }}
      >
        {selectedChat ? (
          <>
            <Box
              sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper'
              }}
            >
              <Typography variant="subtitle1" fontWeight="medium">
                {selectedChat.name || selectedChat.remoteJid || selectedChat.receivingPhoneJid}
              </Typography>
            </Box>
            <ChatMessages messages={messages} userId={null} loading={loading} />
            <ChatInput
              value={message}
              onChange={e => setMessage(e.target.value)}
              onSend={handleSend}
              disabled={sending}
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
