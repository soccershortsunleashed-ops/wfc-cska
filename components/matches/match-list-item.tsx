"use client"

import Link from "next/link"
import Image from "next/image"
import { Match, MatchStatus } from "@prisma/client"
import { Calendar, MapPin, Trophy, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getImageProps } from "@/lib/image-utils"
import { cn } from "@/lib/utils"

interface MatchListItemProps {
  match: Match
}

export function MatchListItem({ match }: MatchListItemProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date)
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
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

  const matchDate = new Date(match.matchDate)
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
                {/* CSKA */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden relative flex-shrink-0 p-1">
                    {match.cskaLogoUrl ? (
                      <Image
                        {...getImageProps(match.cskaLogoUrl, "ЦСКА")}
                        fill
                        sizes="56px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="w-full h-full bg-[var(--cska-blue)] flex items-center justify-center text-white font-bold text-xs rounded-full">
                        ЖФК
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm md:text-base">ЦСКА</div>
                    {match.isHome && (
                      <div className="text-xs text-muted-foreground">Дома</div>
                    )}
                  </div>
                </div>

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

                {/* Opponent */}
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <div className="flex-1 text-right">
                    <div className="font-semibold text-sm md:text-base">{match.opponentName}</div>
                    {!match.isHome && (
                      <div className="text-xs text-muted-foreground">В гостях</div>
                    )}
                  </div>
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden relative flex-shrink-0 p-1">
                    {match.opponentLogoUrl ? (
                      <Image
                        {...getImageProps(match.opponentLogoUrl, match.opponentName)}
                        fill
                        sizes="56px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">
                        {match.opponentName.substring(0, 2)}
                      </span>
                    )}
                  </div>
                </div>
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
