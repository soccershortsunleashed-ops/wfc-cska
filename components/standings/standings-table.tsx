import Image from "next/image"
import { getImageProps } from "@/lib/image-utils"
import { Badge } from "@/components/ui/badge"

interface StandingsTeam {
  id: string
  teamName: string
  teamLogoUrl: string | null
  position: number
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: string | null
}

interface StandingsTableProps {
  standings: StandingsTeam[]
}

export function StandingsTable({ standings }: StandingsTableProps) {
  if (!standings || standings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Турнирная таблица пока не доступна</p>
      </div>
    )
  }

  const renderFormBadge = (result: string) => {
    const variants = {
      W: { bg: "bg-green-500", text: "text-white", label: "П" }, // Победа
      D: { bg: "bg-yellow-500", text: "text-white", label: "Н" }, // Ничья
      L: { bg: "bg-red-500", text: "text-white", label: "П" }, // Поражение
    }

    const variant = variants[result as keyof typeof variants] || variants.L

    return (
      <div
        className={`w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-bold ${variant.bg} ${variant.text}`}
        title={result === "W" ? "Победа" : result === "D" ? "Ничья" : "Поражение"}
      >
        {result === "W" ? "П" : result === "D" ? "Н" : "П"}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full inline-block align-middle">
        <div className="overflow-hidden border rounded-lg">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  #
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Команда
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                  И
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider hidden md:table-cell">
                  В
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider hidden md:table-cell">
                  Н
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider hidden md:table-cell">
                  П
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">
                  Мячи
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">
                  РМ
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                  О
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">
                  Форма
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {standings.map((team) => {
                const isCska = team.teamName === "ЦСКА"
                const formResults = team.form ? team.form.split("") : []

                return (
                  <tr
                    key={team.id}
                    className={`transition-colors hover:bg-muted/50 ${
                      isCska ? "bg-[var(--cska-blue)]/5 font-semibold" : ""
                    }`}
                  >
                    {/* Position */}
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCska
                            ? "bg-[var(--cska-blue)] text-white"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {team.position}
                      </div>
                    </td>

                    {/* Team Name & Logo */}
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden p-1 flex-shrink-0">
                          {team.teamLogoUrl ? (
                            <div className="relative w-full h-full">
                              <Image
                                {...getImageProps(team.teamLogoUrl, team.teamName)}
                                fill
                                sizes="32px"
                                className="object-contain"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-[10px] rounded-full">
                              {team.teamName.substring(0, 2)}
                            </div>
                          )}
                        </div>
                        <span className={`text-sm ${isCska ? "font-bold" : ""}`}>
                          {team.teamName}
                        </span>
                      </div>
                    </td>

                    {/* Played */}
                    <td className="px-3 py-4 whitespace-nowrap text-center text-sm">
                      {team.played}
                    </td>

                    {/* Won (hidden on mobile) */}
                    <td className="px-3 py-4 whitespace-nowrap text-center text-sm hidden md:table-cell">
                      {team.won}
                    </td>

                    {/* Drawn (hidden on mobile) */}
                    <td className="px-3 py-4 whitespace-nowrap text-center text-sm hidden md:table-cell">
                      {team.drawn}
                    </td>

                    {/* Lost (hidden on mobile) */}
                    <td className="px-3 py-4 whitespace-nowrap text-center text-sm hidden md:table-cell">
                      {team.lost}
                    </td>

                    {/* Goals (hidden on mobile) */}
                    <td className="px-3 py-4 whitespace-nowrap text-center text-sm hidden sm:table-cell">
                      <span className="text-muted-foreground">
                        {team.goalsFor}:{team.goalsAgainst}
                      </span>
                    </td>

                    {/* Goal Difference (hidden on tablet and below) */}
                    <td className="px-3 py-4 whitespace-nowrap text-center text-sm hidden lg:table-cell">
                      <span
                        className={
                          team.goalDifference > 0
                            ? "text-green-600 font-semibold"
                            : team.goalDifference < 0
                            ? "text-red-600"
                            : "text-muted-foreground"
                        }
                      >
                        {team.goalDifference > 0 ? "+" : ""}
                        {team.goalDifference}
                      </span>
                    </td>

                    {/* Points */}
                    <td className="px-3 py-4 whitespace-nowrap text-center">
                      <span
                        className={`text-base font-bold ${
                          isCska ? "text-[var(--cska-blue)]" : ""
                        }`}
                      >
                        {team.points}
                      </span>
                    </td>

                    {/* Form (hidden on tablet and below) */}
                    <td className="px-3 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        {formResults.length > 0 ? (
                          formResults.map((result, index) => (
                            <div key={index}>{renderFormBadge(result)}</div>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-semibold">И</span> - Игры
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="font-semibold">В</span> - Победы
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="font-semibold">Н</span> - Ничьи
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="font-semibold">П</span> - Поражения
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-semibold">Мячи</span> - Забито:Пропущено
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <span className="font-semibold">РМ</span> - Разница мячей
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">О</span> - Очки
          </div>
        </div>
      </div>
    </div>
  )
}
