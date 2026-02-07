"use client"

import Link from "next/link"
import Image from "next/image"
import { Match, MatchStatus, FootballTeam } from "@prisma/client"
import { Calendar, MapPin, Trophy, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getImageProps } from "@/lib/image-utils"
import { cn } from "@/lib/utils"

type MatchWithTeams = Match & {
  homeTeam?: FootballTeam | null
  awayTeam?: FootballTeam | null
  // Старые поля для обратной совместимости
  opponentName?: string | null
  opponentLogoUrl?: string | null
  cskaLogoUrl?: string | null
  isHome?: boolean | null
}

interface MatchListItemProps {
  match: MatchWithTeams
}

export function MatchListItem({ match }: MatchListItemProps) {
  // Определяем команды (новая структура или старая для обратной совместимости)
  const isCskaHome = match.homeTeam?.name === 'ЦСКА' || match.isHome === true
  const cskaTeam = isCskaHome ? match.homeTeam : match.awayTeam
  const opponentTeam = isCskaHome ? match.awayTeam : match.homeTeam
  
  // Формируем данные для отображения
  const opponentName = opponentTeam?.name || match.opponentName || 'Соперник'
  const cskaLogoUrl = cskaTeam?.logoFileName 
    ? `/teams/${cskaTeam.season}/${cskaTeam.competition}/${cskaTeam.logoFileName}`
    : match.cskaLogoUrl || null
  const opponentLogoUrl = opponentTeam?.logoFileName
    ? `/teams/${opponentTeam.season}/${opponentTeam.competition}/${opponentTeam.logoFileName}`
    : match.opponentLogoUrl || null

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(dateObj)
  }

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj)
  }

  const getStatusBadge = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.LIVE:
        return (
          <Badge className="bg-red-500 text-white animate-pulse">
            В эфире
          </Badge>
        )
      case MatchStatus.FINISHED:
        return (
          <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
            Завершён
          </Badge>
        )
      case MatchStatus.SCHEDULED:
        return (
          <Badge variant="outline" className="border-[var(--cska-blue)] text-[var(--cska-blue)]">
            Запланирован
          </Badge>
        )
      case MatchStatus.POSTPONED:
        return (
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
            Отложен
          </Badge>
        )
      case MatchStatus.CANCELLED:
        return (
          <Badge variant="secondary" className="bg-red-500/10 text-red-700 dark:text-red-400">
            Отменён
          </Badge>
        )
    }
  }

  const matchDate = typeof match.matchDate === 'string' ? new Date(match.matchDate) : match.matchDate
  const isFinished = match.status === MatchStatus.FINISHED
  const hasScore = match.scoreHome !== null && match.scoreAway !== null

  return (
    <Link href={`/matches/${match.slug}`}>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Date and Status */}
            <div className="flex items-center justify-between md:flex-col md:items-start md:w-32 flex-shrink-0">
              <div className="text-sm text-muted-foreground">
                {formatDate(matchDate)}
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(match.status)}
              </div>
            </div>

            {/* Teams */}
            <div className="flex-1">
              <div className="flex items-center justify-between gap-4">
                {/* Home Team (left side) */}
                {isCskaHome ? (
                  // ЦСКА дома - слева
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 p-2">
                      {cskaLogoUrl ? (
                        <div className="relative w-full h-full">
                          <Image
                            {...getImageProps(cskaLogoUrl, "ЦСКА")}
                            fill
                            sizes="56px"
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-[var(--cska-blue)] flex items-center justify-center text-white font-bold text-xs rounded-full">
                          ЖФК
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm md:text-base">ЦСКА</div>
                      <div className="text-xs text-muted-foreground">Дома</div>
                    </div>
                  </div>
                ) : (
                  // Соперник дома - слева
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 p-2">
                      {opponentLogoUrl ? (
                        <div className="relative w-full h-full">
                          <Image
                            {...getImageProps(opponentLogoUrl, opponentName)}
                            fill
                            sizes="56px"
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-muted-foreground">
                          {opponentName.substring(0, 2)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm md:text-base">{opponentName}</div>
                      <div className="text-xs text-muted-foreground">Дома</div>
                    </div>
                  </div>
                )}

                {/* Score or VS */}
                <div className="flex items-center gap-2 px-4">
                  {isFinished && hasScore ? (
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-2xl md:text-3xl font-bold",
                        match.scoreHome! > match.scoreAway! ? "text-[var(--cska-blue)]" : "text-muted-foreground"
                      )}>
                        {match.scoreHome}
                      </span>
                      <span className="text-xl text-muted-foreground">:</span>
                      <span className={cn(
                        "text-2xl md:text-3xl font-bold",
                        match.scoreAway! > match.scoreHome! ? "text-[var(--cska-blue)]" : "text-muted-foreground"
                      )}>
                        {match.scoreAway}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">{formatTime(matchDate)}</span>
                    </div>
                  )}
                </div>

                {/* Away Team (right side) */}
                {isCskaHome ? (
                  // Соперник в гостях - справа
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <div className="flex-1 text-right">
                      <div className="font-semibold text-sm md:text-base">{opponentName}</div>
                      <div className="text-xs text-muted-foreground">В гостях</div>
                    </div>
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 p-2">
                      {opponentLogoUrl ? (
                        <div className="relative w-full h-full">
                          <Image
                            {...getImageProps(opponentLogoUrl, opponentName)}
                            fill
                            sizes="56px"
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-muted-foreground">
                          {opponentName.substring(0, 2)}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  // ЦСКА в гостях - справа
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <div className="flex-1 text-right">
                      <div className="font-semibold text-sm md:text-base">ЦСКА</div>
                      <div className="text-xs text-muted-foreground">В гостях</div>
                    </div>
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 p-2">
                      {cskaLogoUrl ? (
                        <div className="relative w-full h-full">
                          <Image
                            {...getImageProps(cskaLogoUrl, "ЦСКА")}
                            fill
                            sizes="56px"
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-[var(--cska-blue)] flex items-center justify-center text-white font-bold text-xs rounded-full">
                          ЖФК
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Match Info */}
            <div className="flex flex-col gap-1 md:w-48 flex-shrink-0 text-xs text-muted-foreground">
              {match.tournament && (
                <div className="flex items-center gap-2">
                  <Trophy className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{match.tournament}</span>
                </div>
              )}
              {match.venue && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{match.venue}</span>
                </div>
              )}
              {match.round && (
                <div className="text-xs font-medium text-[var(--cska-blue)]">
                  {match.round}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
