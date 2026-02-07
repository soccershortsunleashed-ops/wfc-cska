#!/usr/bin/env node

/**
 * Упрощенный тестовый скрипт для проверки RuStat API
 * Использует токен из браузера
 * 
 * Использование:
 *   1. Откройте https://football.rustatsport.ru в браузере
 *   2. Войдите в систему
 *   3. Скопируйте токен из DevTools (Network -> любой запрос -> Authorization header)
 *   4. Вставьте токен ниже
 *   5. Запустите: node scripts/test-rustat-api-simple.mjs
 */

// ВСТАВЬТЕ ТОКЕН СЮДА (без "Bearer ")
const TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ikg3eDZQWGJab3VLIiwidHlwIjoiSldUIn0.eyJhY2wiOm51bGwsImFjdGl2ZSI6dHJ1ZSwiYXVkIjpbInJ1c3RhdF9mb290YmFsbCJdLCJhdXRoX3R5cGUiOiJjb2RlIiwiY2xpZW50X2lkIjoicnVzdGF0X2Zvb3RiYWxsIiwiZW1haWwiOiJ2YWRpbS1maWZhQG1haWwucnUiLCJleHAiOjE3Njk2Mjk5NTksImlhdCI6MTc2OTYyOTY1OSwiaXNzIjoiaHR0cHM6Ly9hcGktYXV0aC5ydXN0YXRzcG9ydC5ydSIsInNjb3BlIjoib3BlbmlkIiwic2Vzc2lvbiI6IjViNjA5ZGEwMTM2N2VkMzA5Y2FlNjBkM2JlNDI4ODA5MTA1ZGMzZGM4ZGZmNDQ2MzJjMjNhNTcyOWU2NWMxYTkiLCJ0b3NfYWNjZXB0ZWQiOnRydWUsInR3b19mYWN0b3IiOmZhbHNlLCJ0eXAiOiJCZWFyZXIiLCJ1c2VyX2lkIjo2MDd9.F1TptlnzlK4JYeckkADSzLRM7ku_3zl2PQBM29EvzUfSbla4lkOB0cox-fOQSh3RNhvuxK01fF8HwTuIAzzE4zqzLGLOAGCkN8-8cD0-S5_0WZ-cL91kqmKygFs_ieIdL01HvfGpMU-iGU9k4Py2uLdsiFIFmOxwPVsqtkAa1S3sxlzyX_LWTvPrPPvIfuLiROtwQzbdtypdpK7fmnF9HE6fc4IQD0L73btd7l1NWNfa3_J3KZU-tZVnbZJo4BgKn8SdD9_XYwca3ZYMHM45bUpL_PuD0m4xxY0wPGXXli3dXhPRmjl5Hf6Aza9o9-gqrACTJkUmJZivLYkyvFVSVA'

const RUSTAT_API_URL = 'https://api-football.rustatsport.ru'
const CSKA_TEAM_ID = 13503
const TEST_MATCH_ID = 688301 // Зенит 0:1 ЦСКА, 08.11.2025

async function testMatchInfo(token, matchId) {
  console.log(`📊 Получение информации о матче ${matchId}...`)
  
  const response = await fetch(`${RUSTAT_API_URL}/matches/${matchId}/info`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch match info: ${response.status}`)
  }

  const data = await response.json()
  console.log('✅ Информация о матче:')
  console.log(`   Дата: ${data.date}`)
  console.log(`   Турнир: ${data.tournament.name_rus}`)
  console.log(`   ${data.team1.name_rus} ${data.team1.score}:${data.team2.score} ${data.team2.name_rus}`)
  console.log(`   Видео: ${data.has_video ? 'Да' : 'Нет'}\n`)
  
  return data
}

async function testMatchPlayers(token, matchId) {
  console.log(`👥 Получение списка игроков матча ${matchId}...`)
  
  const response = await fetch(`${RUSTAT_API_URL}/matches/${matchId}/players`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch match players: ${response.status}`)
  }

  const data = await response.json()
  console.log(`✅ Получено игроков: ${data.length}`)
  
  // Группируем по командам
  const cskaPlayers = data.filter(p => p.team_id === CSKA_TEAM_ID)
  const opponentPlayers = data.filter(p => p.team_id !== CSKA_TEAM_ID)
  
  console.log(`   ЦСКА: ${cskaPlayers.length} игроков`)
  console.log(`   Соперник: ${opponentPlayers.length} игроков\n`)
  
  return data
}

async function testMatchTactics(token, matchId) {
  console.log(`⚽ Получение расстановок матча ${matchId}...`)
  
  const response = await fetch(`${RUSTAT_API_URL}/matches/${matchId}/tactics`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch match tactics: ${response.status}`)
  }

  const data = await response.json()
  console.log('✅ Расстановки получены:')
  console.log(`   Начало матча: ${data.start.length} команды`)
  console.log(`   Конец матча: ${data.end.length} команды`)
  
  // Показываем схемы
  data.start.forEach(team => {
    const schemeNames = {
      908: '4-4-2 classic',
    }
    console.log(`   Команда ${team.team_id}: ${schemeNames[team.lexic] || team.lexic}, ${team.players.length} игроков`)
  })
  console.log()
  
  return data
}

async function testTeamMatches(token) {
  console.log(`📅 Получение матчей ЦСКА...`)
  
  const response = await fetch(`${RUSTAT_API_URL}/teams/${CSKA_TEAM_ID}/matches?limit=10&offset=0`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch team matches: ${response.status}`)
  }

  const data = await response.json()
  console.log(`✅ Получено матчей: ${data.matches.length}`)
  
  // Показываем последние 3 матча
  console.log('\n   Последние матчи:')
  data.matches.slice(0, 3).forEach(match => {
    const date = new Date(match.datetime).toLocaleDateString('ru-RU')
    const team1 = data.teams.find(t => t.id === match.team1.id)
    const team2 = data.teams.find(t => t.id === match.team2.id)
    console.log(`   ${date}: ${team1?.name_rus} ${match.team1.score}:${match.team2.score} ${team2?.name_rus}`)
  })
  console.log()
  
  return data
}

async function main() {
  console.log('🚀 Тестирование RuStat API (с готовым токеном)\n')
  console.log('=' .repeat(60))
  console.log()

  try {
    // Тестируем различные endpoints
    await testMatchInfo(TOKEN, TEST_MATCH_ID)
    await testMatchPlayers(TOKEN, TEST_MATCH_ID)
    await testMatchTactics(TOKEN, TEST_MATCH_ID)
    await testTeamMatches(TOKEN)

    console.log('=' .repeat(60))
    console.log('✅ Все тесты пройдены успешно!')
    console.log('\n💡 API работает корректно, можно продолжать разработку')
    
  } catch (error) {
    console.error('\n❌ Ошибка:', error.message)
    process.exit(1)
  }
}

main()
