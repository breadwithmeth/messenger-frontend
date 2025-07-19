# Руководство по оптимизации производительности React компонентов

## Проблема: Лаг ввода в input полях

Когда input компонент лагает (задержка 1-3 секунды на символ), это обычно происходит из-за:

1. **Тяжёлых вычислений в рендере** - фильтрация, поиск, сортировка выполняются при каждом рендере
2. **Связанные обновления состояния** - изменение input'а вызывает перерендер всего приложения  
3. **Отсутствие мемоизации** - компоненты и функции пересоздаются без необходимости
4. **Блокирующие операции** - синхронные API вызовы или тяжёлые вычисления

## Решения

### 1. Изоляция input от других обновлений

```jsx
// ❌ Плохо: input связан с тяжёлыми операциями
const [searchTerm, setSearchTerm] = useState('');
const filteredData = data.filter(item => item.name.includes(searchTerm)); // Выполняется при каждом символе

// ✅ Хорошо: используем useDeferredValue для изоляции
const [searchTerm, setSearchTerm] = useState('');
const deferredSearchTerm = useDeferredValue(searchTerm);
const filteredData = useMemo(() => 
  data.filter(item => item.name.includes(deferredSearchTerm)), 
  [data, deferredSearchTerm]
);
```

### 2. Мемоизация тяжёлых вычислений

```jsx
// ❌ Плохо: фильтрация выполняется при каждом рендере
const Component = ({ data, filter }) => {
  const filtered = data.filter(item => item.category === filter);
  return <List items={filtered} />;
};

// ✅ Хорошо: мемоизируем результат
const Component = ({ data, filter }) => {
  const filtered = useMemo(() => 
    data.filter(item => item.category === filter), 
    [data, filter]
  );
  return <List items={filtered} />;
};
```

### 3. Использование React.memo и useCallback

```jsx
// ❌ Плохо: компонент перерендеривается без необходимости
const ListItem = ({ item, onSelect }) => {
  return <div onClick={() => onSelect(item)}>{item.name}</div>;
};

// ✅ Хорошо: мемоизируем компонент и функции
const ListItem = React.memo(({ item, onSelect }) => {
  const handleClick = useCallback(() => onSelect(item), [item, onSelect]);
  return <div onClick={handleClick}>{item.name}</div>;
});

const Parent = ({ items }) => {
  const handleSelect = useCallback((item) => {
    console.log('Selected:', item);
  }, []);
  
  return items.map(item => 
    <ListItem key={item.id} item={item} onSelect={handleSelect} />
  );
};
```

### 4. useTransition для плавных обновлений

```jsx
// ❌ Плохо: обновления блокируют UI
const [data, setData] = useState([]);
const [filter, setFilter] = useState('');

const updateData = (newData) => {
  setData(newData); // Блокирует UI при больших данных
};

// ✅ Хорошо: используем transition
const [data, setData] = useState([]);
const [filter, setFilter] = useState('');
const [isPending, startTransition] = useTransition();

const updateData = (newData) => {
  startTransition(() => {
    setData(newData); // Не блокирует UI
  });
};
```

### 5. Debouncing для API вызовов

```jsx
// ❌ Плохо: API вызов при каждом символе
const [query, setQuery] = useState('');

useEffect(() => {
  if (query) {
    fetchResults(query); // Слишком много запросов
  }
}, [query]);

// ✅ Хорошо: debouncing
const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 300);

useEffect(() => {
  if (debouncedQuery) {
    fetchResults(debouncedQuery);
  }
}, [debouncedQuery]);
```

## Практические хуки для оптимизации

### useOptimizedInput
Изолирует input от тяжёлых операций:

```jsx
const {
  value,           // Для отображения в input
  deferredValue,   // Для тяжёлых операций  
  handleChange,    // Оптимизированный обработчик
  isPending        // Индикатор загрузки
} = useOptimizedInput('', { debounceDelay: 300 });
```

### useOptimizedSearch
Оптимизированный поиск с мемоизацией:

```jsx
const {
  results,         // Отфильтрованные данные
  isSearching,     // Индикатор поиска
  totalResults     // Количество результатов
} = useOptimizedSearch(data, searchTerm, ['name', 'description']);
```

## Чек-лист оптимизации

- [ ] Input изолирован от тяжёлых операций (useDeferredValue)
- [ ] Тяжёлые вычисления мемоизированы (useMemo)
- [ ] Функции мемоизированы (useCallback)
- [ ] Компоненты мемоизированы (React.memo)
- [ ] Используется useTransition для неблокирующих обновлений
- [ ] API вызовы debounced
- [ ] Убраны ненужные анимации/transitions
- [ ] Списки виртуализированы при больших данных
- [ ] Состояние разбито на локальные компоненты

## Измерение производительности

```jsx
// Используйте React DevTools Profiler для измерения
const Component = () => {
  // Измерение времени рендера
  console.time('render');
  const result = heavyComputation();
  console.timeEnd('render');
  
  return <div>{result}</div>;
};

// Используйте Performance API
const startTime = performance.now();
// ... операция
const endTime = performance.now();
console.log(`Операция заняла ${endTime - startTime} миллисекунд`);
```
