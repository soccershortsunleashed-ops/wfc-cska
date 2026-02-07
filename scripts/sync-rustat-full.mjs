#!/usr/bin/env node

/**
 * Полный цикл синхронизации данных с RuStat API
 * 
 * Что делает:
 * 1. Авторизуется через OAuth 2.0 и получает свежий токен
 * 2. Получает список всех матчей ЦСКА за 2025 год
 * 3. Сопоставляет матчи с БД и обновляет rustatId
 * 4. Загружает полные данные для каждого матча:
 *    - info (основная информация)
 *    - players (список игроков)
 *    - tactics (расстановки)
 *    - teamStats (статистика команд)
 *    - playerStats (статистика игроков)
 * 5. Сохраняет данные в БД
 * 
 * Использование:
 *   node scripts/sync-rustat-full.mjs
 *   node scripts/sync-rustat-full.mjs --force  # перезагрузить все данные
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

// Конфигурация
const RUSTAT_AUTH_URL = 'https://api-auth.rustatsport.ru'
const RUSTAT_API_URL = 'https://api-football.rustatsport.ru'
const CSKA_TEAM_ID = 13503
const DELAY_MS = 500
const FORCE_RELOAD = process.argv.includes('--force')

// Учетные данные из .env
const RUSTAT_TOKEN = process.env.RUSTAT_TOKEN

if (!RUSTAT_TOKEN) {
  console.error('❌ RUSTAT_TOKEN должен быть указан в .env файле!')
  console.error('💡 Получите токен из браузера DevTools (Network → Authorization header)')
  process.exit(1)
}

// Маппинг названий команд
const TEAM_NAME_MAPPING = {
  'ЦСКА': 'ЦСКА',
  'ЦСКА Москва': 'ЦСКА',
  'Зенит': 'Зенит',
  'Зенит Санкт-Петербург': 'Зенит',
  'Локомотив': 'Локомотив',
  'Краснодар': 'Краснодар',
  'Ростов': 'Ростов',
  'Чертаново': 'Чертаново',
  'Рубин': 'Рубин',
  'Спартак Москва': 'Спартак',
  'Спартак': 'Спартак',
  'Урал-УрФА': 'Урал',
  'Енисей': 'Енисей',
  'Звезда-2005': 'Звезда',
  'Динамо': 'Динамо',
  'Рязань-ВДВ': 'Рязань-ВДВ',
  'Крылья Советов Самара': 'Крылья Советов',
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ============================================================================
// ЭТАП 1: ПРОВЕРКА ТОКЕНА
// ============================================================================

function checkToken(token) {
  console.log('🔐 Проверка токена...')
  
  try {
    // Декодируем JWT чтобы узнать время истечения
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
      throw new Error('Токен истек! Обновите RUSTAT_TOKEN в .env файле')
    }

    const minutesLeft = Math.floor((expiresAt - now) / 1000 / 60)
    console.log(`   Осталось времени: ${minutesLeft} минут`)
    console.log()

    return true

  } catch (error) {
    console.error('❌ Ошибка проверки токена:', error.message)
    throw error
  }
}

// ============================================================================
// ЭТАП 2: ПОЛУЧЕНИЕ СПИСКА МАТЧЕЙ
// ============================================================================

async function getRustatMatches(token) {
  console.log('📥 Получение списка матчей ЦСКА из RuStat API...')
  
  try {
    const response = await fetch(
      `${RUSTAT_API_URL}/teams/${CSKA_TEAM_ID}/matches?limit=100&offset=0`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Ошибка получения матчей: ${response.status}`)
    }

    const data = await response.json()
    
    // Фильтруем матчи 2025 года
    const matches2025 = data.matches.filter(match => {
      const year = new Date(match.datetime).getFullYear()
      return year === 2025
    })

    console.log(`✅ Получено ${matches2025.length} матчей 2025 года`)
    console.log()

    return {
      matches: matches2025,
      teams: data.teams,
      tournaments: data.tournaments,
    }

  } catch (error) {
    console.error('❌ Ошибка получения матчей:', error.message)
    throw error
  }
}

// ============================================================================
// ЭТАП 3: СОПОСТАВЛЕНИЕ С БД
// ============================================================================

function normalizeTeamName(name) {
  return TEAM_NAME_MAPPING[name] || name
}

function matchesAreSame(dbMatch, rustatMatch, rustatTeams) {
  const rustatTeam1 = rustatTeams.find(t => t.id === rustatMatch.team1.id)
  const rustatTeam2 = rustatTeams.find(t => t.id === rustatMatch.team2.id)
  
  if (!rustatTeam1 || !rustatTeam2) return false

  const rustatTeam1Name = normalizeTeamName(rustatTeam1.name_rus)
  const rustatTeam2Name = normalizeTeamName(rustatTeam2.name_rus)
  const dbOpponentName = normalizeTeamName(dbMatch.opponentName)

  const cskaInRustat = rustatTeam1Name === 'ЦСКА' || rustatTeam2Name === 'ЦСКА'
  const opponentInRustat = rustatTeam1Name === dbOpponentName || rustatTeam2Name === dbOpponentName
  
  if (!cskaInRustat || !opponentInRustat) return false

  const dbDate = new Date(dbMatch.matchDate)
  const rustatDate = new Date(rustatMatch.datetime)
  const dayDiff = Math.abs(dbDate - rustatDate) / (1000 * 60 * 60 * 24)
  
  return dayDiff < 1
}

async function syncMatchIds(rustatMatches, rustatTeams) {
  console.log('🔍 Сопоставление матчей с БД...')
  console.log()

  const dbMatches = await prisma.match.findMany({
    where: {
      matchDate: {
        gte: new Date('2025-01-01'),
        lt: new Date('2026-01-01'),
      },
    },
    orderBy: {
      matchDate: 'asc',
    },
  })

  let matched = 0
  let alreadySynced = 0

  for (const dbMatch of dbMatches) {
    if (dbMatch.rustatId) {
      alreadySynced++
      continue
    }

    const rustatMatch = rustatMatches.find(rm => 
      matchesAreSame(dbMatch, rm, rustatTeams)
    )

    if (rustatMatch) {
      await prisma.match.update({
        where: { id: dbMatch.id },
        data: { rustatId: rustatMatch.id },
      })

      const date = new Date(dbMatch.matchDate).toLocaleDateString('ru-RU')
      console.log(`✅ ${date}: ЦСКА vs ${dbMatch.opponentName} → RuStat ID: ${rustatMatch.id}`)
      matched++
    }
  }

  console.log()
  console.log(`📊 Сопоставлено: ${matched}, Уже синхронизировано: ${alreadySynced}`)
  console.log()

  return matched
}

// ============================================================================
// ЭТАП 4: ЗАГРУЗКА ДЕТАЛЬНЫХ ДАННЫХ
// ============================================================================

async function fetchRustatData(token, endpoint) {
  const response = await fetch(`${RUSTAT_API_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  return response.json()
}

async function fetchRustatDataPost(token, endpoint, body) {
  const response = await fetch(`${RUSTAT_API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  return response.json()
}

async function loadMatchData(token, matchId) {
  try {
    // 1. Основная информация
    const info = await fetchRustatData(token, `/matches/${matchId}/info`)
    await delay(DELAY_MS)

    // 2. Список игроков
    const players = await fetchRustatData(token, `/matches/${matchId}/players`)
    await delay(DELAY_MS)

    // 3. Расстановки
    const tactics = await fetchRustatData(token, `/matches/${matchId}/tactics`)
    await delay(DELAY_MS)

    // 4. Статистика команд
    let teamStats = null
    try {
      teamStats = await fetchRustatDataPost(token, '/matches/teams/stats', {
        match_id: matchId,
        params: [
          [1, 0], [196, 0], [223, 0], [224, 0], [202, 0], [203, 0],
          [207, 0], [264, 0], [273, 0], [694, 0], [336, 0], [488, 0],
          [434, 0], [438, 0], [291, 0], [293, 0], [731, 0], [733, 0],
          [766, 0], [399, 0], [460, 0], [462, 0], [726, 0], [728, 0],
          [342, 0],
        ],
      })
      await delay(DELAY_MS)
    } catch (error) {
      console.log(`      ⚠️  Статистика команд недоступна`)
    }

    // 5. Статистика игроков
    let playerStats = null
    try {
      playerStats = await fetchRustatDataPost(token, '/matches/players/stats', {
        gk: false,
        match_id: matchId,
        params: [
          [1, 0], [288, 0], [719, 0], [196, 0], [393, 0], [223, 0],
          [224, 0], [191, 0], [194, 0], [195, 0], [193, 0], [684, 0],
          [641, 0], [643, 0], [264, 0], [273, 0], [694, 0], [697, 0],
          [336, 0], [488, 0], [434, 0], [438, 0], [291, 0], [293, 0],
          [731, 0], [733, 0], [766, 0], [399, 0], [401, 0], [460, 0],
          [462, 0], [726, 0], [728, 0], [342, 0], [345, 0], [439, 0],
          [225, 0], [262, 0], [229, 0], [231, 0], [226, 0], [228, 0],
          [232, 0], [242, 0], [304, 0], [310, 0], [305, 0], [307, 0],
          [317, 0], [323, 0], [489, 0], [608, 0], [709, 0],
        ],
      })
      await delay(DELAY_MS)
    } catch (error) {
      console.log(`      ⚠️  Статистика игроков недоступна`)
    }

    return {
      info,
      players,
      tactics,
      teamStats,
      playerStats,
      syncedAt: new Date().toISOString(),
    }

  } catch (error) {
    throw new Error(`Ошибка загрузки данных: ${error.message}`)
  }
}

async function loadAllMatchesData(token) {
  console.log('📦 Загрузка детальных данных матчей...')
  console.log()

  const whereClause = {
    matchDate: {
      gte: new Date('2025-01-01'),
      lt: new Date('2026-01-01'),
    },
    rustatId: {
      not: null,
    },
  }

  if (!FORCE_RELOAD) {
    whereClause.rustatSynced = false
  }

  const matches = await prisma.match.findMany({
    where: whereClause,
    orderBy: {
      matchDate: 'asc',
    },
  })

  if (matches.length === 0) {
    console.log('✅ Все матчи уже загружены!')
    if (!FORCE_RELOAD) {
      console.log('💡 Используйте --force для перезагрузки')
    }
    return { loaded: 0, failed: 0 }
  }

  console.log(`📊 Найдено матчей для загрузки: ${matches.length}`)
  if (FORCE_RELOAD) {
    console.log('⚠️  Режим --force: перезагрузка всех данных')
  }
  console.log()

  let loaded = 0
  let failed = 0

  for (const match of matches) {
    const date = new Date(match.matchDate).toLocaleDateString('ru-RU')
    console.log(`   📅 ${date}: ЦСКА vs ${match.opponentName}`)
    console.log(`      RuStat ID: ${match.rustatId}`)

    try {
      const rustatData = await loadMatchData(token, match.rustatId)

      await prisma.match.update({
        where: { id: match.id },
        data: {
          rustatData: JSON.stringify(rustatData),
          rustatSynced: true,
          rustatSyncedAt: new Date(),
        },
      })

      loaded++
      console.log(`      ✅ Данные загружены и сохранены`)

    } catch (error) {
      failed++
      console.log(`      ❌ Ошибка: ${error.message}`)
    }

    console.log()
    await delay(DELAY_MS)
  }

  return { loaded, failed }
}

// ============================================================================
// ГЛАВНАЯ ФУНКЦИЯ
// ============================================================================

async function main() {
  console.log('\n🚀 Полная синхронизация данных с RuStat API\n')
  console.log('=' .repeat(80))
  console.log()

  try {
    // Этап 1: Проверка токена
    checkToken(RUSTAT_TOKEN)

    // Этап 2: Получение списка матчей
    const { matches, teams, tournaments } = await getRustatMatches(RUSTAT_TOKEN)

    // Этап 3: Сопоставление с БД
    const matchedCount = await syncMatchIds(matches, teams)

    // Этап 4: Загрузка детальных данных
    const { loaded, failed } = await loadAllMatchesData(RUSTAT_TOKEN)

    // Итоги
    console.log('=' .repeat(80))
    console.log('\n📊 Итоговая статистика:')
    console.log(`   🔗 Сопоставлено матчей: ${matchedCount}`)
    console.log(`   ✅ Загружено данных: ${loaded}`)
    console.log(`   ❌ Ошибок: ${failed}`)
    console.log()

    if (loaded > 0) {
      console.log('✅ Синхронизация завершена успешно!')
      console.log('💡 Данные доступны на страницах матчей')
    } else if (matchedCount > 0) {
      console.log('✅ Матчи сопоставлены!')
      console.log('💡 Запустите скрипт еще раз для загрузки данных')
    }

  } catch (error) {
    console.error('\n❌ Критическая ошибка:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
