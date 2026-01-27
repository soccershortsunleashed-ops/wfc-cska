# Компоненты раздела "Матчи"

Набор компонентов для отображения информации о матчах, статистики и турнирных таблиц.

## Компоненты

### 1. MatchesList
Список матчей с поддержкой фильтрации и пагинации.

```tsx
import { MatchesList } from "@/components/matches/matches-list"

<MatchesList
  matches={matches}
  isLoading={false}
/>
```

### 2. MatchListItem
Карточка отдельного матча для списка.

```tsx
import { MatchListItem } from "@/components/matches/match-list-item"

<MatchListItem match={match} />
```

### 3. MatchFilters
Фильтры для списка матчей (турнир, сезон, статус, дома/в гостях, поиск по сопернику).

```tsx
import { MatchFilters } from "@/components/matches/match-filters"

<MatchFilters
  tournaments={tournaments}
  seasons={seasons}
  filters={filters}
  onFiltersChange={handleFiltersChange}
/>
```

### 4. MatchPagination
Пагинация для списка матчей.

```tsx
import { MatchPagination } from "@/components/matches/match-pagination"

<MatchPagination
  currentPage={1}
  totalPages={10}
  onPageChange={handlePageChange}
/>
```

### 5. MatchDetail
Детальная страница матча с полной информацией.

```tsx
import { MatchDetail } from "@/components/matches/match-detail"

<MatchDetail match={match} />
```

### 6. MatchTimeline
Хронология событий матча (голы, карточки, замены).

```tsx
import { MatchTimeline, MatchEvent } from "@/components/matches/match-timeline"

const events: MatchEvent[] = [
  {
    id: "1",
    minute: 12,
    type: "goal",
    team: "home",
    playerName: "Иванова А.",
    assistPlayerName: "Петрова М.",
    description: "Точный удар с правой ноги",
  },
  // ...
]

<MatchTimeline
  events={events}
  homeTeam="ЦСКА"
  awayTeam="Динамо"
/>
```

**Типы событий:**
- `goal` - гол
- `yellow_card` - жёлтая карточка
- `red_card` - красная карточка
- `substitution` - замена
- `penalty` - пенальти

### 7. MatchStats
Статистика матча с визуальным сравнением показателей команд.

```tsx
import { MatchStats, MatchStatistics } from "@/components/matches/match-stats"

const stats: MatchStatistics = {
  possession: { home: 58, away: 42 },
  shots: { home: 18, away: 12 },
  shotsOnTarget: { home: 8, away: 5 },
  corners: { home: 7, away: 4 },
  fouls: { home: 11, away: 15 },
  offsides: { home: 2, away: 3 },
  yellowCards: { home: 1, away: 3 },
  redCards: { home: 0, away: 1 },
  saves: { home: 4, away: 5 },
  passAccuracy: { home: 84, away: 78 },
}

<MatchStats
  stats={stats}
  homeTeam="ЦСКА"
  awayTeam="Динамо"
/>
```

### 8. TournamentTable
Турнирная таблица с подсветкой зон (чемпион, еврокубки, вылет).

```tsx
import { TournamentTable, TournamentTeam } from "@/components/matches/tournament-table"

const teams: TournamentTeam[] = [
  {
    position: 1,
    teamName: "ЦСКА",
    teamLogoUrl: "/seed-assets/cska-logo.png",
    played: 15,
    won: 12,
    drawn: 2,
    lost: 1,
    goalsFor: 38,
    goalsAgainst: 8,
    goalDifference: 30,
    points: 38,
    form: ["W", "W", "D", "W", "W"], // Последние 5 матчей
    isCSKA: true, // Подсветка команды ЦСКА
  },
  // ...
]

<TournamentTable
  teams={teams}
  tournamentName="Суперлига"
  season="2024/2025"
  highlightPositions={{
    champions: [1],
    championsLeague: [2, 3],
    europaLeague: [4, 5],
    relegation: [7, 8],
  }}
/>
```

**Форма команды (form):**
- `W` - победа (Win)
- `D` - ничья (Draw)
- `L` - поражение (Loss)

## Тестирование

Для тестирования компонентов создана страница `/test-match-components`:

```bash
npm run dev
# Откройте http://localhost:3000/test-match-components
```

## Стилизация

Все компоненты используют:
- Фирменные цвета ЦСКА: `#0033A0` (синий), `#E4002B` (красный)
- shadcn/ui компоненты для консистентности
- Адаптивный дизайн (desktop/tablet/mobile)
- Dark mode поддержка

## Интеграция с API

Компоненты работают с данными из API endpoints:
- `/api/matches` - список матчей
- `/api/matches/[id]` - детали матча
- `/api/matches/upcoming` - предстоящие матчи
- `/api/matches/past` - прошедшие матчи
- `/api/matches/tournaments` - список турниров
- `/api/matches/seasons` - список сезонов
- `/api/matches/stats` - статистика матчей

См. `lib/services/matches.service.ts` для деталей.
