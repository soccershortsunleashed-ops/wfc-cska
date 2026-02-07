import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:../dev.db'
})

const prisma = new PrismaClient({ adapter })

async function checkSeason() {
  try {
    console.log('Проверка сезона 2025...\n')
    
    const standings = await prisma.standingsTeam.findMany({
      where: {
        season: '2025'
      },
      orderBy: {
        position: 'asc'
      }
    })

    console.log(`Найдено записей: ${standings.length}\n`)
    
    standings.forEach(team => {
      console.log(`${team.position}. ${team.teamName}`)
      console.log(`   Турнир: ${team.tournament}`)
      console.log(`   И${team.played} В${team.won} Н${team.drawn} П${team.lost} ${team.goalsFor}:${team.goalsAgainst} О${team.points}`)
      console.log()
    })
    
  } catch (error) {
    console.error('Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSeason()
