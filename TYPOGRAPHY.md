# Типографика ЖФК ЦСКА

## Шрифты

### Основной шрифт - Geist Sans
- **Семейство**: Geist Sans (Variable Font)
- **Использование**: Весь текст на сайте
- **Особенности**: Современный, читаемый, поддержка кириллицы
- **CSS Variable**: `--font-geist-sans`

### Моноширинный шрифт - Geist Mono
- **Семейство**: Geist Mono (Variable Font)
- **Использование**: Код, технические данные
- **CSS Variable**: `--font-geist-mono`

---

## Иерархия типографики

### 1. Display - Очень крупные заголовки

Используются для Hero секций и главных заголовков страниц.

#### Display 2XL
```tsx
<h1 className="text-display-2xl">
  ЖФК ЦСКА
</h1>
```
- **Mobile**: 60px (3.75rem)
- **Tablet**: 72px (4.5rem)
- **Desktop**: 96px (6rem)
- **Line Height**: 1 (none)
- **Tracking**: -0.05em (tighter)

#### Display XL
```tsx
<h1 className="text-display-xl">
  Чемпионы России
</h1>
```
- **Mobile**: 48px (3rem)
- **Tablet**: 60px (3.75rem)
- **Desktop**: 72px (4.5rem)
- **Line Height**: 1 (none)
- **Tracking**: -0.05em (tighter)

#### Display LG
```tsx
<h1 className="text-display-lg">
  Новости клуба
</h1>
```
- **Mobile**: 36px (2.25rem)
- **Tablet**: 48px (3rem)
- **Desktop**: 60px (3.75rem)
- **Line Height**: 1.1 (tight)
- **Tracking**: -0.025em (tight)

---

### 2. Headings - Стандартные заголовки

Используются для заголовков секций и карточек.

#### Heading XL
```tsx
<h2 className="text-heading-xl">
  Состав команды
</h2>
```
- **Mobile**: 30px (1.875rem)
- **Tablet**: 36px (2.25rem)
- **Desktop**: 48px (3rem)
- **Line Height**: 1.1 (tight)

#### Heading LG
```tsx
<h2 className="text-heading-lg">
  Ближайшие матчи
</h2>
```
- **Mobile**: 24px (1.5rem)
- **Tablet**: 30px (1.875rem)
- **Desktop**: 36px (2.25rem)
- **Line Height**: 1.1 (tight)

#### Heading MD
```tsx
<h3 className="text-heading-md">
  Последние новости
</h3>
```
- **Mobile**: 20px (1.25rem)
- **Tablet**: 24px (1.5rem)
- **Desktop**: 30px (1.875rem)
- **Line Height**: 1.2 (snug)

#### Heading SM
```tsx
<h4 className="text-heading-sm">
  Статистика сезона
</h4>
```
- **Mobile**: 18px (1.125rem)
- **Tablet**: 20px (1.25rem)
- **Desktop**: 24px (1.5rem)
- **Line Height**: 1.2 (snug)

---

### 3. Player Numbers - Номера игроков

Специальные размеры для отображения номеров игроков с табличными цифрами.

#### Player Number Hero
```tsx
<span className="text-player-number-hero">
  10
</span>
```
- **Mobile**: 96px (6rem)
- **Tablet/Desktop**: 128px (8rem)
- **Line Height**: 1 (none)
- **Tracking**: -0.05em (tighter)
- **Font Feature**: Tabular nums

#### Player Number Large
```tsx
<span className="text-player-number-large">
  7
</span>
```
- **Mobile**: 60px (3.75rem)
- **Tablet**: 72px (4.5rem)
- **Desktop**: 96px (6rem)
- **Line Height**: 1 (none)
- **Tracking**: -0.05em (tighter)
- **Font Feature**: Tabular nums

#### Player Number Medium
```tsx
<span className="text-player-number-medium">
  23
</span>
```
- **Mobile**: 36px (2.25rem)
- **Tablet**: 48px (3rem)
- **Desktop**: 60px (3.75rem)
- **Line Height**: 1 (none)
- **Tracking**: -0.025em (tight)
- **Font Feature**: Tabular nums

#### Player Number Small
```tsx
<span className="text-player-number-small">
  15
</span>
```
- **Mobile**: 24px (1.5rem)
- **Tablet**: 30px (1.875rem)
- **Desktop**: 36px (2.25rem)
- **Line Height**: 1 (none)
- **Font Feature**: Tabular nums

---

