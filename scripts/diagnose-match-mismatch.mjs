#!/usr/bin/env node

import 'dotenv/config'
import { chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

const RUSTAT_URL = 'https://football.rustatsport.ru'
const API_BASE = 'https://api-football.rustatsport.ru'

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

  // Берем игрока Смирнову (rustatId: 1373001)
  const player = await prisma.player.findFirst({
    where: { rustatId: 1373001 }
  })

  console.log(`Игрок: ${player.firstName} ${player.lastName}`)
  console.log(`RuStat ID: ${player.rustatId}\n`)

  // Получаем матчи игрока за сезон 2025
  const response = await fetch(
    `${API_BASE}/players/${player.rustatId}/matches?season_id=35&limit=10`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  )

  const data = await response.json()
  const matches = data.matches || data || []

  console.log(`Матчей из API (сезон 2025): ${matches.length}\n`)
  console.log('Структура первого матча:')
  console.log(JSON.stringify(matches[0], null, 2))
  
  console.log('\nПервые 10 матчей из API:')
  matches.slice(0, 10).forEach(m => {
    console.log(`- match_id: ${m.match_id || m.id}, date: ${m.date || m.datetime}`)
  })

  // Получаем матчи из БД
  const dbMatches = await prisma.match.findMany({
    where: { rustatId: { not: null } },
    select: { rustatId: true, slug: true, matchDate: true },
    orderBy: { matchDate: 'desc' }
  })

  console.log(`\nМатчей в БД с RuStat ID: ${dbMatches.length}\n`)
  console.log('Матчи в БД:')
  dbMatches.forEach(m => {
    console.log(`- rustatId: ${m.rustatId}, slug: ${m.slug}, date: ${m.matchDate.toLocaleDateString('ru-RU')}`)
  })

  // Проверяем совпадения
  console.log('\n🔍 Проверка совпадений:')
  const apiMatchIds = new Set(matches.map(m => m.id))
  const dbMatchIds = new Set(dbMatches.map(m => m.rustatId))

  const intersection = [...apiMatchIds].filter(id => dbMatchIds.has(id))
  console.log(`Совпадений: ${intersection.length}`)
  
  if (intersection.length > 0) {
    console.log('\nСовпадающие матчи:')
    intersection.forEach(id => {
      const apiMatch = matches.find(m => m.id === id)
      const dbMatch = dbMatches.find(m => m.rustatId === id)
      console.log(`- ${id}: ${apiMatch.datetime} (API) = ${dbMatch.slug} (DB)`)
    })
  }

  await prisma.$disconnect()
}

main()
