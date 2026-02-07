import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { matchesService } from "@/lib/services/matches.service"
import { MatchStatus } from "@prisma/client"
import { MatchDetail } from "@/components/matches/match-detail"
import { MatchTimeline, MatchEvent } from "@/components/matches/match-timeline"
import { MatchStats, MatchStatistics } from "@/components/matches/match-stats"
import { TournamentTable, TournamentTeam } from "@/components/matches/tournament-table"
import { MatchInfoCard } from "@/components/matches/match-info-card"
import { MatchLineup } from "@/components/matches/match-lineup"
import { TeamStatsComparison } from "@/components/matches/team-stats-comparison"
import { PlayersStatsTable } from "@/components/matches/players-stats-table"
import { MatchEventsTimeline } from "@/components/matches/match-events-timeline"
import { MatchCharts } from "@/components/matches/match-charts"
import { EmptyState } from "@/components/matches/empty-state"
import { MatchInfoSkeleton, LineupSkeleton, StatsSkeleton, TableSkeleton } from "@/components/matches/match-skeletons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Info, BarChart3, Clock } from "lucide-react"
import type { RustatCachedData } from "@/lib/types/rustat.types"

interface MatchPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
  const { slug } = await params
  const match = await matchesService.getBySlug(slug)

  if (!match) {
    return {
      title: "Матч не найден | ЖФК ЦСКА",
    }
  }

  const matchDate = new Date(match.matchDate).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const opponentName = match.awayTeam?.name || match.homeTeam?.name || match.opponentName || 'Соперник'
  const title = `ЦСКА - ${opponentName} | ${matchDate}`
  const description = match.description || `Матч ЦСКА против ${opponentName}. ${match.tournament || ""} ${match.season || ""}`

  return {
    title: `${title} | ЖФК ЦСКА`,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: match.opponentLogoUrl ? [match.opponentLogoUrl] : [],
    },
  }
}

// Функция для получения данных RuStat
async function getRustatData(matchId: string): Promise<RustatCachedData | null> {
  try {
    // Проверяем, есть ли у матча rustatId и синхронизированные данные
    const match = await matchesService.getById(matchId)
    
    if (!match || !match.rustatId || !match.rustatSynced || !match.rustatData) {
      return null
    }

    // Парсим данные из БД
    const data = JSON.parse(match.rustatData) as RustatCachedData
    return data
  } catch (error) {
    console.error('[RuStat] Error loading data:', error)
    return null
  }
}

// Функция для получения событий матча (пока заглушка, в будущем из БД)
async function getMatchEvents(matchId: string): Promise<MatchEvent[]> {
  // TODO: Реализовать получение событий из БД
  // Пока возвращаем пустой массив
  return []
}

// Функция для получения статистики матча (пока заглушка, в будущем из БД)
async function getMatchStatistics(matchId: string): Promise<MatchStatistics | null> {
  // TODO: Реализовать получение статистики из БД
  // Пока возвращаем null
  return null
}

