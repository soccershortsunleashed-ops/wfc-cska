"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MatchStatus } from "@prisma/client"
import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

interface MatchFiltersProps {
  tournaments: string[]
  seasons: string[]
}

export function MatchFilters({ tournaments, seasons }: MatchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const currentTournament = searchParams.get("tournament") || ""
  const currentSeason = searchParams.get("season") || ""
  const currentStatus = searchParams.get("status") || ""
  const currentOpponent = searchParams.get("opponentName") || ""
  const currentIsHome = searchParams.get("isHome") || ""

  const activeFiltersCount = [
    currentTournament,
    currentSeason,
    currentStatus,
    currentOpponent,
    currentIsHome,
  ].filter(Boolean).length

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // Сбрасываем страницу при изменении фильтров
    params.delete("page")
    
    router.push(`/matches?${params.toString()}`)
  }

  const handleClearFilters = () => {
    router.push("/matches")
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Фильтры
          {activeFiltersCount > 0 && (
            <Badge 
              variant="destructive" 
              className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Фильтры матчей</SheetTitle>
          <SheetDescription>
            Настройте фильтры для поиска нужных матчей
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Tournament Filter */}
          <div className="space-y-2">
            <Label htmlFor="tournament">Турнир</Label>
            <Select
              value={currentTournament}
              onValueChange={(value) => handleFilterChange("tournament", value)}
            >
              <SelectTrigger id="tournament">
                <SelectValue placeholder="Все турниры" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все турниры</SelectItem>
                {tournaments.map((tournament) => (
                  <SelectItem key={tournament} value={tournament}>
                    {tournament}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Season Filter */}
          <div className="space-y-2">
            <Label htmlFor="season">Сезон</Label>
            <Select
              value={currentSeason}
              onValueChange={(value) => handleFilterChange("season", value)}
            >
              <SelectTrigger id="season">
                <SelectValue placeholder="Все сезоны" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все сезоны</SelectItem>
                {seasons.map((season) => (
                  <SelectItem key={season} value={season}>
                    {season}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status">Статус</Label>
            <Select
              value={currentStatus}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все статусы</SelectItem>
                <SelectItem value={MatchStatus.SCHEDULED}>Запланирован</SelectItem>
                <SelectItem value={MatchStatus.LIVE}>В эфире</SelectItem>
                <SelectItem value={MatchStatus.FINISHED}>Завершён</SelectItem>
                <SelectItem value={MatchStatus.POSTPONED}>Отложен</SelectItem>
                <SelectItem value={MatchStatus.CANCELLED}>Отменён</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Home/Away Filter */}
          <div className="space-y-2">
            <Label htmlFor="isHome">Место проведения</Label>
            <Select
              value={currentIsHome}
              onValueChange={(value) => handleFilterChange("isHome", value)}
            >
              <SelectTrigger id="isHome">
                <SelectValue placeholder="Все матчи" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все матчи</SelectItem>
                <SelectItem value="true">Домашние</SelectItem>
                <SelectItem value="false">Выездные</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Opponent Search */}
          <div className="space-y-2">
            <Label htmlFor="opponent">Соперник</Label>
            <Input
              id="opponent"
              placeholder="Поиск по названию команды"
              value={currentOpponent}
              onChange={(e) => handleFilterChange("opponentName", e.target.value)}
            />
          </div>

          {/* Clear Filters Button */}
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleClearFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Сбросить фильтры
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