### 4. Body Text - Основной текст

Используется для параграфов и основного контента.

#### Body XL
```tsx
<p className="text-body-xl">
  Крупный текст для важных описаний
</p>
```
- **Mobile**: 20px (1.25rem)
- **Tablet/Desktop**: 24px (1.5rem)
- **Line Height**: 1.6 (relaxed)

#### Body LG
```tsx
<p className="text-body-lg">
  Увеличенный текст для лидов
</p>
```
- **Mobile**: 18px (1.125rem)
- **Tablet/Desktop**: 20px (1.25rem)
- **Line Height**: 1.6 (relaxed)

#### Body MD (по умолчанию)
```tsx
<p className="text-body-md">
  Стандартный текст для большинства контента
</p>
```
- **Mobile**: 16px (1rem)
- **Tablet/Desktop**: 18px (1.125rem)
- **Line Height**: 1.6 (relaxed)

#### Body SM
```tsx
<p className="text-body-sm">
  Уменьшенный текст для дополнительной информации
</p>
```
- **Mobile**: 14px (0.875rem)
- **Tablet/Desktop**: 16px (1rem)
- **Line Height**: 1.6 (relaxed)

---

### 5. Labels & Captions

Используются для меток, категорий и подписей.

#### Label LG
```tsx
<span className="text-label-lg">
  Категория
</span>
```
- **Mobile**: 14px (0.875rem)
- **Tablet/Desktop**: 16px (1rem)
- **Transform**: Uppercase
- **Tracking**: 0.05em (wide)
- **Weight**: 600 (semibold)

#### Label MD
```tsx
<span className="text-label-md">
  Позиция
</span>
```
- **Mobile**: 12px (0.75rem)
- **Tablet/Desktop**: 14px (0.875rem)
- **Transform**: Uppercase
- **Tracking**: 0.05em (wide)
- **Weight**: 600 (semibold)

#### Label SM
```tsx
<span className="text-label-sm">
  Тег
</span>
```
- **Size**: 12px (0.75rem)
- **Transform**: Uppercase
- **Tracking**: 0.1em (wider)
- **Weight**: 600 (semibold)

#### Caption
```tsx
<p className="text-caption">
  Дополнительная информация или подпись к изображению
</p>
```
- **Mobile**: 12px (0.75rem)
- **Tablet/Desktop**: 14px (0.875rem)
- **Color**: Muted foreground
- **Line Height**: 1.4 (normal)

---

### 6. Score Display - Счет матчей

Специальные размеры для отображения счета с табличными цифрами.

#### Score Large
```tsx
<span className="text-score-large">
  3:1
</span>
```
- **Mobile**: 48px (3rem)
- **Tablet**: 60px (3.75rem)
- **Desktop**: 72px (4.5rem)
- **Line Height**: 1 (none)
- **Font Feature**: Tabular nums

#### Score Medium
```tsx
<span className="text-score-medium">
  2:0
</span>
```
- **Mobile**: 30px (1.875rem)
- **Tablet**: 36px (2.25rem)
- **Desktop**: 48px (3rem)
- **Line Height**: 1 (none)
- **Font Feature**: Tabular nums

#### Score Small
```tsx
<span className="text-score-small">
  1:1
</span>
```
- **Mobile**: 24px (1.5rem)
- **Tablet/Desktop**: 30px (1.875rem)
- **Line Height**: 1 (none)
- **Font Feature**: Tabular nums

---

## Утилиты для улучшения читаемости

### Text Balance
Балансирует длину строк для лучшей читаемости заголовков.

```tsx
<h1 className="text-display-xl text-balance">
  Длинный заголовок будет сбалансирован
</h1>
```

### Text Pretty
Улучшает перенос слов для лучшей типографики.

```tsx
<p className="text-body-md text-pretty">
  Длинный текст с улучшенными переносами
</p>
```

### Line Clamp
Ограничивает количество строк с многоточием.

```tsx
<p className="text-body-md line-clamp-2">
  Этот текст будет обрезан после двух строк...
</p>

<p className="text-body-md line-clamp-3">
  Этот текст будет обрезан после трех строк...
</p>
```

---

## Примеры использования

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
  <h3 className="text-heading-md">
    Анна Иванова
  </h3>
  <span className="text-label-md text-muted-foreground">
    Нападающий
  </span>
