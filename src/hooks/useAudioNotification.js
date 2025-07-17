import { useCallback, useRef, useState } from 'react';

/**
 * Хук для воспроизведения звуковых уведомлений
 * Swiss Style: функциональность без излишеств
 */
export const useAudioNotification = () => {
  const audioRef = useRef(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Создание простого звука уведомления через Web Audio API
  const createBeepSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // Частота звука
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      return true;
    } catch (error) {
      console.debug('Не удалось создать beep звук:', error.message);
      return false;
    }
  }, []);

  // Инициализация аудио и запрос разрешения
  const initAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/new_message.wav');
      audioRef.current.volume = 0.3; // Умеренная громкость
      audioRef.current.preload = 'auto';
    }
    return audioRef.current;
  }, []);

  // Включение звуковых уведомлений (должно вызываться при клике пользователя)
  const enableAudio = useCallback(async () => {
    try {
      const audio = initAudio();
      // Пытаемся воспроизвести тишину для получения разрешения
      audio.muted = true;
      await audio.play();
      audio.pause();
      audio.muted = false;
      audio.currentTime = 0;
      
      setIsAudioEnabled(true);
      setHasUserInteracted(true);
      return true;
    } catch (error) {
      console.debug('Не удалось получить разрешение на аудио:', error.message);
      setIsAudioEnabled(false);
      return false;
    }
  }, [initAudio]);

  // Воспроизведение звука уведомления
  const playNotificationSound = useCallback(async () => {
    // Проверяем, включены ли звуковые уведомления
    if (!isAudioEnabled || !hasUserInteracted) {
      console.debug('Звуковые уведомления отключены или нет разрешения пользователя');
      return false;
    }

    try {
      const audio = initAudio();
      
      // Сброс позиции для повторного воспроизведения
      audio.currentTime = 0;
      
      // Воспроизведение с обработкой ошибок
      await audio.play();
      return true;
    } catch (error) {
      // Если основной звук не сработал, пробуем fallback beep
      console.debug('Основной звук не сработал, используем fallback:', error.message);
      return createBeepSound();
    }
  }, [initAudio, isAudioEnabled, hasUserInteracted, createBeepSound]);

  // Проверка поддержки аудио
  const isAudioSupported = useCallback(() => {
    return typeof Audio !== 'undefined';
  }, []);

  return {
    playNotificationSound,
    enableAudio,
    isAudioEnabled,
    hasUserInteracted,
    isAudioSupported
  };
};
