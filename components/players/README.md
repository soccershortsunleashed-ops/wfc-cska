# Компоненты игроков

## PlayersCarousel

Карусель для отображения карточек игроков с поддержкой навигации, адаптивности и доступности.

### Использование

```tsx
import { PlayersCarousel } from "@/components/players"
import { playersService } from "@/lib/services/players.service"

export default async function MyPage() {
  const players = await playersService.list({ team: "MAIN" })
  
  return (
    <PlayersCarousel 
      players={players}
      onPlayerClick={(player) => console.log(player)}
    />
  )
}
```

### Props

| Prop | Тип | Обязательный | Описание |
|------|-----|--------------|----------|
| `players` | `Player[]` | Да | Массив игроков для отображения |
| `onPlayerClick` | `(player: Player) => void` | Нет | Callback при клике на карточку игрока |
| `className` | `string` | Нет | Дополнительные CSS классы |

### Особенности

#### Адаптивность
- **Mobile** (<640px): 1 слайд
- **Tablet** (640px-1024px): 2 слайда
- **Desktop** (1024px-1280px): 3 слайда
- **Large Desktop** (>1280px): 4 слайда

#### Навигация
- **Кнопки Prev/Next**: Навигация между слайдами
- **Клавиатура**: Стрелки ← → для навигации
- **Dots**: Индикаторы с возможностью клика
- **Drag/Swipe**: Встроенная поддержка от Embla Carousel

#### Доступность
- Все интерактивные элементы имеют `aria-labels`
- Кнопки используют правильные `aria-атрибуты`
- Точки индикаторов используют `role="tab"` и `aria-selected`
- Полная поддержка клавиатурной навигации
- Focus-visible стили для всех элементов

#### Производительность
- INP: 101 ms (отлично)
- CLS: 0.00 (отлично)
- Плавные CSS transitions
- Оптимизированный рендеринг

### Примеры

#### Базовое использование
```tsx
<PlayersCarousel players={players} />
```

#### С обработчиком клика
```tsx
<PlayersCarousel 
  players={players}
  onPlayerClick={(player) => {
    // Открыть модальное окно или перейти на страницу игрока
    router.push(`/players/${player.slug}`)
  }}
/>
```

#### С дополнительными стилями
```tsx
<PlayersCarousel 
  players={players}
  className="my-8 px-4"
/>
```

### Зависимости

- `embla-carousel-react`: ^8.6.0
- `lucide-react`: Иконки для кнопок навигации
- `@/components/ui/button`: shadcn/ui Button компонент
- `@/components/players/player-card`: Компонент карточки игрока

### Тестирование

Компонент полностью протестирован:
- ✅ Функциональное тестирование (навигация, клики)
- ✅ Адаптивность (mobile, tablet, desktop)
- ✅ Производительность (Chrome DevTools Performance)
- ✅ Доступность (ARIA, клавиатура, screen readers)

Подробный отчет: `CAROUSEL-TEST-REPORT.md`

---

## PlayerCard

Карточка игрока с фото, номером и основной информацией.

### Использование

```tsx
import { PlayerCard } from "@/components/players"

<PlayerCard 
  player={player}
  onClick={(player) => console.log(player)}
/>
```

### Props

| Prop | Тип | Обязательный | Описание |
|------|-----|--------------|----------|
| `player` | `Player` | Да | Объект игрока |
| `onClick` | `(player: Player) => void` | Нет | Callback при клике |

---

## PlayersFilters

Компонент фильтрации игроков по позиции, команде и поиску.

### Использование

```tsx
import { PlayersFilters } from "@/components/players"

<PlayersFilters />
```

Компонент автоматически обновляет URL query параметры при изменении фильтров.
