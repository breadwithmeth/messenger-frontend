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
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchChats = () => {
      api.getChats()
        .then(data => {
          if (!isMounted) return;
          
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
          
          setChats(sorted);
        })
        .catch(err => isMounted && setError(err.message || 'Ошибка загрузки чатов'))
        .finally(() => isMounted && setLoading(false));
    };
    fetchChats();
    // Обновляем чаты каждые 2 секунды
    const intervalId = setInterval(fetchChats, 2000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [selectedChat]);

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
    setIsFirstLoad(true); // Сбрасываем флаг при выборе нового чата
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
    // Обновляем сообщения каждые 2 секунды
    const interval = setInterval(() => fetchMessages(selectedChat.id), 2000);
    return () => clearInterval(interval);
  }, [selectedChat]);

  useEffect(() => {
    // Прокручиваем вниз только при первой загрузке сообщений
    if (messagesEndRef.current && isFirstLoad && chatMessages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setIsFirstLoad(false);
    }
  }, [chatMessages, isFirstLoad]);

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
            {chats.map(chat => {
              // Определяем, является ли чат неотвеченным (последнее сообщение не от нас)
              const isUnread = chat.lastMessage && !chat.lastMessage.fromMe;
              
              return (
                <li
                  key={chat.id}
                  onClick={() => handleChatClick(chat)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    background: selectedChat?.id === chat.id ? '#e0e0e0' : (isUnread ? '#fff8e1' : 'transparent'),
                    borderBottom: '1px solid #ddd',
                    borderLeft: isUnread ? '4px solid #ff9800' : 'none',
                    userSelect: 'none',
                    transition: 'background-color 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={e => { 
                    if (selectedChat?.id !== chat.id) {
                      e.currentTarget.style.backgroundColor = isUnread ? '#fff3c4' : '#f5f5f5';
                    }
                  }}
                  onMouseLeave={e => { 
                    if (selectedChat?.id !== chat.id) {
                      e.currentTarget.style.backgroundColor = isUnread ? '#fff8e1' : 'transparent';
                    }
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: 4 
                  }}>
                    <div style={{ 
                      fontWeight: isUnread ? 'bold' : 600, 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      flex: 1,
                      marginRight: 8
                    }}>
                      {chat.name || chat.remoteJid || chat.receivingPhoneJid}
                    </div>
                    {isUnread && (
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: 0, // Swiss style: square indicator
                        backgroundColor: '#FF0000', // Swiss style red
                        flexShrink: 0,
                      }} />
                    )}
                  </div>
                  <div style={{ 
                    color: '#555', 
                    fontSize: 14, 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    fontWeight: isUnread ? 500 : 'normal'
                  }}>
                    {chat.lastMessage?.content || 'Нет сообщений'}
                  </div>
                  {chat.lastMessage?.timestamp && (
                    <div style={{
                      color: isUnread ? '#ff9800' : '#888',
                      fontSize: 12,
                      marginTop: 2,
                      fontWeight: isUnread ? 'bold' : 'normal'
                    }}>
                      {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </li>
              );
            })}
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
                      background: isMe ? '#000000' : '#FFFFFF',
                      color: isMe ? '#FFFFFF' : '#000000',
                      padding: '10px 14px',
                      borderRadius: 0, // Swiss style: rectangular bubbles
                      marginBottom: 8,
                      maxWidth: '70%',
                      fontSize: 15,
                      border: '2px solid #000000',
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
                  borderRadius: 0, // Swiss style: rectangular input
                  border: '2px solid #000000',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                }}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={sending || !message.trim()}
                style={{
                  marginLeft: 8,
                  padding: '12px 24px',
                  background: '#000000',
                  color: '#FFFFFF',
                  border: '2px solid #000000',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontSize: '0.875rem',
                  borderRadius: 0, // Swiss style: rectangular send button
                  cursor: sending || !message.trim() ? 'not-allowed' : 'pointer',
                  opacity: sending || !message.trim() ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
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
