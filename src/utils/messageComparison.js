// Утилиты для сравнения сообщений и оптимизации рендеринга

/**
 * Сравнивает два массива сообщений для определения необходимости перерендера
 * @param {Array} prevMessages - Предыдущий массив сообщений
 * @param {Array} nextMessages - Новый массив сообщений
 * @param {number} compareCount - Количество последних сообщений для сравнения (по умолчанию 3)
 * @returns {boolean} - true если массивы одинаковые, false если нужен перерендер
 */
export const areMessagesEqual = (prevMessages, nextMessages, compareCount = 3) => {
  // Быстрое сравнение длины
  if (prevMessages.length !== nextMessages.length) return false;
  
  // Если массивы пустые, то они равны
  if (prevMessages.length === 0) return true;
  
  // Сравниваем только последние несколько сообщений для производительности
  const count = Math.min(compareCount, prevMessages.length);
  const prevLast = prevMessages.slice(-count);
  const nextLast = nextMessages.slice(-count);
  
  for (let i = 0; i < count; i++) {
    const prevMsg = prevLast[i];
    const nextMsg = nextLast[i];
    
    if (!prevMsg || !nextMsg) return false;
    if (prevMsg.id !== nextMsg.id) return false;
    if (prevMsg.content !== nextMsg.content) return false;
    if (prevMsg.timestamp !== nextMsg.timestamp) return false;
  }
  
  return true;
};

/**
 * Сравнивает два сообщения для определения необходимости перерендера компонента
 * @param {Object} prevMessage - Предыдущее сообщение
 * @param {Object} nextMessage - Новое сообщение
 * @returns {boolean} - true если сообщения одинаковые, false если нужен перерендер
 */
export const areMessagesPropsEqual = (prevMessage, nextMessage) => {
  if (!prevMessage || !nextMessage) return false;
  if (prevMessage.id !== nextMessage.id) return false;
  if (prevMessage.content !== nextMessage.content) return false;
  if (prevMessage.timestamp !== nextMessage.timestamp) return false;
  if (prevMessage.mediaUrl !== nextMessage.mediaUrl) return false;
  if (prevMessage.quotedContent !== nextMessage.quotedContent) return false;
  
  return true;
};
