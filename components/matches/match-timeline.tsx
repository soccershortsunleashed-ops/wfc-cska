"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Goal, AlertCircle, ArrowRightLeft, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export interface MatchEvent {
  id: string
  minute: number
  type: "goal" | "yellow_card" | "red_card" | "substitution" | "penalty"
  team: "home" | "away"
  playerName: string
  assistPlayerName?: string
  description?: string
}

interface MatchTimelineProps {
  events: MatchEvent[]
  homeTeam: string
  awayTeam: string
}

export function MatchTimeline({ events, homeTeam, awayTeam }: MatchTimelineProps) {
  const getEventIcon = (type: MatchEvent["type"]) => {
    switch (type) {
      case "goal":
        return <Goal className="h-5 w-5" />
      case "yellow_card":
        return <div className="w-3 h-4 bg-yellow-500 rounded-sm" />
      case "red_card":
        return <div className="w-3 h-4 bg-red-500 rounded-sm" />
      case "substitution":
        return <ArrowRightLeft className="h-5 w-5" />
      case "penalty":
        return <Goal className="h-5 w-5" />
    }
  }

  const getEventLabel = (type: MatchEvent["type"]) => {
    switch (type) {
      case "goal":
        return "Гол"
      case "yellow_card":
        return "Жёлтая карточка"
      case "red_card":
        return "Красная карточка"
      case "substitution":
        return "Замена"
      case "penalty":
        return "Пенальти"
    }
  }

  const getEventColor = (type: MatchEvent["type"]) => {
    switch (type) {
      case "goal":
      case "penalty":
        return "text-green-600 dark:text-green-400"
      case "yellow_card":
        return "text-yellow-600 dark:text-yellow-400"
      case "red_card":
        return "text-red-600 dark:text-red-400"
      case "substitution":
        return "text-blue-600 dark:text-blue-400"
    }
  }

  // Сортируем события по минутам
  const sortedEvents = [...events].sort((a, b) => a.minute - b.minute)

  if (sortedEvents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[var(--cska-blue)]" />
            Хронология матча
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            События матча пока не добавлены
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-[var(--cska-blue)]" />
          Хронология матча
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedEvents.map((event, index) => {
            const isHomeTeam = event.team === "home"
            
            return (
              <div
                key={event.id}
                className={cn(
                  "flex items-start gap-4 pb-4",
                  index !== sortedEvents.length - 1 && "border-b"
                )}
              >
                {/* Минута */}
                <div className="flex-shrink-0 w-12 text-center">
                  <Badge variant="outline" className="font-mono">
                    {event.minute}'
                  </Badge>
                </div>

                {/* Иконка события */}
                <div
                  className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                    getEventColor(event.type),
                    "bg-muted"
                  )}
                >
                  {getEventIcon(event.type)}
                </div>

                {/* Детали события */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{getEventLabel(event.type)}</span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        isHomeTeam
                          ? "bg-[var(--cska-blue)]/10 text-[var(--cska-blue)]"
                          : "bg-muted"
                      )}
                    >
                      {isHomeTeam ? homeTeam : awayTeam}
                    </Badge>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">{event.playerName}</span>
                    {event.assistPlayerName && (
                      <span className="text-muted-foreground">
                        {" "}
                        (ассист: {event.assistPlayerName})
                      </span>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
