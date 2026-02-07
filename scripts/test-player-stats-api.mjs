#!/usr/bin/env node

/**
 * Тестовый скрипт для исследования RuStat API статистики игроков
 * 
 * Цель:
 * 1. Получить статистику игроков из конкретного матча
 * 2. Проанализировать все доступные параметры (lexic ID)
 * 3. Определить mapping параметров к понятным названиям
 * 
 * Использование:
 *   node scripts/test-player-stats-api.mjs
 *   node scripts/test-player-stats-api.mjs --match-id 688301
 */

import 'dotenv/config'

const RUSTAT_API_URL = 'https://api-football.rustatsport.ru'
const RUSTAT_TOKEN = process.env.RUSTAT_TOKEN

// Матч по умолчанию: Зенит 0:1 ЦСКА (28.09.2025)
const DEFAULT_MATCH_ID = 688301

// Получить match ID из аргументов командной строки
const matchId = process.argv.includes('--match-id') 
  ? parseInt(process.argv[process.argv.indexOf('--match-id') + 1])
  : DEFAULT_MATCH_ID

// ============================================================================
// Проверка токена
// ============================================================================

function checkToken(token) {
  console.log('🔐 Проверка токена...\n')
  
  if (!token) {
    console.error('❌ RUSTAT_TOKEN не найден в .env файле!')
    console.error('💡 Получите токен из браузера DevTools:')
    console.error('   1. Откройте https://football.rustatsport.ru')
    console.error('   2. Войдите в систему')
    console.error('   3. Откройте DevTools → Network')
    console.error('   4. Найдите запрос к api-football.rustatsport.ru')
    console.error('   5. Скопируйте Authorization header (без "Bearer ")')
    console.error('   6. Обновите RUSTAT_TOKEN в .env файле\n')
    process.exit(1)
  }

  try {
    // Декодируем JWT
    const tokenParts = token.split('.')
    if (tokenParts.length !== 3) {
      throw new Error('Неверный формат токена')
    }

    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString())
    const expiresAt = new Date(payload.exp * 1000)
    const now = new Date()

    console.log(`   Email: ${payload.email}`)
    console.log(`   Токен действителен до: ${expiresAt.toLocaleString('ru-RU')}`)

    if (expiresAt < now) {
      console.error('\n❌ Токен истек! Обновите RUSTAT_TOKEN в .env файле')
      console.error('💡 Следуйте инструкции выше для получения нового токена\n')
      process.exit(1)
    }

    const minutesLeft = Math.floor((expiresAt - now) / 1000 / 60)
    console.log(`   Осталось времени: ${minutesLeft} минут\n`)

    return true

  } catch (error) {
    console.error('❌ Ошибка проверки токена:', error.message)
    process.exit(1)
  }
}

// ============================================================================
// Получение данных из API
// ============================================================================

