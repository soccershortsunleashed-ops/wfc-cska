#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

const stats = await prisma.playerStats.findMany({
  where: { rustatSynced: true },
  include: {
    player: {
      select: { firstName: true, lastName: true, number: true }
    }
  },
  orderBy: { goals: 'desc' }
})

console.log('\n📊 Все игроки с синхронизированной статистикой:\n')
stats.forEach((s, i) => {
  const name = `${s.player.firstName} ${s.player.lastName}`
  console.log(
    `${(i + 1).toString().padStart(2)}. ${name.padEnd(25)} (#${s.player.number.toString().padStart(2)}) - ` +
    `${s.goals} голов, ${s.assists} ассистов, ${s.gamesPlayed} матчей`
  )
})

console.log(`\n✅ Всего синхронизировано: ${stats.length} игроков\n`)

await prisma.$disconnect()
