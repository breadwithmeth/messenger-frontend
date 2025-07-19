import React, { useState, useMemo, useTransition, useCallback, useDeferredValue } from 'react';
import { 
  Box, 
  TextField, 
  List, 
  ListItem, 
  ListItemText, 
  Typography,
  CircularProgress 
} from '@mui/material';

/**
 * Пример ПОЛНОСТЬЮ оптимизированного компонента без лагов ввода
 * Демонстрирует все техники оптимизации
 */

// 1. Мемоизированный компонент элемента списка
const MessageItem = React.memo(({ message, onSelect, isSelected }) => {
  const handleClick = useCallback(() => {
    onSelect(message);
  }, [message, onSelect]);

  return (
    <ListItem 
      button 
      selected={isSelected}
      onClick={handleClick}
      sx={{
        backgroundColor: isSelected ? 'action.selected' : 'transparent',
        '&:hover': { backgroundColor: 'action.hover' },
        transition: 'none', // Убираем анимации для производительности
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <ListItemText
        primary={message.content}
        secondary={`${message.sender} • ${new Date(message.timestamp).toLocaleTimeString()}`}
        primaryTypographyProps={{
          sx: {
            fontWeight: isSelected ? 600 : 400,
            fontSize: '0.95rem'
          }
        }}
        secondaryTypographyProps={{
          sx: { fontSize: '0.8rem', color: 'text.secondary' }
        }}
      />
    </ListItem>
  );
}, (prevProps, nextProps) => {
  // Кастомная функция сравнения для оптимизации
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.message.content === nextProps.message.content
  );
});

// 2. Хук для оптимизированного поиска
const useOptimizedMessageSearch = (messages, searchTerm) => {
  // Используем deferredValue для изоляции поиска от ввода
  const deferredSearchTerm = useDeferredValue(searchTerm);
  
  // Мемоизируем фильтрацию
  const filteredMessages = useMemo(() => {
    if (!deferredSearchTerm.trim()) {
      return messages;
    }
    
    const term = deferredSearchTerm.toLowerCase();
    return messages.filter(message => 
      message.content.toLowerCase().includes(term) ||
      message.sender.toLowerCase().includes(term)
    );
  }, [messages, deferredSearchTerm]);

  return {
    filteredMessages,
    isSearching: searchTerm !== deferredSearchTerm
  };
};

// 3. Главный компонент
const OptimizedMessenger = ({ messages: initialMessages = [], onMessageSelect }) => {
  // Локальное состояние для немедленного отображения ввода
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messages, setMessages] = useState(initialMessages);
  
  // Transition для плавных обновлений
  const [isPending, startTransition] = useTransition();

  // Оптимизированный поиск с изоляцией
  const { filteredMessages, isSearching } = useOptimizedMessageSearch(messages, searchTerm);

  // Мемоизированные обработчики
  const handleSearchChange = useCallback((event) => {
    const value = event.target.value;
    // Немедленно обновляем input для отзывчивости
    setSearchTerm(value);
  }, []);

  const handleMessageSelect = useCallback((message) => {
    startTransition(() => {
      setSelectedMessage(message);
      onMessageSelect?.(message);
    });
  }, [onMessageSelect]);

  const handleAddMessage = useCallback((newMessage) => {
    startTransition(() => {
      setMessages(prev => [...prev, newMessage]);
    });
  }, []);

  // Мемоизированный рендер списка для стабильности
  const messageList = useMemo(() => (
    <List 
      sx={{ 
        height: 400, 
        overflow: 'auto',
        '& .MuiListItem-root': {
          px: 2,
          py: 1
        }
      }}
    >
      {filteredMessages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          onSelect={handleMessageSelect}
          isSelected={selectedMessage?.id === message.id}
        />
      ))}
      {filteredMessages.length === 0 && searchTerm.trim() && !isSearching && (
        <ListItem>
          <ListItemText 
            primary="Сообщения не найдены"
            sx={{ textAlign: 'center', color: 'text.secondary' }}
          />
        </ListItem>
      )}
    </List>
  ), [filteredMessages, handleMessageSelect, selectedMessage?.id, searchTerm, isSearching]);

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', p: 2 }}>
      {/* Заголовок с индикатором */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Сообщения ({filteredMessages.length})
        </Typography>
        {(isSearching || isPending) && (
          <CircularProgress size={20} sx={{ ml: 2 }} />
        )}
      </Box>

      {/* Оптимизированный поиск */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Поиск сообщений..."
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            transition: 'none', // Убираем все анимации
            '& fieldset': { transition: 'none' },
            '&:hover fieldset': { transition: 'none' },
            '&.Mui-focused fieldset': { transition: 'none' }
          },
          '& .MuiInputBase-input': {
            transition: 'none',
            fontSize: '16px' // Предотвращаем zoom на мобильных
          }
        }}
      />

      {/* Мемоизированный список */}
      {messageList}

      {/* Информация о выбранном сообщении */}
      {selectedMessage && (
        <Box 
          sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Выбранное сообщение:
          </Typography>
          <Typography variant="body2">
            {selectedMessage.content}
          </Typography>
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            От: {selectedMessage.sender} • {new Date(selectedMessage.timestamp).toLocaleString()}
          </Typography>
        </Box>
      )}

      {/* Кнопка для добавления тестового сообщения */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <button
          onClick={() => handleAddMessage({
            id: Date.now(),
            content: `Новое сообщение ${Date.now()}`,
            sender: 'User',
            timestamp: new Date().toISOString()
          })}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Добавить сообщение (для теста)
        </button>
      </Box>
    </Box>
  );
};

export default OptimizedMessenger;
