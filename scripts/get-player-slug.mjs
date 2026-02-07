#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

const player = await prisma.player.findFirst({
  where: {
    rustatId: { not: null },
    stats: {
      goals: { gt: 0 }
    }
  },
  include: {
    stats: true
  },
  orderBy: {
    number: 'asc'
  }
})

if (player) {
  console.log(`\nИгрок: ${player.firstName} ${player.lastName} (#${player.number})`)
  console.log(`Slug: ${player.slug}`)
  console.log(`URL: http://localhost:3000/players/${player.slug}`)
  if (player.stats) {
    console.log(`Статистика: ${player.stats.goals} голов, ${player.stats.assists} ассистов`)
  }
  console.log()
}

await prisma.$disconnect()
