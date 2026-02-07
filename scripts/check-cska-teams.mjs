#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const cskaTeams = await prisma.footballTeam.findMany({
    where: {
      name: 'ЦСКА'
    },
    orderBy: {
      season: 'asc'
    }
  })

  console.log('\n📊 Записи ЦСКА в БД:\n')
  
  for (const team of cskaTeams) {
    console.log(`ID: ${team.id} | Сезон: ${team.season} | Турнир: ${team.competition}`)
  }
  
  console.log(`\nВсего записей ЦСКА: ${cskaTeams.length}\n`)
}

main()
  .finally(() => prisma.$disconnect())
