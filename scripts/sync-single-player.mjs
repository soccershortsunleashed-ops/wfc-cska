#!/usr/bin/env node

/**
 * Синхронизация статистики одного игрока из RuStat
 * Использование: node scripts/sync-single-player.mjs <rustatId>
 * Пример: node scripts/sync-single-player.mjs 649721
 */

import 'dotenv/config'
import { chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

const RUSTAT_URL = 'https://football.rustatsport.ru'
const API_BASE = 'https://api-football.rustatsport.ru'
const DELAY_MS = 300

// Параметры статистики
const PLAYER_PARAMS = [
  [1, 0],    // Рейтинг
  [288, 0],  // Минуты
  [196, 0],  // Голы
  [393, 0],  // Ассисты
  [641, 0],  // Удары
  [643, 0],  // Удары в створ
  [336, 0],  // Передачи
  [488, 0],  // Передачи точные %
  [434, 0],  // Ключевые передачи
  [225, 0],  // Единоборства
  [262, 0],  // Единоборства выигранные %
  [202, 0],  // Желтые карточки
  [291, 0],  // Перехваты
  [731, 0],  // Отборы
  [766, 0],  // Блоки
  [342, 0],  // Выносы
]

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function getToken(email, password) {
  console.log('🌐 Запуск браузера для авторизации...')
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  let token = null

  page.on('request', (request) => {
    const url = request.url()
    if (url.includes('api-football.rustatsport.ru')) {
      const authHeader = request.headers()['authorization']
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '')
      }
    }
  })

  await page.goto(RUSTAT_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(2000)

  try {
    const loginBtn = page.locator('button:has-text("Войти"), a:has-text("Войти")').first()
    if (await loginBtn.isVisible({ timeout: 5000 })) {
      await loginBtn.click()
      await page.waitForTimeout(2000)
    }
  } catch (e) {}

  const emailInput = page.locator('input[type="email"], input[name="email"]').first()
  await emailInput.fill(email)
  await page.waitForTimeout(500)

  const passwordInput = page.locator('input[type="password"]').first()
  await passwordInput.fill(password)
  await page.waitForTimeout(500)

  const submitBtn = page.locator('button[type="submit"], button:has-text("Войти")').first()
  await submitBtn.click()
  await page.waitForTimeout(5000)

  if (!token) {
    token = await page.evaluate(() => {
      return localStorage.getItem('token') || 
             localStorage.getItem('auth_token') ||
             sessionStorage.getItem('token')
    })
  }

  await browser.close()

  if (!token) {
    throw new Error('Не удалось получить токен')
  }

  console.log(`✅ Токен получен`)
  return token
}

async function getPlayerMatches(token, playerId, seasonIds = [35, 36]) {
  const allMatches = []
  
  for (const seasonId of seasonIds) {
    try {
      const response = await fetch(
        `${API_BASE}/players/${playerId}/matches?season_id=${seasonId}&limit=100`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )

      if (response.ok) {
        const data = await response.json()
        const matches = data.matches || data || []
        allMatches.push(...matches)
        console.log(`  ✅ Сезон ${seasonId}: найдено ${matches.length} матчей`)
      }
      
      await delay(DELAY_MS)
    } catch (error) {
      console.log(`  ⚠️  Ошибка получения матчей для сезона ${seasonId}: ${error.message}`)
    }
  }

  return allMatches
}

async function getMatchPlayerStats(token, matchId) {
  try {
    const response = await fetch(`${API_BASE}/matches/players/stats`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        match_id: matchId,
        params: PLAYER_PARAMS,
        gk: false
      })
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.log(`    ⚠️  Ошибка получения статистики матча ${matchId}: ${error.message}`)
    return []
  }
}

