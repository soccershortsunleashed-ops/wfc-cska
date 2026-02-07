import type { RustatPlayerStatsResponse } from '@/lib/types/rustat.types'
import type { PlayerStats } from '@prisma/client'
import { RUSTAT_PLAYER_PARAMS } from '@/lib/constants/rustat-player-params'

/**
 * Получить значение параметра из статистики RuStat
 */
function getStatValue(
  playerStats: RustatPlayerStatsResponse[0],
  paramId: number
): number {
  const stat = playerStats.stats.find(s => s.p === paramId)
  return stat?.v ?? 0
}

/**
 * Преобразовать статистику RuStat в формат БД
 * 
 * @param rustatStats - Массив статистики всех игроков из RuStat
 * @param rustatPlayerId - ID игрока в RuStat
 * @returns Частичный объект PlayerStats или null если игрок не найден
 */
export function transformRustatPlayerStats(
  rustatStats: RustatPlayerStatsResponse,
  rustatPlayerId: number
): Partial<PlayerStats> | null {
  const playerData = rustatStats.find(p => p.player_id === rustatPlayerId)
  if (!playerData) return null
  
  // Основные показатели
  const minutesPlayed = getStatValue(playerData, RUSTAT_PLAYER_PARAMS.MINUTES)
  const goals = getStatValue(playerData, RUSTAT_PLAYER_PARAMS.GOALS)
  const assists = getStatValue(playerData, RUSTAT_PLAYER_PARAMS.ASSISTS)
  
  // Карточки
  const yellowCards = getStatValue(playerData, RUSTAT_PLAYER_PARAMS.YELLOW_CARDS)
  const redCards = getStatValue(playerData, RUSTAT_PLAYER_PARAMS.RED_CARDS)
  
  // Удары
  const shots = getStatValue(playerData, RUSTAT_PLAYER_PARAMS.SHOTS)
  const shotsOnTarget = getStatValue(playerData, RUSTAT_PLAYER_PARAMS.SHOTS_ON_TARGET)
  const shotAccuracy = shots > 0 ? (shotsOnTarget / shots) * 100 : null
  
  // Передачи
  const passes = getStatValue(playerData, RUSTAT_PLAYER_PARAMS.PASSES)
  const passAccuracyPct = getStatValue(playerData, RUSTAT_PLAYER_PARAMS.PASSES_ACCURATE_PCT)
  const passesAccurate = passAccuracyPct > 0 ? Math.round((passes * passAccuracyPct) / 100) : 0
  const keyPasses = getStatValue(playerData, RUSTAT_PLAYER_PARAMS.KEY_PASSES)
  
  // Единоборства
  const duels = getStatValue(playerData, RUSTAT_PLAYER_PARAMS.DUELS)
  const duelWinRatePct = getStatValue(playerData, RUSTAT_PLAYER_PARAMS.DUELS_WON_PCT)
  const duelsWon = duelWinRatePct > 0 ? Math.round((duels * duelWinRatePct) / 100) : 0
  
  // Защита
  const interceptions = getStatValue(playerData, RUSTAT_PLAYER_PARAMS.INTERCEPTIONS)
  const tackles = getStatValue(playerData, RUSTAT_PLAYER_PARAMS.TACKLES)
  const blocks = getStatValue(playerData, RUSTAT_PLAYER_PARAMS.BLOCKS)
  const clearances = getStatValue(playerData, RUSTAT_PLAYER_PARAMS.CLEARANCES)
  
  // Атака
  const dribbles = getStatValue(playerData, RUSTAT_PLAYER_PARAMS.DRIBBLES)
  const dribblesSuccess = getStatValue(playerData, RUSTAT_PLAYER_PARAMS.DRIBBLES_SUCCESS)
  const foulsDrawn = getStatValue(playerData, RUSTAT_PLAYER_PARAMS.FOULS_DRAWN)
  const foulsCommitted = getStatValue(playerData, RUSTAT_PLAYER_PARAMS.FOULS_COMMITTED)
  
  // Для вратарей
  const saves = getStatValue(playerData, RUSTAT_PLAYER_PARAMS.SAVES)
  const goalsConceded = getStatValue(playerData, RUSTAT_PLAYER_PARAMS.GOALS_CONCEDED)
  const savePercentage = (saves + goalsConceded) > 0 
    ? (saves / (saves + goalsConceded)) * 100 
    : null
  
  return {
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
    tacklesWon: tackles, // RuStat не разделяет успешные/неуспешные
    blocks,
    clearances,
    dribbles,
    dribblesSuccess,
    foulsDrawn,
    foulsCommitted,
    saves: saves || null,
    goalsConceded: goalsConceded || null,
    savePercentage,
    rustatPlayerId,
    rustatSynced: true,
    rustatSyncedAt: new Date(),
  }
}

