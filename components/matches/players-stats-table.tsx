'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { RustatPlayerStatsResponse, RustatPlayer } from '@/lib/types/rustat.types'

interface PlayersStatsTableProps {
  playerStats: RustatPlayerStatsResponse
  players: RustatPlayer[]
  team1Id: number
  team2Id: number
  team1Name: string
  team2Name: string
}

// Маппинг lexic ID на названия параметров
const PARAM_LABELS: Record<number, string> = {
  1: 'Рейтинг',
  288: 'Минуты',
  196: 'Голы',
  393: 'Голевые передачи',
  641: 'Удары',
  336: 'Передачи',
  488: 'Точность передач %',
  434: 'Ключевые передачи',
  225: 'Единоборства',
  262: 'Единоборства удачные %',
  719: 'Позиция',
}

// Маппинг позиций
const POSITION_LABELS: Record<number, string> = {
  601: 'З Л',
  602: 'П Л',
  603: 'З П',
  604: 'П П',
  607: 'ГК',
  608: 'З ЛЦ',
  609: 'З ПЦ',
  618: 'ЗП ЛЦ',
  621: 'ЗП ПЦ',
  625: 'Ф ЛЦ',
  626: 'Ф ПЦ',
}

/**
 * Компонент таблицы статистики игроков
 * Показывает детальную статистику каждого игрока с возможностью фильтрации по командам
 */
export function PlayersStatsTable({
  playerStats,
  players,
  team1Id,
  team2Id,
  team1Name,
  team2Name,
}: PlayersStatsTableProps) {
  const [sortBy, setSortBy] = useState<number>(1) // По умолчанию сортируем по рейтингу
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  if (!playerStats || playerStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Статистика игроков</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Статистика игроков недоступна
          </div>
        </CardContent>
      </Card>
    )
  }

  // Создаем мапу игроков для быстрого доступа
  const playersMap = new Map(players.map(p => [p.id, p]))

  // Обогащаем данные игроков информацией о команде
  const enrichedStats = playerStats.map(ps => {
    const player = playersMap.get(ps.player_id)
    const statsMap = new Map(ps.stats.map(s => [s.p, s.v]))
    
    return {
      playerId: ps.player_id,
      teamId: player?.team_id || 0,
      playerName: player?.name_rus || 'Неизвестный игрок',
      playerNum: player?.num || 0,
      stats: statsMap,
    }
  })

  const team1Players = enrichedStats.filter(p => p.teamId === team1Id)
  const team2Players = enrichedStats.filter(p => p.teamId === team2Id)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Статистика игроков</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Все игроки</TabsTrigger>
            <TabsTrigger value="team1">{team1Name}</TabsTrigger>
            <TabsTrigger value="team2">{team2Name}</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <StatsTable
              players={enrichedStats}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={(key) => {
                if (sortBy === key) {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                } else {
                  setSortBy(key)
                  setSortOrder('desc')
                }
              }}
            />
          </TabsContent>

          <TabsContent value="team1" className="mt-4">
            <StatsTable
              players={team1Players}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={(key) => {
                if (sortBy === key) {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                } else {
                  setSortBy(key)
                  setSortOrder('desc')
                }
              }}
            />
          </TabsContent>

          <TabsContent value="team2" className="mt-4">
            <StatsTable
              players={team2Players}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={(key) => {
                if (sortBy === key) {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                } else {
                  setSortBy(key)
                  setSortOrder('desc')
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface StatsTableProps {
  players: Array<{
    playerId: number
    teamId: number
    playerName: string
    playerNum: number
    stats: Map<number, number>
  }>
  sortBy: number
  sortOrder: 'asc' | 'desc'
  onSort: (key: number) => void
}

function StatsTable({
  players,
  sortBy,
  sortOrder,
  onSort,
}: StatsTableProps) {
  // Сортировка
  const sortedPlayers = [...players].sort((a, b) => {
    const aValue = a.stats.get(sortBy) ?? 0
    const bValue = b.stats.get(sortBy) ?? 0

    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
  })

  // Основные параметры для отображения
  const displayParams = [1, 288, 196, 393, 641, 336, 488] // Рейтинг, Минуты, Голы, Передачи, Удары, Передачи, Точность

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">№</TableHead>
            <TableHead>Игрок</TableHead>
            <TableHead className="text-center">Поз.</TableHead>
            {displayParams.map((paramId) => (
              <TableHead
                key={paramId}
                className="text-center cursor-pointer hover:bg-muted/50"
                onClick={() => onSort(paramId)}
              >
                {PARAM_LABELS[paramId] || `P${paramId}`}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPlayers.map((player) => {
            const positionId = player.stats.get(719)
            const position = positionId ? POSITION_LABELS[positionId] || `P${positionId}` : '-'
            const rating = player.stats.get(1)

            return (
              <TableRow key={player.playerId}>
                <TableCell className="font-medium">{player.playerNum}</TableCell>
                <TableCell>{player.playerName}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="text-xs">
                    {position}
                  </Badge>
                </TableCell>
                {displayParams.map((paramId) => {
                  const value = player.stats.get(paramId)
                  
                  // Специальная обработка для рейтинга
                  if (paramId === 1 && value !== undefined) {
                    return (
                      <TableCell key={paramId} className="text-center">
                        <Badge
                          variant={value >= 170 ? 'default' : 'secondary'}
                        >
                          {value.toFixed(0)}
                        </Badge>
                      </TableCell>
                    )
                  }

                  // Специальная обработка для минут
                  if (paramId === 288 && value !== undefined) {
                    return (
                      <TableCell key={paramId} className="text-center">
                        {value}'
                      </TableCell>
                    )
                  }

                  // Специальная обработка для процентов
                  if (paramId === 488 && value !== undefined) {
                    return (
                      <TableCell key={paramId} className="text-center">
                        {value}%
                      </TableCell>
                    )
                  }

                  return (
                    <TableCell key={paramId} className="text-center">
                      {value !== undefined ? value : '-'}
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
