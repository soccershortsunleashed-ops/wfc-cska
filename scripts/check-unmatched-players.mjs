#!/usr/bin/env node

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

const players = await prisma.player.findMany({
  where: {
    number: { in: [9, 17, 19, 69] }
  },
  select: {
    number: true,
    firstName: true,
    lastName: true,
    rustatId: true,
  }
})

console.log('Несопоставленные игроки:')
for (const p of players) {
  console.log(`#${p.number}: "${p.lastName}" "${p.firstName}" (rustatId: ${p.rustatId || 'null'})`)
}

await prisma.$disconnect()
