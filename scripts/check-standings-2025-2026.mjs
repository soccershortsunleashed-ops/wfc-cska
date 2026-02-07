import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:../dev.db'
})

const prisma = new PrismaClient({ adapter })

async function checkStandings() {
  console.log('🔍 Проверка данных турнирной таблицы...\n')

  try {
    // Проверяем 2026 (новый сезон)
    console.log('=== Сезон 2026 ===')
    const standings2026 = await prisma.standingsTeam.findMany({
      where: {
        season: '2026',
        tournament: 'Суперлига'
      },
      orderBy: {
        position: 'asc'
      }
    })

    console.log(`📊 Найдено записей: ${standings2026.length}`)
    if (standings2026.length > 0) {
      console.log('Топ-3 команды:')
      standings2026.slice(0, 3).forEach(team => {
        console.log(`${team.position}. ${team.teamName}: И${team.played} В${team.won} Н${team.drawn} П${team.lost} ${team.goalsFor}:${team.goalsAgainst} О${team.points}`)
      })
    }

    // Проверяем 2025
    console.log('\n=== Сезон 2025 ===')
    const standings2025 = await prisma.standingsTeam.findMany({
      where: {
        season: '2025',
        tournament: 'Суперлига'
      },
      orderBy: {
        position: 'asc'
      }
    })

    console.log(`📊 Найдено записей: ${standings2025.length}`)
    if (standings2025.length > 0) {
      console.log('Топ-3 команды:')
      standings2025.slice(0, 3).forEach(team => {
        console.log(`${team.position}. ${team.teamName}: И${team.played} В${team.won} Н${team.drawn} П${team.lost} ${team.goalsFor}:${team.goalsAgainst} О${team.points}`)
      })
    }

  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkStandings()
