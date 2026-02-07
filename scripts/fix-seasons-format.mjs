#!/usr/bin/env node

/**
 * Исправляет формат сезонов в БД
 * Было: "2024/2025" → Стало: "2025"
 * Было: competition="superliga" → Стало: competition="Суперлига"
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

// Маппинг старых сезонов на новые
const SEASON_MAPPING = {
  '2015/2016': '2016',
  '2016/2017': '2017',
  '2017/2018': '2018',
  '2018/2019': '2019',
  '2019/2020': '2020',
  '2020/2021': '2021',
  '2021/2022': '2022',
  '2022/2023': '2023',
  '2023/2024': '2024',
  '2024/2025': '2025',
  '2025/2026': '2026',
}

async function main() {
  console.log('\n🔄 Исправление формата сезонов в БД\n')
  console.log('=' .repeat(80))
  console.log()

  // 1. Обновляем матчи
  console.log('📅 Обновление матчей...\n')
  let matchesUpdated = 0
  
  for (const [oldSeason, newSeason] of Object.entries(SEASON_MAPPING)) {
    const count = await prisma.match.count({
      where: { season: oldSeason }
    })
    
    if (count > 0) {
      await prisma.match.updateMany({
        where: { season: oldSeason },
        data: { season: newSeason }
      })
      console.log(`   ${oldSeason} → ${newSeason}: ${count} матчей`)
      matchesUpdated += count
    }
  }

  // 2. Обновляем турнирную таблицу
  console.log('\n📊 Обновление турнирной таблицы...\n')
  let standingsUpdated = 0
  
  for (const [oldSeason, newSeason] of Object.entries(SEASON_MAPPING)) {
    const count = await prisma.standingsTeam.count({
      where: { season: oldSeason }
    })
    
    if (count > 0) {
      await prisma.standingsTeam.updateMany({
        where: { season: oldSeason },
        data: { season: newSeason }
      })
      console.log(`   ${oldSeason} → ${newSeason}: ${count} записей`)
      standingsUpdated += count
    }
  }

  // 3. Обновляем команды (если есть)
  console.log('\n⚽ Обновление команд...\n')
  let teamsUpdated = 0
  
  for (const [oldSeason, newSeason] of Object.entries(SEASON_MAPPING)) {
    const count = await prisma.footballTeam.count({
      where: { season: oldSeason }
    })
    
    if (count > 0) {
      await prisma.footballTeam.updateMany({
        where: { season: oldSeason },
        data: { 
          season: newSeason,
          competition: 'Суперлига'
        }
      })
      console.log(`   ${oldSeason} → ${newSeason}: ${count} команд`)
      teamsUpdated += count
    }
  }

  console.log()
  console.log('=' .repeat(80))
  console.log(`\n📊 Итого:`)
  console.log(`   Матчей обновлено: ${matchesUpdated}`)
  console.log(`   Турнирная таблица: ${standingsUpdated}`)
  console.log(`   Команд обновлено: ${teamsUpdated}`)
  console.log()
  console.log('✅ Миграция завершена!')
  console.log()
}

main()
  .catch((error) => {
    console.error('\n❌ Ошибка:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
