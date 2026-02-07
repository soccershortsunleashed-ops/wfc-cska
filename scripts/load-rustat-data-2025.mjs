#!/usr/bin/env node

/**
 * Скрипт для загрузки полных данных RuStat для всех матчей 2025 года
 * 
 * Что делает:
 * 1. Получает все матчи 2025 года с rustatId из БД
 * 2. Для каждого матча загружает полные данные из RuStat API:
 *    - info (основная информация)
 *    - players (список игроков)
 *    - tactics (расстановки)
 *    - teamStats (статистика команд)
 *    - playerStats (статистика игроков)
 * 3. Сохраняет данные в поле rustatData
 * 4. Устанавливает флаг rustatSynced = true
 * 
 * Использование:
 *   node scripts/load-rustat-data-2025.mjs
 *   node scripts/load-rustat-data-2025.mjs --force  # перезагрузить все данные
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

// Токен из .env
const TOKEN = process.env.RUSTAT_TOKEN

if (!TOKEN) {
  console.error('❌ RUSTAT_TOKEN не найден в .env файле!')
  console.error('💡 Обновите токен в .env файле из браузера DevTools')
  process.exit(1)
}

const RUSTAT_API_URL = 'https://api-football.rustatsport.ru'

// Флаг для принудительной перезагрузки
const FORCE_RELOAD = process.argv.includes('--force')

// Задержка между запросами (мс)
const DELAY_BETWEEN_REQUESTS = 500

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchRustatData(endpoint, options = {}) {
  const response = await fetch(`${RUSTAT_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.status}`)
  }

  return response.json()
}

async function getMatchFullData(matchId) {
  console.log(`  📥 Загрузка данных для матча ${matchId}...`)

  try {
    // 1. Основная информация
    const info = await fetchRustatData(`/matches/${matchId}/info`)
    await delay(DELAY_BETWEEN_REQUESTS)

    // 2. Список игроков
    const players = await fetchRustatData(`/matches/${matchId}/players`)
    await delay(DELAY_BETWEEN_REQUESTS)

    // 3. Расстановки
    const tactics = await fetchRustatData(`/matches/${matchId}/tactics`)
    await delay(DELAY_BETWEEN_REQUESTS)

    // 4. Статистика команд
    let teamStats = null
    try {
      teamStats = await fetchRustatData(`/matches/teams/stats`, {
        method: 'POST',
        body: JSON.stringify({
          match_id: matchId,
          params: [
            [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0],
            [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 0], [15, 0],
            [16, 0], [17, 0], [18, 0], [19, 0], [20, 0], [21, 0], [22, 0],
            [23, 0], [24, 0], [25, 0], [26, 0], [27, 0], [28, 0], [29, 0],
            [30, 0], [31, 0], [32, 0], [33, 0], [34, 0], [35, 0], [36, 0],
            [37, 0], [38, 0], [39, 0], [40, 0], [41, 0], [42, 0], [43, 0],
            [44, 0], [45, 0], [46, 0], [47, 0], [48, 0], [49, 0], [50, 0],
            [51, 0], [52, 0], [53, 0], [54, 0], [55, 0], [56, 0], [57, 0],
          ],
        }),
      })
      await delay(DELAY_BETWEEN_REQUESTS)
    } catch (error) {
      console.log(`    ⚠️  Статистика команд недоступна: ${error.message}`)
    }

    // 5. Статистика игроков
    let playerStats = null
    try {
      playerStats = await fetchRustatData(`/matches/players/stats`, {
        method: 'POST',
        body: JSON.stringify({
          gk: false,
          match_id: matchId,
          params: [
            [1, 0], [288, 0], [719, 0], [196, 0], [393, 0], [223, 0], [224, 0],
            [191, 0], [194, 0], [195, 0], [193, 0], [684, 0], [641, 0], [643, 0],
            [264, 0], [273, 0], [694, 0], [697, 0], [336, 0], [488, 0], [434, 0],
            [438, 0], [291, 0], [293, 0], [731, 0], [733, 0], [766, 0], [399, 0],
            [401, 0], [460, 0], [462, 0], [726, 0], [728, 0], [342, 0], [345, 0],
            [439, 0], [225, 0], [262, 0], [229, 0], [231, 0], [226, 0], [228, 0],
            [232, 0], [242, 0], [304, 0], [310, 0], [305, 0], [307, 0], [317, 0],
            [323, 0], [489, 0], [608, 0], [709, 0],
          ],
        }),
      })
      await delay(DELAY_BETWEEN_REQUESTS)
    } catch (error) {
      console.log(`    ⚠️  Статистика игроков недоступна: ${error.message}`)
    }

    const data = {
      info,
      players,
      tactics,
      teamStats,
      playerStats,
      syncedAt: new Date().toISOString(),
    }

    console.log(`  ✅ Данные загружены успешно`)
    return data

  } catch (error) {
    console.log(`  ❌ Ошибка загрузки: ${error.message}`)
    throw error
  }
}

async function loadMatchesData() {
  console.log('\n🔄 Загрузка данных RuStat для матчей 2025 года...\n')
  console.log('=' .repeat(80))
  console.log()

  try {
    // Получаем матчи с rustatId
    const whereClause = {
      matchDate: {
        gte: new Date('2025-01-01'),
        lt: new Date('2026-01-01'),
      },
      rustatId: {
        not: null,
      },
    }

    // Если не force, пропускаем уже загруженные
    if (!FORCE_RELOAD) {
      whereClause.rustatSynced = false
    }

    const matches = await prisma.match.findMany({
      where: whereClause,
      orderBy: {
        matchDate: 'asc',
      },
    })

    if (matches.length === 0) {
      console.log('✅ Все матчи уже загружены!')
      console.log('💡 Используйте --force для перезагрузки всех данных')
      return
    }

    console.log(`📋 Найдено матчей для загрузки: ${matches.length}`)
    if (FORCE_RELOAD) {
      console.log('⚠️  Режим принудительной перезагрузки (--force)')
    }
    console.log()

    let loaded = 0
    let failed = 0

    for (const match of matches) {
      const date = new Date(match.matchDate).toLocaleDateString('ru-RU')
      console.log(`\n📅 ${date}: ЦСКА vs ${match.opponentName}`)
      console.log(`   RuStat ID: ${match.rustatId}`)

      try {
        // Загружаем данные
        const data = await getMatchFullData(match.rustatId)

        // Сохраняем в БД
        await prisma.match.update({
          where: { id: match.id },
          data: {
            rustatData: JSON.stringify(data),
            rustatSynced: true,
            rustatSyncedAt: new Date(),
          },
        })

        console.log(`   💾 Данные сохранены в БД`)
        loaded++

      } catch (error) {
        console.log(`   ❌ Ошибка: ${error.message}`)
        failed++
      }

      // Задержка между матчами
      if (matches.indexOf(match) < matches.length - 1) {
        await delay(DELAY_BETWEEN_REQUESTS)
      }
    }

    console.log()
    console.log('=' .repeat(80))
    console.log('\n📊 Результаты загрузки:')
    console.log(`   ✅ Загружено: ${loaded}`)
    console.log(`   ❌ Ошибок: ${failed}`)
    console.log(`   📝 Всего обработано: ${matches.length}`)
    
    if (loaded > 0) {
      console.log('\n✅ Загрузка завершена успешно!')
      console.log('💡 Теперь данные RuStat доступны на страницах матчей')
    }

  } catch (error) {
    console.error('\n❌ Ошибка:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

loadMatchesData()
