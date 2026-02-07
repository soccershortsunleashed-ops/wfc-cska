#!/usr/bin/env node

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const matches = await prisma.match.findMany({
    where: {
      matchDate: {
        gte: new Date('2025-01-01'),
        lt: new Date('2026-01-01'),
      },
      rustatId: {
        not: null,
      },
    },
    select: {
      opponentName: true,
      matchDate: true,
      rustatId: true,
      rustatSynced: true,
    },
    orderBy: {
      matchDate: 'asc',
    },
  })

  const synced = matches.filter(m => m.rustatSynced)
  const notSynced = matches.filter(m => !m.rustatSynced)

  console.log('\n📊 Статус синхронизации матчей 2025 года\n')
  console.log('=' .repeat(80))
  console.log(`\n✅ Всего матчей с RuStat ID: ${matches.length}`)
  console.log(`✅ Загружено данных: ${synced.length}`)
  console.log(`❌ Не загружено: ${notSynced.length}`)

  if (notSynced.length > 0) {
    console.log('\n📋 Матчи без данных:\n')
    notSynced.forEach(m => {
      const date = new Date(m.matchDate).toLocaleDateString('ru-RU')
      console.log(`   ❌ ${date}: ЦСКА vs ${m.opponentName} (RuStat ID: ${m.rustatId})`)
    })
  }

  console.log('\n' + '=' .repeat(80))
  console.log()

  await prisma.$disconnect()
}

main()
