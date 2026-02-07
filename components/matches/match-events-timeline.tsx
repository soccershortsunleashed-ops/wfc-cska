"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Goal, ArrowRightLeft, AlertCircle, Clock, Info } from "lucide-react"
import type { RustatPlayer, RustatPlayerStatsResponse, RustatTactics } from "@/lib/types/rustat.types"

interface MatchEvent {
  minute: number | string
  type: "goal" | "substitution" | "yellow_card" | "red_card"
  teamId: number
  playerId: number
  playerName: string
  playerOutId?: number
  playerOutName?: string
  assistPlayerId?: number
  assistPlayerName?: string
  description?: string
}

interface MatchEventsTimelineProps {
  playerStats: RustatPlayerStatsResponse
  players: RustatPlayer[]
  tactics: RustatTactics
  team1Id: number
  team2Id: number
  team1Name: string
  team2Name: string
  team1Color?: string
  team2Color?: string
}

export function MatchEventsTimeline({
  playerStats,
  players,
  tactics,
  team1Id,
  team2Id,
  team1Name,
  team2Name,
  team1Color = "#CC0000",
  team2Color = "#0066CC",
}: MatchEventsTimelineProps) {
  // Создаем мапу игроков для быстрого доступа
  const playersMap = new Map(players.map(p => [p.id, p]))
  const events: MatchEvent[] = []

  // 1. Извлекаем голы из статистики игроков
  playerStats.forEach(playerStat => {
    const player = playersMap.get(playerStat.player_id)
    if (!player) return

    // Ищем голы (параметр 196)
    const goalsParam = playerStat.stats.find(s => s.p === 196)
    if (goalsParam && goalsParam.v > 0) {
      // Ищем ассисты (параметр 393)
      const assistParam = playerStat.stats.find(s => s.p === 393)
      let assistPlayer: RustatPlayer | undefined

      if (assistParam && assistParam.v > 0) {
        // Ищем игрока с ассистом
        const assistPlayerStat = playerStats.find(ps => {
          const assist = ps.stats.find(s => s.p === 393)
          return assist && assist.v > 0 && ps.player_id !== player.id
        })
        if (assistPlayerStat) {
          assistPlayer = playersMap.get(assistPlayerStat.player_id)
        }
      }

      events.push({
        minute: "?",
        type: "goal",
        teamId: player.team_id,
        playerId: player.id,
        playerName: player.name_rus,
        assistPlayerId: assistPlayer?.id,
        assistPlayerName: assistPlayer?.name_rus,
        description: `Гол`,
      })
    }

    // Ищем желтые карточки (параметр 202 в team stats, но не в player stats)
    // К сожалению, в player stats нет информации о карточках
  })

  // 2. Извлекаем замены из tactics (разница между start и end)
  for (const teamTactics of tactics.start) {
    const teamId = teamTactics.team_id
    const startPlayers = new Set(teamTactics.players.map(p => p.id))

    // Находим конечную расстановку этой команды
    const endTactics = tactics.end.find(t => t.team_id === teamId)
    if (!endTactics) continue

    const endPlayers = new Set(endTactics.players.map(p => p.id))

    // Находим замены
    const playersOut = [...startPlayers].filter(id => !endPlayers.has(id))
    const playersIn = [...endPlayers].filter(id => !startPlayers.has(id))

    // Создаем события замен
    for (let i = 0; i < Math.max(playersOut.length, playersIn.length); i++) {
      const outId = playersOut[i]
      const inId = playersIn[i]

      const outPlayer = playersMap.get(outId)
      const inPlayer = playersMap.get(inId)

      if (outPlayer && inPlayer) {
        events.push({
          minute: "?",
          type: "substitution",
          teamId,
          playerId: inId,
          playerName: inPlayer.name_rus,
          playerOutId: outId,
          playerOutName: outPlayer.name_rus,
          description: `Замена`,
        })
      }
    }
  }

  // Сортируем события: сначала голы, потом замены
  events.sort((a, b) => {
    if (a.type === "goal" && b.type !== "goal") return -1
    if (a.type !== "goal" && b.type === "goal") return 1
    return 0
  })

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Clock className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">События недоступны</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Детальная хронология событий матча пока не загружена
          </p>
        </CardContent>
      </Card>
    )
  }

  const getEventIcon = (type: MatchEvent["type"]) => {
    switch (type) {
      case "goal":
        return <Goal className="w-5 h-5" />
      case "substitution":
        return <ArrowRightLeft className="w-5 h-5" />
      case "yellow_card":
      case "red_card":
        return <AlertCircle className="w-5 h-5" />
      default:
        return null
    }
  }

  const getEventColor = (teamId: number) => {
    return teamId === team1Id ? team1Color : team2Color
  }

  const getTeamName = (teamId: number) => {
    return teamId === team1Id ? team1Name : team2Name
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Хронология матча</CardTitle>
        <CardDescription>
          Ключевые события матча
        </CardDescription>
        <div className="flex items-start gap-2 mt-2 p-3 bg-muted/50 rounded-lg">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Точные минуты событий недоступны через API RuStat. Показаны только типы событий (голы, замены).
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Вертикальная линия */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

          {/* События */}
          <div className="space-y-6">
            {events.map((event, index) => (
              <div key={index} className="relative flex items-start gap-4 pl-0">
                {/* Минута */}
                <div className="flex-shrink-0 w-12 text-right">
                  <Badge variant="outline" className="font-mono text-xs">
                    {event.minute}
                  </Badge>
                </div>

                {/* Иконка */}
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10 border-2 border-background"
                  style={{ backgroundColor: getEventColor(event.teamId) }}
                >
                  <div className="text-white">
                    {getEventIcon(event.type)}
                  </div>
                </div>

                {/* Описание */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold">{event.playerName}</span>
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: `${getEventColor(event.teamId)}20`,
                        color: getEventColor(event.teamId),
                        borderColor: getEventColor(event.teamId),
                      }}
                    >
                      {getTeamName(event.teamId)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                  {event.assistPlayerName && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Ассист: {event.assistPlayerName}
                    </p>
                  )}
                  {event.playerOutName && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Вышла: {event.playerOutName}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
