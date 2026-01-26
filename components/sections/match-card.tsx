import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Trophy } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/layout/container"
import { getImageProps, IMAGE_SIZES } from "@/lib/image-utils"

interface Match {
  opponentName: string
  opponentLogoUrl: string | null
  cskaLogoUrl: string | null
  matchDate: string
  venue: string | null
  scoreHome: number | null
  scoreAway: number | null
}

interface MatchCardProps {
  upcomingMatch?: Match | null
  lastMatch?: Match | null
}

export function MatchCard({ upcomingMatch, lastMatch }: MatchCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
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

  if (!upcomingMatch && !lastMatch) {
    return null
  }

  // Определяем количество карточек для правильного layout
  const matchCount = (upcomingMatch ? 1 : 0) + (lastMatch ? 1 : 0)
  const isSingleMatch = matchCount === 1

  return (
    <section className="py-8 md:py-12 bg-muted/30">
      <Container>
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-1">Матчи</h2>
          <p className="text-muted-foreground text-xs max-w-2xl mx-auto">
            Следите за расписанием и результатами наших матчей
          </p>
        </div>

        <div className={`grid gap-4 ${isSingleMatch ? 'max-w-md' : 'md:grid-cols-2 max-w-3xl'} mx-auto`}>
          {/* Upcoming Match */}
          {upcomingMatch && (
            <Card className="overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 gpu-accelerated">
                <CardHeader className="bg-gradient-to-br from-[var(--cska-blue)] to-[var(--cska-blue)]/80 text-white pb-3 pt-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 text-[10px] px-2 py-0.5">
                      Ближайший матч
                    </Badge>
                    <div className="text-right">
                      <div className="text-sm font-bold">
                        {formatShortDate(upcomingMatch.matchDate)}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 pb-3 px-4">
                  {/* Teams */}
                  <div className="flex items-center justify-between mb-3">
                    {/* Home Team - CSKA */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted flex items-center justify-center mb-2 overflow-hidden relative">
                        {upcomingMatch.cskaLogoUrl ? (
                          <Image
                            {...getImageProps(upcomingMatch.cskaLogoUrl, "ЦСКА")}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[var(--cska-blue)] flex items-center justify-center text-white font-bold text-sm md:text-base">
                            ЖФК
                          </div>
                        )}
                      </div>
                      <span className="font-semibold text-center text-sm md:text-base">
                        ЦСКА
                      </span>
                    </div>

                    {/* VS */}
                    <div className="px-3">
                      <span className="text-2xl md:text-3xl font-bold text-muted-foreground">
                        VS
                      </span>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted flex items-center justify-center mb-2 overflow-hidden relative">
                        {upcomingMatch.opponentLogoUrl ? (
                          <Image
                            {...getImageProps(upcomingMatch.opponentLogoUrl, upcomingMatch.opponentName)}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-base md:text-lg font-bold text-muted-foreground">
                            {upcomingMatch.opponentName.substring(0, 2)}
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-center text-sm md:text-base">
                        {upcomingMatch.opponentName}
                      </span>
                    </div>
                  </div>

                  {/* Match Info */}
                  <div className="space-y-1.5 text-xs md:text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>{formatDate(upcomingMatch.matchDate)}</span>
                    </div>
                    {upcomingMatch.venue && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>{upcomingMatch.venue}</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2 pt-0 pb-3 px-4">
                  <Button
                    asChild
                    size="sm"
                    className="flex-1 bg-[var(--cska-red)] hover:bg-[var(--cska-red)]/90 button-hover focus-ring text-xs md:text-sm h-8 md:h-9"
                  >
                    <Link href="/tickets">Купить билет</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1 button-hover focus-ring text-xs md:text-sm h-8 md:h-9">
                    <Link href="/matches">Подробнее</Link>
                  </Button>
                </CardFooter>
              </Card>
          )}

          {/* Last Match */}
          {lastMatch && (
            <Card className="overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 gpu-accelerated">
                <CardHeader className="bg-gradient-to-br from-muted to-muted/50 pb-3 pt-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-[var(--cska-gold)] text-white hover:bg-[var(--cska-gold)]/90 text-[10px] px-2 py-0.5">
                      Последний матч
                    </Badge>
                    <div className="text-right">
                      <div className="text-sm font-bold">
                        {formatShortDate(lastMatch.matchDate)}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 pb-3 px-4">
                  {/* Teams with Score */}
                  <div className="flex items-center justify-between mb-3">
                    {/* Home Team - CSKA */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted flex items-center justify-center mb-2 overflow-hidden relative">
                        {lastMatch.cskaLogoUrl ? (
                          <Image
                            {...getImageProps(lastMatch.cskaLogoUrl, "ЦСКА")}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[var(--cska-blue)] flex items-center justify-center text-white font-bold text-sm md:text-base">
                            ЖФК
                          </div>
                        )}
                      </div>
                      <span className="font-semibold text-center text-sm md:text-base mb-1">
                        ЦСКА
                      </span>
                      <div className="text-3xl md:text-4xl font-bold text-[var(--cska-blue)]">
                        {lastMatch.scoreHome ?? "-"}
                      </div>
                    </div>

                    {/* Score Separator */}
                    <div className="px-3">
                      <Trophy className="h-6 w-6 text-[var(--cska-gold)]" />
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted flex items-center justify-center mb-2 overflow-hidden relative">
                        {lastMatch.opponentLogoUrl ? (
                          <Image
                            {...getImageProps(lastMatch.opponentLogoUrl, lastMatch.opponentName)}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-base md:text-lg font-bold text-muted-foreground">
                            {lastMatch.opponentName.substring(0, 2)}
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-center text-sm md:text-base mb-1">
                        {lastMatch.opponentName}
                      </span>
                      <div className="text-3xl md:text-4xl font-bold text-muted-foreground">
                        {lastMatch.scoreAway ?? "-"}
                      </div>
                    </div>
                  </div>

                  {/* Match Info */}
                  <div className="space-y-1.5 text-xs md:text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>{formatDate(lastMatch.matchDate)}</span>
                    </div>
                    {lastMatch.venue && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>{lastMatch.venue}</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-0 pb-3 px-4">
                  <Button asChild variant="outline" size="sm" className="w-full button-hover focus-ring text-xs md:text-sm h-8 md:h-9">
                    <Link href="/matches">Смотреть обзор</Link>
                  </Button>
                </CardFooter>
              </Card>
          )}
        </div>

        {/* View All Matches Link */}
        <div className="text-center mt-6">
          <Button asChild size="default" variant="outline" className="button-hover focus-ring text-sm">
            <Link href="/matches">Все матчи</Link>
          </Button>
        </div>
      </Container>
    </section>
  )
}
