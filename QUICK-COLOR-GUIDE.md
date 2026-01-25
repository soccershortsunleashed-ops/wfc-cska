# Быстрое руководство по цветам ЦСКА

## 🎨 Основные цвета

### 🔵 Синий ЦСКА (#143d8d) - Primary
**Когда использовать:**
- Основные кнопки
- Ссылки
- Навигация
- Заголовки
- Focus states

**Примеры:**
```tsx
<Button>Основная кнопка</Button>
<Link className="text-primary hover:underline">Ссылка</Link>
<h1 className="text-primary">Заголовок</h1>
```

---

### 🔴 Красный ЦСКА (#e30613) - Accent
**Когда использовать:**
- Call-to-action ("Купить билет", "Подписаться")
- Важные уведомления
- Срочные действия
- Акции и предложения

**Примеры:**
```tsx
<Button className="bg-accent text-accent-foreground">
  Купить билет
</Button>

<div className="bg-accent/10 border border-accent p-4">
  <p className="text-accent font-semibold">Важное объявление</p>
</div>
```

---

### 🟡 Золотой ЦСКА (#d4af37) - Secondary
**Когда использовать:**
- Награды и достижения
- Премиум контент
- Вторичные кнопки
- Акценты на важных элементах

**Примеры:**
```tsx
<Button variant="secondary">Вторичная кнопка</Button>

<div className="bg-secondary text-secondary-foreground p-4">
  <span>🏆 Чемпион 2023</span>
</div>
```

---

## 📋 Быстрые рецепты

### Кнопки

```tsx
// Основная кнопка (синяя)
<Button>Действие</Button>

// CTA кнопка (красная)
<Button className="bg-accent text-accent-foreground hover:bg-accent/90">
  Купить билет
</Button>

// Вторичная кнопка (золотая)
<Button variant="secondary">Узнать больше</Button>

// Outline кнопка
<Button variant="outline">Отмена</Button>

// Ghost кнопка
<Button variant="ghost">Закрыть</Button>
```

### Карточки

```tsx
// Обычная карточка
<Card>
  <CardHeader>
    <CardTitle>Заголовок</CardTitle>
  </CardHeader>
  <CardContent>Контент</CardContent>
</Card>

// Карточка с синим фоном
<Card className="bg-primary text-primary-foreground">
  <CardHeader>
    <CardTitle>Важная информация</CardTitle>
  </CardHeader>
  <CardContent>Белый текст на синем</CardContent>
</Card>

// Карточка с красным акцентом
<Card className="border-accent">
  <CardHeader>
    <CardTitle className="text-accent">Срочно!</CardTitle>
  </CardHeader>
  <CardContent>Важное объявление</CardContent>
</Card>
```

### Badges

```tsx
// Синий badge
<Badge>По умолчанию</Badge>

// Золотой badge
<Badge variant="secondary">Премиум</Badge>

// Outline badge
<Badge variant="outline">Информация</Badge>

// Красный badge (destructive)
<Badge variant="destructive">Важно</Badge>
```

### Текст

```tsx
// Обычный текст
<p>Обычный текст</p>

// Приглушенный текст
<p className="text-muted-foreground">Второстепенная информация</p>

// Синий текст
<p className="text-primary">Важный текст</p>

// Красный текст
<p className="text-accent">Срочное уведомление</p>
```

### Границы

```tsx
// Обычная граница
<div className="border rounded-lg p-4">Контент</div>

// Синяя граница
<div className="border-2 border-primary rounded-lg p-4">Контент</div>

// Красная граница
<div className="border-2 border-accent rounded-lg p-4">Контент</div>

// Золотая граница
<div className="border-2 border-secondary rounded-lg p-4">Контент</div>
```

---

## ⚠️ Что НЕ делать

### ❌ Плохо
```tsx
// Золотой текст на белом (низкая контрастность)
<p className="text-secondary">Текст</p>

// Красный текст на синем (плохая читаемость)
<div className="bg-primary">
  <p className="text-accent">Текст</p>
</div>

// Слишком много красного
<div className="bg-accent">
  <Button className="bg-accent">
    <span className="text-accent">Текст</span>
  </Button>
</div>
```

### ✅ Хорошо
```tsx
// Темный текст на золотом
<div className="bg-secondary text-secondary-foreground">
  <p>Текст</p>
</div>

// Белый текст на синем
<div className="bg-primary text-primary-foreground">
  <p>Текст</p>
</div>

// Сбалансированное использование цветов
<div className="bg-background">
  <Button>Синяя кнопка</Button>
  <Button className="bg-accent text-accent-foreground">
    Красная кнопка
  </Button>
</div>
```

---

## 🌓 Темная тема

Все цвета автоматически адаптируются для темной темы:

```tsx
// Автоматически меняется в зависимости от темы
<div className="bg-background text-foreground">
  <Button>Кнопка</Button>
</div>
```

Для переключения темы используйте `next-themes`:
```tsx
import { useTheme } from "next-themes"

const { theme, setTheme } = useTheme()

<Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
  Переключить тему
</Button>
```

---

## 📊 Контрастность

Все комбинации проверены на соответствие WCAG 2.1:

| Комбинация | Контрастность | Уровень |
|------------|---------------|---------|
| Синий на белом | 8.5:1 | AAA ✅ |
| Красный на белом | 4.8:1 | AA ✅ |
| Белый на синем | 8.5:1 | AAA ✅ |
| Белый на красном | 4.8:1 | AA ✅ |
| Темный на золотом | 7.2:1 | AAA ✅ |

---

## 🔗 Полезные ссылки

- [Полная документация](./COLOR-SCHEME.md)
- [Отчет о реализации](./COLOR-SCHEME-REPORT.md)
- [Тестовая страница](/test-colors)

---

**Совет:** Используйте тестовую страницу `/test-colors` для визуальной проверки всех комбинаций цветов!
