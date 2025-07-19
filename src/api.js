// whatsapp-frontend/src/api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('jwtToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

const login = async (email, password) => {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
};

const getChats = async () => {
  const response = await apiClient.get('/chats');
  return response.data;
};

// Получить назначенные чаты за последние 24 часа
const getMyAssignedChats = async () => {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const now = new Date();
  
  const response = await apiClient.get('/chat-assignment/my-assigned', {
    params: {
      from: yesterday.toISOString(),
      to: now.toISOString()
    }
  });
  
  console.log('Назначенные чаты:', response.data.chats);
  console.log('Всего:', response.data.total);
  console.log('Фильтры:', response.data.filters);
  
  return response.data;
};

const getMessagesByChatId = async (chatId) => {
  const response = await apiClient.get(`/chats/${chatId}/messages`);
  return response.data;
};

const getOrganizationPhones = async () => {
  const response = await apiClient.get('/organization-phones/all');
  return response.data;
};

const sendTextMessage = async ({ organizationPhoneId, receiverJid, text }) => {
  const response = await apiClient.post('/messages/send-text', { organizationPhoneId, receiverJid, text });
  return response.data;
};

const sendMediaMessage = async ({ chatId, file, mediaType, caption }) => {
  const formData = new FormData();
  formData.append('media', file);
  formData.append('chatId', chatId);
  formData.append('mediaType', mediaType);
  if (caption) formData.append('caption', caption);

  const response = await apiClient.post('/media/send', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const createWhatsAppAccount = async (data) => {
  const response = await apiClient.post('/organization-phones', data);
  return response.data;
};

const connectWhatsAppAccount = async (phoneId) => {
    const response = await apiClient.post(`/organization-phones/${phoneId}/connect`);
    return response.data;
};

const disconnectWhatsAppAccount = async (phoneId) => {
    const response = await apiClient.post(`/organization-phones/${phoneId}/disconnect`);
    return response.data;
};

const deleteWhatsAppAccount = async (phoneId) => {
    const response = await apiClient.delete(`/organization-phones/${phoneId}`);
    return response.data;
};

const resyncPhone = async (phoneId) => {
    const response = await apiClient.post(`/organization-phones/${phoneId}/connect`);
    return response.data;
};

const rewriteWithGemini = async (text, options = {}) => {
    const { tone = 'professional', style = 'friendly', length = 'same' } = options;
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      throw new Error('API ключ для Gemini не найден. Пожалуйста, добавьте его в настройках.');
    }
    const prompt = `Перепиши следующий текст. Оригинал: "${text}". Требования: тон - ${tone}, стиль - ${style}, длина - ${length}.`;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    
    try {
      const response = await axios.post(API_URL, {
        contents: [{ parts: [{ text: prompt }] }]
      });
      return response.data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
      console.error('Ошибка при обращении к Gemini API:', error);
      if (error.response && error.response.status === 429) {
        throw new Error('Превышен лимит запросов к Gemini API. Попробуйте позже.');
      }
      throw new Error(error.response?.data?.error?.message || 'Не удалось получить ответ от Gemini.');
    }
};

// Закомментирована функция анализа сообщений (убрана по требованию)
/*
const analyzeMessageWithGemini = async (text) => {
  const apiKey = localStorage.getItem('gemini_api_key');
  if (!apiKey) {
    throw new Error('API ключ для Gemini не найден. Пожалуйста, добавьте его в настройках.');
  }
  const prompt = `Проанализируй следующее сообщение на трех языках (русский, английский, испанский): "${text}".
  Дай оценку по двум критериям:
  1.  **Ошибки (errors)**: есть ли орфографические или грамматические ошибки? (true/false)
  2.  **Нецензурная лексика (profanity)**: есть ли в тексте мат или оскорбления? (true/false)

  Верни ответ в формате JSON объекта, например: {"errors": false, "profanity": true}`;

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  try {
    const response = await axios.post(API_URL, {
      contents: [{ parts: [{ text: prompt }] }]
    }, {
      responseType: 'text' // Получаем ответ как текст
    });

    // Извлекаем JSON из ответа, который может быть обернут в markdown
    const rawText = response.data;
    const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```|({[\s\S]*})/);
    if (!jsonMatch) {
      throw new Error('Не удалось извлечь JSON из ответа Gemini.');
    }
    // Берем либо первую, либо вторую группу, где будет JSON
    const jsonString = jsonMatch[1] || jsonMatch[2];
    return JSON.parse(jsonString);

  } catch (error) {
    console.error('Ошибка при анализе сообщения через Gemini API:', error);
    if (error.response && error.response.status === 429) {
      throw new Error('Превышен лимит запросов к Gemini API. Попробуйте позже.');
    }
    throw new Error(error.response?.data?.error?.message || 'Не удалось проанализировать сообщение.');
  }
};
*/

const suggestRepliesWithGemini = async (chatHistory, userContext) => {
  const apiKey = localStorage.getItem('gemini_api_key');
  if (!apiKey) {
    throw new Error('API ключ для Gemini не найден.');
  }

  const contextPrompt = userContext 
    ? `Вот контекст для генерации ответов: "${userContext}". Постарайся придерживаться этого стиля.`
    : "Генерируй стандартные, вежливые ответы.";

  const historyPrompt = chatHistory.map(msg => `${msg.fromMe ? 'Я' : 'Клиент'}: ${msg.content}`).join('\n');

  const prompt = `${contextPrompt}\n\nИстория переписки:\n${historyPrompt}\n\nОсновываясь на последнем сообщении клиента, предложи 3 коротких варианта ответа от моего имени. Ответы должны быть разными по смыслу и тону. Не добавляй ничего лишнего, только сами варианты. Ответ верни в виде JSON-массива строк. Например: ["Да, конечно", "Хорошо, сейчас проверю", "Не могу помочь с этим"].`;

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  try {
    const response = await axios.post(API_URL, {
      contents: [{ parts: [{ text: prompt }] }]
    });

    // Обрабатываем JSON ответ от Gemini API
    const geminiResponse = response.data;
    console.log('Gemini API response:', geminiResponse); // Для отладки
    
    if (!geminiResponse.candidates || !geminiResponse.candidates[0]) {
      throw new Error('Некорректный ответ от Gemini API');
    }

    const textContent = geminiResponse.candidates[0].content.parts[0].text;
    console.log('Text content from Gemini:', textContent); // Для отладки
    
    // Улучшенный поиск JSON в ответе Gemini
    let jsonString = textContent.trim();
    
    // Удаляем markdown блоки если они есть
    const markdownMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch) {
      jsonString = markdownMatch[1].trim();
    } else {
      // Ищем JSON массив напрямую
      const jsonArrayMatch = textContent.match(/\[[\s\S]*?\]/);
      if (jsonArrayMatch) {
        jsonString = jsonArrayMatch[0];
      } else {
        // Если JSON не найден, пытаемся извлечь строки из текста
        const lines = textContent.split('\n').filter(line => line.trim());
        const replies = [];
        
        for (const line of lines) {
          // Ищем строки в кавычках
          const quotedMatch = line.match(/"([^"]+)"/);
          if (quotedMatch && quotedMatch[1].length > 0) {
            replies.push(quotedMatch[1]);
          } else if (line.includes('.') && line.length > 5 && line.length < 100) {
            // Если строка похожа на ответ (содержит точку, не слишком короткая/длинная)
            const cleanLine = line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim();
            if (cleanLine.length > 0) {
              replies.push(cleanLine);
            }
          }
        }
        
        if (replies.length > 0) {
          return replies.slice(0, 3); // Берем максимум 3 варианта
        }
      }
    }
    
    console.log('Extracted JSON string:', jsonString); // Для отладки

    try {
      // Очищаем строку от потенциальных проблем
      let cleanedJsonString = jsonString
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Удаляем control characters
        .replace(/\n\s*/g, ' ') // Заменяем переносы строк на пробелы
        .replace(/,\s*]/g, ']') // Удаляем trailing запятые
        .replace(/,\s*}/g, '}') // Удаляем trailing запятые в объектах
        .trim();

      const parsedResult = JSON.parse(cleanedJsonString);
      console.log('Parsed result:', parsedResult); // Для отладки
      
      // Проверяем что результат - массив строк
      if (Array.isArray(parsedResult) && parsedResult.every(item => typeof item === 'string')) {
        return parsedResult;
      } else {
        throw new Error('Ответ не является массивом строк');
      }
    } catch (e) {
      console.error("Ошибка парсинга JSON строки:", jsonString, "Ошибка:", e);
      // Возвращаем дефолтные варианты если парсинг не удался
      return ["Понял, спасибо", "Хорошо", "Сейчас проверю"];
    }

  } catch (error) {
    console.error('Ошибка при генерации ответов через Gemini API:', error);
    if (error.response && error.response.status === 429) {
      throw new Error('Превышен лимит запросов к Gemini API. Попробуйте позже.');
    }
    throw new Error(error.response?.data?.error?.message || 'Не удалось сгенерировать ответы.');
  }
};