// Функция для получения турнирной таблицы (пока заглушка, в будущем из БД)
async function getTournamentTable(tournament: string, season: string): Promise<TournamentTeam[]> {
  // TODO: Реализовать получение турнирной таблицы из БД
  // Пока возвращаем пустой массив
  return []
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { slug } = await params
  const match = await matchesService.getBySlug(slug)

  if (!match) {
    notFound()
  }

  // Определяем название команды-соперника
  const opponentName = match.awayTeam?.name || match.homeTeam?.name || match.opponentName || 'Соперник'

  // Получаем дополнительные данные
  const [events, statistics, tournamentTable, rustatData] = await Promise.all([
    getMatchEvents(match.id),
    getMatchStatistics(match.id),
    match.tournament && match.season
      ? getTournamentTable(match.tournament, match.season)
      : Promise.resolve([]),
    getRustatData(match.id),
  ])

  const hasEvents = events.length > 0
  const hasStatistics = statistics !== null
  const hasTournamentTable = tournamentTable.length > 0
  const hasRustatData = rustatData !== null

  // Определяем ID команд для RuStat компонентов
  const cskaTeamId = rustatData?.info.team1.id === 13503 ? rustatData.info.team1.id : rustatData?.info.team2.id || 13503
  const opponentTeamId = rustatData?.info.team1.id === 13503 ? rustatData.info.team2.id : rustatData?.info.team1.id || 0
  const cskaTeamName = rustatData?.info.team1.id === 13503 ? rustatData.info.team1.name_rus : rustatData?.info.team2.name_rus || "ЦСКА"
  const opponentTeamNameRustat = rustatData?.info.team1.id === 13503 ? rustatData.info.team2.name_rus : rustatData?.info.team1.name_rus || opponentName

  // Проверяем, завершен ли матч
  const isMatchFinished = match.status === MatchStatus.FINISHED || match.scoreHome !== null

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 space-y-6">
      {/* Основная информация о матче */}
      <MatchDetail match={match} />

      {/* Дополнительная информация в табах */}
      {(hasEvents || hasStatistics || hasTournamentTable || hasRustatData) && (
        <Tabs defaultValue={hasRustatData ? "rustat-info" : hasEvents ? "timeline" : hasStatistics ? "stats" : "table"} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-auto gap-2">
            {hasRustatData && (
              <>
                <TabsTrigger value="rustat-info" className="text-xs md:text-sm">
                  <Info className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Информация</span>
                  <span className="sm:hidden">Инфо</span>
                </TabsTrigger>
                <TabsTrigger value="rustat-lineup" className="text-xs md:text-sm">
                  Расстановка
                </TabsTrigger>
                <TabsTrigger value="rustat-team-stats" className="text-xs md:text-sm">
                  <span className="hidden md:inline">Статистика команд</span>
                  <span className="md:hidden">Команды</span>
                </TabsTrigger>
                <TabsTrigger value="rustat-player-stats" className="text-xs md:text-sm">
                  <span className="hidden md:inline">Статистика игроков</span>
                  <span className="md:hidden">Игроки</span>
                </TabsTrigger>
                <TabsTrigger value="rustat-events" className="text-xs md:text-sm">
                  <Clock className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">События</span>
                  <span className="sm:hidden">События</span>
                </TabsTrigger>
                <TabsTrigger value="rustat-charts" className="text-xs md:text-sm">
                  <BarChart3 className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Графики</span>
                  <span className="sm:hidden">Графики</span>
                </TabsTrigger>
              </>
            )}
            {hasEvents && <TabsTrigger value="timeline">Хронология</TabsTrigger>}
            {hasStatistics && <TabsTrigger value="stats">Статистика</TabsTrigger>}
            {hasTournamentTable && <TabsTrigger value="table">Турнирная таблица</TabsTrigger>}
          </TabsList>

          {hasRustatData && rustatData && (
            <>
              <TabsContent value="rustat-info" className="mt-6">
                <Suspense fallback={<MatchInfoSkeleton />}>
                  <MatchInfoCard info={rustatData.info} />
                </Suspense>
              </TabsContent>

              <TabsContent value="rustat-lineup" className="mt-6">
                <Suspense fallback={<LineupSkeleton />}>
                  <MatchLineup
                    tactics={rustatData.tactics}
                    players={rustatData.players}
                    team1Name={cskaTeamName}
                    team2Name={opponentTeamNameRustat}
                    team1Color={cskaTeamId === rustatData.info.team1.id ? "#CC0000" : "#0066CC"}
                    team2Color={cskaTeamId === rustatData.info.team1.id ? "#0066CC" : "#CC0000"}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="rustat-team-stats" className="mt-6">
                {rustatData.teamStats ? (
                  <Suspense fallback={<StatsSkeleton />}>
                    <TeamStatsComparison
                      stats={rustatData.teamStats}
                      team1Id={cskaTeamId}
                      team2Id={opponentTeamId}
                      team1Name={cskaTeamName}
                      team2Name={opponentTeamNameRustat}
                    />
                  </Suspense>
                ) : (
                  <EmptyState
                    icon={AlertCircle}
                    title="Статистика недоступна"
                    description="Статистика команд для этого матча пока не загружена"
                  />
                )}
              </TabsContent>

              <TabsContent value="rustat-player-stats" className="mt-6">
                {rustatData.playerStats ? (
                  <Suspense fallback={<TableSkeleton />}>
                    <PlayersStatsTable
                      playerStats={rustatData.playerStats}
                      players={rustatData.players}
                      team1Id={cskaTeamId}
                      team2Id={opponentTeamId}
                      team1Name={cskaTeamName}
                      team2Name={opponentTeamNameRustat}
                    />
                  </Suspense>
                ) : (
                  <EmptyState
                    icon={AlertCircle}
                    title="Статистика недоступна"
                    description="Статистика игроков для этого матча пока не загружена"
                  />
                )}
              </TabsContent>

              <TabsContent value="rustat-events" className="mt-6">
                {rustatData.playerStats ? (
                  <Suspense fallback={<StatsSkeleton />}>
                    <MatchEventsTimeline
                      playerStats={rustatData.playerStats}
                      players={rustatData.players}
                      tactics={rustatData.tactics}
                      team1Id={cskaTeamId}
                      team2Id={opponentTeamId}
                      team1Name={cskaTeamName}
                      team2Name={opponentTeamNameRustat}
                      team1Color={cskaTeamId === rustatData.info.team1.id ? "#CC0000" : "#0066CC"}
                      team2Color={cskaTeamId === rustatData.info.team1.id ? "#0066CC" : "#CC0000"}
                    />
                  </Suspense>
                ) : (
                  <EmptyState
                    icon={Clock}
                    title="События недоступны"
                    description="Хронология событий матча пока не загружена"
                  />
                )}
              </TabsContent>

              <TabsContent value="rustat-charts" className="mt-6">
                {rustatData.teamStats ? (
                  <Suspense fallback={<StatsSkeleton />}>
                    <MatchCharts
                      stats={rustatData.teamStats}
                      team1Id={cskaTeamId}
                      team2Id={opponentTeamId}
                      team1Name={cskaTeamName}
                      team2Name={opponentTeamNameRustat}
                      team1Color={cskaTeamId === rustatData.info.team1.id ? "#CC0000" : "#0066CC"}
                      team2Color={cskaTeamId === rustatData.info.team1.id ? "#0066CC" : "#CC0000"}
                    />
                  </Suspense>
                ) : (
                  <EmptyState
                    icon={BarChart3}
                    title="Графики недоступны"
                    description="Данные для построения графиков пока не загружены"
                  />
                )}
              </TabsContent>
            </>
          )}

          {hasEvents && (
            <TabsContent value="timeline" className="mt-6">
              <MatchTimeline
                events={events}
                homeTeam="ЦСКА"
                awayTeam={opponentName}
              />
            </TabsContent>
          )}

          {hasStatistics && (
            <TabsContent value="stats" className="mt-6">
              <MatchStats
                stats={statistics!}
                homeTeam="ЦСКА"
                awayTeam={opponentName}
              />
            </TabsContent>
          )}

          {hasTournamentTable && match.tournament && match.season && (
            <TabsContent value="table" className="mt-6">
              <TournamentTable
                teams={tournamentTable}
                tournamentName={match.tournament}
                season={match.season}
                highlightPositions={{
                  champions: [1],
                  championsLeague: [2, 3],
                  europaLeague: [4, 5],
                  relegation: [7, 8],
                }}
              />
            </TabsContent>
          )}
        </Tabs>
      )}

      {/* Сообщение, если нет дополнительных данных */}
      {!hasEvents && !hasStatistics && !hasTournamentTable && !hasRustatData && (
        <EmptyState
          icon={Info}
          title={isMatchFinished ? "Статистика обрабатывается" : "Матч еще не состоялся"}
          description={
            isMatchFinished
              ? "Детальная статистика матча будет доступна в ближайшее время"
              : "Статистика появится после завершения матча"
          }
        />
      )}
    </div>
  )
}

// Генерация статических путей для популярных матчей
export async function generateStaticParams() {
  // Получаем последние 50 матчей для статической генерации
  const { matches } = await matchesService.list({
    page: 1,
    pageSize: 50,
    orderBy: "matchDate",
    orderDirection: "desc",
  })

  return matches.map((match) => ({
    slug: match.slug,
  }))
}
