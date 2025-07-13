import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Divider,
  IconButton 
} from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import api from "../api";
import ChatSidebar from "../components/ChatSidebar";

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

function ChatMessages({ messages, userId }) {
  const theme = useTheme();
  
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
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

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
    const fetchMessages = async () => {
      try {
        const data = await api.getMessagesByChatId(selectedChat.id);
        let msgs = Array.isArray(data) ? data : data.messages;
        msgs = msgs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        if (isMounted) setMessages(msgs);
      } catch {}
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [selectedChat]);

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

  const theme = useTheme();
  
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
          borderColor: 'divider'
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
            <ChatMessages messages={messages} userId={null} />
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
    </Box>
  );
}
