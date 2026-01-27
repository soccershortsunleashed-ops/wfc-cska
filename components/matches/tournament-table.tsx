"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { getImageProps } from "@/lib/image-utils"
import { cn } from "@/lib/utils"

export interface TournamentTeam {
  position: number
  teamName: string
  teamLogoUrl?: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form?: ("W" | "D" | "L")[] // Последние 5 матчей
  isCSKA?: boolean
}

interface TournamentTableProps {
  teams: TournamentTeam[]
  tournamentName: string
  season: string
  highlightPositions?: {
    champions?: number[]
    championsLeague?: number[]
    europaLeague?: number[]
    relegation?: number[]
  }
}

export function TournamentTable({
  teams,
  tournamentName,
  season,
  highlightPositions = {},
}: TournamentTableProps) {
  const getPositionColor = (position: number) => {
    if (highlightPositions.champions?.includes(position)) {
      return "bg-green-500/10 border-l-4 border-green-500"
    }
    if (highlightPositions.championsLeague?.includes(position)) {
      return "bg-blue-500/10 border-l-4 border-blue-500"
    }
    if (highlightPositions.europaLeague?.includes(position)) {
      return "bg-orange-500/10 border-l-4 border-orange-500"
    }
    if (highlightPositions.relegation?.includes(position)) {
      return "bg-red-500/10 border-l-4 border-red-500"
    }
    return ""
  }

  const getFormIcon = (result: "W" | "D" | "L") => {
    switch (result) {
      case "W":
        return (
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
            П
          </div>
        )
      case "D":
        return (
          <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold">
            Н
          </div>
        )
      case "L":
        return (
          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
            П
          </div>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[var(--cska-blue)]" />
            Турнирная таблица
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {tournamentName} • {season}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">#</th>
                <th className="px-4 py-3 text-left font-semibold">Команда</th>
                <th className="px-2 py-3 text-center font-semibold">И</th>
                <th className="px-2 py-3 text-center font-semibold">В</th>
                <th className="px-2 py-3 text-center font-semibold">Н</th>
                <th className="px-2 py-3 text-center font-semibold">П</th>
                <th className="px-2 py-3 text-center font-semibold">ЗМ</th>
                <th className="px-2 py-3 text-center font-semibold">ПМ</th>
                <th className="px-2 py-3 text-center font-semibold">РМ</th>
                <th className="px-4 py-3 text-center font-semibold">О</th>
                <th className="px-4 py-3 text-center font-semibold">Форма</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr
                  key={team.position}
                  className={cn(
                    "border-b hover:bg-muted/50 transition-colors",
                    getPositionColor(team.position),
                    team.isCSKA && "bg-[var(--cska-blue)]/5 font-semibold"
                  )}
                >
                  <td className="px-4 py-3 text-sm">{team.position}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden relative flex-shrink-0">
                        {team.teamLogoUrl ? (
                          <Image
                            {...getImageProps(team.teamLogoUrl, team.teamName)}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold">
                            {team.teamName.substring(0, 2)}
                          </span>
                        )}
                      </div>
                      <span className="text-sm">{team.teamName}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center text-sm">{team.played}</td>
                  <td className="px-2 py-3 text-center text-sm">{team.won}</td>
                  <td className="px-2 py-3 text-center text-sm">{team.drawn}</td>
                  <td className="px-2 py-3 text-center text-sm">{team.lost}</td>
                  <td className="px-2 py-3 text-center text-sm">{team.goalsFor}</td>
                  <td className="px-2 py-3 text-center text-sm">{team.goalsAgainst}</td>
                  <td
                    className={cn(
                      "px-2 py-3 text-center text-sm font-semibold",
                      team.goalDifference > 0 && "text-green-600",
                      team.goalDifference < 0 && "text-red-600"
                    )}
                  >
                    {team.goalDifference > 0 ? "+" : ""}
                    {team.goalDifference}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-bold">
                    {team.points}
                  </td>
                  <td className="px-4 py-3">
                    {team.form && (
                      <div className="flex items-center justify-center gap-1">
                        {team.form.slice(-5).map((result, index) => (
                          <div key={index}>{getFormIcon(result)}</div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-2 p-4">
          {teams.map((team) => (
            <div
              key={team.position}
              className={cn(
                "p-4 rounded-lg border",
                getPositionColor(team.position),
                team.isCSKA && "bg-[var(--cska-blue)]/5 font-semibold"
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="text-lg font-bold text-muted-foreground">
                  {team.position}
                </div>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden relative flex-shrink-0">
                  {team.teamLogoUrl ? (
                    <Image
                      {...getImageProps(team.teamLogoUrl, team.teamName)}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold">
                      {team.teamName.substring(0, 2)}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{team.teamName}</div>
                  <div className="text-sm text-muted-foreground">
                    {team.played} игр • {team.points} очков
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                <div>
                  <div className="text-muted-foreground text-xs">В</div>
                  <div className="font-semibold">{team.won}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Н</div>
                  <div className="font-semibold">{team.drawn}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">П</div>
                  <div className="font-semibold">{team.lost}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">РМ</div>
                  <div
                    className={cn(
                      "font-semibold",
                      team.goalDifference > 0 && "text-green-600",
                      team.goalDifference < 0 && "text-red-600"
                    )}
                  >
                    {team.goalDifference > 0 ? "+" : ""}
                    {team.goalDifference}
                  </div>
                </div>
              </div>

              {team.form && (
                <div className="flex items-center justify-center gap-1 mt-3 pt-3 border-t">
                  {team.form.slice(-5).map((result, index) => (
                    <div key={index}>{getFormIcon(result)}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        {(highlightPositions.champions ||
          highlightPositions.championsLeague ||
          highlightPositions.europaLeague ||
          highlightPositions.relegation) && (
          <div className="p-4 border-t bg-muted/30">
            <div className="text-xs font-semibold mb-2">Обозначения:</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {highlightPositions.champions && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span>Чемпион</span>
                </div>
              )}
              {highlightPositions.championsLeague && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span>Лига чемпионов</span>
                </div>
              )}
              {highlightPositions.europaLeague && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded" />
                  <span>Лига Европы</span>
                </div>
              )}
              {highlightPositions.relegation && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded" />
                  <span>Вылет</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
