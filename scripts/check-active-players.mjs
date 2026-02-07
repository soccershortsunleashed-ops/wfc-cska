#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🔍 Проверка активных игроков основного состава\n')

  const players = await prisma.player.findMany({
    where: {
      team: 'MAIN',
      leftClub: false
    },
    include: {
      stats: true
    },
    orderBy: {
      lastName: 'asc'
    }
  })

  console.log(`📊 Всего активных игроков: ${players.length}\n`)

  const withPhoto = players.filter(p => p.photoUrl)
  const withRustat = players.filter(p => p.rustatId)
  const withStats = players.filter(p => p.stats && p.stats.rustatSynced)

  console.log(`📷 С фотографиями: ${withPhoto.length}`)
  console.log(`🔗 С RuStat ID: ${withRustat.length}`)
  console.log(`📊 Со статистикой: ${withStats.length}\n`)

  console.log('📋 Список игроков:\n')

  for (const player of players) {
    const photo = player.photoUrl ? '📷' : '  '
    const rustat = player.rustatId ? '🔗' : '  '
    const stats = player.stats?.rustatSynced ? '📊' : '  '
    const games = player.stats?.gamesPlayed || 0
    const goals = player.stats?.goals || 0

    console.log(`${photo}${rustat}${stats} №${player.number.toString().padStart(2)} ${player.firstName} ${player.lastName} - ${games} матчей, ${goals} голов`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
