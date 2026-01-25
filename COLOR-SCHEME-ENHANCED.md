# 🎨 Улучшенная цветовая схема ЦСКА с градиентами

> Вдохновлено дизайном ФК "Локомотив" - использование фирменных цветов через эффектные градиенты

## 🎯 Основные фирменные цвета

### Синий ЦСКА (Primary)
- **HEX**: `#0033A0` (официальный синий ЦСКА)
- **RGB**: `rgb(0, 51, 160)`
- **HSL**: `hsl(221, 100%, 31%)`
- **Использование**: Основной цвет бренда, заголовки, кнопки

### Красный ЦСКА (Accent)
- **HEX**: `#E4002B` (официальный красный ЦСКА)
- **RGB**: `rgb(228, 0, 43)`
- **HSL**: `hsl(349, 100%, 45%)`
- **Использование**: Акценты, CTA, важные элементы

### Белый ЦСКА
- **HEX**: `#FFFFFF`
- **Использование**: Текст на темном фоне, фон карточек

## 🌈 Градиенты - Основа дизайна

### 1. Hero Gradient (Главный градиент)
```css
/* Синий → Красный (диагональ) */
background: linear-gradient(135deg, #0033A0 0%, #E4002B 100%);
```
**Использование:**
- Hero секция на главной странице
- Фон заголовков страниц
- Крупные баннеры

**Пример:**
```tsx
<div className="bg-gradient-to-br from-[#0033A0] to-[#E4002B]">
  <h1 className="text-white">ЖФК ЦСКА</h1>
</div>
```

---

### 2. Subtle Gradient (Тонкий градиент)
```css
/* Темно-синий → Синий ЦСКА */
background: linear-gradient(180deg, #001f5c 0%, #0033A0 100%);
```
**Использование:**
- Фон header
- Фон footer
- Карточки игроков

**Пример:**
```tsx
<header className="bg-gradient-to-b from-[#001f5c] to-[#0033A0]">
  {/* Навигация */}
</header>
```

---

### 3. Card Gradient (Градиент для карточек)
```css
/* Синий с прозрачностью */
background: linear-gradient(135deg, 
  rgba(0, 51, 160, 0.95) 0%, 
  rgba(0, 51, 160, 0.85) 100%
);
```
**Использование:**
- Карточки новостей
- Карточки матчей
- Overlay на изображениях

**Пример:**
```tsx
<div className="relative">
  <img src="news.jpg" />
  <div className="absolute inset-0 bg-gradient-to-br from-[#0033A0]/95 to-[#0033A0]/85">
    <h3 className="text-white">Заголовок новости</h3>
  </div>
</div>
```

---

### 4. Button Gradient (Градиент для кнопок)
```css
/* Красный → Темно-красный */
background: linear-gradient(90deg, #E4002B 0%, #b30022 100%);
```
**Использование:**
- Primary кнопки
- CTA элементы
- Активные состояния

**Пример:**
```tsx
<button className="bg-gradient-to-r from-[#E4002B] to-[#b30022] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all">
  Купить билет
</button>
```

---

### 5. Accent Gradient (Акцентный градиент)
```css
/* Красный → Синий (горизонтальный) */
background: linear-gradient(90deg, #E4002B 0%, #0033A0 100%);
```
**Использование:**
- Разделители секций
- Декоративные элементы
- Прогресс-бары

**Пример:**
```tsx
<div className="h-1 w-full bg-gradient-to-r from-[#E4002B] to-[#0033A0]" />
```

---

### 6. Hover Gradient (Градиент при наведении)
```css
/* Синий → Светло-синий */
background: linear-gradient(135deg, #0033A0 0%, #0047cc 100%);
```
**Использование:**
- Hover состояния карточек
- Интерактивные элементы

**Пример:**
```tsx
<div className="bg-gradient-to-br from-[#0033A0] to-[#0033A0] hover:to-[#0047cc] transition-all duration-300">
  {/* Контент */}
</div>
```

---

### 7. Text Gradient (Градиент для текста)
```css
/* Синий → Красный */
background: linear-gradient(90deg, #0033A0 0%, #E4002B 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```
**Использование:**
- Заголовки H1
- Логотип
- Акцентный текст

**Пример:**
```tsx
<h1 className="text-6xl font-bold bg-gradient-to-r from-[#0033A0] to-[#E4002B] bg-clip-text text-transparent">
  ЖФК ЦСКА
</h1>
```

---

### 8. Overlay Gradient (Градиент для оверлеев)
```css
/* Прозрачный → Синий */
background: linear-gradient(180deg, 
  rgba(0, 51, 160, 0) 0%, 
  rgba(0, 51, 160, 0.9) 100%
);
```
**Использование:**
- Overlay на hero изображениях
- Затемнение фоновых изображений

