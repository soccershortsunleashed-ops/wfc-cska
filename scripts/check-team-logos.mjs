import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:../dev.db'
})

const prisma = new PrismaClient({ adapter })

async function checkLogos() {
  try {
    console.log('🔍 Проверка логотипов команд...\n')
    
    // Получаем уникальные команды из матчей с логотипами
    const matches = await prisma.match.findMany({
      where: {
        opponentLogoUrl: { not: null }
      },
      select: {
        opponentName: true,
        opponentLogoUrl: true
      },
      distinct: ['opponentName']
    })
    
    console.log(`Найдено ${matches.length} команд с логотипами в матчах:\n`)
    
    matches.forEach(match => {
      console.log(`${match.opponentName}: ${match.opponentLogoUrl}`)
    })
    
    // Проверяем логотипы в турнирной таблице
    console.log('\n\n🔍 Логотипы в турнирной таблице:\n')
    
    const standings = await prisma.standingsTeam.findMany({
      where: {
        season: '2025',
        tournament: 'Суперлига'
      },
      select: {
        teamName: true,
        teamLogoUrl: true
      },
      orderBy: {
        position: 'asc'
      }
    })
    
    standings.forEach(team => {
      console.log(`${team.teamName}: ${team.teamLogoUrl || 'НЕТ ЛОГОТИПА'}`)
    })
    
  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkLogos()
