'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { RustatTeamStatsResponse } from '@/lib/types/rustat.types'

interface TeamStatsComparisonProps {
  stats: RustatTeamStatsResponse
  team1Id: number
  team2Id: number
  team1Name: string
  team2Name: string
}

/**
 * Компонент сравнения статистики команд
 * Показывает визуальное сравнение различных показателей
 */
export function TeamStatsComparison({
  stats,
  team1Id,
  team2Id,
  team1Name,
  team2Name,
}: TeamStatsComparisonProps) {
  if (!stats || Object.keys(stats).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Статистика команд</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Статистика недоступна
          </div>
        </CardContent>
      </Card>
    )
  }

  const team1Stats = stats[team1Id.toString()] || []
  const team2Stats = stats[team2Id.toString()] || []

  if (team1Stats.length === 0 && team2Stats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Статистика команд</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Статистика недоступна
          </div>
        </CardContent>
      </Card>
    )
  }

  // Создаем мапу параметров для быстрого доступа
  const team1Map = new Map(team1Stats.map(s => [s.p, s.v]))
  const team2Map = new Map(team2Stats.map(s => [s.p, s.v]))

  // Получаем все уникальные параметры
  const allParams = new Set([...team1Stats.map(s => s.p), ...team2Stats.map(s => s.p)])

  // Фильтруем только те параметры, которые мы хотим показать
  const displayParams = DISPLAY_PARAMS.filter(p => allParams.has(p.id))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Статистика команд</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Заголовки команд */}
        <div className="grid grid-cols-3 gap-4 text-sm font-medium">
          <div className="text-right">{team1Name}</div>
          <div className="text-center text-muted-foreground">Показатель</div>
          <div className="text-left">{team2Name}</div>
        </div>

        {/* Статистика */}
        <div className="space-y-4">
          {displayParams.map((param) => {
            const value1 = team1Map.get(param.id) ?? 0
            const value2 = team2Map.get(param.id) ?? 0

            // Пропускаем если нет данных
            if (value1 === 0 && value2 === 0) return null

            return (
              <StatRow
                key={param.id}
                label={param.label}
                value1={value1}
                value2={value2}
                dataType={param.dataType}
                reverse={param.reverse}
              />
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

interface StatRowProps {
  label: string
  value1: number
  value2: number
  dataType: 'num' | 'pct' | 'time'
  reverse?: boolean
}

function StatRow({ label, value1, value2, dataType, reverse = false }: StatRowProps) {
  const total = value1 + value2
  const percentage1 = total > 0 ? (value1 / total) * 100 : 50
  const percentage2 = total > 0 ? (value2 / total) * 100 : 50

  // Определяем какая команда лучше
  const team1Better = reverse ? value1 < value2 : value1 > value2
  const team2Better = reverse ? value2 < value1 : value2 > value1

  return (
    <div className="space-y-2">
      {/* Значения и название */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className={`text-right font-medium ${team1Better ? 'text-primary' : ''}`}>
          {formatValue(value1, dataType)}
        </div>
        <div className="text-center text-muted-foreground text-xs">
          {label}
        </div>
        <div className={`text-left font-medium ${team2Better ? 'text-primary' : ''}`}>
          {formatValue(value2, dataType)}
        </div>
      </div>

      {/* Визуальное сравнение */}
      <div className="flex items-center gap-2">
        {/* Команда 1 (справа налево) */}
        <div className="flex-1 flex justify-end">
          <div className="w-full max-w-full">
            <Progress
              value={percentage1}
              className="h-2 rotate-180"
              indicatorClassName={team1Better ? 'bg-primary' : 'bg-muted-foreground/50'}
            />
          </div>
        </div>

        {/* Команда 2 (слева направо) */}
        <div className="flex-1">
          <div className="w-full max-w-full">
            <Progress
              value={percentage2}
              className="h-2"
              indicatorClassName={team2Better ? 'bg-primary' : 'bg-muted-foreground/50'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function formatValue(value: number, dataType: 'num' | 'pct' | 'time'): string {
  switch (dataType) {
    case 'pct':
      return `${value}%`
    case 'time':
      // Время в секундах -> минуты:секунды
      const minutes = Math.floor(value / 60)
      const seconds = value % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    case 'num':
    default:
      return value.toString()
  }
}

// Маппинг ID статистики на русские названия и типы данных
const DISPLAY_PARAMS = [
  { id: 1, label: 'Index (рейтинг)', dataType: 'num' as const, reverse: false },
  { id: 120, label: 'Голы', dataType: 'num' as const, reverse: false },
  { id: 113, label: 'Голевые моменты', dataType: 'num' as const, reverse: false },
  { id: 76, label: 'Владение мячом', dataType: 'pct' as const, reverse: false },
  { id: 519, label: 'Удары', dataType: 'num' as const, reverse: false },
  { id: 520, label: 'Удары в створ', dataType: 'num' as const, reverse: false },
  { id: 268, label: 'Передачи', dataType: 'num' as const, reverse: false },
  { id: 350, label: 'Точность передач', dataType: 'pct' as const, reverse: false },
  { id: 518, label: 'Угловые', dataType: 'num' as const, reverse: false },
  { id: 164, label: 'Единоборства', dataType: 'num' as const, reverse: false },
  { id: 201, label: 'Единоборства удачные', dataType: 'pct' as const, reverse: false },
  { id: 545, label: 'Фолы', dataType: 'num' as const, reverse: true },
  { id: 202, label: 'Желтые карточки', dataType: 'num' as const, reverse: true },
]
