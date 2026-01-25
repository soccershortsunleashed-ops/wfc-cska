import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { playersService } from '@/lib/services/players.service'
import { Button } from '@/components/ui/button'
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
    <div className="min-h-screen bg-gradient-to-br from-[var(--cska-blue)] via-[#002080] to-[#001440]">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/players">
            <Button variant="ghost" className="gap-2 text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" />
              Назад к составу
            </Button>
          </Link>
        </div>

        {/* Player Header */}
        <div className="relative">
          {/* Content */}
          <div className="relative grid md:grid-cols-[300px_1fr] gap-8 mb-8">
            {/* Player Photo */}
            <div className="relative aspect-[3/4] w-full max-w-[300px] mx-auto md:mx-0 rounded-lg overflow-hidden bg-black/20 backdrop-blur-sm border-2 border-white/10">
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
                <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-white/50">
                  {player.number}
                </div>
              )}
            </div>

            {/* Player Info */}
            <div className="space-y-6 text-white">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-5xl font-bold text-white">{player.number}</div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">{fullName}</h1>
                    <p className="text-xl text-white/70">{positionLabels[player.position]}</p>
                  </div>
                </div>
                <p className="text-sm text-white/60 mt-2">{teamLabels[player.team]}</p>
              </div>

              {/* Player Details - Simplified */}
              <div className="grid grid-cols-2 gap-4 text-sm bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div>
                  <p className="text-white/60 mb-1">Рост</p>
                  <p className="font-semibold text-white">{player.heightCm ? `${player.heightCm} см` : '—'}</p>
                </div>
                <div>
                  <p className="text-white/60 mb-1">Вес</p>
                  <p className="font-semibold text-white">{player.weightKg ? `${player.weightKg} кг` : '—'}</p>
                </div>
                <div>
                  <p className="text-white/60 mb-1">Дата рождения</p>
                  <p className="font-semibold text-white">{formatDate(player.birthDate)}</p>
                </div>
                <div>
                  <p className="text-white/60 mb-1">Гражданство</p>
                  <p className="font-semibold text-white">{player.nationality}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="relative">
          <PlayerStats stats={player.stats} position={player.position} />
        </div>
      </div>
    </div>
  )
}
