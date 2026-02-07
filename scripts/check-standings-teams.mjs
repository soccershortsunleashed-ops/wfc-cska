#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('📊 Проверка связей турнирной таблицы с командами\n')

  const standings = await prisma.standingsTeam.findMany({
    where: { season: '2026' },
    include: { team: true },
    take: 5,
  })

  console.log(`Найдено записей: ${standings.length}\n`)

  for (const standing of standings) {
    console.log(`${standing.position}. ${standing.teamName}`)
    console.log(`   teamId: ${standing.teamId || 'null'}`)
    console.log(`   team: ${standing.team ? standing.team.name : 'null'}`)
    console.log(`   teamLogoUrl: ${standing.teamLogoUrl || 'null'}`)
    console.log()
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
