import { playersService } from "@/lib/services/players.service"
import { PlayersCarousel } from "@/components/players"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export async function TeamCarouselSection() {
  // Получаем первых 12 игроков основного состава
  const players = await playersService.list({
    team: "MAIN",
    sort: "number",
  })

  const featuredPlayers = players.slice(0, 12)

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 md:mb-12 px-8 md:px-12 lg:px-16">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Наша команда
            </h2>
            <p className="text-muted-foreground mt-2 text-lg">
              Познакомьтесь с игроками основного состава
            </p>
          </div>

          <Button asChild variant="outline" size="lg" className="group">
            <Link href="/players">
              Все игроки
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Carousel */}
        <div className="px-8 md:px-12 lg:px-16">
          <PlayersCarousel players={featuredPlayers} />
        </div>
      </div>
    </section>
  )
}
