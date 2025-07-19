import React from "react";
import { Box, Typography, Menu, MenuItem } from "@mui/material";

const API_URL_ROOT = (import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000/').replace(/\/$/, '');

// Константы для ограничений загрузки медиафайлов
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_COOLDOWN = 30 * 1000; // 30 секунд

// Глобальное хранилище попыток загрузки с персистентностью в localStorage
const downloadAttempts = new Map();

// Загружаем сохраненные попытки из localStorage
const loadSavedAttempts = () => {
  try {
    const saved = localStorage.getItem('mediaDownloadAttempts');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.entries(parsed).forEach(([key, attempts]) => {
        // Фильтруем старые попытки (старше 1 часа)
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        const recentAttempts = attempts.filter(attempt => attempt > oneHourAgo);
        if (recentAttempts.length > 0) {
          downloadAttempts.set(key, recentAttempts);
        }
      });
    }
  } catch (error) {
    console.error('Ошибка загрузки сохраненных попыток:', error);
  }
};

// Сохраняем попытки в localStorage
const saveAttempts = () => {
  try {
    const attemptsObj = {};
    downloadAttempts.forEach((attempts, key) => {
      attemptsObj[key] = attempts;
    });
    localStorage.setItem('mediaDownloadAttempts', JSON.stringify(attemptsObj));
  } catch (error) {
    console.error('Ошибка сохранения попыток:', error);
  }
};

// Загружаем при инициализации
loadSavedAttempts();

// Функция для управления автозагрузкой медиа
window.setAutoLoadMedia = (enabled) => {
  localStorage.setItem('autoLoadMedia', enabled.toString());
  console.log(`Автозагрузка медиа ${enabled ? 'включена' : 'отключена'}`);
};

// Проверяем настройку автозагрузки
const getAutoLoadSetting = () => {
  const setting = localStorage.getItem('autoLoadMedia');
  return setting === 'true'; // По умолчанию отключено
};

// Функция для сброса ограничений (для тестирования)
window.resetMediaLimits = () => {
  downloadAttempts.clear();
  localStorage.removeItem('mediaDownloadAttempts');
  // Принудительно обновляем все компоненты
  window.location.reload();
  console.log('Все ограничения на загрузку медиафайлов сброшены. Страница перезагружена.');
};

// Функция для показа доступных команд
window.showMediaCommands = () => {
  console.log(`
📋 Доступные команды для управления медиа:

🔄 resetMediaLimits() - Сбросить все ограничения на загрузку
⚙️ setAutoLoadMedia(true/false) - Включить/отключить автозагрузку медиа
📊 showMediaCommands() - Показать эту справку

Текущие настройки:
- Автозагрузка медиа: ${getAutoLoadSetting() ? 'включена' : 'отключена'}
- Активных ограничений: ${downloadAttempts.size}
  `);
};

