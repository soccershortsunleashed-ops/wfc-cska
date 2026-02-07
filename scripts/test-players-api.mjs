#!/usr/bin/env node

/**
 * Тестирование API получения игроков
 */

import 'dotenv/config'
import { chromium } from 'playwright'

const RUSTAT_URL = 'https://football.rustatsport.ru'
const API_BASE = 'https://api-football.rustatsport.ru'
const CSKA_TEAM_ID = 13503

async function getToken(email, password) {
  console.log('🌐 Запуск браузера...')
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

async function testEndpoints(token) {
  console.log('\n📊 Тестирование endpoints...\n')

  // Вариант 1: /teams/{teamId}/players
  console.log('1️⃣ GET /teams/13503/players')
  try {
    const res1 = await fetch(`${API_BASE}/teams/${CSKA_TEAM_ID}/players`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data1 = await res1.json()
    console.log('Status:', res1.status)
    console.log('Response keys:', Object.keys(data1))
    console.log('Full response:', JSON.stringify(data1, null, 2))
  } catch (e) {
    console.log('Error:', e.message)
  }

  // Вариант 2: /teams/{teamId}/squad
  console.log('\n2️⃣ GET /teams/13503/squad')
  try {
    const res2 = await fetch(`${API_BASE}/teams/${CSKA_TEAM_ID}/squad`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data2 = await res2.json()
    console.log('Status:', res2.status)
    console.log('Response keys:', Object.keys(data2))
    console.log('Full response:', JSON.stringify(data2, null, 2))
  } catch (e) {
    console.log('Error:', e.message)
  }

  // Вариант 3: /teams/{teamId}/roster
  console.log('\n3️⃣ GET /teams/13503/roster')
  try {
    const res3 = await fetch(`${API_BASE}/teams/${CSKA_TEAM_ID}/roster`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data3 = await res3.json()
    console.log('Status:', res3.status)
    console.log('Response keys:', Object.keys(data3))
    console.log('Full response:', JSON.stringify(data3, null, 2))
  } catch (e) {
    console.log('Error:', e.message)
  }

  // Вариант 4: /teams/{teamId} (общая информация)
  console.log('\n4️⃣ GET /teams/13503')
  try {
    const res4 = await fetch(`${API_BASE}/teams/${CSKA_TEAM_ID}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data4 = await res4.json()
    console.log('Status:', res4.status)
    console.log('Response keys:', Object.keys(data4))
    console.log('Full response:', JSON.stringify(data4, null, 2))
  } catch (e) {
    console.log('Error:', e.message)
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

  await testEndpoints(token)
}

main()
