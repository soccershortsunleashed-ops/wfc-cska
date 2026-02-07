import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

const match = await prisma.match.findFirst({
  where: {
    rustatId: { not: null }
  }
})

if (match) {
  console.log('Match ID:', match.id)
  console.log('Slug:', match.slug)
  console.log('RuStat ID:', match.rustatId)
  console.log('Opponent:', match.opponentName)
  console.log('Date:', match.matchDate.toLocaleDateString('ru-RU'))
}

await prisma.$disconnect()
