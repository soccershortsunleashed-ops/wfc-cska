#!/usr/bin/env node

/**
 * Быстрая синхронизация статистики игроков за 2025 год
 * Токен передается напрямую в коде (не через .env)
 */

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

const RUSTAT_API_URL = 'https://api-football.rustatsport.ru'
const RUSTAT_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6Ikg3eDZQWGJab3VLIiwidHlwIjoiSldUIn0.eyJhY2wiOm51bGwsImFjdGl2ZSI6dHJ1ZSwiYXVkIjpbInJ1c3RhdF9mb290YmFsbCJdLCJhdXRoX3R5cGUiOiJjb2RlIiwiY2xpZW50X2lkIjoicnVzdGF0X2Zvb3RiYWxsIiwiZW1haWwiOiJ2YWRpbS1maWZhQG1haWwucnUiLCJleHAiOjE3Njk3MTkzMzcsImlhdCI6MTc2OTcxOTAzNywiaXNzIjoiaHR0cHM6Ly9hcGktYXV0aC5ydXN0YXRzcG9ydC5ydSIsInNjb3BlIjoib3BlbmlkIiwic2Vzc2lvbiI6ImFkOGQ2M2FlOTdhZTMxNzc3MWZhZTUyYzZmZTk5ZDQxNGExNWJmYTAxOTgxY2Q5ZTU4NTNiNzY3OTE2ZjdjMTYiLCJ0b3NfYWNjZXB0ZWQiOnRydWUsInR3b19mYWN0b3IiOmZhbHNlLCJ0eXAiOiJCZWFyZXIiLCJ1c2VyX2lkIjo2MDd9.DDjTjQkYCyhpaXz99Ap4GUXOMMNiJH-eV2_9ZKhQi7XwRWM_HceNuoeQIkdN9e_Lzr0C17unDnQbxgD9vqHsLlzIqEyECYWMnL1LAaAgR0HYWE2dLCJEsYgdltanuWFFfK8tfaht5X45YB6n0_ekF6ZmAEEmGGnbvgKbpI4j4Nv75QwPg1e1oZMawF2oBqU_-QhiQmbPR8BPLCJkCce1MUzbjFDCOZm_8kKN2M8wEosgrqfNYhrhuYIZkbAooaBi6x6h45ugUtO380t0W49RLBjsFjao4sA-64cE7pqqEEN_SoqFJPeFU26CHryH12So6wEO0siNoIyyT9xEb_ButA"
const DELAY_MS = 500

const ALL_PLAYER_PARAMS = [
  [1, 0],    // Рейтинг (Index)
  [288, 0],  // Минуты
  [196, 0],  // Голы
  [393, 0],  // Ассисты (Передачи голевые)
  [641, 0],  // Удары
  [643, 0],  // Удары в створ
  [336, 0],  // Передачи
  [488, 0],  // Передачи точные %
  [434, 0],  // Ключевые передачи
  [225, 0],  // Единоборства
  [262, 0],  // Единоборства выигранные %
  [202, 0],  // Желтые карточки
  [291, 0],  // Перехваты
  [731, 0],  // Отборы
  [766, 0],  // Блоки
  [342, 0],  // Выносы
  // Параметры ниже имеют неправильные значения - убираем
  // [399, 0],  // Дриблинг попытки (неправильный ID?)
  // [401, 0],  // Дриблинг успешный (неправильный ID - возвращает 1331!)
  // [460, 0],  // Фолы полученные
  // [462, 0],  // Фолы совершенные (неправильный ID - возвращает 200!)
]

const PARAM_IDS = {
  RATING: 1, MINUTES: 288, GOALS: 196, ASSISTS: 393, SHOTS: 641, SHOTS_ON_TARGET: 643,
  PASSES: 336, PASSES_ACCURATE_PCT: 488, KEY_PASSES: 434, DUELS: 225, DUELS_WON_PCT: 262,
  YELLOW_CARDS: 202, INTERCEPTIONS: 291, TACKLES: 731, BLOCKS: 766, CLEARANCES: 342,
}

