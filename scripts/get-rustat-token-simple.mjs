#!/usr/bin/env node

/**
 * Простое получение токена RuStat
 * Открывает браузер и ждет пока пользователь авторизуется
 */

import puppeteer from 'puppeteer'
import fs from 'fs'

async function getToken() {
  console.log('🔐 Получение токена RuStat...\n')
  console.log('💡 Браузер откроется автоматически')
  console.log('💡 Если нужно - авторизуйтесь вручную')
  console.log('💡 Скрипт автоматически перехватит токен\n')
  
  let browser
  let token = null

  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox'],
    })

    const page = await browser.newPage()

    // Перехватываем запросы
    await page.setRequestInterception(true)
    
    page.on('request', (request) => {
      const url = request.url()
      
      if (url.includes('api-football.rustatsport.ru')) {
        const headers = request.headers()
        if (headers.authorization && headers.authorization.startsWith('Bearer ')) {
          if (!token) {
            token = headers.authorization.replace('Bearer ', '')
            console.log('✅ Токен перехвачен!')
            
            // Проверяем токен
            try {
              const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
              const expiresAt = new Date(payload.exp * 1000)
              const now = new Date()
              const minutesLeft = Math.floor((expiresAt - now) / 1000 / 60)
              
              console.log(`   Email: ${payload.email}`)
              console.log(`   Действителен до: ${expiresAt.toLocaleString('ru-RU')}`)
              console.log(`   Осталось: ${minutesLeft} минут\n`)
            } catch (e) {
              // Ignore
            }
          }
        }
      }
      
      request.continue()
    })

    console.log('Открываю RuStat...\n')
    await page.goto('https://football.rustatsport.ru', {
      waitUntil: 'domcontentloaded',
    })

    // Ждем токен максимум 60 секунд
    console.log('Ожидание токена (макс. 60 сек)...')
    console.log('Если нужно - авторизуйтесь в браузере\n')
    
    for (let i = 0; i < 60 && !token; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      if (i % 5 === 0 && i > 0) {
        console.log(`   Прошло ${i} секунд...`)
      }
    }

    if (!token) {
      throw new Error('Токен не получен за 60 секунд')
    }

    // Обновляем .env
    const envPath = '.env'
    let envContent = fs.readFileSync(envPath, 'utf-8')
    
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
    
    // Обновляем комментарий
    if (envContent.includes('# Обновлен:')) {
      envContent = envContent.replace(/# Обновлен: .*/, `# Обновлен: ${timestamp}`)
    } else {
      envContent = envContent.replace(
        /RUSTAT_TOKEN=/,
        `# Обновлен: ${timestamp}\nRUSTAT_TOKEN=`
      )
    }
    
    fs.writeFileSync(envPath, envContent)
    
    console.log('💾 Токен сохранен в .env\n')
    console.log('✅ Готово! Можно запускать:')
    console.log('   node scripts/test-player-stats-api.mjs\n')

    return token

  } catch (error) {
    console.error('\n❌ Ошибка:', error.message)
    throw error
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

getToken().catch(() => process.exit(1))
