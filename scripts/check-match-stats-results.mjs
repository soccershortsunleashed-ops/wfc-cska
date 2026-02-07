#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

console.log('📊 Проверка результатов синхронизации детальной статистики\n')

// 1. Общая статистика
const totalStats = await prisma.playerMatchStats.count()
console.log(`✅ Всего записей статистики матчей: ${totalStats}\n`)

// 2. Статистика по игрокам
const statsByPlayer = await prisma.playerMatchStats.groupBy({
  by: ['playerId'],
  _count: { id: true }
})

console.log(`Игроков со статистикой: ${statsByPlayer.length}\n`)

// 3. Примеры статистики
const examples = await prisma.playerMatchStats.findMany({
  take: 5,
  include: {
    player: { select: { firstName: true, lastName: true } },
    match: { select: { slug: true, matchDate: true } }
  },
  orderBy: { createdAt: 'desc' }
})

console.log('Примеры статистики:\n')
examples.forEach(stat => {
  console.log(`${stat.player.firstName} ${stat.player.lastName} - ${stat.match.slug}`)
  console.log(`  Минуты: ${stat.minutesPlayed}, Голы: ${stat.goals}, Ассисты: ${stat.assists}`)
  console.log(`  Удары: ${stat.shots} (${stat.shotsOnTarget} в створ)`)
  console.log(`  Передачи: ${stat.passes} (${stat.passesAccurate} точных)`)
  console.log(`  Единоборства: ${stat.duels} (${stat.duelsWon} выигранных)`)
  console.log(`  Рейтинг: ${stat.rating}\n`)
})

// 4. Топ-5 игроков по голам
const topScorers = await prisma.playerMatchStats.groupBy({
  by: ['playerId'],
  _sum: { goals: true },
  orderBy: { _sum: { goals: 'desc' } },
  take: 5
})

console.log('Топ-5 бомбардиров:\n')
for (const scorer of topScorers) {
  const player = await prisma.player.findUnique({
    where: { id: scorer.playerId },
    select: { firstName: true, lastName: true }
  })
  console.log(`${player.firstName} ${player.lastName}: ${scorer._sum.goals} голов`)
}

await prisma.$disconnect()
