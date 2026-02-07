#!/usr/bin/env node

import 'dotenv/config'

const token = process.env.RUSTAT_TOKEN
const CSKA_TEAM_ID = 13503

async function testEndpoint() {
  console.log('🔍 Тестирование endpoint /teams/{id}/players...\n')
  
  try {
    const response = await fetch(
      `https://api-football.rustatsport.ru/teams/${CSKA_TEAM_ID}/players`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    )

    console.log('Status:', response.status)
    
    if (!response.ok) {
      const text = await response.text()
      console.log('Error:', text)
      return
    }

    const data = await response.json()
    
    console.log('\n✅ Успешно!')
    console.log(`Тип данных: ${typeof data}`)
    console.log(`Количество игроков: ${Array.isArray(data) ? data.length : 'не массив'}`)
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('\n📋 Первый игрок:')
      console.log(JSON.stringify(data[0], null, 2))
      
      console.log('\n📋 Поля:')
      Object.keys(data[0]).forEach(key => {
        console.log(`  - ${key}: ${typeof data[0][key]}`)
      })
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message)
  }
}

testEndpoint()
