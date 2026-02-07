#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const teams = await prisma.footballTeam.findMany({
    orderBy: [
      { season: 'asc' },
      { name: 'asc' }
    ]
  })

  console.log('\n📊 Команды по сезонам:\n')
  
  const bySeason = {}
  
  for (const team of teams) {
    if (!bySeason[team.season]) {
      bySeason[team.season] = []
    }
    bySeason[team.season].push(team.name)
  }
  
  for (const [season, teamNames] of Object.entries(bySeason)) {
    console.log(`\n${season} (${teamNames.length} команд):`)
    teamNames.forEach(name => console.log(`  - ${name}`))
  }
  
  console.log(`\n📊 Всего команд в БД: ${teams.length}\n`)
}

main()
  .finally(() => prisma.$disconnect())
