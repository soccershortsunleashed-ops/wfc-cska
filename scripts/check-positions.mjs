import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Проверка позиций игроков основного состава:\n')
  
  const players = await prisma.player.findMany({
    where: { team: 'MAIN' },
    select: {
      firstName: true,
      lastName: true,
      number: true,
      position: true,
    },
    orderBy: [
      { position: 'asc' },
      { number: 'asc' }
    ]
  })
  
  console.log(`Всего игроков основного состава: ${players.length}\n`)
  
  const byPosition = {
    GOALKEEPER: [],
    DEFENDER: [],
    MIDFIELDER: [],
    FORWARD: []
  }
  
  players.forEach(p => {
    byPosition[p.position].push(p)
  })
  
  console.log('По позициям:')
  console.log(`GOALKEEPER (Вратари): ${byPosition.GOALKEEPER.length}`)
  byPosition.GOALKEEPER.forEach(p => console.log(`  ${p.number}. ${p.firstName} ${p.lastName}`))
  
  console.log(`\nDEFENDER (Защитники): ${byPosition.DEFENDER.length}`)
  byPosition.DEFENDER.forEach(p => console.log(`  ${p.number}. ${p.firstName} ${p.lastName}`))
  
  console.log(`\nMIDFIELDER (Полузащитники): ${byPosition.MIDFIELDER.length}`)
  byPosition.MIDFIELDER.forEach(p => console.log(`  ${p.number}. ${p.firstName} ${p.lastName}`))
  
  console.log(`\nFORWARD (Нападающие): ${byPosition.FORWARD.length}`)
  byPosition.FORWARD.forEach(p => console.log(`  ${p.number}. ${p.firstName} ${p.lastName}`))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
