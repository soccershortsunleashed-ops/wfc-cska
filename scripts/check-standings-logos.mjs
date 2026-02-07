import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:../dev.db'
})
const prisma = new PrismaClient({ adapter })

async function checkStandingsLogos() {
  console.log('🔍 Проверка логотипов в турнирной таблице...\n')

  try {
    // Получить данные за сезон 2025
    const standings = await prisma.standingsTeam.findMany({
      where: {
        season: '2025'
      },
      orderBy: {
        position: 'asc'
      }
    })

    console.log(`📊 Найдено команд в сезоне 2025: ${standings.length}\n`)

    let withLogos = 0
    let withoutLogos = 0

    standings.forEach(team => {
      const hasLogo = team.teamLogoUrl ? '✅' : '❌'
      if (team.teamLogoUrl) {
        withLogos++
      } else {
        withoutLogos++
      }
      
      console.log(`${hasLogo} ${team.position}. ${team.teamName}`)
      if (team.teamLogoUrl) {
        console.log(`   Логотип: ${team.teamLogoUrl}`)
      }
    })

    console.log(`\n📈 Статистика:`)
    console.log(`   С логотипами: ${withLogos}`)
    console.log(`   Без логотипов: ${withoutLogos}`)

  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkStandingsLogos()