function parsePlayerStats(statsArray) {
  const result = {
    rating: 0,
    minutesPlayed: 0,
    goals: 0,
    assists: 0,
    shots: 0,
    shotsOnTarget: 0,
    passes: 0,
    passesAccurate: 0,
    keyPasses: 0,
    duels: 0,
    duelsWon: 0,
    yellowCards: 0,
    interceptions: 0,
    tackles: 0,
    blocks: 0,
    clearances: 0,
  }

  for (const stat of statsArray) {
    switch (stat.p) {
      case 1: result.rating = stat.v; break
      case 288: result.minutesPlayed = stat.v; break
      case 196: result.goals = stat.v; break
      case 393: result.assists = stat.v; break
      case 641: result.shots = stat.v; break
      case 643: result.shotsOnTarget = stat.v; break
      case 336: result.passes = stat.v; break
      case 488: 
        if (result.passes > 0) {
          result.passesAccurate = Math.round(result.passes * stat.v / 100)
        }
        break
      case 434: result.keyPasses = stat.v; break
      case 225: result.duels = stat.v; break
      case 262: 
        if (result.duels > 0) {
          result.duelsWon = Math.round(result.duels * stat.v / 100)
        }
        break
      case 202: result.yellowCards = stat.v; break
      case 291: result.interceptions = stat.v; break
      case 731: result.tackles = stat.v; break
      case 766: result.blocks = stat.v; break
      case 342: result.clearances = stat.v; break
    }
  }

  return result
}

async function saveMatchStats(playerId, matchId, stats) {
  try {
    await prisma.playerMatchStats.upsert({
      where: {
        playerId_matchId: {
          playerId,
          matchId
        }
      },
      update: {
        ...stats,
        updatedAt: new Date()
      },
      create: {
        playerId,
        matchId,
        ...stats
      }
    })
    return true
  } catch (error) {
    console.log(`    ⚠️  Ошибка сохранения статистики: ${error.message}`)
    return false
  }
}

