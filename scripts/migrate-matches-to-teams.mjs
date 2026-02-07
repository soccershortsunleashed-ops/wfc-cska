#!/usr/bin/env node

/**
 * Скрипт миграции существующих матчей к модели FootballTeam
 * 
 * Что делает:
 * 1. Находит все матчи без связей с командами
 * 2. Определяет команды по названиям
 * 3. Устанавливает связи homeTeam/awayTeam
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { findTeamByName } from '../lib/utils/team-utils.mjs'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('\n🔄 Миграция матчей к модели FootballTeam\n')
  console.log('=' .repeat(80))
  console.log()

  // Находим все матчи без связей
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { homeTeamId: null },
        { awayTeamId: null },
      ],
    },
    orderBy: {
      matchDate: 'asc',
    },
  })

  console.log(`📊 Найдено матчей для миграции: ${matches.length}\n`)

  if (matches.length === 0) {
    console.log('✅ Все матчи уже мигрированы!')
    return
  }

  let migrated = 0
  let failed = 0

  for (const match of matches) {
    try {
      const date = new Date(match.matchDate).toLocaleDateString('ru-RU')
      console.log(`📅 ${date}: ${match.opponentName}`)

      // Ищем ЦСКА
      const cskaTeam = await findTeamByName(prisma, 'ЦСКА', match.season)
      
      if (!cskaTeam) {
        console.log(`   ❌ ЦСКА не найден для сезона ${match.season}`)
        failed++
        continue
      }

      // Ищем команду-соперника
      let opponentTeam = await findTeamByName(
        prisma,
        match.opponentName,
        match.season
      )

      if (!opponentTeam) {
        console.log(`   ⚠️  Команда "${match.opponentName}" не найдена, создаем...`)
        
        // Создаем команду
        opponentTeam = await prisma.footballTeam.create({
          data: {
            name: match.opponentName,
            fullName: match.opponentName,
            logoFileName: extractLogoFileName(match.opponentLogoUrl),
            season: match.season,
            competition: 'Суперлига',
          },
        })
        
        console.log(`   ✅ Создана команда: ${opponentTeam.name}`)
      }

      // Определяем кто дома, кто в гостях
      const isHome = match.isHome ?? true
      const homeTeamId = isHome ? cskaTeam.id : opponentTeam.id
      const awayTeamId = isHome ? opponentTeam.id : cskaTeam.id

      // Обновляем матч
      await prisma.match.update({
        where: { id: match.id },
        data: {
          homeTeamId,
          awayTeamId,
        },
      })

      console.log(`   ✅ Мигрировано: ${isHome ? 'ЦСКА' : opponentTeam.name} vs ${isHome ? opponentTeam.name : 'ЦСКА'}`)
      migrated++

    } catch (error) {
      console.log(`   ❌ Ошибка: ${error.message}`)
      failed++
    }

    console.log()
  }

  console.log('=' .repeat(80))
  console.log(`\n📊 Итого:`)
  console.log(`   ✅ Мигрировано: ${migrated}`)
  console.log(`   ❌ Ошибок: ${failed}`)
  console.log()
}

/**
 * Извлекает имя файла из URL логотипа
 */
function extractLogoFileName(logoUrl) {
  if (!logoUrl) return null
  
  const parts = logoUrl.split('/')
  return parts[parts.length - 1] || null
}

main()
  .catch((error) => {
    console.error('\n❌ Критическая ошибка:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
