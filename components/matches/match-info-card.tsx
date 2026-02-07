'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, Video } from 'lucide-react'
import type { RustatMatchInfo } from '@/lib/types/rustat.types'

interface MatchInfoCardProps {
  info: RustatMatchInfo
}

/**
 * Компонент с основной информацией о матче
 */
export function MatchInfoCard({ info }: MatchInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Информация о матче</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Счет */}
        <div className="flex items-center justify-center gap-8 py-6">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">
              {info.team1.name_rus}
            </div>
            <div className="text-5xl font-bold">{info.team1.score}</div>
          </div>
          <div className="text-2xl text-muted-foreground">:</div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">
              {info.team2.name_rus}
            </div>
            <div className="text-5xl font-bold">{info.team2.score}</div>
          </div>
        </div>

        {/* Детали */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Дата:</span>
            <span className="font-medium">{info.date}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Турнир:</span>
            <span className="font-medium">{info.tournament.name_rus}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Статус:</span>
            <Badge variant={info.status_id === 5 ? 'default' : 'secondary'}>
              {getStatusLabel(info.status_id)}
            </Badge>
          </div>

          {info.has_video && (
            <div className="flex items-center gap-3 text-sm">
              <Video className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Видео:</span>
              <Badge variant="outline" className="gap-1">
                <Video className="w-3 h-3" />
                Доступно
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function getStatusLabel(statusId: number): string {
  const statuses: Record<number, string> = {
    1: 'Запланирован',
    2: 'Идет',
    3: 'Перерыв',
    4: 'Отложен',
    5: 'Завершен',
    6: 'Отменен',
  }

  return statuses[statusId] || 'Неизвестно'
}
