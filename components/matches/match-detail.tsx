"use client"

import Image from "next/image"
import Link from "next/link"
import { Match, MatchStatus, FootballTeam } from "@prisma/client"
import { Calendar, MapPin, Trophy, Users, User, ArrowLeft, Video } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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

interface MatchDetailProps {
  match: MatchWithTeams
}

export function MatchDetail({ match }: MatchDetailProps) {
  // Определяем команды (новая структура или старая для обратной совместимости)
  const isCskaHome = match.homeTeam?.name === 'ЦСКА' || match.isHome === true
  const cskaTeam = isCskaHome ? match.homeTeam : match.awayTeam
  const opponentTeam = isCskaHome ? match.awayTeam : match.homeTeam
  
  // Формируем данные для отображения
  const cskaName = 'ЦСКА'
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
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj)
  }

  const getStatusBadge = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.LIVE:
        return (
          <Badge className="bg-red-500 text-white animate-pulse text-sm">
            В эфире
          </Badge>
        )
      case MatchStatus.FINISHED:
        return (
          <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400 text-sm">
            Завершён
          </Badge>
        )
      case MatchStatus.SCHEDULED:
        return (
          <Badge variant="outline" className="border-[var(--cska-blue)] text-[var(--cska-blue)] text-sm">
            Запланирован
          </Badge>
        )
      case MatchStatus.POSTPONED:
        return (
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-sm">
            Отложен
          </Badge>
        )
      case MatchStatus.CANCELLED:
        return (
          <Badge variant="secondary" className="bg-red-500/10 text-red-700 dark:text-red-400 text-sm">
            Отменён
          </Badge>
        )
    }
  }

  const matchDate = typeof match.matchDate === 'string' ? new Date(match.matchDate) : match.matchDate
  const isFinished = match.status === MatchStatus.FINISHED
  const hasScore = match.scoreHome !== null && match.scoreAway !== null
  
  // Определяем результат для ЦСКА
  const cskaScore = isCskaHome ? match.scoreHome : match.scoreAway
  const opponentScore = isCskaHome ? match.scoreAway : match.scoreHome
  const cskaWon = hasScore && cskaScore! > opponentScore!
  const isDraw = hasScore && cskaScore === opponentScore

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/matches">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к списку матчей
        </Link>
      </Button>

      {/* Main Match Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-[var(--cska-blue)] to-[var(--cska-blue)]/80 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusBadge(match.status)}
              {match.tournament && (
                <>
                  <Separator orientation="vertical" className="h-6 bg-white/20" />
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    <span className="font-semibold text-base">{match.tournament}</span>
                    {match.round && <span className="text-sm opacity-90">• {match.round}</span>}
                  </div>
                </>
              )}
            </div>
            <div className="text-lg font-semibold">{match.season}</div>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          {/* Teams and Score */}
          <div className="flex items-center justify-between gap-8 mb-8">
            {/* Home Team (left) */}
            {isCskaHome ? (
              // ЦСКА дома - слева
              <div className="flex flex-col items-center flex-1">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-muted flex items-center justify-center mb-4 overflow-hidden p-4">
                  {cskaLogoUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        {...getImageProps(cskaLogoUrl, cskaName)}
                        fill
                        sizes="128px"
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-[var(--cska-blue)] flex items-center justify-center text-white font-bold text-2xl rounded-full">
                      ЖФК
                    </div>
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-center mb-2">
                  {cskaName}
                </h2>
                <Badge variant="outline" className="text-xs">
                  Дома
                </Badge>
                {isFinished && hasScore && (
                  <div className={cn(
                    "text-5xl md:text-6xl font-bold mt-4",
                    cskaWon ? "text-[var(--cska-blue)]" : isDraw ? "text-muted-foreground" : "text-muted-foreground/50"
                  )}>
                    {match.scoreHome}
                  </div>
                )}
              </div>
            ) : (
              // Соперник дома - слева
              <div className="flex flex-col items-center flex-1">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-muted flex items-center justify-center mb-4 overflow-hidden p-4">
                  {opponentLogoUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        {...getImageProps(opponentLogoUrl, opponentName)}
                        fill
                        sizes="128px"
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-muted-foreground">
                      {opponentName.substring(0, 2)}
                    </span>
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-center mb-2">
                  {opponentName}
                </h2>
                <Badge variant="outline" className="text-xs">
                  Дома
                </Badge>
                {isFinished && hasScore && (
                  <div className={cn(
                    "text-5xl md:text-6xl font-bold mt-4",
                    !cskaWon && !isDraw ? "text-[var(--cska-blue)]" : isDraw ? "text-muted-foreground" : "text-muted-foreground/50"
                  )}>
                    {match.scoreHome}
                  </div>
                )}
              </div>
            )}

            {/* VS or Score Separator */}
            <div className="flex flex-col items-center">
              {isFinished && hasScore ? (
                <div className="text-3xl md:text-4xl font-bold text-muted-foreground">
                  :
                </div>
              ) : (
                <div className="text-2xl md:text-3xl font-bold text-muted-foreground">
                  VS
                </div>
              )}
            </div>

            {/* Away Team (right) */}
            {isCskaHome ? (
              // Соперник в гостях - справа
              <div className="flex flex-col items-center flex-1">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-muted flex items-center justify-center mb-4 overflow-hidden p-4">
                  {opponentLogoUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        {...getImageProps(opponentLogoUrl, opponentName)}
                        fill
                        sizes="128px"
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-muted-foreground">
                      {opponentName.substring(0, 2)}
                    </span>
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-center mb-2">
                  {opponentName}
                </h2>
                <Badge variant="outline" className="text-xs">
                  В гостях
                </Badge>
                {isFinished && hasScore && (
                  <div className={cn(
                    "text-5xl md:text-6xl font-bold mt-4",
                    !cskaWon && !isDraw ? "text-[var(--cska-blue)]" : isDraw ? "text-muted-foreground" : "text-muted-foreground/50"
                  )}>
                    {match.scoreAway}
                  </div>
                )}
              </div>
            ) : (
              // ЦСКА в гостях - справа
              <div className="flex flex-col items-center flex-1">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-muted flex items-center justify-center mb-4 overflow-hidden p-4">
                  {cskaLogoUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        {...getImageProps(cskaLogoUrl, cskaName)}
                        fill
                        sizes="128px"
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-[var(--cska-blue)] flex items-center justify-center text-white font-bold text-2xl rounded-full">
                      ЖФК
                    </div>
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-center mb-2">
                  {cskaName}
                </h2>
                <Badge variant="outline" className="text-xs">
                  В гостях
                </Badge>
                {isFinished && hasScore && (
                  <div className={cn(
                    "text-5xl md:text-6xl font-bold mt-4",
                    cskaWon ? "text-[var(--cska-blue)]" : isDraw ? "text-muted-foreground" : "text-muted-foreground/50"
                  )}>
                    {match.scoreAway}
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Match Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-[var(--cska-blue)] mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-muted-foreground">Дата и время</div>
                <div className="font-medium">{formatDate(matchDate)}</div>
              </div>
            </div>

            {match.venue && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[var(--cska-blue)] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-muted-foreground">Место проведения</div>
                  <div className="font-medium">{match.venue}</div>
                </div>
              </div>
            )}

            {match.attendance && (
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-[var(--cska-blue)] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-muted-foreground">Посещаемость</div>
                  <div className="font-medium">{match.attendance.toLocaleString("ru-RU")} зрителей</div>
                </div>
              </div>
            )}

            {match.referee && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-[var(--cska-blue)] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-muted-foreground">Главный судья</div>
                  <div className="font-medium">{match.referee}</div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {match.description && (
            <>
              <Separator className="my-6" />
              <div>
                <h3 className="font-semibold mb-2">О матче</h3>
                <p className="text-muted-foreground">{match.description}</p>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            {match.highlights && (
              <Button asChild className="flex-1 bg-[var(--cska-red)] hover:bg-[var(--cska-red)]/90">
                <a href={match.highlights} target="_blank" rel="noopener noreferrer">
                  <Video className="h-4 w-4 mr-2" />
                  Смотреть обзор
                </a>
              </Button>
            )}
            {match.status === MatchStatus.SCHEDULED && (
              <Button asChild className="flex-1 bg-[var(--cska-blue)] hover:bg-[var(--cska-blue)]/90">
                <Link href="/tickets">
                  Купить билет
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