const getUsers = async () => {
  const response = await apiClient.get('/users/all');
  return response.data;
};

const createUser = async (userData) => {
  const response = await apiClient.post('/users', userData);
  return response.data;
};

const getCurrentUser = async () => {
  const response = await apiClient.get('/users/me');
  return response.data;
};

const markChatAsRead = async (chatId) => {
  const response = await apiClient.post(`/message-read/${chatId}/mark-read`);
  return response.data;
};

const assignChatToOperator = async (chatId, operatorId, priority = 'medium') => {
  const response = await apiClient.post('/chat-assignment/assign', {
    chatId,
    operatorId,
    priority
  });
  return response.data;
};

const takeChat = async (chatId, priority = 'medium') => {
  // Получаем текущего пользователя и назначаем чат на него
  const currentUser = await getCurrentUser();
  return assignChatToOperator(chatId, currentUser.id, priority);
};

const unassignChat = async (chatId) => {
  const response = await apiClient.post('/chat-assignment/unassign', {
    chatId
  });
  return response.data;
};


const api = {
    login,
    getChats,
    getMyAssignedChats,
    getMessagesByChatId,
    getOrganizationPhones,
    sendTextMessage,
    sendMediaMessage,
    createWhatsAppAccount,
    connectWhatsAppAccount,
    disconnectWhatsAppAccount,
    deleteWhatsAppAccount,
    resyncPhone,
    rewriteWithGemini,
    suggestRepliesWithGemini,
    getUsers,
    createUser,
    getCurrentUser,
    markChatAsRead,
    assignChatToOperator,
    takeChat,
    unassignChat,
};

export default api;

export {
    login,
    getChats,
    getMyAssignedChats,
    getMessagesByChatId,
    getOrganizationPhones,
    sendTextMessage,
    sendMediaMessage,
    createWhatsAppAccount,
    connectWhatsAppAccount,
    disconnectWhatsAppAccount,
    deleteWhatsAppAccount,
    resyncPhone,
    rewriteWithGemini,
    suggestRepliesWithGemini,
    getUsers,
    createUser,
    getCurrentUser,
    markChatAsRead,
    assignChatToOperator,
    takeChat,
    unassignChat,
};