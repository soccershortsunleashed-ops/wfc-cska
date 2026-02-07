import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:../dev.db'
})
const prisma = new PrismaClient({ adapter })

async function checkMatches() {
  console.log('🔍 Проверка матчей в базе данных...\n')

  try {
    // Получаем все матчи
    const allMatches = await prisma.match.findMany({
      orderBy: { matchDate: 'desc' },
      take: 10
    })

    console.log(`📊 Всего матчей в БД: ${await prisma.match.count()}`)
    console.log(`\n📋 Последние 10 матчей:\n`)

    allMatches.forEach(match => {
      console.log(`⚽ ${match.opponentName}`)
      console.log(`   Дата: ${match.matchDate}`)
      console.log(`   Турнир: ${match.tournament || 'НЕ УКАЗАН'}`)
      console.log(`   Сезон: ${match.season}`)
      console.log(`   Статус: ${match.status}`)
      console.log(`   Счет: ${match.scoreHome ?? '-'} : ${match.scoreAway ?? '-'}`)
      console.log(`   Дома: ${match.isHome ? 'Да' : 'Нет'}`)
      console.log('')
    })

    // Проверяем завершенные матчи
    const finishedMatches = await prisma.match.count({
      where: {
        status: 'FINISHED',
        scoreHome: { not: null },
        scoreAway: { not: null }
      }
    })

    console.log(`✅ Завершенных матчей со счетом: ${finishedMatches}`)

    // Проверяем матчи по турнирам
    const matchesByTournament = await prisma.match.groupBy({
      by: ['tournament'],
      _count: true,
      orderBy: {
        _count: {
          tournament: 'desc'
        }
      }
    })

    console.log(`\n📊 Матчи по турнирам:`)
    matchesByTournament.forEach(t => {
      console.log(`   ${t.tournament || 'БЕЗ ТУРНИРА'}: ${t._count} матчей`)
    })

    // Проверяем матчи по сезонам
    const matchesBySeason = await prisma.match.groupBy({
      by: ['season'],
      _count: true,
      orderBy: {
        season: 'desc'
      }
    })

    console.log(`\n📊 Матчи по сезонам:`)
    matchesBySeason.forEach(s => {
      console.log(`   ${s.season}: ${s._count} матчей`)
    })

  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkMatches()
