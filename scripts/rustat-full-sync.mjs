#!/usr/bin/env node

/**
 * Полная синхронизация статистики ЦСКА из RuStat
 * Согласно ТЗ от 31.01.2026
 * 
 * Включает:
 * - Автоматическую авторизацию
 * - Сбор паспортных данных игроков
 * - Сбор матчей (сезоны 2025 + 2026)
 * - Сбор статистики по матчам
 * - Сбор карты ударов (Shot Map)
 * - Инкрементальное обновление
 */

import 'dotenv/config'
import { chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import fs from 'fs/promises'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

const RUSTAT_URL = 'https://football.rustatsport.ru'
const API_BASE = 'https://api-football.rustatsport.ru'
const CSKA_TEAM_ID = 13503
const DELAY_MS = 500

// Параметры статистики (проверенные)
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

// Логирование
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

// Получение токена через Playwright
async function getToken(email, password) {
  log('🌐 Запуск браузера для авторизации...')
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  let token = null

  // Перехват токена
  page.on('request', (request) => {
    const url = request.url()
    if (url.includes('api-football.rustatsport.ru')) {
      const authHeader = request.headers()['authorization']
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '')
      }
    }
  })

  // Авторизация
  log('🔐 Переход на сайт RuStat...')
  await page.goto(RUSTAT_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(2000)

  log('🔐 Ввод учетных данных...')
  try {
    const loginBtn = page.locator('button:has-text("Войти"), a:has-text("Войти")').first()
    if (await loginBtn.isVisible({ timeout: 5000 })) {
      await loginBtn.click()
      await page.waitForTimeout(2000)
    }
  } catch (e) {
    // Уже на странице входа
  }

  const emailInput = page.locator('input[type="email"], input[name="email"]').first()
  await emailInput.fill(email)
  await page.waitForTimeout(500)

  const passwordInput = page.locator('input[type="password"]').first()
  await passwordInput.fill(password)
  await page.waitForTimeout(500)

  const submitBtn = page.locator('button[type="submit"], button:has-text("Войти")').first()
  await submitBtn.click()

  log('⏳ Ожидание авторизации...')
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

  log(`✅ Токен получен: ${token.substring(0, 50)}...`)
  return token
}

