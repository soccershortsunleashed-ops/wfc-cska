"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/layout/container"
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animated-section"
import { getImageProps, getResponsiveSizes } from "@/lib/image-utils"

interface Player {
  id: string
  slug: string
  firstName: string
  lastName: string
  number: number
  position: string
  photoUrl: string | null
}

interface TeamTeaserProps {
  players: Player[]
}

const positionLabels: Record<string, string> = {
  GOALKEEPER: "Вратарь",
  DEFENDER: "Защитник",
  MIDFIELDER: "Полузащитник",
  FORWARD: "Нападающий",
}

export function TeamTeaser({ players }: TeamTeaserProps) {
  if (!players || players.length === 0) {
    return null
  }

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <Container>
        <AnimatedSection>
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Наша команда</h2>
              <p className="text-muted-foreground">
                Познакомьтесь с игроками ЖФК ЦСКА
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden md:flex button-hover focus-ring">
              <Link href="/players">
                Весь состав
                <ArrowRight className="ml-2 h-4 w-4 icon-slide" />
              </Link>
            </Button>
          </div>
        </AnimatedSection>

        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {players.slice(0, 4).map((player) => (
            <StaggerItem key={player.id}>
              <PlayerCard player={player} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Mobile "All Players" Button */}
        <AnimatedSection delay={0.3}>
          <div className="text-center mt-8 md:hidden">
            <Button asChild variant="outline" className="w-full button-hover focus-ring">
              <Link href="/players">
                Весь состав
                <ArrowRight className="ml-2 h-4 w-4 icon-slide" />
              </Link>
            </Button>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  )
}

function PlayerCard({ player }: { player: Player }) {
  return (
    <Card className="overflow-hidden group card-hover gpu-accelerated">
      <Link href={`/players/${player.slug}`} className="focus-ring">
        <CardContent className="p-0">
          {/* Player Photo */}
          <div className="relative h-80 overflow-hidden bg-gradient-to-br from-[var(--cska-blue)] to-[var(--cska-blue)]/80">
            {player.photoUrl ? (
              <Image
                {...getImageProps(player.photoUrl, `${player.firstName} ${player.lastName}`)}
                fill
                sizes={getResponsiveSizes('playerTeaser')}
                className="object-cover image-hover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl font-bold text-white/20">
                  {player.number}
                </span>
              </div>
            )}
            
            {/* Number Badge */}
            <div className="absolute top-4 right-4">
              <Badge className="bg-[var(--cska-red)] text-white text-2xl font-bold px-4 py-2 hover:bg-[var(--cska-red)]/90">
                {player.number}
              </Badge>
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>

          {/* Player Info */}
          <div className="p-6 bg-card">
            <h3 className="text-xl font-bold mb-1 color-transition group-hover:text-[var(--cska-blue)]">
              {player.firstName}
            </h3>
            <h3 className="text-xl font-bold mb-2 color-transition group-hover:text-[var(--cska-blue)]">
              {player.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">
              {positionLabels[player.position] || player.position}
            </p>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
