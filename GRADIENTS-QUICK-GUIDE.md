# 🌈 Быстрое руководство по градиентам ЦСКА

> Вдохновлено дизайном ФК "Локомотив"

## 🎨 Доступные градиенты

### 1. Hero Gradient
```tsx
<div className="gradient-hero">
  {/* Синий → Красный (диагональ) */}
</div>
```

### 2. Subtle Gradient
```tsx
<header className="gradient-subtle">
  {/* Темно-синий → Синий (вертикаль) */}
</header>
```

### 3. Button Gradient
```tsx
<button className="gradient-button text-white px-6 py-3 rounded-lg">
  {/* Красный → Темно-красный */}
</button>
```

### 4. Accent Gradient
```tsx
<div className="h-1 gradient-accent">
  {/* Красный → Синий (горизонталь) */}
</div>
```

### 5. Gradient Text
```tsx
<h1 className="gradient-text text-6xl font-bold">
  ЖФК ЦСКА
</h1>
```

### 6. Animated Gradient
```tsx
<div className="gradient-animated">
  {/* Анимированный градиент */}
</div>
```

## 💡 Частые сценарии

### Hero секция
```tsx
<section className="gradient-hero min-h-screen flex items-center justify-center">
  <div className="text-white text-center">
    <h1 className="text-6xl font-bold">ЖФК ЦСКА</h1>
    <button className="gradient-button px-8 py-4 rounded-lg mt-6">
      Купить билет
    </button>
  </div>
</section>
```

### Header
```tsx
<header className="gradient-subtle">
  <nav className="container mx-auto px-4 py-4 text-white">
    {/* Навигация */}
  </nav>
</header>
```

### Карточка с overlay
```tsx
<div className="relative rounded-xl overflow-hidden">
  <img src="/news.jpg" className="w-full h-64 object-cover" />
  <div className="absolute inset-0 gradient-overlay" />
  <div className="absolute bottom-0 p-6 text-white">
    <h3 className="text-2xl font-bold">Заголовок</h3>
  </div>
</div>
```

### Статистика
```tsx
<div className="gradient-hero rounded-xl p-8 text-white">
  <div className="text-5xl font-bold">24</div>
  <div className="text-xl">Побед</div>
</div>
```

## 🎯 Tailwind классы

Также можно использовать напрямую:

```tsx
{/* Hero градиент */}
<div className="bg-gradient-to-br from-[#0033A0] to-[#E4002B]">

{/* Subtle градиент */}
<div className="bg-gradient-to-b from-[#001f5c] to-[#0033A0]">

{/* Button градиент */}
<button className="bg-gradient-to-r from-[#E4002B] to-[#b30022]">

{/* Текстовый градиент */}
<h1 className="bg-gradient-to-r from-[#0033A0] to-[#E4002B] bg-clip-text text-transparent">
```

## 📱 Демо

Посмотрите все градиенты в действии:
```
http://localhost:3000/test-gradients
```

## 📚 Полная документация

См. [COLOR-SCHEME-ENHANCED.md](./COLOR-SCHEME-ENHANCED.md)
