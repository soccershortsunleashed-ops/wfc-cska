# Быстрое руководство по типографике

## 🎯 Когда что использовать

### 📱 Display - Очень крупные заголовки
**Где:** Hero секции, главные заголовки страниц

```tsx
// Главный заголовок сайта
<h1 className="text-display-2xl">ЖФК ЦСКА</h1>

// Заголовок Hero секции
<h1 className="text-display-xl">Чемпионы России</h1>

// Заголовок страницы
<h1 className="text-display-lg">Новости клуба</h1>
```

---

### 📝 Headings - Стандартные заголовки
**Где:** Заголовки секций, карточек, блоков

```tsx
// Заголовок секции
<h2 className="text-heading-xl">Состав команды</h2>

// Заголовок подсекции
<h2 className="text-heading-lg">Ближайшие матчи</h2>

// Заголовок карточки
<h3 className="text-heading-md">Последние новости</h3>

// Подзаголовок
<h4 className="text-heading-sm">Статистика сезона</h4>
```

---

### 🔢 Player Numbers - Номера игроков
**Где:** Карточки игроков, профили, составы

```tsx
// Главный номер (профиль игрока)
<span className="text-player-number-hero">10</span>

// Крупный номер (карточка игрока)
<span className="text-player-number-large">7</span>

// Средний номер (список игроков)
<span className="text-player-number-medium">23</span>

// Маленький номер (компактный список)
<span className="text-player-number-small">15</span>
```

---

### 📄 Body Text - Основной текст
**Где:** Параграфы, описания, контент

```tsx
// Важное описание (лид)
<p className="text-body-xl">
  Крупный текст для важных описаний
</p>

// Увеличенный текст (подзаголовок)
<p className="text-body-lg">
  Увеличенный текст для лидов
</p>

// Стандартный текст (по умолчанию)
<p className="text-body-md">
  Стандартный текст для большинства контента
</p>

// Дополнительная информация
<p className="text-body-sm">
  Уменьшенный текст для дополнительной информации
</p>
```

---

### 🏷️ Labels - Метки и категории
**Где:** Категории, позиции, теги

```tsx
// Крупная метка
<span className="text-label-lg">Категория</span>

// Стандартная метка
<span className="text-label-md">Позиция</span>

// Маленькая метка (в Badge)
<Badge className="text-label-sm">Тег</Badge>
```

---

### 📸 Caption - Подписи
**Где:** Подписи к изображениям, даты, мета-информация

```tsx
<p className="text-caption">
  20 января 2026, 19:00 • Арена Химки
</p>
```

---

### ⚽ Score - Счет матчей
**Где:** Карточки матчей, результаты

```tsx
// Крупный счет (главная карточка)
<span className="text-score-large">3:1</span>

// Средний счет (список матчей)
<span className="text-score-medium">2:0</span>

// Маленький счет (компактный список)
<span className="text-score-small">1:1</span>
```

---

## 🛠️ Утилиты

### Text Balance
Балансирует длину строк для заголовков

```tsx
<h1 className="text-display-xl text-balance">
  Длинный заголовок будет сбалансирован
</h1>
```

### Text Pretty
Улучшает перенос слов

```tsx
<p className="text-body-md text-pretty">
  Длинный текст с улучшенными переносами
</p>
```

### Line Clamp
Ограничивает количество строк

```tsx
<p className="text-body-md line-clamp-2">
  Текст обрезается после 2 строк...
</p>

<p className="text-body-md line-clamp-3">
  Текст обрезается после 3 строк...
</p>
```

---

## 📦 Готовые рецепты

### Hero секция
```tsx
<section className="hero">
  <h1 className="text-display-2xl text-balance text-primary">
    ЖФК ЦСКА
  </h1>
  <p className="text-body-xl text-pretty text-muted-foreground">
    Чемпионы России 2023
  </p>
</section>
```

### Карточка игрока
```tsx
<div className="player-card">
  <span className="text-player-number-large text-primary">
    10
  </span>
  <h3 className="text-heading-md">Анна Иванова</h3>
  <span className="text-label-md text-muted-foreground">
    Нападающий
  </span>
</div>
```

### Карточка матча
```tsx
<div className="match-card">
  <div className="flex items-center justify-between">
    <span className="text-heading-sm">ЦСКА</span>
    <span className="text-score-large text-primary">3:1</span>
    <span className="text-heading-sm">Спартак</span>
  </div>
  <p className="text-caption text-center">
    15 января 2026, 19:00 • Арена Химки
  </p>
</div>
```

### Новостная карточка
```tsx
<article className="news-card">
  <Badge className="text-label-sm">Новости</Badge>
  <h3 className="text-heading-md line-clamp-2">
    ЦСКА одержал победу в принципиальном матче
  </h3>
  <p className="text-body-sm text-muted-foreground line-clamp-3">
    Описание новости с ограничением в три строки...
  </p>
  <time className="text-caption">20 января 2026</time>
</article>
```

---

## 📱 Responsive размеры

### Mobile (< 768px)
- Display 2XL: 60px
- Heading XL: 30px
- Player Number Large: 60px
- Body MD: 16px

### Tablet (768px - 1023px)
- Display 2XL: 72px
- Heading XL: 36px
- Player Number Large: 72px
- Body MD: 18px

### Desktop (≥ 1024px)
- Display 2XL: 96px
- Heading XL: 48px
- Player Number Large: 96px
- Body MD: 18px

---

## ✅ Правильно / ❌ Неправильно

### ✅ Правильно

```tsx
// Используйте семантические классы
<h1 className="text-display-xl">Заголовок</h1>

// Комбинируйте с цветами
<h2 className="text-heading-lg text-primary">
  Синий заголовок
</h2>

// Используйте утилиты
<h1 className="text-display-xl text-balance">
  Длинный заголовок
</h1>

// Ограничивайте длинные тексты
<p className="text-body-md line-clamp-3">
  Длинное описание...
</p>
```

### ❌ Неправильно

```tsx
// Не используйте произвольные размеры
<h1 className="text-5xl">Заголовок</h1>

// Не смешивайте стили
<span className="text-player-number-large text-body-md">
  10
</span>

// Не забывайте про responsive
<h1 className="text-6xl">Заголовок</h1>
```

---

## 🎨 Комбинации с цветами

```tsx
// Синий заголовок
<h1 className="text-display-xl text-primary">
  Заголовок
</h1>

// Красный номер
<span className="text-player-number-large text-accent">
  10
</span>

// Приглушенный текст
<p className="text-body-md text-muted-foreground">
  Дополнительная информация
</p>

// Белый текст на синем фоне
<div className="bg-primary text-primary-foreground">
  <h2 className="text-heading-lg">Заголовок</h2>
</div>
```

---

## 🔗 Полезные ссылки

- [Полная документация](./TYPOGRAPHY.md)
- [Тестовая страница](/test-typography)
- [Цветовая схема](./COLOR-SCHEME.md)

---

**Совет:** Используйте тестовую страницу `/test-typography` для визуальной проверки всех размеров на разных экранах!
