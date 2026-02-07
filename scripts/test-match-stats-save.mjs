#!/usr/bin/env node

import 'dotenv/config'
import { chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

const RUSTAT_URL = 'https://football.rustatsport.ru'
const API_BASE = 'https://api-football.rustatsport.ru'

const PLAYER_PARAMS = [
  [1, 0], [288, 0], [196, 0], [393, 0], [641, 0], [643, 0],
  [336, 0], [488, 0], [434, 0], [225, 0], [262, 0], [202, 0],
  [291, 0], [731, 0], [766, 0], [342, 0],
]

async function getToken(email, password) {
  console.log('🌐 Получение токена...')
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
  return token
}

async function main() {
  const email = process.env.RUSTAT_EMAIL
  const password = process.env.RUSTAT_PASSWORD

  const token = await getToken(email, password)
  console.log('✅ Токен получен\n')

  // Берем один матч из БД
  const match = await prisma.match.findFirst({
    where: { rustatId: 688301 } // Зенит 08.11.2025
  })

  console.log(`Тестовый матч: ${match.slug}`)
  console.log(`RuStat ID: ${match.rustatId}\n`)

  // Получаем статистику матча
  const response = await fetch(`${API_BASE}/matches/players/stats`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      match_id: match.rustatId,
      params: PLAYER_PARAMS,
      gk: false
    })
  })

  const data = await response.json()
  console.log(`Получено статистики игроков: ${data.length}\n`)

  // Берем первого игрока
  const playerStat = data[0]
  console.log(`Тестовый игрок: player_id=${playerStat.player_id}`)
  console.log(`Статистика:`, playerStat.stats)

  // Ищем игрока в БД
  const player = await prisma.player.findFirst({
    where: { rustatId: playerStat.player_id }
  })

  if (!player) {
    console.log('❌ Игрок не найден в БД')
    await prisma.$disconnect()
    return
  }

  console.log(`\n✅ Игрок найден: ${player.firstName} ${player.lastName}`)

  // Парсим статистику
  const stats = {}
  for (const stat of playerStat.stats) {
    switch (stat.p) {
      case 1: stats.rating = stat.v; break
      case 288: stats.minutesPlayed = stat.v; break
      case 196: stats.goals = stat.v; break
      case 393: stats.assists = stat.v; break
      case 641: stats.shots = stat.v; break
      case 643: stats.shotsOnTarget = stat.v; break
      case 336: stats.passes = stat.v; break
      case 488: stats.passAccuracy = stat.v; break
      case 434: stats.keyPasses = stat.v; break
      case 225: stats.duels = stat.v; break
      case 262: stats.duelWinRate = stat.v; break
      case 202: stats.yellowCards = stat.v; break
      case 291: stats.interceptions = stat.v; break
      case 731: stats.tackles = stat.v; break
      case 766: stats.blocks = stat.v; break
      case 342: stats.clearances = stat.v; break
    }
  }

  console.log('\nПарсированная статистика:', stats)

  // Сохраняем
  const saved = await prisma.playerMatchStats.upsert({
    where: {
      playerId_matchId: {
        playerId: player.id,
        matchId: match.id
      }
    },
    update: stats,
    create: {
      playerId: player.id,
      matchId: match.id,
      ...stats
    }
  })

  console.log('\n✅ Статистика сохранена:', saved.id)

  // Проверяем
  const check = await prisma.playerMatchStats.findUnique({
    where: {
      playerId_matchId: {
        playerId: player.id,
        matchId: match.id
      }
    }
  })

  console.log('\n✅ Проверка: статистика найдена в БД')
  console.log(`Минуты: ${check.minutesPlayed}, Голы: ${check.goals}, Ассисты: ${check.assists}`)

  await prisma.$disconnect()
}

main()
