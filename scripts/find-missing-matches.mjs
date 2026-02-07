#!/usr/bin/env node

/**
 * Находит матчи, которые есть в RuStat, но отсутствуют в БД
 */

import 'dotenv/config'
import { chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

const RUSTAT_URL = 'https://football.rustatsport.ru'
const API_BASE = 'https://api-football.rustatsport.ru'
const CSKA_TEAM_ID = 13503

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

  if (!token) throw new Error('Не удалось получить токен')

  console.log(`✅ Токен получен\n`)
  return token
}

async function main() {
  console.log('🔍 Поиск недостающих матчей\n')
  console.log('='.repeat(80) + '\n')

  const email = process.env.RUSTAT_EMAIL
  const password = process.env.RUSTAT_PASSWORD

  if (!email || !password) {
    console.log('❌ ОШИБКА: Не указаны RUSTAT_EMAIL и RUSTAT_PASSWORD')
    process.exit(1)
  }

  try {
    const token = await getToken(email, password)

    // Получаем матчи из RuStat
    console.log('📥 Получение матчей из RuStat...')
    const response = await fetch(
      `${API_BASE}/teams/${CSKA_TEAM_ID}/matches?limit=200&offset=0`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch matches: ${response.status}`)
    }

    const data = await response.json()
    
    // Фильтруем матчи 2025 года
    const rustatMatches = data.matches.filter(match => {
      const year = new Date(match.datetime).getFullYear()
      return year === 2025
    })

    console.log(`✅ Получено ${rustatMatches.length} матчей из RuStat\n`)

    // Получаем матчи из БД
    console.log('📥 Получение матчей из БД...')
    const dbMatches = await prisma.match.findMany({
      where: {
        matchDate: {
          gte: new Date('2025-01-01'),
          lt: new Date('2026-01-01'),
        },
      },
    })

    console.log(`✅ Получено ${dbMatches.length} матчей из БД\n`)

    // Находим матчи, которых нет в БД
    const dbRustatIds = new Set(dbMatches.map(m => m.rustatId).filter(Boolean))
    
    const missingMatches = rustatMatches.filter(rm => !dbRustatIds.has(rm.id))

    console.log('='.repeat(80))
    console.log(`\n📊 Найдено недостающих матчей: ${missingMatches.length}\n`)

    if (missingMatches.length > 0) {
      console.log('Недостающие матчи:\n')
      
      for (const match of missingMatches) {
        const date = new Date(match.datetime).toLocaleDateString('ru-RU')
        const team1 = data.teams.find(t => t.id === match.team1.id)
        const team2 = data.teams.find(t => t.id === match.team2.id)
        const score = match.score1 !== null && match.score2 !== null 
          ? `${match.score1}:${match.score2}` 
          : '-:-'
        
        console.log(`  ${date} | ${team1?.name_rus} vs ${team2?.name_rus} | ${score} | RuStat ID: ${match.id}`)
      }

      console.log('\n💡 Эти матчи нужно добавить в БД вручную или через seed скрипт')
    } else {
      console.log('✅ Все матчи из RuStat уже есть в БД!')
    }

  } catch (error) {
    console.error('\n❌ ОШИБКА:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
