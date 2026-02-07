#!/usr/bin/env node

/**
 * ПОЛНАЯ синхронизация статистики ЦСКА из RuStat
 * Включает детальную статистику по матчам
 */

import 'dotenv/config'
import { chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import fs from 'fs/promises'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

const RUSTAT_URL = 'https://football.rustatsport.ru'
const API_BASE = 'https://api-football.rustatsport.ru'
const CSKA_TEAM_ID = 13503
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

const logs = []
function log(message, level = 'info') {
  const timestamp = new Date().toISOString()
  const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`
  logs.push(logEntry)
  console.log(logEntry)
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function getToken(email, password) {
  log('🌐 Запуск браузера для авторизации...')
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

  log(`✅ Токен получен`)
  return token
}

async function getPlayers(token) {
  log('📊 Получение списка игроков ЦСКА...')
  
  const response = await fetch(`${API_BASE}/teams/${CSKA_TEAM_ID}/players`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const data = await response.json()
  
  let allPlayers = []
  
  if (Array.isArray(data)) {
    for (const group of data) {
      if (group.players && Array.isArray(group.players)) {
        const positionName = getPositionName(group.lexic)
        const playersWithPosition = group.players.map(p => ({
          ...p,
          position_group: positionName,
          lexic: group.lexic
        }))
        allPlayers.push(...playersWithPosition)
      }
    }
  }

  log(`✅ Найдено игроков: ${allPlayers.length}`)
  return allPlayers
}

function getPositionName(lexic) {
  const positions = {
    15: 'GOALKEEPER',
    14: 'DEFENDER',
    32: 'MIDFIELDER',
    31: 'FORWARD'
  }
  return positions[lexic] || 'MIDFIELDER'
}

function getCountryName(countryId) {
  const countries = {
    172: 'Россия',
    192: 'Сербия',
    83: 'Беларусь',
    175: 'Шотландия',
    28: 'Босния и Герцеговина',
    30: 'Бразилия',
    139: 'Нигерия',
    85: 'Камерун'
  }
  return countries[countryId] || 'Россия'
}

async function savePlayer(playerData) {
  if (!playerData.id) {
    throw new Error('Player ID is missing')
  }

  const fullName = playerData.name_rus || playerData.name_eng || ''
  const nameParts = fullName.split(' ')
  const firstName = nameParts.slice(1).join(' ') || fullName
  const lastName = nameParts[0] || ''

  // Сначала ищем игрока по rustatId
  let player = await prisma.player.findUnique({
    where: { rustatId: playerData.id }
  })

  if (player) {
    // Обновляем существующего игрока
    player = await prisma.player.update({
      where: { id: player.id },
      data: {
        rustatName: fullName,
        position: playerData.position_group || player.position,
        nationality: getCountryName(playerData.country_id),
        updatedAt: new Date(),
      },
    })
    log(`  ✅ Обновлен существующий игрок: ${player.firstName} ${player.lastName} (ID: ${player.id})`)
  } else {
    // Создаем нового игрока
    player = await prisma.player.create({
      data: {
        slug: `player-${playerData.id}`,
        firstName,
        lastName,
        number: playerData.number || 0,
        position: playerData.position_group || 'MIDFIELDER',
        birthDate: new Date('2000-01-01'),
        nationality: getCountryName(playerData.country_id),
        rustatId: playerData.id,
        rustatName: fullName,
        team: 'MAIN',
      },
    })
    log(`  ✅ Создан новый игрок: ${firstName} ${lastName} (ID: ${player.id})`)
  }

  return player
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
      }
      
      await delay(DELAY_MS)
    } catch (error) {
      log(`    ⚠️  Ошибка получения матчей для сезона ${seasonId}: ${error.message}`, 'warn')
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
    log(`    ⚠️  Ошибка получения статистики матча ${matchId}: ${error.message}`, 'warn')
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
        // Процент точности - вычисляем количество точных передач
        if (result.passes > 0) {
          result.passesAccurate = Math.round(result.passes * stat.v / 100)
        }
        break
      case 434: result.keyPasses = stat.v; break
      case 225: result.duels = stat.v; break
      case 262: 
        // Процент выигранных единоборств - вычисляем количество
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
    log(`    ⚠️  Ошибка сохранения статистики: ${error.message}`, 'warn')
    return false
  }
}

async function main() {
  log('🚀 ПОЛНАЯ синхронизация статистики ЦСКА из RuStat')
  log('='.repeat(80))

  const email = process.env.RUSTAT_EMAIL
  const password = process.env.RUSTAT_PASSWORD

  if (!email || !password) {
    log('❌ ОШИБКА: Не указаны RUSTAT_EMAIL и RUSTAT_PASSWORD', 'error')
    process.exit(1)
  }

  const stats = {
    playersProcessed: 0,
    playersSkipped: 0,
    matchStatsAdded: 0,
    matchStatsUpdated: 0,
    errors: [],
    startTime: Date.now(),
  }

  let token = null

  try {
    // 1. Получение токена
    token = await getToken(email, password)

    // 2. Получение игроков
    const players = await getPlayers(token)

    // 3. Обработка каждого игрока
    for (let i = 0; i < players.length; i++) {
      const playerData = players[i]
      const playerName = playerData.name_rus || playerData.name_eng || `Player ${playerData.id}`
      
      log(`\n[${i + 1}/${players.length}] Обработка: ${playerName}`)
      
      try {
        // Сохранение игрока
        const player = await savePlayer(playerData)
        log(`  ✅ Игрок сохранен: ${player.id}`)

        // Получение матчей игрока
        const matches = await getPlayerMatches(token, playerData.id)
        log(`  📊 Матчей найдено: ${matches.length}`)

        // Обработка матчей (только завершенные и есть в БД)
        let matchesProcessed = 0
        const dbMatches = await prisma.match.findMany({
          where: { 
            rustatId: { not: null },
            status: 'FINISHED'
          },
          select: { id: true, rustatId: true }
        })

        const dbMatchIds = new Set(dbMatches.map(m => m.rustatId))

        for (const matchData of matches) {
          const matchId = matchData.id || matchData.match_id
          if (!matchId || !dbMatchIds.has(matchId)) continue

          const dbMatch = dbMatches.find(m => m.rustatId === matchId)
          if (!dbMatch) continue

          // Получаем статистику матча
          const matchStats = await getMatchPlayerStats(token, matchId)
          
          // Ищем статистику нашего игрока
          const playerMatchStats = matchStats.find(s => s.player_id === playerData.id)
          
          if (playerMatchStats && playerMatchStats.stats) {
            const parsedStats = parsePlayerStats(playerMatchStats.stats)
            const saved = await saveMatchStats(player.id, dbMatch.id, parsedStats)
            
            if (saved) {
              matchesProcessed++
              stats.matchStatsAdded++
            }
          }

          await delay(DELAY_MS)
        }

        log(`  ✅ Сохранено статистики матчей: ${matchesProcessed}`)
        stats.playersProcessed++

      } catch (error) {
        log(`  ❌ Ошибка: ${error.message}`, 'error')
        stats.errors.push({ player: playerName, error: error.message })
        stats.playersSkipped++
      }

      await delay(DELAY_MS)
    }

    // 4. Сохранение метаданных
    const duration = Date.now() - stats.startTime
    
    await prisma.syncMetadata.create({
      data: {
        entityType: 'complete_sync',
        status: stats.errors.length === 0 ? 'success' : 'partial',
        lastSyncAt: new Date(),
        itemsProcessed: stats.playersProcessed,
        itemsAdded: stats.matchStatsAdded,
        itemsSkipped: stats.playersSkipped,
        itemsFailed: stats.errors.length,
        errors: stats.errors.length > 0 ? JSON.stringify(stats.errors) : null,
        duration,
      },
    })

    // 5. Финальный отчет
    log('\n' + '='.repeat(80))
    log('📊 ФИНАЛЬНЫЙ ОТЧЕТ')
    log('='.repeat(80))
    log(`Игроков обработано: ${stats.playersProcessed}`)
    log(`Игроков пропущено: ${stats.playersSkipped}`)
    log(`Статистики матчей добавлено: ${stats.matchStatsAdded}`)
    log(`Ошибок: ${stats.errors.length}`)
    log(`Длительность: ${(duration / 1000).toFixed(1)}с`)

    if (stats.errors.length > 0) {
      log('\nОшибки:')
      stats.errors.forEach(e => log(`  - ${e.player}: ${e.error}`))
    }

    // 6. Сохранение лога
    const logFile = `logs/rustat-complete-sync-${new Date().toISOString().replace(/:/g, '-')}.log`
    await fs.mkdir('logs', { recursive: true })
    await fs.writeFile(logFile, logs.join('\n'))
    log(`\n📝 Лог сохранен: ${logFile}`)

  } catch (error) {
    log(`\n❌ КРИТИЧЕСКАЯ ОШИБКА: ${error.message}`, 'error')
    log(error.stack, 'error')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
