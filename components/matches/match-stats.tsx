"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface MatchStatistics {
  possession: { home: number; away: number }
  shots: { home: number; away: number }
  shotsOnTarget: { home: number; away: number }
  corners: { home: number; away: number }
  fouls: { home: number; away: number }
  offsides: { home: number; away: number }
  yellowCards: { home: number; away: number }
  redCards: { home: number; away: number }
  saves: { home: number; away: number }
  passAccuracy: { home: number; away: number }
}

interface MatchStatsProps {
  stats: MatchStatistics
  homeTeam: string
  awayTeam: string
}

interface StatRowProps {
  label: string
  homeValue: number
  awayValue: number
  isPercentage?: boolean
  homeTeam: string
  awayTeam: string
}

function StatRow({ label, homeValue, awayValue, isPercentage = false, homeTeam, awayTeam }: StatRowProps) {
  const total = homeValue + awayValue
  const homePercentage = total > 0 ? (homeValue / total) * 100 : 50
  const awayPercentage = total > 0 ? (awayValue / total) * 100 : 50

  const formatValue = (value: number) => {
    return isPercentage ? `${value}%` : value.toString()
  }

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="text-center text-sm font-medium text-muted-foreground">
        {label}
      </div>

      {/* Values */}
      <div className="flex items-center justify-between text-sm font-semibold">
        <span className="text-[var(--cska-blue)]">{formatValue(homeValue)}</span>
        <span className="text-muted-foreground">{formatValue(awayValue)}</span>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-1">
        {/* Home Progress */}
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--cska-blue)] transition-all duration-500"
            style={{ width: `${homePercentage}%` }}
          />
        </div>

        {/* Away Progress */}
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-400 transition-all duration-500 ml-auto"
            style={{ width: `${awayPercentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export function MatchStats({ stats, homeTeam, awayTeam }: MatchStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[var(--cska-blue)]" />
          Статистика матча
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Team Names */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div className="font-semibold text-[var(--cska-blue)]">{homeTeam}</div>
          <div className="font-semibold text-muted-foreground">{awayTeam}</div>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          <StatRow
            label="Владение мячом"
            homeValue={stats.possession.home}
            awayValue={stats.possession.away}
            isPercentage
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />

          <StatRow
            label="Удары"
            homeValue={stats.shots.home}
            awayValue={stats.shots.away}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />

          <StatRow
            label="Удары в створ"
            homeValue={stats.shotsOnTarget.home}
            awayValue={stats.shotsOnTarget.away}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />

          <StatRow
            label="Угловые"
            homeValue={stats.corners.home}
            awayValue={stats.corners.away}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />

          <StatRow
            label="Фолы"
            homeValue={stats.fouls.home}
            awayValue={stats.fouls.away}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />

          <StatRow
            label="Офсайды"
            homeValue={stats.offsides.home}
            awayValue={stats.offsides.away}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />

          <StatRow
            label="Жёлтые карточки"
            homeValue={stats.yellowCards.home}
            awayValue={stats.yellowCards.away}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />

          {(stats.redCards.home > 0 || stats.redCards.away > 0) && (
            <StatRow
              label="Красные карточки"
              homeValue={stats.redCards.home}
              awayValue={stats.redCards.away}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
            />
          )}

          <StatRow
            label="Сейвы вратаря"
            homeValue={stats.saves.home}
            awayValue={stats.saves.away}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />

          <StatRow
            label="Точность передач"
            homeValue={stats.passAccuracy.home}
            awayValue={stats.passAccuracy.away}
            isPercentage
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />
        </div>
      </CardContent>
    </Card>
  )
}
