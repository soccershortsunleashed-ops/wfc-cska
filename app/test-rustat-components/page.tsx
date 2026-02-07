'use client'

import { useEffect, useState } from 'react'
import { MatchLineup } from '@/components/matches/match-lineup'
import { TeamStatsComparison } from '@/components/matches/team-stats-comparison'
import { PlayersStatsTable } from '@/components/matches/players-stats-table'
import { MatchInfoCard } from '@/components/matches/match-info-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { RustatCachedData } from '@/lib/types/rustat.types'

export default function TestRustatComponentsPage() {
  const [data, setData] = useState<RustatCachedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Загружаем данные тестового матча (Зенит 0:1 ЦСКА)
    fetch('/api/matches/cmkxikrbm000004ucym8g8myi/rustat')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then((result) => {
        setData(result.data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Загрузка данных матча...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-500">
          Ошибка загрузки: {error || 'Нет данных'}
        </div>
      </div>
    )
  }

  const team1Name = data.info.team1.name_rus
  const team2Name = data.info.team2.name_rus
  const team1Id = data.info.team1.id
  const team2Id = data.info.team2.id

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Тест компонентов RuStat API
        </h1>
        <p className="text-muted-foreground">
          {team1Name} {data.info.team1.score}:{data.info.team2.score} {team2Name} • {data.info.date}
        </p>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="info">Информация</TabsTrigger>
          <TabsTrigger value="lineup">Расстановка</TabsTrigger>
          <TabsTrigger value="team-stats">Статистика команд</TabsTrigger>
          <TabsTrigger value="player-stats">Статистика игроков</TabsTrigger>
          <TabsTrigger value="all">Все вместе</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <MatchInfoCard info={data.info} />
        </TabsContent>

        <TabsContent value="lineup" className="mt-6">
          <MatchLineup
            tactics={data.tactics}
            players={data.players}
            team1Name={team1Name}
            team2Name={team2Name}
            team1Color="#0066CC"
            team2Color="#CC0000"
          />
        </TabsContent>

        <TabsContent value="team-stats" className="mt-6">
          {data.teamStats ? (
            <TeamStatsComparison
              stats={data.teamStats}
              team1Id={team1Id}
              team2Id={team2Id}
              team1Name={team1Name}
              team2Name={team2Name}
            />
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Статистика команд недоступна
            </div>
          )}
        </TabsContent>

        <TabsContent value="player-stats" className="mt-6">
          {data.playerStats ? (
            <PlayersStatsTable
              playerStats={data.playerStats}
              players={data.players}
              team1Id={team1Id}
              team2Id={team2Id}
              team1Name={team1Name}
              team2Name={team2Name}
            />
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Статистика игроков недоступна
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6 space-y-6">
          <MatchInfoCard info={data.info} />
          
          <MatchLineup
            tactics={data.tactics}
            players={data.players}
            team1Name={team1Name}
            team2Name={team2Name}
            team1Color="#0066CC"
            team2Color="#CC0000"
          />

          {data.teamStats && (
            <TeamStatsComparison
              stats={data.teamStats}
              team1Id={team1Id}
              team2Id={team2Id}
              team1Name={team1Name}
              team2Name={team2Name}
            />
          )}

          {data.playerStats && (
            <PlayersStatsTable
              playerStats={data.playerStats}
              players={data.players}
              team1Id={team1Id}
              team2Id={team2Id}
              team1Name={team1Name}
              team2Name={team2Name}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