/**
 * Агрегировать статистику из нескольких матчей
 * 
 * @param statsArray - Массив статистики из разных матчей
 * @returns Суммарная статистика
 */
export function aggregatePlayerStats(
  statsArray: Array<Partial<PlayerStats>>
): Partial<PlayerStats> {
  if (statsArray.length === 0) {
    return {}
  }
  
  if (statsArray.length === 1) {
    return statsArray[0]
  }
  
  // Суммируем все числовые поля
  const aggregated: Partial<PlayerStats> = {
    gamesPlayed: 0,
    minutesPlayed: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    shots: 0,
    shotsOnTarget: 0,
    passes: 0,
    passesAccurate: 0,
    keyPasses: 0,
    duels: 0,
    duelsWon: 0,
    interceptions: 0,
    tackles: 0,
    tacklesWon: 0,
    blocks: 0,
    clearances: 0,
    dribbles: 0,
    dribblesSuccess: 0,
    foulsDrawn: 0,
    foulsCommitted: 0,
    penaltiesScored: 0,
    penaltiesMissed: 0,
    saves: 0,
    goalsConceded: 0,
    cleanSheets: 0,
  }
  
  for (const stats of statsArray) {
    aggregated.gamesPlayed! += stats.gamesPlayed || 0
    aggregated.minutesPlayed! += stats.minutesPlayed || 0
    aggregated.goals! += stats.goals || 0
    aggregated.assists! += stats.assists || 0
    aggregated.yellowCards! += stats.yellowCards || 0
    aggregated.redCards! += stats.redCards || 0
    aggregated.shots! += stats.shots || 0
    aggregated.shotsOnTarget! += stats.shotsOnTarget || 0
    aggregated.passes! += stats.passes || 0
    aggregated.passesAccurate! += stats.passesAccurate || 0
    aggregated.keyPasses! += stats.keyPasses || 0
    aggregated.duels! += stats.duels || 0
    aggregated.duelsWon! += stats.duelsWon || 0
    aggregated.interceptions! += stats.interceptions || 0
    aggregated.tackles! += stats.tackles || 0
    aggregated.tacklesWon! += stats.tacklesWon || 0
    aggregated.blocks! += stats.blocks || 0
    aggregated.clearances! += stats.clearances || 0
    aggregated.dribbles! += stats.dribbles || 0
    aggregated.dribblesSuccess! += stats.dribblesSuccess || 0
    aggregated.foulsDrawn! += stats.foulsDrawn || 0
    aggregated.foulsCommitted! += stats.foulsCommitted || 0
    aggregated.penaltiesScored! += stats.penaltiesScored || 0
    aggregated.penaltiesMissed! += stats.penaltiesMissed || 0
    aggregated.saves! += stats.saves || 0
    aggregated.goalsConceded! += stats.goalsConceded || 0
    aggregated.cleanSheets! += stats.cleanSheets || 0
  }
  
  // Пересчитываем процентные показатели
  if (aggregated.shots! > 0) {
    aggregated.shotAccuracy = (aggregated.shotsOnTarget! / aggregated.shots!) * 100
  }
  
  if (aggregated.passes! > 0) {
    aggregated.passAccuracy = (aggregated.passesAccurate! / aggregated.passes!) * 100
  }
  
  if (aggregated.duels! > 0) {
    aggregated.duelWinRate = (aggregated.duelsWon! / aggregated.duels!) * 100
  }
  
  if ((aggregated.saves! + aggregated.goalsConceded!) > 0) {
    aggregated.savePercentage = (aggregated.saves! / (aggregated.saves! + aggregated.goalsConceded!)) * 100
  }
  
  return aggregated
}
