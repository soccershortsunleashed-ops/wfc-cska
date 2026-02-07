#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🔍 Поиск Габриэль Онгене...\n')

  const player = await prisma.player.findFirst({
    where: {
      OR: [
        { firstName: { contains: 'Габриэль' } },
        { firstName: { contains: 'Gabriel' } },
        { lastName: { contains: 'Онгене' } },
        { lastName: { contains: 'Ongene' } },
      ]
    },
    include: {
      stats: true,
      matchStats: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  })

  if (!player) {
    console.log('❌ Игрок не найден')
    return
  }

  console.log(`✅ Найден игрок: ${player.firstName} ${player.lastName}`)
  console.log(`   ID: ${player.id}`)
  console.log(`   Номер: ${player.number}`)
  console.log(`   RuStat ID: ${player.rustatId || 'нет'}`)
  console.log(`   Фото: ${player.photoUrl ? 'ДА' : 'НЕТ'}`)
  console.log(`   leftClub: ${player.leftClub}`)
  console.log(`   Slug: ${player.slug}\n`)

  if (player.stats) {
    console.log('📈 Агрегированная статистика:')
    console.log(`   Матчи: ${player.stats.gamesPlayed}`)
    console.log(`   Голы: ${player.stats.goals}`)
    console.log(`   Ассисты: ${player.stats.assists}`)
    console.log(`   Желтые: ${player.stats.yellowCards}`)
    console.log(`   Синхронизировано: ${player.stats.rustatSynced}`)
    if (player.stats.rustatSyncedAt) {
      console.log(`   Дата синхронизации: ${player.stats.rustatSyncedAt}`)
    }
  } else {
    console.log('⚠️  Агрегированная статистика отсутствует')
  }

  console.log(`\n📋 Детальная статистика: ${player.matchStats.length} записей\n`)

  if (player.matchStats.length > 0) {
    console.log('Последние 5 матчей:')
    player.matchStats.forEach((ms, i) => {
      console.log(`${i + 1}. Матч: ${ms.matchId}, Голы: ${ms.goals}, Минуты: ${ms.minutesPlayed}`)
    })
  }

  console.log('\n📊 В RuStat показано: 18 матчей')
  console.log('📊 На нашем сайте: ' + (player.stats?.gamesPlayed || 0) + ' матчей')
  
  if (player.stats && player.stats.gamesPlayed !== 18) {
    console.log('\n⚠️  РАСХОЖДЕНИЕ! Нужна синхронизация.')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