const MediaContent = ({ message }) => {
  const [loadError, setLoadError] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);
  const [isBlocked, setIsBlocked] = React.useState(false);
  const [userRequestedLoad, setUserRequestedLoad] = React.useState(false);
  const [autoLoadEnabled, setAutoLoadEnabled] = React.useState(getAutoLoadSetting());

  if (!message.mediaUrl || !message.mimeType) {
    return null;
  }

  const fullMediaUrl = `${API_URL_ROOT}${message.mediaUrl}`;
  const mediaKey = `${message.id}_${message.mediaUrl}`;

  // Проверяем настройку автозагрузки при монтировании
  React.useEffect(() => {
    const autoLoad = getAutoLoadSetting();
    setAutoLoadEnabled(autoLoad);
    if (autoLoad) {
      setUserRequestedLoad(true);
    }
  }, []);

  // Проверяем количество попыток для данного файла
  const checkRetryLimits = React.useCallback(() => {
    const now = Date.now();
    const attempts = downloadAttempts.get(mediaKey) || [];
    
    // Фильтруем попытки за последние 30 секунд
    const recentAttempts = attempts.filter(attempt => now - attempt < RETRY_COOLDOWN);
    
    if (recentAttempts.length >= MAX_RETRY_ATTEMPTS) {
      setIsBlocked(true);
      // Разблокируем через 30 секунд
      setTimeout(() => {
        setIsBlocked(false);
        downloadAttempts.set(mediaKey, []);
      }, RETRY_COOLDOWN);
      return false;
    }
    
    return true;
  }, [mediaKey]);

  // Обработчик ошибки загрузки
  const handleLoadError = React.useCallback(() => {
    const now = Date.now();
    const attempts = downloadAttempts.get(mediaKey) || [];
    
    // Добавляем новую попытку
    attempts.push(now);
    downloadAttempts.set(mediaKey, attempts);
    saveAttempts(); // Сохраняем в localStorage
    
    setLoadError(true);
    setRetryCount(prev => prev + 1);
    
    // Проверяем лимиты
    if (!checkRetryLimits()) {
      console.warn(`Превышен лимит попыток загрузки для файла: ${mediaKey}`);
    }
  }, [mediaKey, checkRetryLimits]);

  // Обработчик успешной загрузки
  const handleLoadSuccess = React.useCallback(() => {
    setLoadError(false);
    setRetryCount(0);
    // Очищаем попытки при успешной загрузке
    downloadAttempts.delete(mediaKey);
    saveAttempts(); // Сохраняем в localStorage
  }, [mediaKey]);

  // Обработчик клика для загрузки медиа
  const handleLoadMedia = React.useCallback(() => {
    if (isBlocked) {
      alert(`Превышен лимит попыток загрузки (${MAX_RETRY_ATTEMPTS} попыток). Попробуйте позже.`);
      return;
    }
    setUserRequestedLoad(true);
  }, [isBlocked]);

  // Логирование только при явной загрузке пользователем
  React.useEffect(() => {
    if (userRequestedLoad) {
      console.log('User requested to load media from URL:', fullMediaUrl);
    }
  }, [userRequestedLoad, fullMediaUrl]);
  
  React.useEffect(() => {
    // Логируем попытки загрузки для отладки
    const attempts = downloadAttempts.get(mediaKey) || [];
    if (attempts.length > 0) {
      console.log(`Media file ${mediaKey} has ${attempts.length} download attempts:`, attempts.map(a => new Date(a).toLocaleTimeString()));
    }
  }, [mediaKey]);

  // Показываем информацию о попытках загрузки, если есть ошибки
  const showRetryInfo = loadError && retryCount > 0 && retryCount < MAX_RETRY_ATTEMPTS;

  const retryInfoComponent = showRetryInfo ? (
    <Box sx={{ mt: message.content ? 1 : 0, mb: 1, p: 1, bgcolor: '#fff3e0', border: '1px solid #ff9800' }}>
      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#f57c00' }}>
        ⚠️ Ошибка загрузки. Попытка {retryCount}/{MAX_RETRY_ATTEMPTS}
      </Typography>
    </Box>
  ) : null;

  if (message.mimeType.startsWith('image/')) {
    if (isBlocked) {
      return (
        <Box sx={{ mt: message.content ? 1 : 0, p: 2, bgcolor: '#ffebee', border: '1px solid #f44336' }}>
          <Typography variant="body2" color="error" sx={{ fontSize: '0.8rem' }}>
            🚫 Превышен лимит попыток загрузки изображения ({MAX_RETRY_ATTEMPTS} попыток). Попробуйте позже.
          </Typography>
        </Box>
      );
    }

    if (loadError && retryCount >= MAX_RETRY_ATTEMPTS) {
      return (
        <Box sx={{ mt: message.content ? 1 : 0, p: 2, bgcolor: '#ffebee', border: '1px solid #f44336' }}>
          <Typography variant="body2" color="error" sx={{ fontSize: '0.8rem' }}>
            ❌ Не удалось загрузить изображение после {MAX_RETRY_ATTEMPTS} попыток
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.7 }}>
            Файл: {message.filename || 'image'}
          </Typography>
        </Box>
      );
    }

    // Показываем кнопку загрузки вместо автоматической загрузки
    if (!userRequestedLoad) {
      return (
        <>
          {retryInfoComponent}
          <Box
            onClick={handleLoadMedia}
            sx={{
              mt: retryInfoComponent ? 0 : (message.content ? 1 : 0),
              p: 2,
              bgcolor: '#f5f5f5',
              border: '2px dashed #ccc',
              borderRadius: 0,
              cursor: 'pointer',
              textAlign: 'center',
              '&:hover': {
                bgcolor: '#eeeeee',
                borderColor: '#2196F3',
              }
            }}
          >
            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem' }}>
              🖼️ Кликните для загрузки изображения
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.7 }}>
              {message.filename || 'image'}
            </Typography>
          </Box>
        </>
      );
    }

    return (
      <>
        {retryInfoComponent}
        <Box
          component="img"
          src={fullMediaUrl}
          alt={message.filename || 'image'}
          onLoad={handleLoadSuccess}
          onError={handleLoadError}
          sx={{
            maxWidth: '100%',
            maxHeight: '300px',
            borderRadius: 0, // Swiss style: no rounded corners
            mt: retryInfoComponent ? 0 : (message.content ? 1 : 0),
            cursor: 'pointer',
            opacity: loadError ? 0.5 : 1,
            filter: loadError ? 'grayscale(100%)' : 'none',
          }}
          onClick={() => !loadError && window.open(fullMediaUrl, '_blank')}
        />
      </>
    );
  }

  if (message.mimeType.startsWith('video/')) {
    if (isBlocked) {
      return (
        <Box sx={{ mt: message.content ? 1 : 0, p: 2, bgcolor: '#ffebee', border: '1px solid #f44336' }}>
          <Typography variant="body2" color="error" sx={{ fontSize: '0.8rem' }}>
            🚫 Превышен лимит попыток загрузки видео ({MAX_RETRY_ATTEMPTS} попыток). Попробуйте позже.
          </Typography>
        </Box>
      );
    }

    if (loadError && retryCount >= MAX_RETRY_ATTEMPTS) {
      return (
        <Box sx={{ mt: message.content ? 1 : 0, p: 2, bgcolor: '#ffebee', border: '1px solid #f44336' }}>
          <Typography variant="body2" color="error" sx={{ fontSize: '0.8rem' }}>
            ❌ Не удалось загрузить видео после {MAX_RETRY_ATTEMPTS} попыток
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.7 }}>
            Файл: {message.filename || 'video'}
          </Typography>
        </Box>
      );
    }

    // Показываем кнопку загрузки вместо автоматической загрузки
    if (!userRequestedLoad) {
      return (
        <Box
          onClick={handleLoadMedia}
          sx={{
            mt: message.content ? 1 : 0,
            p: 2,
            bgcolor: '#f5f5f5',
            border: '2px dashed #ccc',
            borderRadius: 0,
            cursor: 'pointer',
            textAlign: 'center',
            '&:hover': {
              bgcolor: '#eeeeee',
              borderColor: '#2196F3',
            }
          }}
        >
          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem' }}>
            🎥 Кликните для загрузки видео
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.7 }}>
            {message.filename || 'video'}
          </Typography>
        </Box>
      );
    }

    return (
      <Box
        component="video"
        controls
        src={fullMediaUrl}
        onLoadedData={handleLoadSuccess}
        onError={handleLoadError}
        sx={{
          maxWidth: '100%',
          maxHeight: '300px',
          borderRadius: 0, // Swiss style: no rounded corners
          mt: message.content ? 1 : 0,
          opacity: loadError ? 0.5 : 1,
          filter: loadError ? 'grayscale(100%)' : 'none',
        }}
      />
    );
  }
  
  if (message.mimeType.startsWith('audio/')) {
    if (isBlocked) {
      return (
        <Box sx={{ mt: message.content ? 1 : 0, p: 2, bgcolor: '#ffebee', border: '1px solid #f44336' }}>
          <Typography variant="body2" color="error" sx={{ fontSize: '0.8rem' }}>
            🚫 Превышен лимит попыток загрузки аудио ({MAX_RETRY_ATTEMPTS} попыток). Попробуйте позже.
          </Typography>
        </Box>
      );
    }

    if (loadError && retryCount >= MAX_RETRY_ATTEMPTS) {
      return (
        <Box sx={{ mt: message.content ? 1 : 0, p: 2, bgcolor: '#ffebee', border: '1px solid #f44336' }}>
          <Typography variant="body2" color="error" sx={{ fontSize: '0.8rem' }}>
            ❌ Не удалось загрузить аудио после {MAX_RETRY_ATTEMPTS} попыток
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.7 }}>
            Файл: {message.filename || 'audio'}
          </Typography>
        </Box>
      );
    }

    // Показываем кнопку загрузки вместо автоматической загрузки
    if (!userRequestedLoad) {
      return (
        <Box
          onClick={handleLoadMedia}
          sx={{
            mt: message.content ? 1 : 0,
            p: 2,
            bgcolor: '#f5f5f5',
            border: '2px dashed #ccc',
            borderRadius: 0,
            cursor: 'pointer',
            textAlign: 'center',
            '&:hover': {
              bgcolor: '#eeeeee',
              borderColor: '#2196F3',
            }
          }}
        >
          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem' }}>
            🎵 Кликните для загрузки аудио
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.7 }}>
            {message.filename || 'audio'}
          </Typography>
        </Box>
      );
    }

    return (
      <Box
        component="audio"
        controls
        src={fullMediaUrl}
        onLoadedData={handleLoadSuccess}
        onError={handleLoadError}
        sx={{
          width: '100%',
          mt: message.content ? 1 : 0,
          opacity: loadError ? 0.5 : 1,
          filter: loadError ? 'grayscale(100%)' : 'none',
        }}
      />
    );
  }

  // Fallback for other file types
  const [downloadError, setDownloadError] = React.useState(false);
  const [downloadAttemptCount, setDownloadAttemptCount] = React.useState(0);

  // Инициализируем состояние из сохраненных данных
  React.useEffect(() => {
    const attempts = downloadAttempts.get(mediaKey) || [];
    const recentAttempts = attempts.filter(attempt => Date.now() - attempt < RETRY_COOLDOWN);
    setDownloadAttemptCount(recentAttempts.length);
    if (recentAttempts.length >= 2) {
      setDownloadError(true);
    }
  }, [mediaKey]);

  // Проверяем доступность файла
  const checkFileAvailability = React.useCallback(async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Ошибка проверки доступности файла:', error);
      return false;
    }
  }, []);

  const handleFileDownload = React.useCallback(async (e) => {
    e.preventDefault();

    if (isBlocked) {
      alert(`Превышен лимит попыток скачивания файла (${MAX_RETRY_ATTEMPTS} попыток). Попробуйте позже.`);
      return;
    }

    // Если уже было 2 неудачных попытки, блокируем дальнейшие попытки
    if (downloadAttemptCount >= 2) {
      setDownloadError(true);
      alert('Файл недоступен после 2 попыток. Возможно, файл поврежден или удален.');
      return;
    }

    // Увеличиваем счетчик попыток
    setDownloadAttemptCount(prev => prev + 1);

    // Отслеживаем попытки скачивания
    const now = Date.now();
    const attempts = downloadAttempts.get(mediaKey) || [];
    attempts.push(now);
    downloadAttempts.set(mediaKey, attempts);
    saveAttempts(); // Сохраняем в localStorage

    // Проверяем доступность файла перед скачиванием
    const isFileAvailable = await checkFileAvailability(fullMediaUrl);
    
    if (!isFileAvailable) {
      setDownloadError(true);
      console.error('Файл недоступен:', fullMediaUrl);
      
      // Если это вторая попытка, блокируем дальнейшие попытки
      if (downloadAttemptCount >= 1) {
        alert('Файл недоступен после проверки. Скачивание заблокировано.');
        return;
      } else {
        alert('Файл недоступен. Попробуйте еще раз.');
        return;
      }
    }

    // Если файл доступен, открываем для скачивания
    window.open(fullMediaUrl, '_blank');
    
    // Сбрасываем ошибки при успешном открытии
    setDownloadError(false);
    
    // Проверяем лимиты после добавления попытки
    if (!checkRetryLimits()) {
      alert(`Превышен лимит попыток скачивания файла (${MAX_RETRY_ATTEMPTS} попыток в течение 30 секунд).`);
    }
  }, [isBlocked, mediaKey, checkRetryLimits, fullMediaUrl, downloadAttemptCount, checkFileAvailability]);

  // Определяем, заблокирован ли файл
  const isFileBlocked = isBlocked || downloadAttemptCount >= 2;

  return (
    <Box sx={{ mt: message.content ? 1 : 0 }}>
      {downloadError && downloadAttemptCount >= 2 && (
        <Box sx={{ mb: 1, p: 1, bgcolor: '#ffebee', border: '1px solid #f44336' }}>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#f44336' }}>
            ❌ Файл недоступен после 2 попыток
          </Typography>
        </Box>
      )}
      
      <a 
        href="#"
        onClick={handleFileDownload}
        style={{ 
          color: 'inherit',
          textDecoration: isFileBlocked ? 'line-through' : 'underline',
          opacity: isFileBlocked ? 0.5 : 1,
          pointerEvents: isFileBlocked ? 'none' : 'auto'
        }}
      >
        <Typography 
          variant="body2"
          sx={{
            color: isFileBlocked ? '#f44336' : 'inherit'
          }}
        >
          {isFileBlocked 
            ? `🚫 Файл заблокирован (недоступен после ${downloadAttemptCount} попыток)` 
            : `📎 ${message.filename || 'Скачать файл'}`
          }
        </Typography>
      </a>
      
      {downloadAttemptCount > 0 && downloadAttemptCount < 2 && downloadError && (
        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#ff9800', display: 'block' }}>
          ⚠️ Попытка {downloadAttemptCount}/2 неудачна
        </Typography>
      )}
      
      {isFileBlocked && (
        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#f44336', display: 'block' }}>
          Файл заблокирован из-за недоступности
        </Typography>
      )}
    </Box>
  );
};


