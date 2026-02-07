import { playersService } from "@/lib/services/players.service"
import { Position, PlayerTeam } from "@prisma/client"
import { PlayersCarousel } from "@/components/players"

interface PlayersGridProps {
  searchParams: {
    position?: string
    team?: string
    sort?: string
    q?: string
  }
}

export async function PlayersGrid({ searchParams }: PlayersGridProps) {
  // Parse and validate search params
  const filters = {
    position:
      searchParams.position && searchParams.position !== "all"
        ? (searchParams.position as Position)
        : undefined,
    team:
      searchParams.team && searchParams.team !== "all"
        ? (searchParams.team.toUpperCase() as PlayerTeam)
        : searchParams.team === undefined
          ? PlayerTeam.MAIN // Default to MAIN only when no param is provided
          : undefined, // Show all teams when explicitly set to "all"
    sort: (searchParams.sort as "number" | "name") || "number",
    q: searchParams.q || undefined,
  }

  // Fetch players from database
  const players = await playersService.list(filters)

  // Show empty state if no players found
  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 md:py-24">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl mb-4">⚽</div>
          <h3 className="text-2xl font-bold">Игроки не найдены</h3>
          <p className="text-muted-foreground">
            Попробуйте изменить параметры фильтрации или поиска
          </p>
        </div>
      </div>
    )
  }

  // Show results count
  const resultsText =
    players.length === 1
      ? "1 игрок"
      : players.length < 5
        ? `${players.length} игрока`
        : `${players.length} игроков`

  return (
    <div className="space-y-6">
      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Найдено: <span className="font-semibold text-foreground">{resultsText}</span>
        </p>
      </div>

      {/* Players Carousel */}
      <PlayersCarousel players={players} />
    </div>
  )
}
