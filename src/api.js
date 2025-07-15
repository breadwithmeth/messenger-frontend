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
    }, {
      responseType: 'text'
    });

    const rawText = response.data;
    // Улучшенный поиск JSON, который может быть обернут в markdown или нет
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```|(\[[\s\S]*\])/);
    
    if (!jsonMatch) {
      console.error("Не удалось извлечь JSON из ответа Gemini:", rawText);
      throw new Error('Не удалось извлечь JSON из ответа Gemini.');
    }
    
    let jsonString = jsonMatch[1] || jsonMatch[2];

    try {
      // Попытка исправить распространенные ошибки формата
      const cleanedJsonString = jsonString
        .replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, "\\&")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\f/g, "\\f")
        .replace(/[\u0000-\u0019]+/g,""); 

      return JSON.parse(cleanedJsonString);
    } catch (e) {
      console.error("Ошибка парсинга JSON строки:", jsonString, "Ошибка:", e);
      throw new Error('Не удалось обработать ответ от Gemini.');
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


const api = {
    login,
    getChats,
    getMessagesByChatId,
    getOrganizationPhones,
    sendTextMessage,
    createWhatsAppAccount,
    connectWhatsAppAccount,
    disconnectWhatsAppAccount,
    deleteWhatsAppAccount,
    resyncPhone,
    rewriteWithGemini,
    analyzeMessageWithGemini,
    suggestRepliesWithGemini,
    getUsers,
    createUser,
    getCurrentUser,
};

export default api;

export {
    login,
    getChats,
    getMessagesByChatId,
    getOrganizationPhones,
    sendTextMessage,
    createWhatsAppAccount,
    connectWhatsAppAccount,
    disconnectWhatsAppAccount,
    deleteWhatsAppAccount,
    resyncPhone,
    rewriteWithGemini,
    analyzeMessageWithGemini,
    suggestRepliesWithGemini,
    getUsers,
    createUser,
    getCurrentUser,
};