async function fetchRustatData(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${RUSTAT_TOKEN}`,
      'Content-Type': 'application/json',
    },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(`${RUSTAT_API_URL}${endpoint}`, options)

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`HTTP ${response.status}: ${text}`)
    }

    return response.json()
  } catch (error) {
    if (error.message.includes('fetch failed')) {
      throw new Error(`Ошибка сети: ${error.message}. Проверьте подключение к интернету.`)
    }
    throw error
  }
}

// ============================================================================
// Получение статистики игроков
// ============================================================================

async function getPlayerStats(matchId) {
  console.log(`📊 Получение статистики игроков для матча ${matchId}...\n`)

  try {
    // 1. Получаем информацию о матче
    console.log('   1️⃣  Получение информации о матче...')
    const matchInfo = await fetchRustatData(`/matches/${matchId}/info`)
    console.log(`      ✅ ${matchInfo.team1.name_rus} ${matchInfo.team1.score}:${matchInfo.team2.score} ${matchInfo.team2.name_rus}`)
    console.log(`      📅 ${matchInfo.date}\n`)

    // 2. Получаем список игроков
    console.log('   2️⃣  Получение списка игроков...')
    const players = await fetchRustatData(`/matches/${matchId}/players`)
    const cskaPlayers = players.filter(p => 
      p.name_rus.includes('ЦСКА') || p.team_id === 13503
    )
    console.log(`      ✅ Всего игроков: ${players.length}`)
    console.log(`      ✅ Игроков ЦСКА: ${cskaPlayers.length}\n`)

    // 3. Получаем статистику игроков
    console.log('   3️⃣  Получение статистики игроков...')
    
    // Параметры для запроса (все доступные)
    const params = [
      [1, 0],    // Index (рейтинг)
      [288, 0],  // Минуты на поле
      [196, 0],  // Голы
      [393, 0],  // Передачи голевые
      [641, 0],  // Удары
      [643, 0],  // Удары в створ
      [336, 0],  // Передачи
      [488, 0],  // Передачи точные, %
      [434, 0],  // Передачи ключевые
      [225, 0],  // Единоборства
      [262, 0],  // Единоборства удачные, %
      [202, 0],  // Желтые карточки
      [203, 0],  // Красные карточки
      [291, 0],  // Перехваты
      [731, 0],  // Отборы
      [766, 0],  // Блоки
      [342, 0],  // Выносы
      [399, 0],  // Дриблинг попытки
      [401, 0],  // Дриблинг успешный
      [460, 0],  // Фолы полученные
      [462, 0],  // Фолы совершенные
      [726, 0],  // Сейвы (для вратарей)
      [728, 0],  // Пропущенные голы (для вратарей)
      [719, 0],  // Позиция
    ]

    const playerStats = await fetchRustatData('/matches/players/stats', 'POST', {
      gk: false,
      match_id: matchId,
      params,
    })

    console.log(`      ✅ Получена статистика для ${playerStats.length} игроков\n`)

    return {
      matchInfo,
      players,
      cskaPlayers,
      playerStats,
    }

  } catch (error) {
    console.error('❌ Ошибка получения данных:', error.message)
    throw error
  }
}

// ============================================================================
// Анализ параметров
// ============================================================================

function analyzeParameters(playerStats) {
  console.log('🔍 Анализ доступных параметров статистики...\n')

  // Собираем все уникальные параметры
  const allParams = new Set()
  
  for (const player of playerStats) {
    for (const stat of player.stats) {
      allParams.add(stat.p)
    }
  }

  const sortedParams = Array.from(allParams).sort((a, b) => a - b)

  console.log(`   Найдено уникальных параметров: ${sortedParams.length}\n`)
  console.log('   Список параметров (lexic ID):')
  console.log('   ' + sortedParams.join(', '))
  console.log()

  return sortedParams
}

// ============================================================================
// Детальный анализ игрока
// ============================================================================

function analyzePlayer(player, playerStats, players) {
  const playerInfo = players.find(p => p.id === player.player_id)
  
  if (!playerInfo) {
    console.log('   ⚠️  Информация об игроке не найдена\n')
    return
  }

  console.log(`\n📋 Детальная статистика: ${playerInfo.name_rus} (#${playerInfo.num})`)
  console.log('   ' + '='.repeat(60))

  // Группируем параметры по категориям
  const categories = {
    'Основные показатели': [1, 288, 196, 393],
    'Удары': [641, 643],
    'Передачи': [336, 488, 434],
    'Единоборства': [225, 262],
    'Карточки': [202, 203],
    'Защита': [291, 731, 766, 342],
    'Атака': [399, 401, 460, 462],
    'Вратарь': [726, 728],
    'Прочее': [719],
  }

  const paramNames = {
    1: 'Рейтинг',
    288: 'Минуты на поле',
    196: 'Голы',
    393: 'Голевые передачи',
    641: 'Удары всего',
    643: 'Удары в створ',
    336: 'Передачи всего',
    488: 'Передачи точные, %',
    434: 'Ключевые передачи',
    225: 'Единоборства всего',
    262: 'Единоборства выигранные, %',
    202: 'Желтые карточки',
    203: 'Красные карточки',
    291: 'Перехваты',
    731: 'Отборы',
    766: 'Блоки',
    342: 'Выносы',
    399: 'Дриблинг попытки',
    401: 'Дриблинг успешный',
    460: 'Фолы полученные',
    462: 'Фолы совершенные',
    726: 'Сейвы',
    728: 'Пропущенные голы',
    719: 'Позиция (ID)',
  }

  for (const [category, paramIds] of Object.entries(categories)) {
    const categoryStats = player.stats.filter(s => paramIds.includes(s.p))
    
    if (categoryStats.length === 0) continue

    console.log(`\n   ${category}:`)
    
    for (const stat of categoryStats) {
      const name = paramNames[stat.p] || `Параметр ${stat.p}`
      const value = stat.v
      console.log(`      ${name.padEnd(30)} ${value}`)
    }
  }

  console.log()
}

// ============================================================================
// Создание mapping файла
// ============================================================================

function generateMapping(allParams) {
  console.log('\n📝 Генерация mapping файла...\n')

  const paramNames = {
    1: 'RATING',
    288: 'MINUTES',
    196: 'GOALS',
    393: 'ASSISTS',
    641: 'SHOTS',
    643: 'SHOTS_ON_TARGET',
    336: 'PASSES',
    488: 'PASSES_ACCURATE_PCT',
    434: 'KEY_PASSES',
    225: 'DUELS',
    262: 'DUELS_WON_PCT',
    202: 'YELLOW_CARDS',
    203: 'RED_CARDS',
    291: 'INTERCEPTIONS',
    731: 'TACKLES',
    766: 'BLOCKS',
    342: 'CLEARANCES',
    399: 'DRIBBLES',
    401: 'DRIBBLES_SUCCESS',
    460: 'FOULS_DRAWN',
    462: 'FOULS_COMMITTED',
    726: 'SAVES',
    728: 'GOALS_CONCEDED',
    719: 'POSITION',
  }

  console.log('   Константы для lib/constants/rustat-player-params.ts:')
  console.log()
  console.log('   export const RUSTAT_PLAYER_PARAMS = {')
  
  for (const paramId of allParams) {
    const name = paramNames[paramId]
    if (name) {
      console.log(`     ${name}: ${paramId},`)
    }
  }
  
  console.log('   } as const')
  console.log()
}

// ============================================================================
// Главная функция
// ============================================================================

async function main() {
  console.log('\n🚀 Тестирование RuStat API для статистики игроков\n')
  console.log('='.repeat(80))
  console.log()

  try {
    // 1. Проверка токена
    checkToken(RUSTAT_TOKEN)

    // 2. Получение данных
    const { matchInfo, players, cskaPlayers, playerStats } = await getPlayerStats(matchId)

    // 3. Анализ параметров
    const allParams = analyzeParameters(playerStats)

    // 4. Детальный анализ первого игрока ЦСКА
    if (playerStats.length > 0) {
      const cskaPlayerStats = playerStats.filter(ps => {
        const playerInfo = players.find(p => p.id === ps.player_id)
        return playerInfo && playerInfo.team_id === 13503
      })

      if (cskaPlayerStats.length > 0) {
        analyzePlayer(cskaPlayerStats[0], playerStats, players)
      }
    }

    // 5. Генерация mapping
    generateMapping(allParams)

    // Итоги
    console.log('='.repeat(80))
    console.log('\n✅ Анализ завершен успешно!')
    console.log('\n📊 Итоговая статистика:')
    console.log(`   Матч: ${matchInfo.team1.name_rus} vs ${matchInfo.team2.name_rus}`)
    console.log(`   Всего игроков: ${players.length}`)
    console.log(`   Игроков ЦСКА: ${cskaPlayers.length}`)
    console.log(`   Уникальных параметров: ${allParams.length}`)
    console.log()

  } catch (error) {
    console.error('\n❌ Критическая ошибка:', error.message)
    process.exit(1)
  }
}

main()
