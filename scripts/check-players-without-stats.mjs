#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🔍 Поиск игроков без синхронизированной статистики\n')

  const players = await prisma.player.findMany({
    where: {
      team: 'MAIN',
      leftClub: false,
      rustatId: { not: null }
    },
    include: {
      stats: true
    },
    orderBy: {
      lastName: 'asc'
    }
  })

  const withoutSyncedStats = players.filter(p => 
    !p.stats || !p.stats.rustatSynced
  )

  console.log(`📊 Игроков без синхронизированной статистики: ${withoutSyncedStats.length}\n`)

  for (const player of withoutSyncedStats) {
    console.log(`📋 ${player.firstName} ${player.lastName}`)
    console.log(`   Номер: ${player.number}`)
    console.log(`   RuStat ID: ${player.rustatId}`)
    console.log(`   Статистика: ${player.stats ? 'есть (не синхронизирована)' : 'отсутствует'}`)
    if (player.stats) {
      console.log(`   Матчи: ${player.stats.gamesPlayed}, Голы: ${player.stats.goals}`)
    }
    console.log()
  }

  if (withoutSyncedStats.length > 0) {
    console.log('💡 Для синхронизации запустите:')
    for (const player of withoutSyncedStats) {
      console.log(`   node scripts/sync-single-player.mjs ${player.rustatId}`)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