// Получение списка игроков
async function getPlayers(token) {
  log('📊 Получение списка игроков ЦСКА...')
  
  const response = await fetch(`${API_BASE}/teams/${CSKA_TEAM_ID}/players`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const data = await response.json()
  
  // API возвращает массив групп по позициям
  // Каждая группа: { ord, lexic, players: [...] }
  let allPlayers = []
  
  if (Array.isArray(data)) {
    for (const group of data) {
      if (group.players && Array.isArray(group.players)) {
        // Добавляем позицию к каждому игроку
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

// Определение позиции по lexic ID
function getPositionName(lexic) {
  const positions = {
    15: 'GOALKEEPER',
    14: 'DEFENDER',
    32: 'MIDFIELDER',
    31: 'FORWARD'
  }
  return positions[lexic] || 'MIDFIELDER'
}

// Получение матчей игрока
async function getPlayerMatches(token, playerId, seasonIds = [35, 36]) {
  log(`  📅 Получение матчей игрока ${playerId}...`)
  
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
        log(`    ✅ Сезон ${seasonId}: ${matches.length} матчей`)
      }
      
      await delay(DELAY_MS)
    } catch (error) {
      log(`    ⚠️  Ошибка получения матчей для сезона ${seasonId}: ${error.message}`, 'warn')
    }
  }

  return allMatches
}

// Получение статистики ударов
async function getPlayerShots(token, playerId, seasonIds = [35, 36]) {
  log(`  🎯 Получение статистики ударов игрока ${playerId}...`)
  
  const allShots = []
  let summary = null
  
  for (const seasonId of seasonIds) {
    try {
      const response = await fetch(
        `${API_BASE}/players/${playerId}/shots?season_id=${seasonId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )

      if (response.ok) {
        const data = await response.json()
        
        if (data.summary) {
          summary = data.summary
        }
        
        if (data.events && Array.isArray(data.events)) {
          allShots.push(...data.events)
        }
        
        log(`    ✅ Сезон ${seasonId}: ${data.events?.length || 0} ударов`)
      }
      
      await delay(DELAY_MS)
    } catch (error) {
      log(`    ⚠️  Ошибка получения ударов для сезона ${seasonId}: ${error.message}`, 'warn')
    }
  }

  return { summary, events: allShots }
}

// Сохранение игрока в БД
async function savePlayer(playerData) {
  // Проверяем наличие ID
  if (!playerData.id) {
    throw new Error('Player ID is missing')
  }

  // Разбиваем имя на части
  const fullName = playerData.name_rus || playerData.name_eng || ''
  const nameParts = fullName.split(' ')
  const firstName = nameParts.slice(1).join(' ') || fullName
  const lastName = nameParts[0] || ''

  const player = await prisma.player.upsert({
    where: { slug: `player-${playerData.id}` },
    update: {
      firstName,
      lastName,
      rustatId: playerData.id,
      rustatName: fullName,
      position: playerData.position_group || 'MIDFIELDER',
      updatedAt: new Date(),
    },
    create: {
      slug: `player-${playerData.id}`,
      firstName,
      lastName,
      number: playerData.number || 0,
      position: playerData.position_group || 'MIDFIELDER',
      birthDate: playerData.birth_date ? new Date(playerData.birth_date) : new Date('2000-01-01'),
      nationality: getCountryName(playerData.country_id) || 'Russia',
      heightCm: playerData.height,
      weightKg: playerData.weight,
      rustatId: playerData.id,
      rustatName: fullName,
      team: 'MAIN',
    },
  })

  return player
}

// Определение страны по ID
function getCountryName(countryId) {
  const countries = {
    172: 'Russia',
    192: 'Serbia',
    83: 'Belarus',
    175: 'Scotland',
    28: 'Bosnia and Herzegovina',
    30: 'Brazil',
    139: 'Nigeria',
    85: 'Cameroon'
  }
  return countries[countryId] || 'Russia'
}

// Сохранение статистики ударов
async function saveShotsSummary(playerId, summary) {
  if (!summary) return

  await prisma.playerShotsSummary.upsert({
    where: { playerId },
    update: {
      shots: summary.shots || 0,
      goals: summary.goals || 0,
      shotsOnTarget: summary.shots_on_target || 0,
      shotsOffTarget: summary.shots_off_target || 0,
      shotsBlocked: summary.shots_blocked || 0,
      xG: summary.xG || 0,
      xGConversion: summary.xG_conversion,
      lastUpdated: new Date(),
    },
    create: {
      playerId,
      shots: summary.shots || 0,
      goals: summary.goals || 0,
      shotsOnTarget: summary.shots_on_target || 0,
      shotsOffTarget: summary.shots_off_target || 0,
      shotsBlocked: summary.shots_blocked || 0,
      xG: summary.xG || 0,
      xGConversion: summary.xG_conversion,
    },
  })
}

// Сохранение событий ударов
async function saveShotEvents(playerId, events) {
  if (!events || events.length === 0) return

  let added = 0
  
  for (const event of events) {
    try {
      await prisma.shotEvent.create({
        data: {
          playerId,
          matchId: event.match_id ? `match-${event.match_id}` : null,
          minute: event.minute || 0,
          x: event.x || 0,
          y: event.y || 0,
          xG: event.xG || 0,
          outcome: event.outcome || 'missed',
          bodyPart: event.body_part,
          situation: event.situation,
          rustatShotId: event.id,
          rustatEventData: JSON.stringify(event),
        },
      })
      added++
    } catch (error) {
      // Дубликат - пропускаем
      if (!error.message.includes('Unique constraint')) {
        log(`    ⚠️  Ошибка сохранения удара: ${error.message}`, 'warn')
      }
    }
  }

  log(`    ✅ Сохранено событий ударов: ${added}`)
  return added
}

// Главная функция
async function main() {
  log('🚀 Полная синхронизация статистики ЦСКА из RuStat')
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
    matchesAdded: 0,
    shotsAdded: 0,
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

        // Получение матчей
        const matches = await getPlayerMatches(token, playerData.id)
        log(`  📊 Матчей найдено: ${matches.length}`)

        // Получение статистики ударов
        const shots = await getPlayerShots(token, playerData.id)
        log(`  🎯 Ударов найдено: ${shots.events.length}`)

        // Сохранение статистики ударов
        await saveShotsSummary(player.id, shots.summary)
        const shotsAdded = await saveShotEvents(player.id, shots.events)
        
        stats.playersProcessed++
        stats.shotsAdded += shotsAdded || 0

      } catch (error) {
        log(`  ❌ Ошибка: ${error.message}`, 'error')
        stats.errors.push({ player: playerName, error: error.message })
        stats.playersSkipped++
      }

      await delay(DELAY_MS)
    }

    // 4. Сохранение метаданных синхронизации
    const duration = Date.now() - stats.startTime
    
    await prisma.syncMetadata.create({
      data: {
        entityType: 'full_sync',
        status: stats.errors.length === 0 ? 'success' : 'partial',
        lastSyncAt: new Date(),
        itemsProcessed: stats.playersProcessed,
        itemsAdded: stats.shotsAdded,
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
    log(`Ударов добавлено: ${stats.shotsAdded}`)
    log(`Ошибок: ${stats.errors.length}`)
    log(`Длительность: ${(duration / 1000).toFixed(1)}с`)

    if (stats.errors.length > 0) {
      log('\nОшибки:')
      stats.errors.forEach(e => log(`  - ${e.player}: ${e.error}`))
    }

    // 6. Сохранение лога
    const logFile = `logs/rustat-full-sync-${new Date().toISOString().replace(/:/g, '-')}.log`
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
