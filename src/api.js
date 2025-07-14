// whatsapp-frontend/src/api.js

// Обратите внимание на import.meta.env для Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'; // Обновленный URL

const api = {
  // Функция для аутентификации пользователя
  login: async (email, password) => { // Изменено с username на email
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }), // Отправляем email и password
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ошибка входа');
    }
    return response.json(); // Возвращает { token: ..., user: ... }
  },

  // Вспомогательная функция для отправки авторизованных запросов
  _authorizedFetch: async (url, options = {}) => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      throw new Error('Отсутствует токен авторизации. Пожалуйста, войдите снова.');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, { // Используем API_BASE_URL
      ...options,
      headers,
    });

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('jwtToken');
      // В реальном приложении здесь лучше использовать роутер для навигации: navigate('/login')
      window.location.href = '/'; // Простая перезагрузка на главную/логин
      throw new Error('Сессия истекла или токен недействителен. Пожалуйста, войдите снова.');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }
    return response.json();
  },

  /**
   * Имитация вызова API для переписывания текста с помощью Gemini.
   * @param {string} text Исходный текст.
   * @returns {Promise<string>} Переписанный текст.
   */
  rewriteWithGemini: async (text) => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      throw new Error('API ключ для Gemini не найден. Пожалуйста, добавьте его в настройках.');
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Перепиши этот текст, сделай его более профессиональным и вежливым, сохранив основной смысл. Оригинал: "${text}"`
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Ошибка от API Gemini:', errorData);
        throw new Error(errorData.error?.message || 'Не удалось получить ответ от Gemini.');
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text.trim();

    } catch (error) {
      console.error('Ошибка при обращении к Gemini API:', error);
      throw error;
    }
  },

  // Отправка текстового сообщения
  sendTextMessage: async ({ organizationPhoneId, receiverJid, text }) => {
    return api._authorizedFetch('/messages/send-text', {
      method: 'POST',
      body: JSON.stringify({ organizationPhoneId, receiverJid, text }),
    });
  },

  // Получение списка чатов
  getChats: async () => {
    return api._authorizedFetch('/chats');
  },

  getMessagesByChatId: async (chatId) => {
    return api._authorizedFetch(`/chats/${chatId}/messages`);
  },

  // Получение списка телефонов организации
  getOrganizationPhones: async () => {
    return api._authorizedFetch('/organization-phones/all');
  },

  // Создание нового аккаунта WhatsApp
  createOrganizationPhone: async ({ phoneJid, displayName }) => {
    const response = await fetch(`${API_BASE_URL}/organization-phones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
      },
      body: JSON.stringify({ phoneJid, displayName })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка при создании аккаунта');
    }
    
    return response.json();
  },

  // Подключение телефона
  connectOrganizationPhone: async (phoneId) => {
    const response = await fetch(`${API_BASE_URL}/organization-phones/${phoneId}/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка при подключении телефона');
    }
    
    return response.json();
  },
};

export default api;