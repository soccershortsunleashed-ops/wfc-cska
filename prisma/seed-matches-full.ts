import { MatchStatus } from '@prisma/client'
import prisma from '../lib/db/prisma'
import fs from 'fs'
import path from 'path'

interface MatchData {
  slug: string
  status: string
  opponentName: string
  opponentLogoUrl: string
  cskaLogoUrl: string
  isHome: boolean
  matchDate: string
  venue: string
  stadium: string
  tournament: string
  season: string
  round: string | null
  scoreHome: number | null
  scoreAway: number | null
  attendance: number | null
  referee: string | null
  highlights: string | null
  description: string | null
}

async function main() {
  console.log('🚀 Начинаем загрузку матчей в базу данных...\n')

  // Читаем данные из файла
  const matchesPath = path.join(__dirname, '../seed/matches-full.json')
  const matchesData = fs.readFileSync(matchesPath, 'utf8')
  const matches: MatchData[] = JSON.parse(matchesData)

  console.log(`📊 Найдено ${matches.length} матчей\n`)

  // Удаляем все существующие матчи
  console.log('🗑️  Очистка существующих матчей...')
  await prisma.match.deleteMany({})
  console.log('✅ Очистка завершена\n')

  // Загружаем матчи
  let createdCount = 0
  let errorCount = 0

  for (const match of matches) {
    try {
      await prisma.match.create({
        data: {
          slug: match.slug,
          type: match.status === 'SCHEDULED' ? 'UPCOMING' : 'LAST',
          status: match.status as MatchStatus,
          opponentName: match.opponentName,
          opponentLogoUrl: match.opponentLogoUrl,
          cskaLogoUrl: match.cskaLogoUrl,
          isHome: match.isHome,
          matchDate: new Date(match.matchDate),
          venue: match.venue,
          stadium: match.stadium,
          tournament: match.tournament,
          season: match.season,
          round: match.round,
          scoreHome: match.scoreHome,
          scoreAway: match.scoreAway,
          attendance: match.attendance,
          referee: match.referee,
          highlights: match.highlights,
          description: match.description,
        },
      })
      
      const statusEmoji = match.status === 'FINISHED' ? '✅' : '📅'
      const scoreInfo = match.scoreHome !== null ? `${match.scoreHome}:${match.scoreAway}` : '—:—'
      console.log(`${statusEmoji} ${match.opponentName} ${scoreInfo} (${match.season})`)
      createdCount++
    } catch (error) {
      console.error(`❌ Ошибка при создании матча ${match.slug}:`, error)
      errorCount++
    }
  }

  console.log(`\n📊 Статистика:`)
  console.log(`   Создано: ${createdCount}`)
  console.log(`   Ошибок: ${errorCount}`)

  // Группируем по сезонам
  const bySeason: Record<string, number> = {}
  const allMatches = await prisma.match.findMany()
  allMatches.forEach(m => {
    if (!bySeason[m.season]) bySeason[m.season] = 0
    bySeason[m.season]++
  })

  console.log(`\n📅 По сезонам:`)
  Object.keys(bySeason).sort().forEach(season => {
    console.log(`   ${season}: ${bySeason[season]} матчей`)
  })

  console.log('\n✅ Загрузка завершена!')
}

main()
  .catch((e) => {
    console.error('❌ ОШИБКА:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
