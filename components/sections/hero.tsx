import Link from "next/link"
import { Calendar, MapPin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface HeroProps {
  upcomingMatch?: {
    opponentName: string
    matchDate: string
    venue: string | null
  } | null
}

export function Hero({ upcomingMatch }: HeroProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2000')",
          }}
        />
      </div>

      {/* Content */}
      <div className="container relative z-20 px-4 md:px-6">
        <div className="max-w-3xl">
          {/* Badge */}
          <Badge
            variant="secondary"
            className="mb-6 bg-[var(--cska-red)] text-white hover:bg-[var(--cska-red)]/90 text-sm px-4 py-2"
          >
            Сезон 2025/2026
          </Badge>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Женский футбольный клуб{" "}
            <span className="text-[var(--cska-red)]">ЦСКА</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl">
            Сила, страсть и командный дух. Следите за нашими матчами, 
            поддерживайте команду и будьте частью истории.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-12">
            <Button
              asChild
              size="lg"
              className="bg-[var(--cska-blue)] hover:bg-[var(--cska-blue)]/90 text-white button-hover focus-ring"
            >
              <Link href="/matches">
                Матчи
                <ArrowRight className="ml-2 h-5 w-5 icon-slide" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-[var(--cska-blue)] button-hover focus-ring"
            >
              <Link href="/players">Команда</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-white/60 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-[var(--cska-blue)] button-hover focus-ring"
            >
              <Link href="/news">Новости</Link>
            </Button>
          </div>

          {/* Upcoming Match Info */}
          {upcomingMatch && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 max-w-md">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-[var(--cska-red)] animate-pulse" />
                <span className="text-sm font-semibold text-white uppercase tracking-wide">
                  Ближайший матч
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                ЦСКА vs {upcomingMatch.opponentName}
              </h3>
              <div className="space-y-2 text-gray-200">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {formatDate(upcomingMatch.matchDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{upcomingMatch.venue || "Место уточняется"}</span>
                </div>
              </div>
              <Button
                asChild
                className="w-full mt-4 bg-[var(--cska-red)] hover:bg-[var(--cska-red)]/90 text-white button-hover focus-ring"
              >
                <Link href="/matches">Подробнее</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  )
}
