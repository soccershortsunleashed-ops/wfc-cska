#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const seasons = await prisma.match.findMany({
    select: { season: true },
    distinct: ['season'],
    orderBy: { season: 'asc' }
  })
  
  console.log('\n📅 Сезоны в БД:\n')
  seasons.forEach(s => console.log(`   ${s.season}`))
  console.log(`\n📊 Всего сезонов: ${seasons.length}\n`)
}

main()
  .finally(() => prisma.$disconnect())