**Пример:**
```tsx
<div className="relative h-screen">
  <img src="hero.jpg" className="absolute inset-0 object-cover" />
  <div className="absolute inset-0 bg-gradient-to-b from-[#0033A0]/0 to-[#0033A0]/90" />
  <div className="relative z-10 text-white">
    {/* Контент */}
  </div>
</div>
```

---

## 🎨 Дополнительные оттенки

### Синяя палитра
```css
--cska-blue-50:  #e6eaf5;   /* Очень светлый */
--cska-blue-100: #b3c2e6;   /* Светлый */
--cska-blue-200: #809ad6;   /* Средне-светлый */
--cska-blue-300: #4d72c7;   /* Средний */
--cska-blue-400: #1a4ab8;   /* Средне-темный */
--cska-blue-500: #0033A0;   /* Основной */
--cska-blue-600: #002980;   /* Темный */
--cska-blue-700: #001f60;   /* Очень темный */
--cska-blue-800: #001440;   /* Почти черный */
--cska-blue-900: #000a20;   /* Черный с синим */
```

### Красная палитра
```css
--cska-red-50:  #fce6e9;   /* Очень светлый */
--cska-red-100: #f7b3bd;   /* Светлый */
--cska-red-200: #f28091;   /* Средне-светлый */
--cska-red-300: #ed4d65;   /* Средний */
--cska-red-400: #e81a39;   /* Средне-темный */
--cska-red-500: #E4002B;   /* Основной */
--cska-red-600: #b30022;   /* Темный */
--cska-red-700: #83001a;   /* Очень темный */
--cska-red-800: #520011;   /* Почти черный */
--cska-red-900: #220007;   /* Черный с красным */
```

---

## 💡 Примеры использования

### Hero секция с градиентом
```tsx
<section className="relative min-h-screen">
  {/* Фоновое изображение */}
  <img 
    src="/hero-bg.jpg" 
    className="absolute inset-0 w-full h-full object-cover"
  />
  
  {/* Градиентный оверлей */}
  <div className="absolute inset-0 bg-gradient-to-br from-[#0033A0]/95 via-[#0033A0]/85 to-[#E4002B]/90" />
  
  {/* Контент */}
  <div className="relative z-10 container mx-auto px-4 py-20">
    <h1 className="text-6xl font-bold text-white mb-4">
      ЖФК ЦСКА
    </h1>
    <p className="text-xl text-white/90 mb-8">
      Женская команда армейского клуба
    </p>
    <button className="bg-gradient-to-r from-[#E4002B] to-[#b30022] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-2xl transition-all">
      Купить билет
    </button>
  </div>
</section>
```

### Карточка новости с градиентом
```tsx
<div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
  {/* Изображение */}
  <img 
    src="/news.jpg" 
    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
  />
  
  {/* Градиентный оверлей */}
  <div className="absolute inset-0 bg-gradient-to-t from-[#0033A0]/95 via-[#0033A0]/50 to-transparent" />
  
  {/* Контент */}
  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
    <span className="inline-block px-3 py-1 bg-[#E4002B] rounded-full text-sm mb-2">
      Новости
    </span>
    <h3 className="text-2xl font-bold mb-2">
      Победа в матче
    </h3>
    <p className="text-white/90">
      ЖФК ЦСКА одержал уверенную победу...
    </p>
  </div>
</div>
```

### Header с тонким градиентом
```tsx
<header className="sticky top-0 z-50 bg-gradient-to-b from-[#001f5c] to-[#0033A0] shadow-lg">
  <div className="container mx-auto px-4 py-4">
    <nav className="flex items-center justify-between">
      {/* Логотип с градиентом */}
      <div className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
        ЖФК ЦСКА
      </div>
      
      {/* Навигация */}
      <ul className="flex gap-6 text-white">
        <li className="hover:text-[#E4002B] transition-colors">Команда</li>
        <li className="hover:text-[#E4002B] transition-colors">Матчи</li>
        <li className="hover:text-[#E4002B] transition-colors">Новости</li>
      </ul>
      
      {/* CTA кнопка */}
      <button className="bg-gradient-to-r from-[#E4002B] to-[#b30022] px-6 py-2 rounded-lg text-white font-semibold hover:shadow-lg transition-all">
        Билеты
      </button>
    </nav>
  </div>
</header>
```

