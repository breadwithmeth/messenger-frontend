# Swiss Style Design Guide

## 🎨 Философия дизайна

Swiss Style (Международный типографский стиль) основан на принципах минимализма, функциональности и ясности. Этот стиль возник в Швейцарии в 1950-х годах и характеризуется:

- **Чистота и простота**
- **Строгая типографика**
- **Прямоугольные формы**
- **Высокий контраст**
- **Минимальная цветовая палитра**

## 🎯 Ключевые принципы

### 1. Типографика
- **Основной шрифт:** Helvetica Neue, Helvetica, Arial
- **Иерархия:** Строгая типографическая сетка
- **Начертания:** Light (300), Regular (400), Medium (500)
- **Spacing:** Унифицированные отступы 8px, 16px, 24px

### 2. Цветовая палитра
```css
/* Primary Colors */
--black: #000000;        /* Основной цвет */
--white: #FFFFFF;        /* Фон */
--red: #FF0000;          /* Акцентный цвет */

/* Secondary Colors */
--gray-light: #E0E0E0;   /* Разделители */
--gray-medium: #666666;  /* Вторичный текст */
--gray-disabled: #CCCCCC; /* Неактивные элементы */
```

### 3. Геометрия
- **Формы:** Только прямоугольники, никаких скруглений
- **Границы:** 1px и 2px для четкости
- **Сетка:** Модульная система на основе 8px
- **Пропорции:** Золотое сечение и простые соотношения

### 4. Интерактивность
- **Анимации:** Минимальные или отсутствуют
- **Transitions:** Простые, до 0.15s
- **Hover эффекты:** Изменение цвета, без теней и трансформаций
- **Focus states:** Красная рамка 2px

## 🎨 Компоненты

### Кнопки
```jsx
// Основная кнопка
<Button sx={{
  borderRadius: 0,
  textTransform: 'uppercase',
  fontWeight: 500,
  letterSpacing: '0.08em',
  padding: '12px 24px',
  border: '2px solid #000000',
  backgroundColor: '#000000',
  color: '#FFFFFF'
}} />

// Кнопка-контур
<Button sx={{
  borderRadius: 0,
  textTransform: 'uppercase',
  fontWeight: 500,
  letterSpacing: '0.08em',
  padding: '12px 24px',
  border: '2px solid #000000',
  backgroundColor: 'transparent',
  color: '#000000'
}} />
```

### Поля ввода
```jsx
<TextField sx={{
  '& .MuiOutlinedInput-root': {
    borderRadius: 0,
    backgroundColor: '#FFFFFF',
    border: '2px solid #000000',
    '& fieldset': {
      border: 'none',
    },
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        border: '2px solid #FF0000',
      },
    },
  }
}} />
```

### Карточки
```jsx
<Paper sx={{
  borderRadius: 0,
  border: '2px solid #000000',
  boxShadow: 'none',
  padding: '24px'
}} />
```

### Диалоги
```jsx
<Dialog PaperProps={{
  sx: {
    borderRadius: 0,
    border: '3px solid #000000',
    boxShadow: 'none'
  }
}} />
```

## 📐 Сетка и отступы

### Spacing Scale
```css
/* 8px grid system */
--space-1: 8px;    /* xs */
--space-2: 16px;   /* sm */
--space-3: 24px;   /* md */
--space-4: 32px;   /* lg */
--space-5: 40px;   /* xl */
--space-6: 48px;   /* 2xl */
```

### Layout
- **Контейнеры:** Максимальная ширина 1200px
- **Колонки:** Четкое разделение на модули
- **Границы:** 2px для основных элементов, 1px для вторичных

## 🎯 Типографическая система

### Заголовки
```css
h1: 48px, font-weight: 300, letter-spacing: -0.02em
h2: 36px, font-weight: 300, letter-spacing: -0.02em
h3: 30px, font-weight: 400, letter-spacing: -0.01em
h4: 24px, font-weight: 400, letter-spacing: -0.01em
h5: 20px, font-weight: 500, letter-spacing: 0
h6: 18px, font-weight: 500, letter-spacing: 0
```

### Основной текст
```css
body1: 16px, font-weight: 400, line-height: 1.5
body2: 14px, font-weight: 400, line-height: 1.43
caption: 12px, font-weight: 400, letter-spacing: 0.03em, text-transform: uppercase
```

### Кнопки и лейблы
```css
button: font-weight: 500, letter-spacing: 0.08em, text-transform: uppercase
```

## 🔍 Примеры использования

### Список чатов
- Прямоугольные элементы без скруглений
- Четкие границы между элементами
- Минимальная подсветка активного элемента
- Типографическая иерархия

### Сообщения
- Прямоугольные пузыри сообщений
- Высокий контраст: черный/белый
- Четкие границы вместо теней
- Простая типографика

### Формы
- Прямоугольные поля ввода
- Четкие лейблы
- Красная подсветка фокуса
- Строгое выравнивание

## ✅ Чек-лист реализации

- [x] Обновлена цветовая палитра (черный/белый/красный)
- [x] Убраны все скругления (borderRadius: 0)
- [x] Заменены тени на границы
- [x] Обновлена типографика (Helvetica)
- [x] Добавлены uppercase трансформации
- [x] Унифицированы отступы по сетке 8px
- [x] Упрощены анимации и переходы
- [x] Обновлены все компоненты MUI
- [x] Адаптирован CSS под Swiss Style
- [x] Обновлены интерактивные состояния

## 🚀 Результат

Мессенджер теперь следует строгим принципам Swiss Style:
- Максимальная функциональность
- Минимальная визуальная сложность
- Высокая читаемость
- Профессиональный внешний вид
- Временная эстетика
