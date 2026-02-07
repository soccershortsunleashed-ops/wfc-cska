#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const match = await prisma.match.findFirst({
    where: {
      rustatSynced: true,
    },
  })

  if (match) {
    console.log('✅ Найден матч с RuStat данными:')
    console.log(`   Slug: ${match.slug}`)
    console.log(`   Opponent: ${match.opponentName}`)
    console.log(`   Date: ${match.matchDate}`)
    console.log(`   URL: http://localhost:3000/matches/${match.slug}`)
  } else {
    console.log('❌ Матчей с RuStat данными не найдено')
  }

  await prisma.$disconnect()
}

main().catch(console.error)
