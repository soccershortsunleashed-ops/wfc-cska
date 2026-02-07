#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const matches = await prisma.match.findMany({
    where: {
      matchDate: {
        gte: new Date('2025-01-01'),
        lte: new Date('2026-01-29')
      },
      status: 'FINISHED'
    },
    orderBy: { matchDate: 'asc' }
  })

  console.log('\n📅 Завершенные матчи с 01.01.2025 по 29.01.2026:\n')
  console.log(`Всего: ${matches.length}\n`)
  
  matches.forEach(m => {
    const date = new Date(m.matchDate).toLocaleDateString('ru-RU')
    const opponent = m.opponentName || 'vs ?'
    const score = `${m.scoreHome}:${m.scoreAway}`
    const rustatId = m.rustatId || 'нет'
    console.log(`${date} - ${opponent} (${score}) - RuStat ID: ${rustatId}`)
  })
  
  console.log()
}

main()
  .finally(() => prisma.$disconnect())
