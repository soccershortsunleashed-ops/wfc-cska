#!/usr/bin/env node

/**
 * Исследование API для получения детальной статистики по матчам
 */

import 'dotenv/config'
import { chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

const RUSTAT_URL = 'https://football.rustatsport.ru'
const API_BASE = 'https://api-football.rustatsport.ru'

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

async function testMatchStatsEndpoints(token) {
  console.log('\n📊 Тестирование endpoints для статистики матчей...\n')

  // Получаем один матч из БД для тестирования
  const match = await prisma.match.findFirst({
    where: { 
      rustatId: { not: null },
      status: 'FINISHED'
    },
    orderBy: { matchDate: 'desc' }
  })

  if (!match || !match.rustatId) {
    console.log('❌ Не найдено матчей с RuStat ID')
    return
  }

  console.log(`Тестовый матч: ${match.slug}`)
  console.log(`RuStat ID: ${match.rustatId}`)
  console.log(`Дата: ${match.matchDate.toLocaleDateString('ru-RU')}\n`)

  const matchId = match.rustatId

  // 1. POST /matches/players/stats
  console.log('1️⃣ POST /matches/players/stats')
  try {
    const res1 = await fetch(`${API_BASE}/matches/players/stats`, {
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
    
    if (res1.ok) {
      const data1 = await res1.json()
      console.log('✅ Status:', res1.status)
      console.log('Response type:', Array.isArray(data1) ? 'array' : typeof data1)
      console.log('Items:', Array.isArray(data1) ? data1.length : 'N/A')
      if (Array.isArray(data1) && data1.length > 0) {
        console.log('First item keys:', Object.keys(data1[0]))
        console.log('Sample:', JSON.stringify(data1[0], null, 2))
      }
    } else {
      console.log('❌ Status:', res1.status)
      const error = await res1.text()
      console.log('Error:', error)
    }
  } catch (e) {
    console.log('❌ Error:', e.message)
  }

  // 2. GET /matches/{matchId}/players
  console.log('\n2️⃣ GET /matches/{matchId}/players')
  try {
    const res2 = await fetch(`${API_BASE}/matches/${matchId}/players`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (res2.ok) {
      const data2 = await res2.json()
      console.log('✅ Status:', res2.status)
      console.log('Response keys:', Object.keys(data2))
      console.log('Sample:', JSON.stringify(data2, null, 2).substring(0, 500))
    } else {
      console.log('❌ Status:', res2.status)
    }
  } catch (e) {
    console.log('❌ Error:', e.message)
  }

  // 3. GET /matches/{matchId}/info
  console.log('\n3️⃣ GET /matches/{matchId}/info')
  try {
    const res3 = await fetch(`${API_BASE}/matches/${matchId}/info`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (res3.ok) {
      const data3 = await res3.json()
      console.log('✅ Status:', res3.status)
      console.log('Response keys:', Object.keys(data3))
      console.log('Sample:', JSON.stringify(data3, null, 2).substring(0, 500))
    } else {
      console.log('❌ Status:', res3.status)
    }
  } catch (e) {
    console.log('❌ Error:', e.message)
  }

  // 4. GET /players/{playerId} - паспортные данные
  console.log('\n4️⃣ GET /players/{playerId} - паспортные данные')
  const player = await prisma.player.findFirst({
    where: { rustatId: { not: null } }
  })
  
  if (player && player.rustatId) {
    try {
      const res4 = await fetch(`${API_BASE}/players/${player.rustatId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (res4.ok) {
        const data4 = await res4.json()
        console.log('✅ Status:', res4.status)
        console.log('Response keys:', Object.keys(data4))
        console.log('Full response:', JSON.stringify(data4, null, 2))
      } else {
        console.log('❌ Status:', res4.status)
      }
    } catch (e) {
      console.log('❌ Error:', e.message)
    }
  }
}

async function main() {
  const email = process.env.RUSTAT_EMAIL
  const password = process.env.RUSTAT_PASSWORD

  if (!email || !password) {
    console.log('❌ Не указаны RUSTAT_EMAIL и RUSTAT_PASSWORD')
    process.exit(1)
  }

  const token = await getToken(email, password)
  console.log('✅ Токен получен')

  await testMatchStatsEndpoints(token)
  
  await prisma.$disconnect()
}

main()
