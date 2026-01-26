# 🔤 Шрифты сайта ЖФК ЦСКА

## Используемые шрифты

На сайте используются современные шрифты **Geist** от Vercel, оптимизированные для веб-интерфейсов.

### 1. Geist Sans (Основной шрифт)
- **Семейство**: Geist
- **Тип**: Sans-serif (без засечек)
- **Источник**: Google Fonts / Next.js Font Optimization
- **Применение**: Весь основной текст сайта
- **CSS переменная**: `--font-geist-sans`
- **Tailwind класс**: `font-sans` (по умолчанию)

**Характеристики:**
- Современный геометрический шрифт
- Отличная читаемость на всех размерах
- Оптимизирован для цифровых интерфейсов
- Поддержка кириллицы

### 2. Geist Mono (Моноширинный шрифт)
- **Семейство**: Geist Mono
- **Тип**: Monospace (моноширинный)
- **Источник**: Google Fonts / Next.js Font Optimization
- **Применение**: Код, технические данные
- **CSS переменная**: `--font-geist-mono`
- **Tailwind класс**: `font-mono`

**Характеристики:**
- Моноширинный шрифт для кода
- Четкое различие символов
- Используется редко (в основном для технических элементов)

## Конфигурация

### Next.js (app/layout.tsx)
```typescript
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

### CSS Variables (app/globals.css)
```css
@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

### Применение в HTML
```html
<body class="font-sans antialiased">
  <!-- Весь контент использует Geist Sans по умолчанию -->
</body>
```

## Типографическая система

### Размеры заголовков
```css
/* Display - Очень крупные заголовки для Hero секций */
.text-display-2xl  /* 6xl/7xl/8xl - Hero заголовки */
.text-display-xl   /* 5xl/6xl/7xl */
.text-display-lg   /* 4xl/5xl/6xl */

/* Headings - Стандартные заголовки */
.text-heading-xl   /* 3xl/4xl/5xl */
.text-heading-lg   /* 2xl/3xl/4xl */
.text-heading-md   /* xl/2xl/3xl */
.text-heading-sm   /* lg/xl/2xl */

/* Body Text - Основной текст */
.text-body-xl      /* xl/2xl */
.text-body-lg      /* lg/xl */
.text-body-md      /* base/lg */
.text-body-sm      /* sm/base */
```

### Специальные классы

#### Номера игроков
```css
.text-player-number-hero    /* 8xl/9xl - Огромные номера */
.text-player-number-large   /* 6xl/7xl/8xl */
.text-player-number-medium  /* 4xl/5xl/6xl */
.text-player-number-small   /* 2xl/3xl/4xl */
```

#### Счет матчей
```css
.text-score-large   /* 5xl/6xl/7xl */
.text-score-medium  /* 3xl/4xl/5xl */
.text-score-small   /* 2xl/3xl */
```

#### Метки и подписи
```css
.text-label-lg      /* sm/base - uppercase, tracking-wide */
.text-label-md      /* xs/sm - uppercase, tracking-wide */
.text-label-sm      /* xs - uppercase, tracking-wider */
.text-caption       /* xs/sm - text-muted-foreground */
```

## Оптимизация

### Next.js Font Optimization
- Автоматическая оптимизация загрузки шрифтов
- Встраивание критических шрифтов в CSS
- Предзагрузка шрифтов для быстрого отображения
- Устранение мерцания текста (FOUT/FOIT)

### Antialiasing
```css
.antialiased {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

Применяется ко всему body для плавного отображения текста.

## Производительность

### Преимущества Geist
1. **Оптимизирован для веб** - создан специально для цифровых интерфейсов
2. **Малый размер файла** - быстрая загрузка
3. **Variable Font** - один файл для всех начертаний
4. **Отличная читаемость** - на всех размерах экрана

### Метрики загрузки
- Шрифты загружаются асинхронно
- Критические стили встроены в HTML
- Кэширование на стороне браузера
- Поддержка font-display: swap

## Альтернативные шрифты

### Fallback стек
```css
font-family: 
  var(--font-geist-sans),
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  Roboto,
  "Helvetica Neue",
  Arial,
  sans-serif;
```

Если Geist не загрузится, браузер использует системные шрифты.

## Доступность

### Рекомендации WCAG
- ✅ Минимальный размер текста: 16px (1rem)
- ✅ Контраст текста: AAA (7:1 для обычного текста)
- ✅ Межстрочный интервал: 1.5 для body текста
- ✅ Межбуквенный интервал: настроен для заголовков

### Responsive Typography
Все размеры шрифтов адаптивны:
- Mobile: меньшие размеры
- Tablet: средние размеры  
- Desktop: полные размеры

## Примеры использования

### Заголовок Hero
```tsx
<h1 className="text-display-2xl font-bold tracking-tighter gradient-text">
  ЦСКА
</h1>
```

### Номер игрока
```tsx
<div className="text-player-number-large font-bold">
  {player.number}
</div>
```

### Основной текст
```tsx
<p className="text-body-md leading-relaxed">
  Описание команды...
</p>
```

### Метка
```tsx
<span className="text-label-md text-muted-foreground">
  Позиция
</span>
```

## Документация

Подробнее о типографике:
- [TYPOGRAPHY.md](./TYPOGRAPHY.md) - Полная документация
- [TYPOGRAPHY-QUICK-GUIDE.md](./TYPOGRAPHY-QUICK-GUIDE.md) - Быстрый справочник

---

**Версия**: 1.0.0  
**Дата**: Январь 2026  
**Шрифты**: Geist Sans, Geist Mono
