#!/usr/bin/env node

/**
 * Синхронизация статистики игроков из RuStat API
 * 
 * Использование:
 *   node scripts/sync-player-stats.mjs
 *   node scripts/sync-player-stats.mjs --season 2025
 *   node scripts/sync-player-stats.mjs --force
 *   node scripts/sync-player-stats.mjs --player-id <id>
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

const RUSTAT_API_URL = 'https://api-football.rustatsport.ru'
const RUSTAT_TOKEN = process.env.RUSTAT_TOKEN
const CSKA_TEAM_ID = 13503
const DELAY_MS = 500

// Параметры командной строки
const args = process.argv.slice(2)
const SEASON = args.includes('--season') 
  ? parseInt(args[args.indexOf('--season') + 1])
  : 2024  // Сезон 2024/2025 по умолчанию
const FORCE = args.includes('--force')
const PLAYER_ID = args.includes('--player-id')
  ? args[args.indexOf('--player-id') + 1]
  : null

if (!RUSTAT_TOKEN) {
  console.error('❌ RUSTAT_TOKEN не найден в .env файле!')
  process.exit(1)
}

// ============================================================================
// Константы параметров RuStat
// ============================================================================

const ALL_PLAYER_PARAMS = [
  [1, 0],    // Рейтинг
  [288, 0],  // Минуты
  [196, 0],  // Голы
  [393, 0],  // Ассисты
  [641, 0],  // Удары
  [643, 0],  // Удары в створ
  [336, 0],  // Передачи
  [488, 0],  // Передачи точные %
  [434, 0],  // Ключевые передачи
  [225, 0],  // Единоборства
  [262, 0],  // Единоборства выигранные %
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
  [726, 0],  // Сейвы
  [728, 0],  // Пропущенные голы
  [719, 0],  // Позиция
]

const PARAM_IDS = {
  RATING: 1,
  MINUTES: 288,
  GOALS: 196,
  ASSISTS: 393,
  SHOTS: 641,
  SHOTS_ON_TARGET: 643,
  PASSES: 336,
  PASSES_ACCURATE_PCT: 488,
  KEY_PASSES: 434,
  DUELS: 225,
  DUELS_WON_PCT: 262,
  YELLOW_CARDS: 202,
  RED_CARDS: 203,
  INTERCEPTIONS: 291,
  TACKLES: 731,
  BLOCKS: 766,
  CLEARANCES: 342,
  DRIBBLES: 399,
  DRIBBLES_SUCCESS: 401,
  FOULS_DRAWN: 460,
  FOULS_COMMITTED: 462,
  SAVES: 726,
  GOALS_CONCEDED: 728,
  POSITION: 719,
}

// ============================================================================
// Утилиты
// ============================================================================

function getStatValue(playerStats, paramId) {
  const stat = playerStats.stats.find(s => s.p === paramId)
  return stat?.v ?? 0
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ============================================================================
// Получение матчей сезона
// ============================================================================

async function getSeasonMatches(season) {
  console.log(`📅 Получение матчей сезона ${season}/${season+1}...\n`)
  
  try {
    const response = await fetch(
      `${RUSTAT_API_URL}/teams/${CSKA_TEAM_ID}/matches?limit=100&offset=0`,
      {
        headers: { 'Authorization': `Bearer ${RUSTAT_TOKEN}` },
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    
    // Фильтруем по сезону: с августа SEASON до июля SEASON+1
    const seasonStart = new Date(`${season}-08-01`)
    const seasonEnd = new Date(`${season + 1}-07-31`)
    
    const seasonMatches = data.matches.filter(match => {
      const matchDate = new Date(match.datetime)
      return matchDate >= seasonStart && 
             matchDate <= seasonEnd && 
             match.status_id === 5 // только завершенные
    })

    console.log(`✅ Найдено ${seasonMatches.length} завершенных матчей`)
    console.log(`   Период: ${seasonStart.toLocaleDateString('ru-RU')} - ${seasonEnd.toLocaleDateString('ru-RU')}\n`)
    
    return seasonMatches

  } catch (error) {
    console.error('❌ Ошибка получения матчей:', error.message)
    throw error
  }
}

// ============================================================================
// Получение статистики матча
// ============================================================================

async function getMatchPlayerStats(matchId) {
  const response = await fetch(
    `${RUSTAT_API_URL}/matches/players/stats`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RUSTAT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gk: false,
        match_id: matchId,
        params: ALL_PLAYER_PARAMS,
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  return response.json()
}

// ============================================================================
// Агрегация статистики
// ============================================================================

function aggregateStats(statsArray) {
  const aggregated = new Map()

  for (const matchStats of statsArray) {
    for (const playerStat of matchStats) {
      const playerId = playerStat.player_id
      
      if (!aggregated.has(playerId)) {
        aggregated.set(playerId, {
          player_id: playerId,
          stats: [],
          matchesCount: 0,
        })
      }

      const existing = aggregated.get(playerId)
      existing.matchesCount++
      
      for (const stat of playerStat.stats) {
        const existingStat = existing.stats.find(s => s.p === stat.p)
        
        // Для процентных показателей НЕ суммируем, а сохраняем отдельно
        const isPercentage = stat.p === 488 || stat.p === 262 // PASSES_ACCURATE_PCT, DUELS_WON_PCT
        
        if (isPercentage) {
          // Для процентов сохраняем массив значений для последующего усреднения
          if (!existingStat) {
            existing.stats.push({ p: stat.p, o: stat.o, values: [stat.v] })
          } else {
            if (!existingStat.values) existingStat.values = [existingStat.v]
            existingStat.values.push(stat.v)
          }
        } else {
          // Для абсолютных значений суммируем
          if (existingStat) {
            existingStat.v += stat.v
          } else {
            existing.stats.push({ ...stat })
          }
        }
      }
    }
  }

  // Усредняем процентные показатели
  for (const playerData of aggregated.values()) {
    for (const stat of playerData.stats) {
      if (stat.values) {
        stat.v = Math.round(stat.values.reduce((a, b) => a + b, 0) / stat.values.length)
        delete stat.values
      }
    }
  }

  return Array.from(aggregated.values())
}

// ============================================================================
// Преобразование в формат БД
// ============================================================================

function transformToDbFormat(playerStats) {
  const minutesPlayed = getStatValue(playerStats, PARAM_IDS.MINUTES)
  const goals = getStatValue(playerStats, PARAM_IDS.GOALS)
  const assists = getStatValue(playerStats, PARAM_IDS.ASSISTS)
  
  const shots = getStatValue(playerStats, PARAM_IDS.SHOTS)
  const shotsOnTarget = getStatValue(playerStats, PARAM_IDS.SHOTS_ON_TARGET)
  const shotAccuracy = shots > 0 ? (shotsOnTarget / shots) * 100 : null
  
  const passes = getStatValue(playerStats, PARAM_IDS.PASSES)
  const passAccuracyPct = getStatValue(playerStats, PARAM_IDS.PASSES_ACCURATE_PCT)
  const passesAccurate = passAccuracyPct > 0 && passes > 0 ? Math.round((passes * passAccuracyPct) / 100) : 0
  const keyPasses = getStatValue(playerStats, PARAM_IDS.KEY_PASSES)
  
  const duels = getStatValue(playerStats, PARAM_IDS.DUELS)
  const duelWinRatePct = getStatValue(playerStats, PARAM_IDS.DUELS_WON_PCT)
  const duelsWon = duelWinRatePct > 0 && duels > 0 ? Math.round((duels * duelWinRatePct) / 100) : 0
  
  const interceptions = getStatValue(playerStats, PARAM_IDS.INTERCEPTIONS)
  const tackles = getStatValue(playerStats, PARAM_IDS.TACKLES)
  const blocks = getStatValue(playerStats, PARAM_IDS.BLOCKS)
  const clearances = getStatValue(playerStats, PARAM_IDS.CLEARANCES)
  
  const dribbles = getStatValue(playerStats, PARAM_IDS.DRIBBLES)
  const dribblesSuccess = getStatValue(playerStats, PARAM_IDS.DRIBBLES_SUCCESS)
  const foulsDrawn = getStatValue(playerStats, PARAM_IDS.FOULS_DRAWN)
  const foulsCommitted = getStatValue(playerStats, PARAM_IDS.FOULS_COMMITTED)
  
  const yellowCards = getStatValue(playerStats, PARAM_IDS.YELLOW_CARDS)
  const redCards = getStatValue(playerStats, PARAM_IDS.RED_CARDS)
  
  const saves = getStatValue(playerStats, PARAM_IDS.SAVES)
  const goalsConceded = getStatValue(playerStats, PARAM_IDS.GOALS_CONCEDED)
  const savePercentage = (saves + goalsConceded) > 0 
    ? (saves / (saves + goalsConceded)) * 100 
    : null

  // Используем переданное количество матчей
  const gamesPlayed = playerStats.matchesCount || 0

  return {
    gamesPlayed,
    minutesPlayed,
    goals,
    assists,
    yellowCards,
    redCards,
    shots,
    shotsOnTarget,
    shotAccuracy,
    passes,
    passesAccurate,
    passAccuracy: passAccuracyPct || null,
    keyPasses,
    duels,
    duelsWon,
    duelWinRate: duelWinRatePct || null,
    interceptions,
    tackles,
    tacklesWon: tackles,
    blocks,
    clearances,
    dribbles,
    dribblesSuccess,
    foulsDrawn,
    foulsCommitted,
    saves: saves || null,
    goalsConceded: goalsConceded || null,
    savePercentage,
    rustatPlayerId: playerStats.player_id,
    rustatSynced: true,
    rustatSyncedAt: new Date(),
    season: `${SEASON}/${SEASON + 1}`,
  }
}

// ============================================================================
// Синхронизация
// ============================================================================

async function syncPlayerStats() {
  console.log(`🔄 Синхронизация статистики игроков за сезон ${SEASON}...\n`)
  console.log('='.repeat(80))
  console.log()

  try {
    // Получаем игроков с rustatId
    const whereClause = {
      team: 'MAIN',
      rustatId: { not: null },
    }

    if (PLAYER_ID) {
      whereClause.id = PLAYER_ID
    }

    const players = await prisma.player.findMany({
      where: whereClause,
      include: { stats: true },
    })

    if (players.length === 0) {
      console.log('⚠️  Игроки с rustatId не найдены')
      console.log('💡 Сначала запустите: node scripts/match-players-rustat.mjs')
      return
    }

    console.log(`📊 Найдено игроков для синхронизации: ${players.length}\n`)

    // Получаем матчи сезона
    const matches = await getSeasonMatches(SEASON)

    if (matches.length === 0) {
      console.log('⚠️  Матчи не найдены')
      return
    }

    // Собираем статистику по всем матчам
    console.log('📥 Загрузка статистики из матчей...\n')
    const allMatchStats = []

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i]
      const date = new Date(match.datetime).toLocaleDateString('ru-RU')
      
      process.stdout.write(`   [${i + 1}/${matches.length}] ${date}...`)

      try {
        const matchStats = await getMatchPlayerStats(match.id)
        allMatchStats.push(matchStats)
        console.log(' ✅')
        await delay(DELAY_MS)
      } catch (error) {
        console.log(` ❌ ${error.message}`)
      }
    }

    console.log()

    // Агрегируем статистику
    console.log('🔄 Агрегация статистики...\n')
    const aggregatedStats = aggregateStats(allMatchStats)

    // Обновляем игроков
    let updated = 0
    let skipped = 0
    let errors = 0

    for (const player of players) {
      const playerFullName = `${player.firstName} ${player.lastName}`
      
      // Находим статистику игрока
      const playerStats = aggregatedStats.find(s => s.player_id === player.rustatId)

      if (!playerStats) {
        console.log(`⏭️  ${playerFullName} (#${player.number}) - нет данных`)
        skipped++
        continue
      }

      try {
        // Преобразуем в формат БД
        const dbStats = transformToDbFormat(playerStats)

        // Обновляем или создаем статистику
        if (player.stats) {
          await prisma.playerStats.update({
            where: { playerId: player.id },
            data: dbStats,
          })
        } else {
          await prisma.playerStats.create({
            data: {
              ...dbStats,
              playerId: player.id,
            },
          })
        }

        console.log(
          `✅ ${playerFullName} (#${player.number}) - ` +
          `${dbStats.gamesPlayed} матчей, ${dbStats.goals} голов, ${dbStats.assists} ассистов`
        )
        updated++

      } catch (error) {
        console.log(`❌ ${playerFullName} (#${player.number}) - ${error.message}`)
        errors++
      }
    }

    // Итоги
    console.log()
    console.log('='.repeat(80))
    console.log('\n📊 Итоговая статистика:')
    console.log(`   ✅ Обновлено: ${updated}`)
    console.log(`   ⏭️  Пропущено: ${skipped}`)
    console.log(`   ❌ Ошибок: ${errors}`)
    console.log()

    if (updated > 0) {
      console.log('✅ Синхронизация завершена успешно!')
      console.log('💡 Статистика доступна на страницах игроков')
      console.log()
    }

  } catch (error) {
    console.error('\n❌ Критическая ошибка:', error.message)
    throw error
  }
}

// ============================================================================
// Главная функция
// ============================================================================

async function main() {
  console.log('\n🚀 Синхронизация статистики игроков из RuStat API\n')
  console.log('='.repeat(80))
  console.log()

  if (FORCE) {
    console.log('⚠️  Режим --force: перезагрузка всех данных\n')
  }

  if (PLAYER_ID) {
    console.log(`🎯 Синхронизация только игрока ID: ${PLAYER_ID}\n`)
  }

  try {
    await syncPlayerStats()
  } catch (error) {
    console.error('\n❌ Ошибка выполнения:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