export default React.memo(function ChatBubble({ message, isMe, showTime }) {
  const [contextMenu, setContextMenu] = React.useState(null);

  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other browsers might not behave the same.
          // With this behavior we prevent contextmenu from appearing again.
          null,
    );
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  const handleDebugMessage = () => {
    console.log('DEBUG MESSAGE:', message);
    alert('Сообщение выведено в консоль разработчика');
    handleClose();
  };

  return (
    <Box
      onContextMenu={handleContextMenu}
      sx={{
        maxWidth: '75%',
        minWidth: '60px',
        p: '1rem 1.5rem',
        mb: '0.5rem',
        borderRadius: 0, // Swiss style: rectangular bubbles
        boxShadow: 'none',
        fontSize: '1rem',
        lineHeight: 1.5,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        position: 'relative',
        transition: 'box-shadow 0.2s ease', // Упрощенная анимация
        alignSelf: isMe ? 'flex-end' : 'flex-start',
        bgcolor: isMe ? '#1976D2' : '#FFFFFF',
        color: isMe ? '#FFFFFF' : '#212121',
        border: isMe ? '2px solid #1976D2' : '2px solid #E0E0E0',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      {/* Больше не показываем имя отправителя внутри bubble, 
          так как это делается в ChatMessages */}
      
      {message.quotedContent && (
        <Box
          sx={{
            p: 1.5,
            mb: 1,
            bgcolor: isMe ? 'rgba(255,255,255,0.15)' : '#F5F5F5',
            borderRadius: 0, // Swiss style: rectangular quotes
            borderLeft: '4px solid',
            borderColor: isMe ? 'rgba(255,255,255,0.8)' : '#2196F3',
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              opacity: 0.9, 
              wordBreak: 'break-all',
              fontStyle: 'italic',
              color: isMe ? '#FFFFFF' : '#424242',
              fontSize: '0.9rem',
              fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
            }}
          >
            {message.quotedContent}
          </Typography>
        </Box>
      )}
      <MediaContent message={message} />
      <Typography 
        variant="body1" 
        component="div" 
        sx={{ 
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          fontSize: '1rem',
          lineHeight: 1.5,
          color: isMe ? '#FFFFFF' : '#212121'
        }}
      >
        {message.content}
      </Typography>
      {showTime && message.timestamp && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'right',
            fontSize: '0.75rem',
            mt: 1.5,
            opacity: 0.8,
            fontFamily: '"Roboto Mono", "Courier New", monospace', // Swiss style: monospace for time
            letterSpacing: '0.5px',
            color: isMe ? '#E3F2FD' : '#757575',
            fontWeight: 500
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          })}
        </Typography>
      )}
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleDebugMessage}>Вывести в консоль</MenuItem>
      </Menu>
    </Box>
  );
});
        }
      >
        <MenuItem onClick={handleDebugMessage}>Вывести в консоль</MenuItem>
      </Menu>
    </Box>
  );
}
