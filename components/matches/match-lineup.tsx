'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { RustatTactics, RustatPlayer } from '@/lib/types/rustat.types'
import { RUSTAT_POSITIONS } from '@/lib/types/rustat.types'

interface MatchLineupProps {
  tactics: RustatTactics
  players: RustatPlayer[]
  team1Name: string
  team2Name: string
  team1Color?: string
  team2Color?: string
}

/**
 * Компонент расстановки команд на поле
 * Показывает начальную и конечную расстановки
 */
export function MatchLineup({
  tactics,
  players,
  team1Name,
  team2Name,
  team1Color = '#0066CC',
  team2Color = '#CC0000',
}: MatchLineupProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Расстановка команд</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="start" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="start">Начало матча</TabsTrigger>
            <TabsTrigger value="end">Конец матча</TabsTrigger>
          </TabsList>

          <TabsContent value="start" className="mt-6">
            <LineupField
              tactics={tactics.start}
              players={players}
              team1Name={team1Name}
              team2Name={team2Name}
              team1Color={team1Color}
              team2Color={team2Color}
            />
          </TabsContent>

          <TabsContent value="end" className="mt-6">
            <LineupField
              tactics={tactics.end}
              players={players}
              team1Name={team1Name}
              team2Name={team2Name}
              team1Color={team1Color}
              team2Color={team2Color}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface LineupFieldProps {
  tactics: Array<{
    team_id: number
    shirt_color: string
    number_color: string
    lexic: number
    players: Array<{ id: number; position_id: number }>
  }>
  players: RustatPlayer[]
  team1Name: string
  team2Name: string
  team1Color: string
  team2Color: string
}

function LineupField({
  tactics,
  players,
  team1Name,
  team2Name,
  team1Color,
  team2Color,
}: LineupFieldProps) {
  if (!tactics || tactics.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Расстановка недоступна
      </div>
    )
  }

  const team1 = tactics[0]
  const team2 = tactics[1]

  return (
    <div className="space-y-6">
      {/* Легенда */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: team1Color }}
          />
          <span>{team1Name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: team2Color }}
          />
          <span>{team2Name}</span>
        </div>
      </div>

      {/* Поле */}
      <div className="relative w-full aspect-[2/3] bg-gradient-to-b from-green-600 to-green-700 rounded-lg overflow-hidden">
        {/* Разметка поля */}
        <FieldMarkings />

        {/* Команда 1 (внизу) */}
        <div className="absolute inset-0">
          {team1?.players.map((player) => {
            const playerData = players.find((p) => p.id === player.id)
            const position = RUSTAT_POSITIONS[player.position_id as keyof typeof RUSTAT_POSITIONS]
            
            if (!position || !playerData) return null

            return (
              <PlayerMarker
                key={player.id}
                player={playerData}
                position={position}
                color={team1Color}
                numberColor={`#${team1.number_color}`}
              />
            )
          })}
        </div>

        {/* Команда 2 (вверху, перевернуто) */}
        <div className="absolute inset-0">
          {team2?.players.map((player) => {
            const playerData = players.find((p) => p.id === player.id)
            const position = RUSTAT_POSITIONS[player.position_id as keyof typeof RUSTAT_POSITIONS]
            
            if (!position || !playerData) return null

            // Переворачиваем позицию для второй команды
            const flippedPosition = {
              ...position,
              x: 100 - position.x,
              y: 100 - position.y,
            }

            return (
              <PlayerMarker
                key={player.id}
                player={playerData}
                position={flippedPosition}
                color={team2Color}
                numberColor={`#${team2.number_color}`}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

function FieldMarkings() {
  return (
    <>
      {/* Центральная линия */}
      <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/30" />
      
      {/* Центральный круг */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-white/30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/30" />
      
      {/* Штрафные площади */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-1/6 border-2 border-t-white/30 border-l-white/30 border-r-white/30 border-b-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/6 border-2 border-b-white/30 border-l-white/30 border-r-white/30 border-t-0" />
      
      {/* Вратарские площади */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-[8%] border-2 border-t-white/30 border-l-white/30 border-r-white/30 border-b-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[8%] border-2 border-b-white/30 border-l-white/30 border-r-white/30 border-t-0" />
    </>
  )
}

interface PlayerMarkerProps {
  player: RustatPlayer
  position: { name: string; x: number; y: number }
  color: string
  numberColor: string
}

function PlayerMarker({ player, position, color, numberColor }: PlayerMarkerProps) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
    >
      {/* Маркер игрока */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg transition-transform group-hover:scale-110"
        style={{ backgroundColor: color }}
      >
        <span style={{ color: numberColor }}>{player.num}</span>
      </div>

      {/* Имя игрока (показывается при наведении) */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Badge variant="secondary" className="whitespace-nowrap text-xs">
          {player.name_rus}
        </Badge>
      </div>
    </div>
  )
}
