import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:../dev.db'
})

const prisma = new PrismaClient({ adapter })

async function checkDB() {
  try {
    const all = await prisma.standingsTeam.findMany({ take: 5 })
    console.log('Первые 5 записей:')
    console.log(JSON.stringify(all, null, 2))
    
    const count = await prisma.standingsTeam.count()
    console.log(`\nВсего записей: ${count}`)
    
    const seasons = await prisma.standingsTeam.groupBy({
      by: ['season'],
      _count: true
    })
    console.log('\nСезоны в базе:')
    seasons.forEach(s => console.log(`  ${s.season}: ${s._count} записей`))
    
  } catch (error) {
    console.error('Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDB()
