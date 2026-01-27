import { Metadata } from 'next'
import { standingsService } from '@/lib/services/standings.service'
import { StandingsTable } from '@/components/standings/standings-table'
import { StandingsFilters } from '@/components/standings/standings-filters'
import { Container } from '@/components/layout/container'

export const metadata: Metadata = {
  title: 'Турнирная таблица | ЖФК ЦСКА',
  description: 'Турнирная таблица ЖФК ЦСКА в чемпионате России',
}

interface StandingsPageProps {
  searchParams: Promise<{
    tournament?: string
    season?: string
  }>
}

export default async function StandingsPage({ searchParams }: StandingsPageProps) {
  const params = await searchParams
  const tournament = params.tournament || 'Суперлига'
  const season = params.season || '2025/2026'

  const [standings, tournaments, seasons] = await Promise.all([
    standingsService.getStandings({ tournament, season }),
    standingsService.getTournaments(),
    standingsService.getSeasons(),
  ])

  return (
    <main className="min-h-screen py-8">
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Турнирная таблица</h1>
          <p className="text-muted-foreground">
            {tournament} • Сезон {season}
          </p>
        </div>

        <StandingsFilters
          tournaments={tournaments}
          seasons={seasons}
          currentTournament={tournament}
          currentSeason={season}
        />

        <StandingsTable standings={standings} />
      </Container>
    </main>
  )
}
