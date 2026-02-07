#!/usr/bin/env node

/**
 * Автоматическое получение токена RuStat через браузер
 * 
 * Использует Puppeteer для авторизации и перехвата токена
 */

import 'dotenv/config'
import puppeteer from 'puppeteer'

const RUSTAT_EMAIL = process.env.RUSTAT_EMAIL
const RUSTAT_PASSWORD = process.env.RUSTAT_PASSWORD

if (!RUSTAT_EMAIL || !RUSTAT_PASSWORD) {
  console.error('❌ RUSTAT_EMAIL и RUSTAT_PASSWORD должны быть указаны в .env файле!')
  process.exit(1)
}

async function getToken() {
  console.log('🔐 Автоматическое получение токена RuStat...\n')
  
  let browser
  let token = null

  try {
    console.log('   1️⃣  Запуск браузера...')
    browser = await puppeteer.launch({
      headless: false, // Показываем браузер для отладки
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()

    // Перехватываем запросы к API
    await page.setRequestInterception(true)
    
    page.on('request', (request) => {
      const url = request.url()
      
      // Ищем запросы к API с токеном
      if (url.includes('api-football.rustatsport.ru')) {
        const headers = request.headers()
        if (headers.authorization && headers.authorization.startsWith('Bearer ')) {
          token = headers.authorization.replace('Bearer ', '')
          console.log('\n   ✅ Токен перехвачен!')
        }
      }
      
      request.continue()
    })

    console.log('   2️⃣  Переход на сайт RuStat...')
    await page.goto('https://football.rustatsport.ru', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    })

    // Ждем немного
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Проверяем нужна ли авторизация
    const loginButtons = await page.$$('button, a')
    let loginButton = null
    
    for (const button of loginButtons) {
      const text = await page.evaluate(el => el.textContent, button)
      if (text && text.includes('Войти')) {
        loginButton = button
        break
      }
    }
    
    if (loginButton) {
      console.log('   3️⃣  Авторизация...')
      
      // Кликаем на кнопку входа
      await loginButton.click()
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Вводим email
      console.log('      Ввод email...')
      await page.type('input[type="email"], input[name="username"]', RUSTAT_EMAIL)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Вводим пароль
      console.log('      Ввод пароля...')
      await page.type('input[type="password"], input[name="password"]', RUSTAT_PASSWORD)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Нажимаем кнопку входа
      console.log('      Отправка формы...')
      await page.click('button[type="submit"]')
      
      // Ждем перенаправления
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 })
    } else {
      console.log('   3️⃣  Уже авторизованы')
    }

    // Переходим на страницу с матчами чтобы вызвать API запрос
    console.log('   4️⃣  Загрузка данных...')
    await page.goto('https://football.rustatsport.ru/teams/13503', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    })

    // Ждем API запросы
    await new Promise(resolve => setTimeout(resolve, 3000))

    if (!token) {
      throw new Error('Не удалось перехватить токен')
    }

    // Проверяем токен
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    const expiresAt = new Date(payload.exp * 1000)
    const now = new Date()
    const minutesLeft = Math.floor((expiresAt - now) / 1000 / 60)

    console.log('\n✅ Токен получен успешно!')
    console.log(`   Email: ${payload.email}`)
    console.log(`   Действителен до: ${expiresAt.toLocaleString('ru-RU')}`)
    console.log(`   Осталось времени: ${minutesLeft} минут`)
    console.log()
    console.log('📋 Токен:')
    console.log(token)
    console.log()

    return token

  } catch (error) {
    console.error('\n❌ Ошибка:', error.message)
    throw error
  } finally {
    if (browser) {
      console.log('   Закрытие браузера...')
      await browser.close()
    }
  }
}

async function updateEnvFile(token) {
  const fs = await import('fs')
  const path = await import('path')
  
  const envPath = path.join(process.cwd(), '.env')
  let envContent = fs.readFileSync(envPath, 'utf-8')
  
  // Обновляем токен
  const tokenRegex = /RUSTAT_TOKEN="[^"]*"/
  const now = new Date()
  const timestamp = now.toLocaleString('ru-RU', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  if (tokenRegex.test(envContent)) {
    envContent = envContent.replace(tokenRegex, `RUSTAT_TOKEN="${token}"`)
  } else {
    envContent += `\nRUSTAT_TOKEN="${token}"\n`
  }
  
  // Обновляем комментарий с датой
  envContent = envContent.replace(
    /# Обновлен: .*/,
    `# Обновлен: ${timestamp}`
  )
  
  fs.writeFileSync(envPath, envContent)
  
  console.log('💾 Токен сохранен в .env файл')
  console.log()
}

async function main() {
  try {
    const token = await getToken()
    await updateEnvFile(token)
    
    console.log('✅ Готово! Теперь можно запустить:')
    console.log('   node scripts/test-player-stats-api.mjs')
    console.log()
    
  } catch (error) {
    console.error('\n❌ Критическая ошибка:', error.message)
    process.exit(1)
  }
}

main()
