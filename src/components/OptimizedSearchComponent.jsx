import React, { useState, useMemo, useTransition, useCallback } from 'react';
import { Box, TextField, List, ListItem, ListItemText, CircularProgress, Typography } from '@mui/material';
import { useOptimizedInput } from '../hooks/useOptimizedInput';
import { useOptimizedSearch } from '../hooks/useOptimizedSearch';

/**
 * Пример оптимизированного компонента для поиска/фильтрации
 * Демонстрирует как избежать лагов при вводе
 */
const OptimizedSearchComponent = React.memo(({ data = [], onSelect, placeholder = "Поиск..." }) => {
  // Используем оптимизированный input hook
  const {
    value: searchTerm,
    deferredValue: deferredSearchTerm,
    isPending,
    handleChange,
    reset
  } = useOptimizedInput('', {
    debounceDelay: 200, // Задержка для API вызовов
    enableTransition: true
  });

  // Используем оптимизированный поиск
  const {
    results: filteredData,
    isSearching,
    hasResults,
    totalResults
  } = useOptimizedSearch(data, deferredSearchTerm, ['name', 'title', 'description'], {
    caseSensitive: false,
    exactMatch: false,
    maxResults: 100 // Ограничиваем для производительности
  });

  // Transition для плавных обновлений списка
  const [isPendingList, startTransition] = useTransition();

  // Мемоизированный обработчик выбора
  const handleSelect = useCallback((item) => {
    startTransition(() => {
      onSelect?.(item);
      reset(); // Очищаем поиск
    });
  }, [onSelect, reset]);

  // Мемоизированный рендер элемента списка
  const renderListItem = useCallback((item, index) => (
    <ListItem 
      key={item.id || index}
      button 
      onClick={() => handleSelect(item)}
      sx={{
        '&:hover': {
          backgroundColor: 'action.hover'
        },
        transition: 'none' // Убираем анимации для производительности
      }}
    >
      <ListItemText
        primary={item.name || item.title}
        secondary={item.description}
        primaryTypographyProps={{
          style: { fontWeight: 500 }
        }}
      />
    </ListItem>
  ), [handleSelect]);

  return (
    <Box sx={{ width: '100%', maxWidth: 400 }}>
      {/* Оптимизированный input */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleChange}
        InputProps={{
          endAdornment: (isSearching || isPending || isPendingList) && (
            <CircularProgress size={20} />
          )
        }}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            transition: 'none', // Убираем анимации
            '& fieldset': {
              transition: 'none'
            },
            '&:hover fieldset': {
              transition: 'none'
            },
            '&.Mui-focused fieldset': {
              transition: 'none'
            }
          },
          '& .MuiInputBase-input': {
            transition: 'none',
            fontSize: '16px' // Предотвращаем zoom на мобильных
          }
        }}
      />

      {/* Результаты поиска */}
      <Box sx={{ minHeight: 50 }}>
        {deferredSearchTerm.trim() && (
          <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
            {isSearching ? 'Поиск...' : `Найдено: ${totalResults}`}
          </Typography>
        )}

        <List sx={{ maxHeight: 300, overflow: 'auto' }}>
          {filteredData.length > 0 ? (
            filteredData.map(renderListItem)
          ) : deferredSearchTerm.trim() && !isSearching ? (
            <ListItem>
              <ListItemText primary="Ничего не найдено" />
            </ListItem>
          ) : null}
        </List>
      </Box>
    </Box>
  );
});

OptimizedSearchComponent.displayName = 'OptimizedSearchComponent';

export default OptimizedSearchComponent;