function getStatValue(playerStats, paramId) {
  const stat = playerStats.stats.find(s => s.p === paramId)
  return stat?.v ?? 0
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function get2025Matches() {
  const matches = await prisma.match.findMany({
    where: {
      matchDate: { gte: new Date('2025-01-01'), lte: new Date() },
      status: 'FINISHED',
      rustatId: { not: null }
    },
    orderBy: { matchDate: 'asc' }
  })
  return matches
}

async function getMatchPlayerStats(matchId) {
  const response = await fetch(`${RUSTAT_API_URL}/matches/players/stats`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RUSTAT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ gk: false, match_id: matchId, params: ALL_PLAYER_PARAMS }),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

function aggregateStats(statsArray) {
  const aggregated = new Map()
  for (const matchStats of statsArray) {
    for (const playerStat of matchStats) {
      const playerId = playerStat.player_id
      if (!aggregated.has(playerId)) {
        aggregated.set(playerId, { player_id: playerId, stats: [], matchesCount: 0 })
      }
      const existing = aggregated.get(playerId)
      existing.matchesCount++
      for (const stat of playerStat.stats) {
        const existingStat = existing.stats.find(s => s.p === stat.p)
        const isPercentage = stat.p === 488 || stat.p === 262
        if (isPercentage) {
          if (!existingStat) {
            existing.stats.push({ p: stat.p, o: stat.o, values: [stat.v] })
          } else {
            if (!existingStat.values) existingStat.values = [existingStat.v]
            existingStat.values.push(stat.v)
          }
        } else {
          if (existingStat) {
            existingStat.v += stat.v
          } else {
            existing.stats.push({ ...stat })
          }
        }
      }
    }
  }
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
  
  // Параметры дриблинга и фолов имеют неправильные ID - устанавливаем в 0
  const dribbles = 0
  const dribblesSuccess = 0
  const foulsDrawn = 0
  const foulsCommitted = 0
  
  const yellowCards = getStatValue(playerStats, PARAM_IDS.YELLOW_CARDS)
  const redCards = 0 // Красные карточки не возвращаются API для полевых игроков
  const gamesPlayed = playerStats.matchesCount || 0

  return {
    gamesPlayed, minutesPlayed, goals, assists, yellowCards, redCards, shots, shotsOnTarget,
    shotAccuracy, passes, passesAccurate, passAccuracy: passAccuracyPct || null, keyPasses,
    duels, duelsWon, duelWinRate: duelWinRatePct || null, interceptions, tackles,
    tacklesWon: tackles, blocks, clearances, dribbles, dribblesSuccess, foulsDrawn,
    foulsCommitted,
    // Параметры вратарей - не заполняем для полевых игроков
    saves: null,
    goalsConceded: null,
    savePercentage: null,
    rustatPlayerId: playerStats.player_id, rustatSynced: true, rustatSyncedAt: new Date(),
    season: '2025/2026',
  }
}

async function main() {
  console.log('\n🚀 Синхронизация статистики игроков (2025 год)\n')
  console.log('='.repeat(80) + '\n')

  const players = await prisma.player.findMany({
    where: { team: 'MAIN', rustatId: { not: null } },
    include: { stats: true },
  })

  console.log(`📊 Игроков: ${players.length}\n`)

  const matches = await get2025Matches()
  console.log(`📅 Матчей: ${matches.length}\n`)

  console.log('📥 Загрузка статистики...\n')
  const allMatchStats = []

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]
    const date = new Date(match.matchDate).toLocaleDateString('ru-RU')
    process.stdout.write(`   [${i + 1}/${matches.length}] ${date}...`)
    try {
      const matchStats = await getMatchPlayerStats(match.rustatId)
      allMatchStats.push(matchStats)
      console.log(' ✅')
      await delay(DELAY_MS)
    } catch (error) {
      console.log(` ❌ ${error.message}`)
    }
  }

  console.log('\n🔄 Агрегация...\n')
  const aggregatedStats = aggregateStats(allMatchStats)
  console.log(`📊 Статистика: ${aggregatedStats.length} игроков\n`)

  let updated = 0, skipped = 0, errors = 0

  for (const player of players) {
    const playerFullName = `${player.firstName} ${player.lastName}`
    const playerStats = aggregatedStats.find(s => s.player_id === player.rustatId)

    if (!playerStats) {
      console.log(`⏭️  ${playerFullName} (#${player.number}) - нет данных`)
      skipped++
      continue
    }

    try {
      const dbStats = transformToDbFormat(playerStats)
      if (player.stats) {
        await prisma.playerStats.update({ where: { playerId: player.id }, data: dbStats })
      } else {
        await prisma.playerStats.create({ data: { ...dbStats, playerId: player.id } })
      }
      console.log(
        `✅ ${playerFullName} (#${player.number}) - ` +
        `${dbStats.gamesPlayed} матчей, ${dbStats.goals}г, ${dbStats.assists}а, ${dbStats.yellowCards}ЖК`
      )
      updated++
    } catch (error) {
      console.log(`❌ ${playerFullName} (#${player.number}) - ${error.message}`)
      errors++
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log(`\n✅ Обновлено: ${updated} | ⏭️ Пропущено: ${skipped} | ❌ Ошибок: ${errors}`)
  console.log(`📅 Матчей обработано: ${matches.length}\n`)
}

main().finally(() => prisma.$disconnect())
