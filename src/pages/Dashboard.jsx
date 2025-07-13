import { useEffect, useRef, useState } from 'react';
import api from '../api';

function Dashboard() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchChats = () => {
      api.getChats()
        .then(data => {
          if (!isMounted) return;
          const sorted = [...data].sort((a, b) => {
            const getTime = chat =>
              chat.lastMessage?.timestamp || chat.lastMessageAt || chat.createdAt || 0;
            return new Date(getTime(b)) - new Date(getTime(a));
          });
          setChats(sorted);
        })
        .catch(err => isMounted && setError(err.message || 'Ошибка загрузки чатов'))
        .finally(() => isMounted && setLoading(false));
    };
    fetchChats();
    const intervalId = setInterval(fetchChats, 5000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const fetchMessages = async (chatId) => {
    if (chatMessages.length === 0) setMessagesLoading(true);
    setMessagesError('');
    try {
      const data = await api.getMessagesByChatId(chatId);
      let messages = Array.isArray(data) ? data : data.messages;
      messages = messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      if (
        chatMessages.length === messages.length &&
        (messages.length === 0 || chatMessages.at(-1)?.id === messages.at(-1)?.id)
      ) return;
      setChatMessages(messages);
    } catch {
      setMessagesError('Ошибка загрузки сообщений');
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleChatClick = (chat) => {
    setSelectedChat(chat);
    setChatMessages([]);
    setMessage('');
    setSendError('');
    setMessagesError('');
    fetchMessages(chat.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setSendError('');
    try {
      const organizationPhoneId = selectedChat.organizationPhone?.id || selectedChat.organizationPhoneId;
      const receiverJid = selectedChat.remoteJid;
      if (!organizationPhoneId || !receiverJid) {
        setSendError('Недостаточно данных');
        return;
      }
      await api.sendTextMessage({ organizationPhoneId, receiverJid, text: message });
      setMessage('');
      fetchMessages(selectedChat.id);
    } catch (err) {
      setSendError('Ошибка отправки: ' + (err?.message || ''));
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!selectedChat) return;
    const interval = setInterval(() => fetchMessages(selectedChat.id), 5000);
    return () => clearInterval(interval);
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif', background: '#fff', color: '#222' }}>
      {/* Sidebar */}
      <aside style={{ width: 280, borderRight: '1px solid #ddd', overflowY: 'auto', background: '#fafafa' }}>
        <div style={{ padding: 16, fontWeight: 'bold', fontSize: 18, borderBottom: '1px solid #ddd', textAlign: 'center' }}>
          Чаты
        </div>
        {loading ? (
          <div style={{ padding: 16, color: '#666', textAlign: 'center' }}>Загрузка...</div>
        ) : error ? (
          <div style={{ padding: 16, color: 'red', textAlign: 'center' }}>{error}</div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {chats.map(chat => (
              <li
                key={chat.id}
                onClick={() => handleChatClick(chat)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  background: selectedChat?.id === chat.id ? '#e0e0e0' : 'transparent',
                  borderBottom: '1px solid #ddd',
                  userSelect: 'none',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={e => { if (selectedChat?.id !== chat.id) e.currentTarget.style.backgroundColor = '#f5f5f5' }}
                onMouseLeave={e => { if (selectedChat?.id !== chat.id) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <div style={{ fontWeight: 600, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {chat.name || chat.remoteJid || chat.receivingPhoneJid}
                </div>
                <div style={{ color: '#555', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {chat.lastMessage?.content || 'Нет сообщений'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* Main panel */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
        {selectedChat ? (
          <>
            <header style={{ padding: 16, borderBottom: '1px solid #ddd', fontWeight: 600, fontSize: 18 }}>
              {selectedChat.name || selectedChat.remoteJid}
            </header>

            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column' }}>
              {messagesError && <div style={{ color: 'red', marginBottom: 8 }}>{messagesError}</div>}
              {chatMessages.map(msg => {
                const isMe = msg.fromMe;
                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      background: isMe ? '#e6e6e6' : '#f9f9f9',
                      padding: '10px 14px',
                      borderRadius: 10,
                      marginBottom: 8,
                      maxWidth: '70%',
                      fontSize: 15,
                      border: '1px solid #ccc',
                      wordBreak: 'break-word',
                      userSelect: 'text',
                    }}
                  >
                    <div>{msg.content}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                      {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              style={{ borderTop: '1px solid #ddd', display: 'flex', padding: 12, background: '#fafafa' }}
            >
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Введите сообщение..."
                style={{
                  flex: 1,
                  padding: 12,
                  fontSize: 16,
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  outline: 'none',
                }}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={sending || !message.trim()}
                style={{
                  marginLeft: 8,
                  padding: '0 20px',
                  background: '#333',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  borderRadius: 6,
                  cursor: sending || !message.trim() ? 'not-allowed' : 'pointer',
                  opacity: sending || !message.trim() ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                Отправить
              </button>
            </form>
            {sendError && (
              <div style={{ color: 'red', textAlign: 'center', padding: 6, fontWeight: 600 }}>
                {sendError}
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: 20,
              userSelect: 'none',
            }}
          >
            Выберите чат
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
