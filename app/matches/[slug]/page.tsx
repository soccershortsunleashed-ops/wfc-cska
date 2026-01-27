import { Metadata } from "next"
import { notFound } from "next/navigation"
import { matchesService } from "@/lib/services/matches.service"
import { MatchDetail } from "@/components/matches/match-detail"
import { MatchTimeline, MatchEvent } from "@/components/matches/match-timeline"
import { MatchStats, MatchStatistics } from "@/components/matches/match-stats"
import { TournamentTable, TournamentTeam } from "@/components/matches/tournament-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MatchPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
  const match = await matchesService.getBySlug(params.slug)

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

  const title = `ЦСКА - ${match.opponentName} | ${matchDate}`
  const description = match.description || `Матч ЦСКА против ${match.opponentName}. ${match.tournament || ""} ${match.season || ""}`

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
  const match = await matchesService.getBySlug(params.slug)

  if (!match) {
    notFound()
  }

  // Получаем дополнительные данные
  const [events, statistics, tournamentTable] = await Promise.all([
    getMatchEvents(match.id),
    getMatchStatistics(match.id),
    match.tournament && match.season
      ? getTournamentTable(match.tournament, match.season)
      : Promise.resolve([]),
  ])

  const hasEvents = events.length > 0
  const hasStatistics = statistics !== null
  const hasTournamentTable = tournamentTable.length > 0

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Основная информация о матче */}
      <MatchDetail match={match} />

      {/* Дополнительная информация в табах */}
      {(hasEvents || hasStatistics || hasTournamentTable) && (
        <Tabs defaultValue={hasEvents ? "timeline" : hasStatistics ? "stats" : "table"} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {hasEvents && <TabsTrigger value="timeline">Хронология</TabsTrigger>}
            {hasStatistics && <TabsTrigger value="stats">Статистика</TabsTrigger>}
            {hasTournamentTable && <TabsTrigger value="table">Турнирная таблица</TabsTrigger>}
          </TabsList>

          {hasEvents && (
            <TabsContent value="timeline" className="mt-6">
              <MatchTimeline
                events={events}
                homeTeam="ЦСКА"
                awayTeam={match.opponentName}
              />
            </TabsContent>
          )}

          {hasStatistics && (
            <TabsContent value="stats" className="mt-6">
              <MatchStats
                stats={statistics!}
                homeTeam="ЦСКА"
                awayTeam={match.opponentName}
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
      {!hasEvents && !hasStatistics && !hasTournamentTable && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Дополнительная информация о матче будет добавлена позже</p>
        </div>
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
