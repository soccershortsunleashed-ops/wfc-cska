import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:../dev.db'
})

const prisma = new PrismaClient({ adapter })

async function checkTournament() {
  try {
    const team = await prisma.standingsTeam.findFirst({
      where: { season: '2025' }
    })
    
    if (team) {
      console.log('Название турнира в базе:')
      console.log(`  Строка: "${team.tournament}"`)
      console.log(`  Длина: ${team.tournament.length}`)
      console.log(`  Байты: ${Buffer.from(team.tournament, 'utf-8').toString('hex')}`)
      console.log()
      console.log('Ожидаемое название:')
      console.log(`  Строка: "Суперлига"`)
      console.log(`  Длина: ${'Суперлига'.length}`)
      console.log(`  Байты: ${Buffer.from('Суперлига', 'utf-8').toString('hex')}`)
    }
    
  } catch (error) {
    console.error('Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTournament()
