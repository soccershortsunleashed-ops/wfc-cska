#!/usr/bin/env node

import 'dotenv/config'

const RUSTAT_API_URL = 'https://api-football.rustatsport.ru'
const MATCH_ID = 688301
const token = process.env.RUSTAT_TOKEN

if (!token) {
  console.error('❌ RUSTAT_TOKEN не найден в .env')
  process.exit(1)
}

async function testEndpoint(name, url, options = {}) {
  console.log(`\n🔍 Тестируем: ${name}`)
  console.log(`   URL: ${url}`)
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    console.log(`   Status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const text = await response.text()
      console.log(`   ❌ Error: ${text}`)
      return null
    }

    const data = await response.json()
    console.log(`   ✅ Success`)
    console.log(`   Data keys: ${Object.keys(data).join(', ')}`)
    
    return data
  } catch (error) {
    console.log(`   ❌ Exception: ${error.message}`)
    return null
  }
}

async function main() {
  console.log('🚀 Тестирование RuStat API endpoints для статистики')
  console.log(`   Match ID: ${MATCH_ID}`)

  // Тест 1: POST /matches/teams/stats
  const teamStats1 = await testEndpoint(
    'Team Stats (POST)',
    `${RUSTAT_API_URL}/matches/teams/stats`,
    {
      method: 'POST',
      body: JSON.stringify({ 
        match_id: MATCH_ID,
        params: [[1, 0], [120, 0], [113, 0], [545, 0], [268, 0], [350, 0], [76, 0]]
      }),
    }
  )

  // Тест 2: GET /matches/{id}/teams/stats
  const teamStats2 = await testEndpoint(
    'Team Stats (GET)',
    `${RUSTAT_API_URL}/matches/${MATCH_ID}/teams/stats`
  )

  // Тест 3: POST /matches/players/stats
  const playerStats1 = await testEndpoint(
    'Player Stats (POST)',
    `${RUSTAT_API_URL}/matches/players/stats`,
    {
      method: 'POST',
      body: JSON.stringify({ 
        match_id: MATCH_ID,
        params: [[1, 0], [288, 0], [196, 0], [393, 0], [641, 0], [336, 0], [488, 0]]
      }),
    }
  )

  // Тест 4: GET /matches/{id}/players/stats
  const playerStats2 = await testEndpoint(
    'Player Stats (GET)',
    `${RUSTAT_API_URL}/matches/${MATCH_ID}/players/stats`
  )

  // Тест 5: GET /matches/{id}/stats (может быть общий endpoint)
  const allStats = await testEndpoint(
    'All Stats (GET)',
    `${RUSTAT_API_URL}/matches/${MATCH_ID}/stats`
  )

  console.log('\n' + '='.repeat(60))
  console.log('📊 Результаты:')
  console.log(`   Team Stats (POST): ${teamStats1 ? '✅' : '❌'}`)
  console.log(`   Team Stats (GET): ${teamStats2 ? '✅' : '❌'}`)
  console.log(`   Player Stats (POST): ${playerStats1 ? '✅' : '❌'}`)
  console.log(`   Player Stats (GET): ${playerStats2 ? '✅' : '❌'}`)
  console.log(`   All Stats (GET): ${allStats ? '✅' : '❌'}`)

  // Если нашли рабочий endpoint, покажем структуру данных
  if (teamStats1 || teamStats2) {
    const data = teamStats1 || teamStats2
    console.log('\n📈 Структура Team Stats:')
    console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...')
  }

  if (playerStats1 || playerStats2) {
    const data = playerStats1 || playerStats2
    console.log('\n📈 Структура Player Stats:')
    console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...')
  }
}

main().catch(console.error)
