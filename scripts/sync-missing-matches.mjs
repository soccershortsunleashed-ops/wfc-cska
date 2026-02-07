#!/usr/bin/env node

/**
 * Синхронизация недостающих матчей с RuStat
 * Автоматически получает токен и обновляет rustatId для матчей
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

  console.log(`✅ Токен получен\n`)
  return token
}

async function getRustatMatches(token) {
  console.log('📥 Получение матчей ЦСКА из RuStat...')
  
  const response = await fetch(
    `${API_BASE}/teams/${CSKA_TEAM_ID}/matches?limit=200&offset=0`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch matches: ${response.status}`)
  }

  const data = await response.json()
  
  // Фильтруем матчи 2025 года
  const matches2025 = data.matches.filter(match => {
    const year = new Date(match.datetime).getFullYear()
    return year === 2025
  })

  console.log(`✅ Получено ${matches2025.length} матчей 2025 года из RuStat\n`)
  
  return { matches: matches2025, teams: data.teams }
}

async function getDbMatches() {
  console.log('📥 Получение матчей из БД...')
  
  const matches = await prisma.match.findMany({
    where: {
      matchDate: {
        gte: new Date('2025-01-01'),
        lt: new Date('2026-01-01'),
      },
    },
    include: {
      homeTeam: true,
      awayTeam: true,
    },
    orderBy: {
      matchDate: 'desc',
    },
  })

  console.log(`✅ Получено ${matches.length} матчей из БД\n`)
  
  return matches
}

function normalizeTeamName(name) {
  const mapping = {
    'ЦСКА Москва': 'ЦСКА',
    'Зенит Санкт-Петербург': 'Зенит',
    'Спартак Москва': 'Спартак',
    'Крылья Советов Самара': 'Крылья Советов',
    'Урал-УрФА': 'Урал',
  }
  return mapping[name] || name
}

function matchesAreSame(dbMatch, rustatMatch, rustatTeams) {
  // Получаем названия команд из RuStat
  const rustatTeam1 = rustatTeams.find(t => t.id === rustatMatch.team1.id)
  const rustatTeam2 = rustatTeams.find(t => t.id === rustatMatch.team2.id)
  
  if (!rustatTeam1 || !rustatTeam2) return false

  const rustatTeam1Name = normalizeTeamName(rustatTeam1.name_rus)
  const rustatTeam2Name = normalizeTeamName(rustatTeam2.name_rus)
  
  // Получаем названия команд из БД
  const dbHomeName = normalizeTeamName(dbMatch.homeTeam?.name || dbMatch.opponentName || '')
  const dbAwayName = normalizeTeamName(dbMatch.awayTeam?.name || dbMatch.opponentName || '')
  
  // Проверяем совпадение команд (в любом порядке)
  const teamsMatch = 
    (rustatTeam1Name === dbHomeName && rustatTeam2Name === dbAwayName) ||
    (rustatTeam1Name === dbAwayName && rustatTeam2Name === dbHomeName)
  
  if (!teamsMatch) return false

  // Проверяем дату (допускаем разницу в 1 день)
  const dbDate = new Date(dbMatch.matchDate)
  const rustatDate = new Date(rustatMatch.datetime)
  
  const dayDiff = Math.abs(dbDate - rustatDate) / (1000 * 60 * 60 * 24)
  
  return dayDiff < 1
}

async function main() {
  console.log('🚀 Синхронизация недостающих матчей с RuStat\n')
  console.log('='.repeat(80) + '\n')

  const email = process.env.RUSTAT_EMAIL
  const password = process.env.RUSTAT_PASSWORD

  if (!email || !password) {
    console.log('❌ ОШИБКА: Не указаны RUSTAT_EMAIL и RUSTAT_PASSWORD')
    process.exit(1)
  }

  try {
    // 1. Получаем токен
    const token = await getToken(email, password)

    // 2. Получаем данные
    const { matches: rustatMatches, teams: rustatTeams } = await getRustatMatches(token)
    const dbMatches = await getDbMatches()

    console.log('🔍 Сопоставление матчей...\n')

    let matched = 0
    let alreadySynced = 0
    let notMatched = 0

    for (const dbMatch of dbMatches) {
      // Пропускаем уже синхронизированные
      if (dbMatch.rustatId) {
        alreadySynced++
        continue
      }

      // Ищем соответствующий матч в RuStat
      const rustatMatch = rustatMatches.find(rm => 
        matchesAreSame(dbMatch, rm, rustatTeams)
      )

      if (rustatMatch) {
        // Обновляем rustatId
        await prisma.match.update({
          where: { id: dbMatch.id },
          data: { 
            rustatId: rustatMatch.id,
            rustatSynced: false // Помечаем для последующей загрузки детальных данных
          },
        })

        const date = new Date(dbMatch.matchDate).toLocaleDateString('ru-RU')
        const home = dbMatch.homeTeam?.name || 'ЦСКА'
        const away = dbMatch.awayTeam?.name || dbMatch.opponentName
        console.log(`✅ ${date}: ${home} vs ${away} → RuStat ID: ${rustatMatch.id}`)
        matched++
      } else {
        notMatched++
      }
    }

    console.log('\n' + '='.repeat(80))
    console.log('\n📊 Результаты синхронизации:')
    console.log(`   ✅ Сопоставлено: ${matched}`)
    console.log(`   ⏭️  Уже синхронизировано: ${alreadySynced}`)
    console.log(`   ❌ Не найдено: ${notMatched}`)
    console.log(`   📝 Всего матчей в БД: ${dbMatches.length}`)
    
    if (matched > 0) {
      console.log('\n✅ Синхронизация завершена успешно!')
      console.log('\n💡 Теперь запустите синхронизацию статистики игроков:')
      console.log('   node scripts/rustat-complete-sync.mjs')
      console.log('   node scripts/aggregate-player-stats.mjs')
    } else {
      console.log('\n✅ Все матчи уже синхронизированы!')
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
