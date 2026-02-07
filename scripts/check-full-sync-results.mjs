#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('📊 Проверка результатов полной синхронизации\n')

  // 1. Игроки с RuStat ID
  const playersWithRustat = await prisma.player.findMany({
    where: { rustatId: { not: null } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      rustatId: true,
      rustatName: true,
      position: true,
      nationality: true,
    },
    orderBy: { position: 'asc' }
  })

  console.log(`✅ Игроков с RuStat ID: ${playersWithRustat.length}\n`)
  
  // Группировка по позициям
  const byPosition = playersWithRustat.reduce((acc, p) => {
    acc[p.position] = (acc[p.position] || 0) + 1
    return acc
  }, {})
  
  console.log('По позициям:')
  Object.entries(byPosition).forEach(([pos, count]) => {
    console.log(`  ${pos}: ${count}`)
  })

  // 2. Метаданные синхронизации
  console.log('\n📝 Метаданные синхронизации:')
  const syncMeta = await prisma.syncMetadata.findMany({
    orderBy: { lastSyncAt: 'desc' },
    take: 5
  })

  syncMeta.forEach(meta => {
    console.log(`\n  ${meta.entityType} - ${meta.status}`)
    console.log(`  Дата: ${meta.lastSyncAt.toLocaleString('ru-RU')}`)
    console.log(`  Обработано: ${meta.itemsProcessed}`)
    console.log(`  Добавлено: ${meta.itemsAdded}`)
    console.log(`  Пропущено: ${meta.itemsSkipped}`)
    console.log(`  Ошибок: ${meta.itemsFailed}`)
    console.log(`  Длительность: ${(meta.duration / 1000).toFixed(1)}с`)
  })

  // 3. Примеры игроков
  console.log('\n👥 Примеры игроков:\n')
  const examples = playersWithRustat.slice(0, 5)
  examples.forEach(p => {
    console.log(`  ${p.rustatName} (${p.position})`)
    console.log(`    RuStat ID: ${p.rustatId}`)
    console.log(`    Nationality: ${p.nationality}`)
  })

  await prisma.$disconnect()
}

main()
