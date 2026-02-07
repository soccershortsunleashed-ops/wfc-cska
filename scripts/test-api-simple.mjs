#!/usr/bin/env node

import 'dotenv/config'

const token = process.env.RUSTAT_TOKEN
const matchId = 688301

console.log('🔍 Простой тест API...\n')

try {
  console.log('Запрос к API...')
  const response = await fetch(
    `https://api-football.rustatsport.ru/matches/${matchId}/info`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  )

  console.log('Status:', response.status)
  
  if (!response.ok) {
    const text = await response.text()
    console.log('Error:', text)
    process.exit(1)
  }

  const data = await response.json()
  console.log('\n✅ Успешно!')
  console.log(JSON.stringify(data, null, 2))

} catch (error) {
  console.error('❌ Ошибка:', error.message)
  console.error('Stack:', error.stack)
}
