#!/usr/bin/env node

/**
 * Автоматическое получение токена RuStat через OAuth 2.0
 * 
 * Использует учетные данные из .env файла
 */

import 'dotenv/config'

const RUSTAT_AUTH_URL = 'https://api-auth.rustatsport.ru'
const RUSTAT_EMAIL = process.env.RUSTAT_EMAIL
const RUSTAT_PASSWORD = process.env.RUSTAT_PASSWORD

if (!RUSTAT_EMAIL || !RUSTAT_PASSWORD) {
  console.error('❌ RUSTAT_EMAIL и RUSTAT_PASSWORD должны быть указаны в .env файле!')
  process.exit(1)
}

async function getToken() {
  console.log('🔐 Получение токена RuStat через OAuth 2.0...\n')
  
  try {
    console.log(`   Email: ${RUSTAT_EMAIL}`)
    console.log('   Отправка запроса...')

    const response = await fetch(`${RUSTAT_AUTH_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: 'rustat_football',
        username: RUSTAT_EMAIL,
        password: RUSTAT_PASSWORD,
        scope: 'openid',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    
    console.log('\n✅ Токен получен успешно!')
    console.log(`   Тип: ${data.token_type}`)
    console.log(`   Истекает через: ${data.expires_in} секунд (${Math.floor(data.expires_in / 60)} минут)`)
    console.log()
    console.log('📋 Токен:')
    console.log(data.access_token)
    console.log()
    console.log('💡 Скопируйте токен и обновите RUSTAT_TOKEN в .env файле')
    console.log()

    // Проверяем токен
    const payload = JSON.parse(Buffer.from(data.access_token.split('.')[1], 'base64').toString())
    const expiresAt = new Date(payload.exp * 1000)
    console.log(`   Токен действителен до: ${expiresAt.toLocaleString('ru-RU')}`)
    console.log()

    return data.access_token

  } catch (error) {
    console.error('\n❌ Ошибка получения токена:', error.message)
    console.error('\n💡 Возможные причины:')
    console.error('   - Неверные учетные данные')
    console.error('   - Проблемы с сетью')
    console.error('   - API временно недоступен')
    console.error()
    process.exit(1)
  }
}

getToken()
