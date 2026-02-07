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
      opponentName: 'Спартак',
      matchDate: {
        gte: new Date('2025-11-01'),
        lt: new Date('2025-11-03'),
      },
    },
    select: {
      slug: true,
      opponentName: true,
      matchDate: true,
      rustatId: true,
      rustatSynced: true,
    },
  })

  console.log('\n📋 Матч ЦСКА vs Спартак:')
  console.log(`   Slug: ${match.slug}`)
  console.log(`   Дата: ${new Date(match.matchDate).toLocaleDateString('ru-RU')}`)
  console.log(`   RuStat ID: ${match.rustatId}`)
  console.log(`   Синхронизирован: ${match.rustatSynced ? '✅ Да' : '❌ Нет'}`)
  console.log(`\n🌐 URL: http://localhost:3000/matches/${match.slug}`)
  console.log()

  await prisma.$disconnect()
}

main()