async function main() {
  const rustatId = parseInt(process.argv[2])
  
  if (!rustatId || isNaN(rustatId)) {
    console.log('❌ Использование: node scripts/sync-single-player.mjs <rustatId>')
    console.log('   Пример: node scripts/sync-single-player.mjs 649721')
    process.exit(1)
  }

  console.log(`🚀 Синхронизация игрока с RuStat ID: ${rustatId}`)
  console.log('='.repeat(80))

  const email = process.env.RUSTAT_EMAIL
  const password = process.env.RUSTAT_PASSWORD

  if (!email || !password) {
    console.log('❌ ОШИБКА: Не указаны RUSTAT_EMAIL и RUSTAT_PASSWORD')
    process.exit(1)
  }

  try {
    // 1. Найти игрока в БД
    const player = await prisma.player.findUnique({
      where: { rustatId }
    })

    if (!player) {
      console.log(`❌ Игрок с RuStat ID ${rustatId} не найден в БД`)
      console.log('   Сначала присвойте RuStat ID игроку')
      process.exit(1)
    }

    console.log(`✅ Найден игрок: ${player.firstName} ${player.lastName} (ID: ${player.id})`)

    // 2. Получение токена
    const token = await getToken(email, password)

    // 3. Получение матчей игрока
    const matches = await getPlayerMatches(token, rustatId)
    console.log(`\n📊 Всего матчей найдено: ${matches.length}`)

    // 4. Получение матчей из БД
    const dbMatches = await prisma.match.findMany({
      where: { 
        rustatId: { not: null },
        status: 'FINISHED'
      },
      select: { id: true, rustatId: true }
    })

    const dbMatchIds = new Set(dbMatches.map(m => m.rustatId))
    console.log(`📊 Завершенных матчей в БД: ${dbMatches.length}`)

    // 5. Обработка матчей
    let matchesProcessed = 0
    let matchesSkipped = 0

    for (const matchData of matches) {
      const matchId = matchData.id || matchData.match_id
      if (!matchId || !dbMatchIds.has(matchId)) {
        matchesSkipped++
        continue
      }

      const dbMatch = dbMatches.find(m => m.rustatId === matchId)
      if (!dbMatch) continue

      console.log(`  📊 Обработка матча RuStat ID: ${matchId}`)

      // Получаем статистику матча
      const matchStats = await getMatchPlayerStats(token, matchId)
      
      // Ищем статистику нашего игрока
      const playerMatchStats = matchStats.find(s => s.player_id === rustatId)
      
      if (playerMatchStats && playerMatchStats.stats) {
        const parsedStats = parsePlayerStats(playerMatchStats.stats)
        const saved = await saveMatchStats(player.id, dbMatch.id, parsedStats)
        
        if (saved) {
          matchesProcessed++
          console.log(`    ✅ Сохранено: ${parsedStats.minutesPlayed} мин, ${parsedStats.goals} голов, ${parsedStats.assists} ассистов`)
        }
      } else {
        console.log(`    ⚠️  Статистика не найдена`)
      }

      await delay(DELAY_MS)
    }

    // 6. Обновление агрегированной статистики
    console.log(`\n📊 Обновление агрегированной статистики...`)
    
    const allStats = await prisma.playerMatchStats.findMany({
      where: { playerId: player.id }
    })

    const aggregated = {
      gamesPlayed: allStats.length,
      minutesPlayed: allStats.reduce((sum, s) => sum + s.minutesPlayed, 0),
      goals: allStats.reduce((sum, s) => sum + s.goals, 0),
      assists: allStats.reduce((sum, s) => sum + s.assists, 0),
      shots: allStats.reduce((sum, s) => sum + s.shots, 0),
      shotsOnTarget: allStats.reduce((sum, s) => sum + s.shotsOnTarget, 0),
      passes: allStats.reduce((sum, s) => sum + s.passes, 0),
      passesAccurate: allStats.reduce((sum, s) => sum + s.passesAccurate, 0),
      keyPasses: allStats.reduce((sum, s) => sum + s.keyPasses, 0),
      duels: allStats.reduce((sum, s) => sum + s.duels, 0),
      duelsWon: allStats.reduce((sum, s) => sum + s.duelsWon, 0),
      yellowCards: allStats.reduce((sum, s) => sum + s.yellowCards, 0),
      interceptions: allStats.reduce((sum, s) => sum + s.interceptions, 0),
      tackles: allStats.reduce((sum, s) => sum + s.tackles, 0),
      blocks: allStats.reduce((sum, s) => sum + s.blocks, 0),
      clearances: allStats.reduce((sum, s) => sum + s.clearances, 0),
      rustatSynced: true,
      rustatSyncedAt: new Date(),
    }

    // Вычисляем проценты
    if (aggregated.shots > 0) {
      aggregated.shotAccuracy = (aggregated.shotsOnTarget / aggregated.shots) * 100
    }
    if (aggregated.passes > 0) {
      aggregated.passAccuracy = (aggregated.passesAccurate / aggregated.passes) * 100
    }
    if (aggregated.duels > 0) {
      aggregated.duelWinRate = (aggregated.duelsWon / aggregated.duels) * 100
    }

    await prisma.playerStats.upsert({
      where: { playerId: player.id },
      update: aggregated,
      create: {
        playerId: player.id,
        ...aggregated
      }
    })

    // 7. Финальный отчет
    console.log('\n' + '='.repeat(80))
    console.log('📊 ФИНАЛЬНЫЙ ОТЧЕТ')
    console.log('='.repeat(80))
    console.log(`Игрок: ${player.firstName} ${player.lastName}`)
    console.log(`RuStat ID: ${rustatId}`)
    console.log(`Матчей обработано: ${matchesProcessed}`)
    console.log(`Матчей пропущено: ${matchesSkipped}`)
    console.log(`\nАгрегированная статистика:`)
    console.log(`  Матчи: ${aggregated.gamesPlayed}`)
    console.log(`  Минуты: ${aggregated.minutesPlayed}`)
    console.log(`  Голы: ${aggregated.goals}`)
    console.log(`  Ассисты: ${aggregated.assists}`)
    console.log(`  Желтые: ${aggregated.yellowCards}`)
    console.log(`\n✅ Синхронизация завершена успешно!`)

  } catch (error) {
    console.log(`\n❌ КРИТИЧЕСКАЯ ОШИБКА: ${error.message}`)
    console.log(error.stack)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
