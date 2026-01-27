import { Suspense } from "react"
import { Metadata } from "next"
import { matchesService } from "@/lib/services/matches.service"
import { MatchesList } from "@/components/matches/matches-list"
import { MatchFilters } from "@/components/matches/match-filters"
import { MatchPagination } from "@/components/matches/match-pagination"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MatchStatus } from "@prisma/client"

export const metadata: Metadata = {
  title: "Матчи | ЖФК ЦСКА",
  description: "Расписание матчей, результаты и статистика ЖФК ЦСКА. Следите за всеми играми команды в различных турнирах.",
  openGraph: {
    title: "Матчи | ЖФК ЦСКА",
    description: "Расписание матчей, результаты и статистика ЖФК ЦСКА",
    type: "website",
  },
}

interface MatchesPageProps {
  searchParams: {
    page?: string
    tournament?: string
    season?: string
    status?: string
    isHome?: string
    opponent?: string
  }
}

function MatchesListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function MatchesContent({ searchParams }: MatchesPageProps) {
  // Ждём searchParams (Next.js 15+)
  const params = await searchParams
  
  // Парсим параметры
  const page = parseInt(params.page || "1", 10)
  const pageSize = 20

  // Формируем фильтры
  const filters: any = {}
  if (params.tournament) filters.tournament = params.tournament
  if (params.season) filters.season = params.season
  if (params.status) filters.status = params.status as MatchStatus
  if (params.isHome) filters.isHome = params.isHome === "true"
  if (params.opponent) filters.opponentName = params.opponent

  // Получаем данные
  const [matchesData, tournaments, seasons] = await Promise.all([
    matchesService.list({
      filters,
      page,
      pageSize,
      orderBy: "matchDate",
      orderDirection: "desc",
    }),
    matchesService.getTournaments(),
    matchesService.getSeasons(),
  ])

  const { matches, pagination } = matchesData

  return (
    <>
      {/* Фильтры */}
      <MatchFilters
        tournaments={tournaments}
        seasons={seasons}
        filters={{
          tournament: params.tournament,
          season: params.season,
          status: params.status as MatchStatus | undefined,
          isHome: params.isHome === "true" ? true : params.isHome === "false" ? false : undefined,
          opponent: params.opponent,
        }}
      />

      {/* Список матчей */}
      <MatchesList matches={matches} isLoading={false} />

      {/* Пагинация */}
      {pagination.totalPages > 1 && (
        <MatchPagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
        />
      )}

      {/* Пустое состояние */}
      {matches.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Матчи не найдены. Попробуйте изменить фильтры.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  )
}

export default function MatchesPage({ searchParams }: MatchesPageProps) {
  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Заголовок */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Матчи</h1>
        <p className="text-muted-foreground text-lg">
          Расписание матчей, результаты и статистика команды
        </p>
      </div>

      {/* Контент с Suspense */}
      <Suspense fallback={<MatchesListSkeleton />}>
        <MatchesContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
