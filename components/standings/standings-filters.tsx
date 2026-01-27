"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface StandingsFiltersProps {
  tournaments: string[]
  seasons: string[]
  currentTournament: string
  currentSeason: string
}

export function StandingsFilters({
  tournaments,
  seasons,
  currentTournament,
  currentSeason,
}: StandingsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTournamentChange = (tournament: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tournament", tournament)
    router.push(`/standings?${params.toString()}`)
  }

  const handleSeasonChange = (season: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("season", season)
    router.push(`/standings?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <label className="text-sm font-medium mb-2 block">Турнир</label>
        <Select value={currentTournament} onValueChange={handleTournamentChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Выберите турнир" />
          </SelectTrigger>
          <SelectContent>
            {tournaments.map((tournament) => (
              <SelectItem key={tournament} value={tournament}>
                {tournament}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <label className="text-sm font-medium mb-2 block">Сезон</label>
        <Select value={currentSeason} onValueChange={handleSeasonChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Выберите сезон" />
          </SelectTrigger>
          <SelectContent>
            {seasons.map((season) => (
              <SelectItem key={season} value={season}>
                {season}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
