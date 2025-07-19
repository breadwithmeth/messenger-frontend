import { useState, useCallback, useDeferredValue, useTransition } from 'react';
import { debounce } from '../utils/performanceUtils';

/**
 * Оптимизированный хук для input'ов с высокой производительностью
 * Изолирует input от других обновлений состояния
 */
export const useOptimizedInput = (initialValue = '', options = {}) => {
  const { 
    debounceDelay = 300,
    enableTransition = true 
  } = options;

  // Локальное состояние для немедленного отображения ввода
  const [localValue, setLocalValue] = useState(initialValue);
  
  // Отложенное значение для тяжёлых операций (поиск, фильтрация)
  const deferredValue = useDeferredValue(localValue);
  
  // Transition для плавных обновлений
  const [isPending, startTransition] = useTransition();

  // Мемоизированный обработчик изменений
  const handleChange = useCallback((event) => {
    const value = typeof event === 'string' ? event : event.target.value;
    
    // Немедленно обновляем локальное состояние для отзывчивости
    setLocalValue(value);
  }, []);

  // Debounced версия для API вызовов
  const debouncedHandleChange = useCallback(
    debounce((value) => {
      if (enableTransition) {
        startTransition(() => {
          // Здесь можно вызывать API или другие тяжёлые операции
        });
      }
    }, debounceDelay),
    [debounceDelay, enableTransition]
  );

  // Сброс значения
  const reset = useCallback(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  // Установка нового значения программно
  const setValue = useCallback((value) => {
    setLocalValue(value);
  }, []);

  return {
    value: localValue,          // Для отображения в input
    deferredValue,              // Для тяжёлых операций
    isPending,                  // Индикатор загрузки
    handleChange,               // Основной обработчик
    debouncedHandleChange,      // Debounced обработчик
    reset,
    setValue
  };
};
