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

  // Отправка текстового сообщения
  /**
   * Отправка текстового сообщения
   * @param {Object} params
   * @param {number} params.organizationPhoneId - ID телефона организации
   * @param {string} params.receiverJid - JID получателя (remoteJid)
   * @param {string} params.text - Текст сообщения
   * @returns {Promise<Object>} Ответ API
   */
  sendTextMessage: async ({ organizationPhoneId, receiverJid, text }) => {
    if (!organizationPhoneId || !receiverJid || !text) {
      throw new Error('organizationPhoneId, receiverJid и text обязательны для отправки сообщения');
    }
    const body = JSON.stringify({ organizationPhoneId, receiverJid, text });
    console.log('Отправка текстового сообщения:', body);
    return api._authorizedFetch('/messages/send-text', {
      method: 'POST',
      body,
    });
  },

  // Отправка медиа-сообщения
  sendMediaMessage: async (jid, type, url, caption, phoneNumber, filename = null) => {
    return api._authorizedFetch('/messages/send-media', {
      method: 'POST',
      body: JSON.stringify({ jid, type, url, caption, phoneNumber, filename }),
    });
  },

  // Эти конечные точки должны быть реализованы в вашем бэкенде:
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