#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const player = await prisma.player.findFirst({
    where: { lastName: 'Смирнова' },
    include: { stats: true }
  })

  if (!player || !player.stats) {
    console.log('❌ Данные не найдены')
    return
  }

  const s = player.stats

  console.log('\n📊 Надежда Смирнова (#10):\n')
  console.log('Матчи:', s.gamesPlayed)
  console.log('Голы:', s.goals)
  console.log('Ассисты:', s.assists)
  console.log('Желтые карточки:', s.yellowCards)
  console.log('Минуты:', s.minutesPlayed)
  console.log('Удары:', s.shots)
  console.log('Удары в створ:', s.shotsOnTarget)
  console.log('Передачи:', s.passes)
  console.log('Точность передач:', s.passAccuracy ? s.passAccuracy.toFixed(1) + '%' : 'N/A')
  console.log('Ключевые передачи:', s.keyPasses)
  console.log('\nСезон:', s.season)
  console.log('Синхронизировано:', s.rustatSyncedAt?.toLocaleString('ru-RU'))
  console.log()
}

main().finally(() => prisma.$disconnect())
