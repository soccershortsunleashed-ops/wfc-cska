#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

const matches = await prisma.match.findMany({
  where: { rustatId: { not: null } },
  select: { id: true, slug: true, rustatId: true, matchDate: true },
  orderBy: { matchDate: 'desc' },
  take: 10
})

console.log(`Матчи с RuStat ID: ${matches.length}`)
matches.forEach(m => {
  console.log(`- ${m.slug}: rustatId=${m.rustatId}, date=${m.matchDate.toLocaleDateString('ru-RU')}`)
})

await prisma.$disconnect()
