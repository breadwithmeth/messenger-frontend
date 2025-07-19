// Утилиты для оптимизации производительности ввода
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Простой debounce для предотвращения частых вызовов функции
 * @param {Function} func - Функция для вызова
 * @param {number} wait - Время задержки в миллисекундах
 * @returns {Function} - Debounced функция
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Хук для дебаунсинга значений input'ов
 * @param {any} value - Значение для дебаунсинга
 * @param {number} delay - Задержка в миллисекундах
 * @returns {any} - Дебаунсированное значение
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Хук для throttling функций для предотвращения лага
 * @param {Function} callback - Функция для throttling
 * @param {number} delay - Задержка в миллисекундах
 * @returns {Function} - Throttled функция
 */
export const useThrottle = (callback, delay) => {
  const lastCall = useRef(0);
  
  return useCallback((...args) => {
    const now = Date.now();
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      callback(...args);
    }
  }, [callback, delay]);
};

/**
 * Throttle для ограничения частоты вызовов функции
 * @param {Function} func - Функция для вызова
 * @param {number} limit - Минимальный интервал между вызовами в миллисекундах
 * @returns {Function} - Throttled функция
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Оптимизированный обработчик onChange для input/textarea
 * Предотвращает лишние перерендеры компонентов
 * @param {Function} callback - Callback функция
 * @returns {Function} - Оптимизированный обработчик
 */
export const createOptimizedChangeHandler = (callback) => {
  return (event) => {
    // Используем прямое значение для минимальной задержки
    const value = event.target.value;
    callback(value);
  };
};

/**
 * Хук для оптимизации рендеринга списков
 * @param {Array} items - Массив элементов
 * @param {Function} keyExtractor - Функция для извлечения ключа
 * @param {Object} options - Опции оптимизации
 */
export const useVirtualizedList = (items, keyExtractor, options = {}) => {
  const {
    itemHeight = 50,
    containerHeight = 400,
    overscan = 5
  } = options;

  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      key: keyExtractor(item),
      top: (startIndex + index) * itemHeight
    }));
  }, [items, scrollTop, itemHeight, containerHeight, overscan, keyExtractor]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((event) => {
    setScrollTop(event.target.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll
  };
};

/**
 * Хук для мемоизации тяжёлых вычислений с возможностью прерывания
 */
export const useInterruptibleMemo = (factory, deps, options = {}) => {
  const { timeout = 16 } = options; // 16ms = 1 frame при 60fps
  const [result, setResult] = useState(null);
  const [isComputing, setIsComputing] = useState(false);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Прерываем предыдущее вычисление
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsComputing(true);

    // Выполняем вычисление в следующем тике
    const timeoutId = setTimeout(() => {
      if (!controller.signal.aborted) {
        try {
          const computedResult = factory();
          if (!controller.signal.aborted) {
            setResult(computedResult);
          }
        } catch (error) {
          if (!controller.signal.aborted) {
            console.error('Error in interruptible memo:', error);
          }
        } finally {
          if (!controller.signal.aborted) {
            setIsComputing(false);
          }
        }
      }
    }, timeout);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
      setIsComputing(false);
    };
  }, deps);

  return { result, isComputing };
};
