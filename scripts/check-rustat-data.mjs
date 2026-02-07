#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

const MATCH_ID = 'cmkxikrbm000004ucym8g8myi'

async function main() {
  const match = await prisma.match.findUnique({
    where: { id: MATCH_ID },
  })

  if (!match) {
    console.log('❌ Матч не найден')
    return
  }

  console.log('✅ Матч найден:')
  console.log(`   ID: ${match.id}`)
  console.log(`   RuStat ID: ${match.rustatId}`)
  console.log(`   Synced: ${match.rustatSynced}`)
  console.log(`   Synced At: ${match.rustatSyncedAt}`)
  console.log()

  if (match.rustatData) {
    const data = JSON.parse(match.rustatData)
    console.log('📊 Данные RuStat:')
    console.log(`   Info: ${data.info ? '✅' : '❌'}`)
    console.log(`   Players: ${data.players ? `✅ (${data.players.length})` : '❌'}`)
    console.log(`   Tactics: ${data.tactics ? '✅' : '❌'}`)
    console.log(`   Team Stats: ${data.teamStats ? '✅' : '❌'}`)
    console.log(`   Player Stats: ${data.playerStats ? '✅' : '❌'}`)
    console.log()

    if (data.teamStats) {
      console.log('📈 Team Stats:')
      console.log(JSON.stringify(data.teamStats, null, 2))
    } else {
      console.log('⚠️  Team Stats отсутствуют')
    }

    if (data.playerStats) {
      console.log('📈 Player Stats:')
      console.log(`   Players: ${data.playerStats.players?.length || 0}`)
      console.log(`   Params: ${data.playerStats.params?.length || 0}`)
    } else {
      console.log('⚠️  Player Stats отсутствуют')
    }
  } else {
    console.log('❌ Нет данных RuStat')
  }

  await prisma.$disconnect()
}

main().catch(console.error)
