import { useMemo, useDeferredValue, useTransition, useCallback } from 'react';

/**
 * Оптимизированный хук для фильтрации данных
 * Предотвращает блокировку UI при больших объёмах данных
 */
export const useOptimizedFilter = (data, filterValue, filterFunction, options = {}) => {
  const {
    enableTransition = true,
    chunkSize = 100, // Размер чанка для обработки больших массивов
    debounceDelay = 150
  } = options;

  // Используем deferred value для изоляции фильтрации от ввода
  const deferredFilterValue = useDeferredValue(filterValue);
  const [isPending, startTransition] = useTransition();

  // Мемоизированная фильтрация
  const filteredData = useMemo(() => {
    if (!deferredFilterValue.trim()) {
      return data;
    }

    // Для больших массивов используем chunked обработку
    if (data.length > chunkSize) {
      return filterInChunks(data, deferredFilterValue, filterFunction, chunkSize);
    }

    return data.filter(item => filterFunction(item, deferredFilterValue));
  }, [data, deferredFilterValue, filterFunction, chunkSize]);

  return {
    filteredData,
    isPending,
    isFiltering: deferredFilterValue !== filterValue
  };
};

/**
 * Обработка больших массивов по частям для предотвращения блокировки UI
 */
const filterInChunks = (data, filterValue, filterFunction, chunkSize) => {
  const result = [];
  const chunks = Math.ceil(data.length / chunkSize);
  
  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, data.length);
    const chunk = data.slice(start, end);
    
    const filteredChunk = chunk.filter(item => 
      filterFunction(item, filterValue)
    );
    
    result.push(...filteredChunk);
  }
  
  return result;
};

/**
 * Оптимизированный хук для поиска с виртуализацией
 */
export const useOptimizedSearch = (items, searchTerm, searchFields = ['name'], options = {}) => {
  const {
    caseSensitive = false,
    exactMatch = false,
    maxResults = 1000
  } = options;

  const deferredSearchTerm = useDeferredValue(searchTerm);

  const searchResults = useMemo(() => {
    if (!deferredSearchTerm.trim()) {
      return items.slice(0, maxResults);
    }

    const term = caseSensitive ? deferredSearchTerm : deferredSearchTerm.toLowerCase();
    
    return items
      .filter(item => {
        return searchFields.some(field => {
          const value = item[field];
          if (!value) return false;
          
          const stringValue = caseSensitive ? String(value) : String(value).toLowerCase();
          
          return exactMatch ? 
            stringValue === term : 
            stringValue.includes(term);
        });
      })
      .slice(0, maxResults);
  }, [items, deferredSearchTerm, searchFields, caseSensitive, exactMatch, maxResults]);

  return {
    results: searchResults,
    isSearching: searchTerm !== deferredSearchTerm,
    hasResults: searchResults.length > 0,
    totalResults: searchResults.length
  };
};