</div>
```

### Карточка матча
```tsx
<div className="match-card">
  <div className="teams">
    <span className="text-heading-sm">ЦСКА</span>
    <span className="text-score-large text-primary">3:1</span>
    <span className="text-heading-sm">Спартак</span>
  </div>
  <p className="text-caption">
    15 января 2026, 19:00 • Арена Химки
  </p>
</div>
```

### Новостная карточка
```tsx
<article className="news-card">
  <span className="text-label-sm text-accent">
    Новости
  </span>
  <h3 className="text-heading-md line-clamp-2">
    ЦСКА одержал победу в принципиальном матче
  </h3>
  <p className="text-body-sm text-muted-foreground line-clamp-3">
    Описание новости с ограничением в три строки...
  </p>
  <time className="text-caption">
    20 января 2026
  </time>
</article>
```

---

## Responsive поведение

Все типографические классы автоматически адаптируются под размер экрана:

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1023px
- **Desktop**: ≥ 1024px

### Стратегия масштабирования
1. **Display & Headings**: Значительное увеличение на больших экранах
2. **Body Text**: Умеренное увеличение для комфортного чтения
3. **Labels & Captions**: Минимальное увеличение
4. **Player Numbers & Scores**: Драматическое увеличение для визуального эффекта

---

## Рекомендации по использованию

### ✅ Правильно

1. **Используйте семантические классы**
   ```tsx
   <h1 className="text-display-xl">Заголовок</h1>
   <p className="text-body-md">Текст</p>
   ```

2. **Комбинируйте с цветами**
   ```tsx
   <h2 className="text-heading-lg text-primary">
     Синий заголовок
   </h2>
   ```

3. **Используйте утилиты для читаемости**
   ```tsx
   <h1 className="text-display-xl text-balance">
     Длинный заголовок
   </h1>
   ```

4. **Ограничивайте длинные тексты**
   ```tsx
   <p className="text-body-md line-clamp-3">
     Длинное описание...
   </p>
   ```

### ❌ Неправильно

1. **Не используйте произвольные размеры**
   ```tsx
   <!-- Плохо -->
   <h1 className="text-5xl">Заголовок</h1>
   
   <!-- Хорошо -->
   <h1 className="text-display-lg">Заголовок</h1>
   ```

2. **Не смешивайте стили**
   ```tsx
   <!-- Плохо -->
   <span className="text-player-number-large text-body-md">
     10
   </span>
   
   <!-- Хорошо -->
   <span className="text-player-number-large">
     10
   </span>
   ```

3. **Не забывайте про responsive**
   ```tsx
   <!-- Плохо -->
   <h1 className="text-6xl">Заголовок</h1>
   
   <!-- Хорошо -->
   <h1 className="text-display-lg">Заголовок</h1>
   ```

---

## Accessibility

### Контрастность
Все размеры текста проверены на соответствие WCAG 2.1:
- **Крупный текст** (≥ 18px): Контрастность ≥ 3:1
- **Обычный текст** (< 18px): Контрастность ≥ 4.5:1

### Семантика
Всегда используйте правильные HTML теги:
- `<h1>` - `<h6>` для заголовков
- `<p>` для параграфов
- `<span>` для inline элементов
- `<time>` для дат

### Читаемость
- **Минимальный размер**: 14px (0.875rem) на mobile
- **Оптимальная длина строки**: 45-75 символов
- **Line height**: 1.4-1.6 для body text

---

## Тестирование

### Проверка на разных экранах
1. Mobile (375px)
2. Tablet (768px)
3. Desktop (1440px)
4. Large Desktop (1920px)

### Проверка читаемости
1. Контрастность текста
2. Размер шрифта
3. Межстрочный интервал
4. Длина строки

### Инструменты
- Chrome DevTools (Device Mode)
- Lighthouse (Accessibility)
- WAVE Browser Extension
- WebAIM Contrast Checker

---

## Статус реализации

- ✅ Шрифты настроены (Geist Sans, Geist Mono)
- ✅ Display размеры (2XL, XL, LG)
- ✅ Heading размеры (XL, LG, MD, SM)
- ✅ Player Number размеры (Hero, Large, Medium, Small)
- ✅ Body Text размеры (XL, LG, MD, SM)
- ✅ Labels & Captions (LG, MD, SM, Caption)
- ✅ Score Display размеры (Large, Medium, Small)
- ✅ Responsive типографика
- ✅ Утилиты для читаемости (balance, pretty, line-clamp)
- ✅ Документация создана

---

**Автор:** Kiro AI  
**Дата:** 20 января 2026
