import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, MapPin, Ruler, Weight } from 'lucide-react'
import { playersService } from '@/lib/services/players.service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlayerStats } from '@/components/players/player-stats'

interface PlayerPageProps {
  params: Promise<{
    slug: string
  }>
}

const positionLabels: Record<string, string> = {
  GOALKEEPER: 'Вратарь',
  DEFENDER: 'Защитник',
  MIDFIELDER: 'Полузащитник',
  FORWARD: 'Нападающий',
}

const teamLabels: Record<string, string> = {
  MAIN: 'Основной состав',
  YOUTH: 'Молодёжный состав',
  JUNIOR: 'Юниорский состав',
}

function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  const { slug } = await params
  const player = await playersService.getBySlug(slug)

  if (!player) {
    return {
      title: 'Игрок не найден',
    }
  }

  const fullName = `${player.firstName} ${player.lastName}`
  const position = positionLabels[player.position]

  return {
    title: `${fullName} - ${position} | ЖФК ЦСКА`,
    description: `${fullName}, ${position}, номер ${player.number}. Подробная информация об игроке ЖФК ЦСКА.`,
    openGraph: {
      title: `${fullName} - ${position}`,
      description: `${fullName}, ${position}, номер ${player.number}`,
      images: player.photoUrl ? [{ url: player.photoUrl }] : [],
      type: 'profile',
    },
  }
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { slug } = await params
  const player = await playersService.getBySlug(slug)

  if (!player) {
    notFound()
  }

  const fullName = `${player.firstName} ${player.lastName}`
  const age = calculateAge(player.birthDate)

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/players">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Назад к составу
          </Button>
        </Link>
      </div>

      {/* Player Header */}
      <div className="grid md:grid-cols-[300px_1fr] gap-8 mb-8">
        {/* Player Photo */}
        <div className="relative aspect-[3/4] w-full max-w-[300px] mx-auto md:mx-0 rounded-lg overflow-hidden bg-muted">
          {player.photoUrl ? (
            <Image
              src={player.photoUrl}
              alt={fullName}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 300px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-muted-foreground">
              {player.number}
            </div>
          )}
        </div>

        {/* Player Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-5xl font-bold text-primary">{player.number}</div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">{fullName}</h1>
                <p className="text-xl text-muted-foreground">{positionLabels[player.position]}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{teamLabels[player.team]}</p>
          </div>

          {/* Player Details Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Возраст</p>
                    <p className="text-lg font-semibold">{age} лет</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Дата рождения</p>
                    <p className="text-lg font-semibold">{formatDate(player.birthDate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Гражданство</p>
                    <p className="text-lg font-semibold">{player.nationality}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {player.heightCm && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Ruler className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Рост</p>
                      <p className="text-lg font-semibold">{player.heightCm} см</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {player.weightKg && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Weight className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Вес</p>
                      <p className="text-lg font-semibold">{player.weightKg} кг</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <PlayerStats stats={player.stats} position={player.position} />
    </div>
  )
}