### Карточка игрока с hover эффектом
```tsx
<div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0033A0] to-[#0033A0] hover:to-[#0047cc] transition-all duration-300 shadow-lg hover:shadow-2xl">
  {/* Фото игрока */}
  <img 
    src="/player.jpg" 
    className="w-full h-80 object-cover opacity-90 group-hover:opacity-100 transition-opacity"
  />
  
  {/* Градиентный оверлей снизу */}
  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0033A0] to-transparent" />
  
  {/* Информация */}
  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
    <div className="flex items-center gap-3 mb-2">
      <span className="text-4xl font-bold">10</span>
      <div>
        <h3 className="text-xl font-bold">Анна Иванова</h3>
        <p className="text-white/80">Нападающий</p>
      </div>
    </div>
  </div>
  
  {/* Красная полоска сверху при hover */}
  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E4002B] to-[#b30022] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
</div>
```

### Секция статистики с градиентными карточками
```tsx
<section className="py-20 bg-gray-50">
  <div className="container mx-auto px-4">
    <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[#0033A0] to-[#E4002B] bg-clip-text text-transparent">
      Статистика сезона
    </h2>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Карточка 1 */}
      <div className="relative overflow-hidden rounded-xl p-8 bg-gradient-to-br from-[#0033A0] to-[#0047cc] text-white shadow-lg hover:shadow-2xl transition-all">
        <div className="text-5xl font-bold mb-2">24</div>
        <div className="text-xl">Побед</div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
      </div>
      
      {/* Карточка 2 */}
      <div className="relative overflow-hidden rounded-xl p-8 bg-gradient-to-br from-[#E4002B] to-[#b30022] text-white shadow-lg hover:shadow-2xl transition-all">
        <div className="text-5xl font-bold mb-2">68</div>
        <div className="text-xl">Голов</div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
      </div>
      
      {/* Карточка 3 */}
      <div className="relative overflow-hidden rounded-xl p-8 bg-gradient-to-br from-[#0033A0] to-[#E4002B] text-white shadow-lg hover:shadow-2xl transition-all">
        <div className="text-5xl font-bold mb-2">1</div>
        <div className="text-xl">Место в таблице</div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
      </div>
    </div>
  </div>
</section>
```

---

## 🎯 Рекомендации по применению

### ✅ Правильно

1. **Hero секции** - используйте диагональный градиент от синего к красному
2. **Header/Footer** - тонкий вертикальный градиент в синих тонах
3. **Кнопки CTA** - горизонтальный градиент в красных тонах
4. **Карточки** - градиент с прозрачностью для overlay
5. **Заголовки** - текстовый градиент от синего к красному
6. **Разделители** - тонкая линия с градиентом

### ❌ Избегать

1. Слишком много градиентов на одной странице
2. Градиенты на мелком тексте (плохая читаемость)
3. Резкие переходы цветов
4. Градиенты на интерактивных элементах без hover состояний
5. Использование градиентов там, где достаточно одного цвета

---

## 📱 Адаптивность

### Desktop (1920px+)
- Крупные диагональные градиенты
- Сложные многослойные эффекты
- Анимированные градиенты при hover

### Tablet (768px - 1919px)
- Упрощенные градиенты
- Меньше слоев
- Базовые hover эффекты

### Mobile (< 768px)
- Простые вертикальные градиенты
- Минимум overlay эффектов
- Без сложных анимаций

---

## 🚀 Производительность

### Оптимизация градиентов

1. **Используйте CSS вместо изображений**
   ```css
   /* ✅ Хорошо */
   background: linear-gradient(135deg, #0033A0 0%, #E4002B 100%);
   
   /* ❌ Плохо */
   background-image: url('/gradient.png');
   ```

2. **Кэшируйте градиенты в CSS переменных**
   ```css
   :root {
     --gradient-hero: linear-gradient(135deg, #0033A0 0%, #E4002B 100%);
     --gradient-card: linear-gradient(180deg, #001f5c 0%, #0033A0 100%);
   }
   ```

3. **Используйте will-change для анимаций**
   ```css
   .animated-gradient {
     will-change: background;
     transition: background 0.3s ease;
   }
   ```

---

## 📊 Контрастность и доступность

Все градиенты проверены на соответствие WCAG 2.1 AA:

| Градиент | Текст | Контрастность | Статус |
|----------|-------|---------------|--------|
| Синий → Красный | Белый | 4.5:1+ | ✅ AA |
| Темно-синий → Синий | Белый | 7:1+ | ✅ AAA |
| Красный → Темно-красный | Белый | 4.5:1+ | ✅ AA |
| Синий с прозрачностью | Белый | 4.5:1+ | ✅ AA |

---

## 🎨 Инструменты для работы с градиентами

1. **CSS Gradient Generator**: https://cssgradient.io/
2. **Coolors Gradient**: https://coolors.co/gradient-maker
3. **WebGradients**: https://webgradients.com/
4. **Gradient Hunt**: https://gradienthunt.com/

---

**Дата создания:** 25 января 2026  
**Версия:** 2.0 (Enhanced with Gradients)  
**Вдохновлено:** ФК "Локомотив" дизайн-система
