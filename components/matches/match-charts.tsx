"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { RustatTeamStatsResponse } from "@/lib/types/rustat.types"

interface MatchChartsProps {
  stats: RustatTeamStatsResponse
  team1Id: number
  team2Id: number
  team1Name: string
  team2Name: string
  team1Color?: string
  team2Color?: string
}

export function MatchCharts({
  stats,
  team1Id,
  team2Id,
  team1Name,
  team2Name,
  team1Color = "#CC0000",
  team2Color = "#0066CC",
}: MatchChartsProps) {
  const team1Stats = stats[team1Id.toString()] || []
  const team2Stats = stats[team2Id.toString()] || []

  // Получаем значение параметра
  const getStatValue = (teamStats: typeof team1Stats, paramId: number): number => {
    const stat = teamStats.find(s => s.p === paramId)
    return stat ? stat.v : 0
  }

  // Владение мячом (параметр 76)
  const team1Possession = getStatValue(team1Stats, 76)
  const team2Possession = getStatValue(team2Stats, 76)

  // Удары (параметр 519)
  const team1Shots = getStatValue(team1Stats, 519)
  const team2Shots = getStatValue(team2Stats, 519)

  // Удары в створ (параметр 520)
  const team1ShotsOnTarget = getStatValue(team1Stats, 520)
  const team2ShotsOnTarget = getStatValue(team2Stats, 520)

  // Передачи (параметр 268)
  const team1Passes = getStatValue(team1Stats, 268)
  const team2Passes = getStatValue(team2Stats, 268)

  // Точность передач (параметр 350)
  const team1PassAccuracy = getStatValue(team1Stats, 350)
  const team2PassAccuracy = getStatValue(team2Stats, 350)

  // Единоборства (параметр 164)
  const team1Duels = getStatValue(team1Stats, 164)
  const team2Duels = getStatValue(team2Stats, 164)

  // Успешность единоборств (параметр 201)
  const team1DuelsWon = getStatValue(team1Stats, 201)
  const team2DuelsWon = getStatValue(team2Stats, 201)

  return (
    <div className="space-y-6">
      {/* График владения мячом */}
      <Card>
        <CardHeader>
          <CardTitle>Владение мячом</CardTitle>
          <CardDescription>
            Процент времени владения мячом каждой командой
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Визуальный график */}
            <div className="flex items-center gap-2">
              <div
                className="h-12 rounded-l-lg flex items-center justify-center text-white font-bold transition-all"
                style={{
                  backgroundColor: team1Color,
                  width: `${team1Possession}%`,
                }}
              >
                {team1Possession > 15 && `${team1Possession}%`}
              </div>
              <div
                className="h-12 rounded-r-lg flex items-center justify-center text-white font-bold transition-all"
                style={{
                  backgroundColor: team2Color,
                  width: `${team2Possession}%`,
                }}
              >
                {team2Possession > 15 && `${team2Possession}%`}
              </div>
            </div>

            {/* Легенда */}
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: team1Color }}
                />
                <span className="font-medium">{team1Name}</span>
                <span className="text-muted-foreground">{team1Possession}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{team2Possession}%</span>
                <span className="font-medium">{team2Name}</span>
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: team2Color }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Диаграмма ударов */}
      <Card>
        <CardHeader>
          <CardTitle>Удары по воротам</CardTitle>
          <CardDescription>
            Общее количество ударов и ударов в створ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Команда 1 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{team1Name}</span>
                <span className="text-sm text-muted-foreground">
                  {team1ShotsOnTarget} / {team1Shots}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex gap-1">
                  {Array.from({ length: team1Shots }).map((_, i) => (
                    <div
                      key={i}
                      className="h-8 flex-1 rounded"
                      style={{
                        backgroundColor: i < team1ShotsOnTarget ? team1Color : `${team1Color}40`,
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>В створ: {team1ShotsOnTarget}</span>
                  <span>Мимо: {team1Shots - team1ShotsOnTarget}</span>
                </div>
              </div>
            </div>

            {/* Команда 2 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{team2Name}</span>
                <span className="text-sm text-muted-foreground">
                  {team2ShotsOnTarget} / {team2Shots}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex gap-1">
                  {Array.from({ length: team2Shots }).map((_, i) => (
                    <div
                      key={i}
                      className="h-8 flex-1 rounded"
                      style={{
                        backgroundColor: i < team2ShotsOnTarget ? team2Color : `${team2Color}40`,
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>В створ: {team2ShotsOnTarget}</span>
                  <span>Мимо: {team2Shots - team2ShotsOnTarget}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Дополнительная статистика */}
      <Card>
        <CardHeader>
          <CardTitle>Дополнительная статистика</CardTitle>
          <CardDescription>
            Передачи и единоборства
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Передачи */}
          <div className="space-y-3">
            <h4 className="font-medium">Передачи</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{team1Name}</span>
                  <span className="font-mono">
                    {team1Passes} ({team1PassAccuracy}%)
                  </span>
                </div>
                <Progress
                  value={team1PassAccuracy}
                  className="h-2"
                  style={{
                    // @ts-ignore
                    "--progress-background": team1Color,
                  }}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{team2Name}</span>
                  <span className="font-mono">
                    {team2Passes} ({team2PassAccuracy}%)
                  </span>
                </div>
                <Progress
                  value={team2PassAccuracy}
                  className="h-2"
                  style={{
                    // @ts-ignore
                    "--progress-background": team2Color,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Единоборства */}
          <div className="space-y-3">
            <h4 className="font-medium">Единоборства</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{team1Name}</span>
                  <span className="font-mono">
                    {team1Duels} ({team1DuelsWon}%)
                  </span>
                </div>
                <Progress
                  value={team1DuelsWon}
                  className="h-2"
                  style={{
                    // @ts-ignore
                    "--progress-background": team1Color,
                  }}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{team2Name}</span>
                  <span className="font-mono">
                    {team2Duels} ({team2DuelsWon}%)
                  </span>
                </div>
                <Progress
                  value={team2DuelsWon}
                  className="h-2"
                  style={{
                    // @ts-ignore
                    "--progress-background": team2Color,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
