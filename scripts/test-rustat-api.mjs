#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки RuStat API
 * 
 * Использование:
 *   node scripts/test-rustat-api.mjs
 */

import 'dotenv/config'

const RUSTAT_AUTH_URL = 'https://api-auth.rustatsport.ru'
const RUSTAT_API_URL = 'https://api-football.rustatsport.ru'
const CSKA_TEAM_ID = 13503
const TEST_MATCH_ID = 688301 // Зенит 0:1 ЦСКА, 08.11.2025

async function getToken() {
  console.log('🔐 Получение токена авторизации...')
  
  const params = new URLSearchParams({
    grant_type: 'password',
    client_id: 'rustat_football',
    username: process.env.RUSTAT_EMAIL,
    password: process.env.RUSTAT_PASSWORD,
    scope: 'openid',
    response_type: 'id_token token',
    email: process.env.RUSTAT_EMAIL,
    session_state: '',
    lang: 'ru',
  })
  
  const response = await fetch(`${RUSTAT_AUTH_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Auth failed: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  console.log('✅ Токен получен успешно\n')
  
  return data.access_token
}

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
      // Добавьте другие схемы по мере необходимости
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
  console.log('🚀 Тестирование RuStat API\n')
  console.log('=' .repeat(60))
  console.log()

  try {
    // Проверяем переменные окружения
    if (!process.env.RUSTAT_EMAIL || !process.env.RUSTAT_PASSWORD) {
      throw new Error('RUSTAT_EMAIL и RUSTAT_PASSWORD должны быть установлены в .env')
    }

    // Получаем токен
    const token = await getToken()

    // Тестируем различные endpoints
    await testMatchInfo(token, TEST_MATCH_ID)
    await testMatchPlayers(token, TEST_MATCH_ID)
    await testMatchTactics(token, TEST_MATCH_ID)
    await testTeamMatches(token)

    console.log('=' .repeat(60))
    console.log('✅ Все тесты пройдены успешно!')
    console.log('\n💡 Теперь можно использовать rustatApiService в коде')
    
  } catch (error) {
    console.error('\n❌ Ошибка:', error.message)
    process.exit(1)
  }
}

main()
