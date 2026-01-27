import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Trophy, Clock } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/layout/container"
import { getImageProps } from "@/lib/image-utils"

interface Match {
  opponentName: string
  opponentLogoUrl: string | null
  cskaLogoUrl: string | null
  matchDate: string
  venue: string | null
  scoreHome: number | null
  scoreAway: number | null
  isHome: boolean
  slug: string
}

interface MatchCardProps {
  lastMatch?: Match | null
  nextMatch?: Match | null
  futureMatch?: Match | null
}

export function MatchCard({ lastMatch, nextMatch, futureMatch }: MatchCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "short",
    }).format(date)
  }

  if (!lastMatch && !nextMatch && !futureMatch) {
    return null
  }

  // Проверяем, есть ли предстоящие матчи
  const hasUpcomingMatches = nextMatch && new Date(nextMatch.matchDate) > new Date()
  const allMatchesArePast = !hasUpcomingMatches

  const renderTeams = (match: Match, showScore: boolean = false) => {
    const homeTeam = match.isHome ? "ЦСКА" : match.opponentName
    const awayTeam = match.isHome ? match.opponentName : "ЦСКА"
    const homeLogo = match.isHome ? match.cskaLogoUrl : match.opponentLogoUrl
    const awayLogo = match.isHome ? match.opponentLogoUrl : match.cskaLogoUrl
    const homeScore = showScore ? match.scoreHome : null
    const awayScore = showScore ? match.scoreAway : null

    return (
      <div className="flex items-center justify-between mb-3">
        {/* Home Team */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-muted flex items-center justify-center mb-2 overflow-hidden p-2">
            {homeLogo ? (
              <div className="relative w-full h-full">
                <Image
                  {...getImageProps(homeLogo, homeTeam)}
                  fill
                  sizes="64px"
                  className="object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-full h-full bg-[var(--cska-blue)] flex items-center justify-center text-white font-bold text-xs rounded-full">
                {homeTeam.substring(0, 2)}
              </div>
            )}
          </div>
          <span className="font-semibold text-center text-xs md:text-sm mb-1">
            {homeTeam}
          </span>
          {showScore && (
            <div className="text-2xl md:text-3xl font-bold text-[var(--cska-blue)]">
              {homeScore ?? "-"}
            </div>
          )}
        </div>

        {/* VS or Score */}
        <div className="px-2">
          {showScore ? (
            <Trophy className="h-5 w-5 text-[var(--cska-gold)]" />
          ) : (
            <span className="text-xl md:text-2xl font-bold text-muted-foreground">
              VS
            </span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-muted flex items-center justify-center mb-2 overflow-hidden p-2">
            {awayLogo ? (
              <div className="relative w-full h-full">
                <Image
                  {...getImageProps(awayLogo, awayTeam)}
                  fill
                  sizes="64px"
                  className="object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs rounded-full">
                {awayTeam.substring(0, 2)}
              </div>
            )}
          </div>
          <span className="font-semibold text-center text-xs md:text-sm mb-1">
            {awayTeam}
          </span>
          {showScore && (
            <div className="text-2xl md:text-3xl font-bold text-muted-foreground">
              {awayScore ?? "-"}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <section className="py-8 md:py-12 bg-background">
      <Container>
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-1">Матчи</h2>
          <p className="text-muted-foreground text-xs max-w-2xl mx-auto">
            Следите за расписанием и результатами наших матчей
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 max-w-6xl mx-auto">
          {/* First Match (Left) */}
          {lastMatch && (
            <Card className="overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="bg-gradient-to-br from-muted to-muted/50 pb-2 pt-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-[var(--cska-gold)] text-white text-[9px] px-1.5 py-0.5">
                    {allMatchesArePast ? "Прошедший" : "Завершён"}
                  </Badge>
                  <div className="text-xs font-bold">
                    {formatShortDate(lastMatch.matchDate)}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-3 pb-2 px-3">
                {renderTeams(lastMatch, true)}

                <div className="space-y-1 text-[10px] md:text-xs">
                  {lastMatch.venue && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{lastMatch.venue}</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="pt-0 pb-2 px-3">
                <Button asChild variant="outline" size="sm" className="w-full text-[10px] md:text-xs h-7">
                  <Link href={`/matches/${lastMatch.slug}`}>Смотреть обзор</Link>
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Center Match (Highlighted) */}
          {nextMatch && (
            <Card className="overflow-hidden border-2 border-[var(--cska-blue)] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--cska-blue)] via-[var(--cska-red)] to-[var(--cska-blue)]" />
              
              <CardHeader className="bg-gradient-to-br from-[var(--cska-blue)] to-[var(--cska-blue)]/80 text-white pb-2 pt-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-white/20 text-white text-[9px] px-1.5 py-0.5">
                    {allMatchesArePast ? "Недавний матч" : "Ближайший матч"}
                  </Badge>
                  <div className="text-xs font-bold">
                    {formatShortDate(nextMatch.matchDate)}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-3 pb-2 px-3">
                {renderTeams(nextMatch, allMatchesArePast)}

                <div className="space-y-1 text-[10px] md:text-xs">
                  {!allMatchesArePast && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span>{formatDate(nextMatch.matchDate)}</span>
                    </div>
                  )}
                  {nextMatch.venue && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{nextMatch.venue}</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex gap-2 pt-0 pb-2 px-3">
                {!allMatchesArePast ? (
                  <>
                    <Button
                      asChild
                      size="sm"
                      className="flex-1 bg-[var(--cska-red)] hover:bg-[var(--cska-red)]/90 text-[10px] md:text-xs h-7"
                    >
                      <Link href="/tickets">Купить билет</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="flex-1 text-[10px] md:text-xs h-7">
                      <Link href={`/matches/${nextMatch.slug}`}>Подробнее</Link>
                    </Button>
                  </>
                ) : (
                  <Button asChild variant="outline" size="sm" className="w-full text-[10px] md:text-xs h-7">
                    <Link href={`/matches/${nextMatch.slug}`}>Смотреть обзор</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          )}

          {/* Third Match (Right) */}
          {futureMatch && (
            <Card className="overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="bg-gradient-to-br from-muted/50 to-muted/30 pb-2 pt-2">
                <div className="flex items-center justify-between">
                  <Badge variant={allMatchesArePast ? "secondary" : "outline"} className={`text-[9px] px-1.5 py-0.5 ${allMatchesArePast ? 'bg-muted' : ''}`}>
                    {allMatchesArePast ? "Прошедший" : "Скоро"}
                  </Badge>
                  <div className="text-xs font-bold">
                    {formatShortDate(futureMatch.matchDate)}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-3 pb-2 px-3">
                {renderTeams(futureMatch, allMatchesArePast)}

                <div className="space-y-1 text-[10px] md:text-xs">
                  {!allMatchesArePast && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span>{formatDate(futureMatch.matchDate)}</span>
                    </div>
                  )}
                  {futureMatch.venue && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{futureMatch.venue}</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="pt-0 pb-2 px-3">
                <Button asChild variant="outline" size="sm" className="w-full text-[10px] md:text-xs h-7">
                  <Link href={`/matches/${futureMatch.slug}`}>
                    {allMatchesArePast ? "Смотреть обзор" : "Подробнее"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        {/* View All Matches Link */}
        <div className="text-center mt-6">
          <Button asChild size="default" variant="outline" className="text-sm">
            <Link href="/matches">Все матчи</Link>
          </Button>
        </div>
      </Container>
    </section>
  )
}
