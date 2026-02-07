#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

const player = await prisma.player.findFirst({
  where: {
    lastName: { contains: 'Смирнов' }
  },
  include: {
    stats: true
  }
})

console.log('\n📊 Данные в БД:')
console.log('Имя:', player.firstName, player.lastName)
console.log('Номер:', player.number)
console.log('RuStat ID:', player.rustatId)
console.log('RuStat Name:', player.rustatName)

if (player.stats) {
  console.log('\n📈 Статистика в БД:')
  console.log('Матчи:', player.stats.gamesPlayed)
  console.log('Голы:', player.stats.goals)
  console.log('Ассисты (передачи голевые):', player.stats.assists)
  console.log('Желтые карточки:', player.stats.yellowCards)
  console.log('Синхронизировано:', player.stats.rustatSynced)
  console.log('Дата синхронизации:', player.stats.rustatSyncedAt)
}

console.log('\n🔗 Данные из RuStat (скриншот):')
console.log('Матчи: 33')
console.log('Голы: 9')
console.log('Передачи голевые: 21')
console.log('Желтые карточки: 3')

console.log('\n⚠️  ПРОБЛЕМА:')
if (player.stats) {
  if (player.stats.goals !== 9) {
    console.log(`❌ Голы не совпадают: БД=${player.stats.goals}, RuStat=9`)
  }
  if (player.stats.assists !== 21) {
    console.log(`❌ Ассисты не совпадают: БД=${player.stats.assists}, RuStat=21`)
  }
  if (player.stats.gamesPlayed !== 33) {
    console.log(`❌ Матчи не совпадают: БД=${player.stats.gamesPlayed}, RuStat=33`)
  }
  if (player.stats.yellowCards !== 3) {
    console.log(`❌ Желтые не совпадают: БД=${player.stats.yellowCards}, RuStat=3`)
  }
}

await prisma.$disconnect()
