#!/usr/bin/env node

/**
 * Автоматизированный сбор статистики игроков ЦСКА из RuStat
 * Согласно ТЗ от 31.01.2026
 * 
 * Использование:
 *   node scripts/rustat-auto-sync.mjs
 *   
 * Требует переменные окружения:
 *   RUSTAT_EMAIL - email для входа
 *   RUSTAT_PASSWORD - пароль
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
const CSKA_TEAM_ID = 13503
const API_BASE = 'https://api-football.rustatsport.ru'

// Логирование
const logs = []
function log(message, level = 'info') {
  const timestamp = new Date().toISOString()
  const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`
  logs.push(logEntry)
  console.log(logEntry)
}

// Главная функция
async function main() {
  log('🚀 Запуск автоматизированного сбора статистики ЦСКА из RuStat')
  log('='.repeat(80))

  // 1. Проверка учетных данных
  const email = process.env.RUSTAT_EMAIL
  const password = process.env.RUSTAT_PASSWORD

  if (!email || !password) {
    log('❌ ОШИБКА: Не указаны RUSTAT_EMAIL и RUSTAT_PASSWORD в .env', 'error')
    log('Пожалуйста, добавьте в файл .env:', 'error')
    log('  RUSTAT_EMAIL=ваш_email@example.com', 'error')
    log('  RUSTAT_PASSWORD=ваш_пароль', 'error')
    process.exit(1)
  }

  log(`📧 Email: ${email}`)
  log('')

  let browser = null
  let token = null

  try {
    // 2. Запуск браузера и авторизация
    log('🌐 Запуск браузера...')
    browser = await chromium.launch({ headless: false }) // headless: false для отладки
    const context = await browser.newContext()
    const page = await context.newPage()

    // Перехват токена из запросов
    page.on('request', (request) => {
      const url = request.url()
      if (url.includes('api-football.rustatsport.ru')) {
        const authHeader = request.headers()['authorization']
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.replace('Bearer ', '')
          log(`🔑 Токен перехвачен: ${token.substring(0, 50)}...`)
        }
      }
    })

    // 3. Авторизация
    log('🔐 Переход на сайт RuStat...')
    await page.goto(RUSTAT_URL, { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    })
    await page.waitForTimeout(3000)

    log('🔐 Поиск формы входа...')
    
    // Ищем кнопку "Войти"
    try {
      const loginBtn = page.locator('button:has-text("Войти"), a:has-text("Войти")').first()
      if (await loginBtn.isVisible({ timeout: 5000 })) {
        log('🔐 Нажатие кнопки "Войти"...')
        await loginBtn.click()
        await page.waitForTimeout(2000)
      }
    } catch (e) {
      log('⚠️  Кнопка "Войти" не найдена, возможно уже на странице входа')
    }

    // Вводим данные
    log('🔐 Ввод email...')
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first()
    await emailInput.fill(email)
    await page.waitForTimeout(500)

    log('🔐 Ввод пароля...')
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first()
    await passwordInput.fill(password)
    await page.waitForTimeout(500)

    log('🔐 Отправка формы...')
    const submitBtn = page.locator('button[type="submit"], button:has-text("Войти")').first()
    await submitBtn.click()

    // Ждем авторизации
    log('⏳ Ожидание авторизации...')
    await page.waitForTimeout(5000)

    // Проверяем, получили ли токен
    if (!token) {
      log('⚠️  Токен не перехвачен из запросов, пробуем получить из localStorage...')
      token = await page.evaluate(() => {
        return localStorage.getItem('token') || 
               localStorage.getItem('auth_token') ||
               localStorage.getItem('access_token') ||
               sessionStorage.getItem('token')
      })
    }

    if (!token) {
      throw new Error('Не удалось получить токен после авторизации')
    }

    log(`✅ Токен успешно получен!`)
    log('')

    // 4. Переход на страницу команды ЦСКА
    log('👥 Переход на страницу команды ЦСКА...')
    await page.goto(`${RUSTAT_URL}/teams/${CSKA_TEAM_ID}/players`, { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    })
    await page.waitForTimeout(3000)

    // 5. Получение списка игроков через API
    log('📊 Получение списка игроков через API...')
    const playersResponse = await fetch(`${API_BASE}/teams/${CSKA_TEAM_ID}/players`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!playersResponse.ok) {
      throw new Error(`API error: ${playersResponse.status}`)
    }

    const playersData = await playersResponse.json()
    const players = playersData.players || playersData || []
    
    log(`✅ Найдено игроков: ${players.length}`)
    log('')

    // 6. Обработка каждого игрока
    const stats = {
      playersProcessed: 0,
      playersSkipped: 0,
      matchesAdded: 0,
      shotsAdded: 0,
      errors: []
    }

    for (let i = 0; i < players.length; i++) {
      const player = players[i]
      log(`\n[${ i + 1}/${players.length}] Обработка игрока: ${player.name || player.full_name || 'Unknown'}`)
      
      try {
        // TODO: Реализовать сбор данных игрока
        // - Паспортные данные
        // - Матчи (сезоны 2025 + 2026)
        // - Статистика ударов
        // - Shot map
        
        stats.playersProcessed++
      } catch (error) {
        log(`❌ Ошибка обработки игрока: ${error.message}`, 'error')
        stats.errors.push({ player: player.name, error: error.message })
        stats.playersSkipped++
      }
    }

    // 7. Закрытие браузера
    await browser.close()
    log('\n✅ Браузер закрыт')

    // 8. Финальный отчет
    log('\n' + '='.repeat(80))
    log('📊 ФИНАЛЬНЫЙ ОТЧЕТ')
    log('='.repeat(80))
    log(`Игроков обработано: ${stats.playersProcessed}`)
    log(`Игроков пропущено: ${stats.playersSkipped}`)
    log(`Матчей добавлено: ${stats.matchesAdded}`)
    log(`Ударов добавлено: ${stats.shotsAdded}`)
    log(`Ошибок: ${stats.errors.length}`)
    
    if (stats.errors.length > 0) {
      log('\nОшибки:')
      stats.errors.forEach(e => log(`  - ${e.player}: ${e.error}`))
    }

    // 9. Сохранение лога
    const logFile = `logs/rustat-sync-${new Date().toISOString().replace(/:/g, '-')}.log`
    await fs.mkdir('logs', { recursive: true })
    await fs.writeFile(logFile, logs.join('\n'))
    log(`\n📝 Лог сохранен: ${logFile}`)

  } catch (error) {
    log(`\n❌ КРИТИЧЕСКАЯ ОШИБКА: ${error.message}`, 'error')
    log(error.stack, 'error')
    
    if (browser) {
      await browser.close()
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
