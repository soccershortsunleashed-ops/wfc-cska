"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Player, Position } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { getImageProps, getResponsiveSizes } from "@/lib/image-utils"

interface PlayerCardProps {
  player: Player
  onClick?: (player: Player) => void
}

export function PlayerCard({ player, onClick }: PlayerCardProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <Link href={`/players/${player.slug}`} className="block">
      <Card
        className="group overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        role="article"
        aria-label={`Карточка игрока ${player.firstName} ${player.lastName}`}
      >
      <CardContent className="p-0">
        {/* Photo Section */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
          {player.photoUrl && !imageError ? (
            <Image
              {...getImageProps(player.photoUrl, `${player.firstName} ${player.lastName}`)}
              fill
              sizes={getResponsiveSizes('playerCard')}
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-8xl font-bold text-muted-foreground/10 transition-all duration-300 group-hover:scale-110">
                {player.number}
              </span>
            </div>
          )}

          {/* Number Badge */}
          <div className="absolute top-4 left-4 bg-primary text-primary-foreground rounded-full w-14 h-14 flex items-center justify-center font-bold text-2xl shadow-lg transition-transform duration-300 group-hover:scale-110">
            {player.number}
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Info Section */}
        <div className="p-4 space-y-1">
          <h3 className="font-bold text-lg leading-tight line-clamp-2">
            {player.firstName} {player.lastName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {getPositionLabel(player.position)}
          </p>
        </div>
      </CardContent>
    </Card>
    </Link>
  )
}

function getPositionLabel(position: Position): string {
  const labels: Record<Position, string> = {
    GOALKEEPER: "Вратарь",
    DEFENDER: "Защитник",
    MIDFIELDER: "Полузащитник",
    FORWARD: "Нападающий",
  }
  return labels[position]
}
