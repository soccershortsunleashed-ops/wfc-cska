#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🔍 Проверка матчей в БД\n')

  // Все матчи
  const allMatches = await prisma.match.findMany({
    orderBy: { matchDate: 'desc' },
    select: {
      id: true,
      rustatId: true,
      matchDate: true,
      status: true,
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
      scoreHome: true,
      scoreAway: true,
    }
  })

  console.log(`📊 Всего матчей в БД: ${allMatches.length}`)
  
  const withRustatId = allMatches.filter(m => m.rustatId)
  const finished = allMatches.filter(m => m.status === 'FINISHED')
  const finishedWithRustat = allMatches.filter(m => m.status === 'FINISHED' && m.rustatId)

  console.log(`   С RuStat ID: ${withRustatId.length}`)
  console.log(`   Завершенные: ${finished.length}`)
  console.log(`   Завершенные с RuStat ID: ${finishedWithRustat.length}\n`)

  console.log('📋 Последние 10 матчей:\n')
  
  for (const match of allMatches.slice(0, 10)) {
    const home = match.homeTeam?.name || 'Unknown'
    const away = match.awayTeam?.name || 'Unknown'
    const score = match.scoreHome !== null && match.scoreAway !== null 
      ? `${match.scoreHome}:${match.scoreAway}` 
      : '-:-'
    const date = new Date(match.matchDate).toLocaleDateString('ru-RU')
    const rustat = match.rustatId ? `RuStat: ${match.rustatId}` : 'Нет RuStat ID'
    
    console.log(`${date} | ${home} vs ${away} | ${score} | ${match.status} | ${rustat}`)
  }

  console.log('\n💡 Для добавления недостающих матчей из RuStat:')
  console.log('   1. Запустите полную синхронизацию матчей:')
  console.log('      node scripts/rustat-full-sync.mjs')
  console.log('   2. Или используйте существующий скрипт синхронизации')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
