#!/usr/bin/env node

/**
 * Исследование API страницы игрока RuStat
 * 
 * Страница: https://football.rustatsport.ru/players/1373001
 * Игрок: Смирнова Надежда (ID: 1373001)
 */

import 'dotenv/config'

const RUSTAT_API_URL = 'https://api-football.rustatsport.ru'
const RUSTAT_TOKEN = process.env.RUSTAT_TOKEN
const PLAYER_ID = 1373001 // Смирнова Надежда

if (!RUSTAT_TOKEN) {
  console.error('❌ RUSTAT_TOKEN не найден в .env файле!')
  process.exit(1)
}

console.log('\n🔍 Исследование API игрока RuStat')
console.log('='.repeat(80))
console.log(`Игрок ID: ${PLAYER_ID}`)
console.log(`URL: https://football.rustatsport.ru/players/${PLAYER_ID}`)
console.log()

// Попробуем разные endpoints
const endpoints = [
  `/players/${PLAYER_ID}`,
  `/players/${PLAYER_ID}/stats`,
  `/players/${PLAYER_ID}/info`,
  `/players/${PLAYER_ID}/seasons`,
  `/players/${PLAYER_ID}/matches`,
]

for (const endpoint of endpoints) {
  console.log(`\n📡 Пробуем: ${endpoint}`)
  
  try {
    const response = await fetch(`${RUSTAT_API_URL}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${RUSTAT_TOKEN}` },
    })
    
    console.log(`   Статус: ${response.status} ${response.statusText}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log(`   ✅ Успешно!`)
      console.log(`   Структура:`, Object.keys(data).join(', '))
      console.log(`   Данные (первые 500 символов):`)
      console.log(`   ${JSON.stringify(data, null, 2).substring(0, 500)}...`)
    }
  } catch (error) {
    console.log(`   ❌ Ошибка: ${error.message}`)
  }
}

console.log('\n' + '='.repeat(80))
console.log('💡 Подсказка: Откройте DevTools на странице игрока и посмотрите Network')
console.log()
