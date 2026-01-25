"use client"

import { Player, Position } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Flag, Ruler, Weight, ArrowRight } from "lucide-react"
import { getImageProps, getResponsiveSizes } from "@/lib/image-utils"

interface PlayerModalProps {
  player: Player | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlayerModal({ player, open, onOpenChange }: PlayerModalProps) {
  const [imageError, setImageError] = useState(false)

  if (!player) return null

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date))
  }

  const calculateAge = (birthDate: Date) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">
            Информация об игроке {player.firstName} {player.lastName}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Подробная информация о игроке номер {player.number}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          {/* Фото игрока */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gradient-to-br from-muted to-muted/50">
            {player.photoUrl && !imageError ? (
              <Image
                {...getImageProps(player.photoUrl, `${player.firstName} ${player.lastName}`, { priority: true })}
                fill
                sizes={getResponsiveSizes('playerModal')}
                className="object-cover"
                onError={() => setImageError(true)}
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-9xl font-bold text-muted-foreground/10">
                  {player.number}
                </span>
              </div>
            )}

            {/* Номер игрока */}
            <div className="absolute top-4 left-4 bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center font-bold text-3xl shadow-lg">
              {player.number}
            </div>

            {/* Позиция */}
            <div className="absolute bottom-4 left-4 right-4">
              <Badge variant="secondary" className="w-full justify-center py-2 text-sm font-semibold">
                {getPositionLabel(player.position)}
              </Badge>
            </div>
          </div>

          {/* Информация об игроке */}
          <div className="space-y-6">
            {/* ФИО */}
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                {player.firstName}
              </h2>
              <h3 className="text-3xl font-bold tracking-tight text-primary">
                {player.lastName}
              </h3>
            </div>

            {/* Основная информация */}
            <div className="grid gap-4">
              {/* Дата рождения и возраст */}
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Дата рождения
                  </p>
                  <p className="text-base font-semibold">
                    {formatDate(player.birthDate)} ({calculateAge(player.birthDate)} лет)
                  </p>
                </div>
              </div>

              {/* Гражданство */}
              <div className="flex items-start gap-3">
                <Flag className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Гражданство
                  </p>
                  <p className="text-base font-semibold">{player.nationality}</p>
                </div>
              </div>

              {/* Рост и вес */}
              {(player.heightCm || player.weightKg) && (
                <div className="grid grid-cols-2 gap-4">
                  {player.heightCm && (
                    <div className="flex items-start gap-3">
                      <Ruler className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Рост
                        </p>
                        <p className="text-base font-semibold">
                          {player.heightCm} см
                        </p>
                      </div>
                    </div>
                  )}

                  {player.weightKg && (
                    <div className="flex items-start gap-3">
                      <Weight className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Вес
                        </p>
                        <p className="text-base font-semibold">
                          {player.weightKg} кг
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Команда */}
              <div className="pt-2">
                <Badge variant="outline" className="text-sm">
                  {getTeamLabel(player.team)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Footer с кнопками */}
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-initial"
          >
            Закрыть
          </Button>
          <Button asChild className="flex-1 sm:flex-initial group">
            <Link href={`/players/${player.slug}`}>
              Открыть профиль
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

function getTeamLabel(team: string): string {
  const labels: Record<string, string> = {
    MAIN: "Основной состав",
    YOUTH: "Молодежная команда",
    JUNIOR: "Юниорская команда",
  }
  return labels[team] || team
}
