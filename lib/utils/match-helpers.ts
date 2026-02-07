import { Match, FootballTeam } from '@prisma/client'
import { getTeamLogoUrl } from './team-utils'

type MatchWithTeams = Match & {
  homeTeam: FootballTeam | null
  awayTeam: FootballTeam | null
}

/**
 * Преобразует матч с командами в формат для клиента
 * Добавляет поля для обратной совместимости
 */
export function transformMatchForClient(match: MatchWithTeams) {
  const cskaTeam = match.homeTeam?.name === 'ЦСКА' ? match.homeTeam : match.awayTeam
  const opponentTeam = match.homeTeam?.name === 'ЦСКА' ? match.awayTeam : match.homeTeam
  const isHome = match.homeTeam?.name === 'ЦСКА'

  return {
    ...match,
    matchDate: match.matchDate.toISOString(),
    createdAt: match.createdAt.toISOString(),
    updatedAt: match.updatedAt.toISOString(),
    rustatSyncedAt: match.rustatSyncedAt?.toISOString() || null,
    
    // Новые поля
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    
    // Старые поля для обратной совместимости
    opponentName: opponentTeam?.name || match.opponentName || 'Неизвестно',
    opponentLogoUrl: opponentTeam ? getTeamLogoUrl(opponentTeam) : match.opponentLogoUrl,
    cskaLogoUrl: cskaTeam ? getTeamLogoUrl(cskaTeam) : match.cskaLogoUrl,
    isHome: isHome ?? match.isHome ?? true,
    
    // Место проведения из стадиона команды-хозяина
    venue: match.venue || match.homeTeam?.stadium || null,
  }
}

/**
 * Определяет является ли ЦСКА командой-хозяином
 */
export function isCskaHome(match: MatchWithTeams): boolean {
  return match.homeTeam?.name === 'ЦСКА'
}

/**
 * Получает команду-соперника
 */
export function getOpponentTeam(match: MatchWithTeams): FootballTeam | null {
  return match.homeTeam?.name === 'ЦСКА' ? match.awayTeam : match.homeTeam
}

/**
 * Получает команду ЦСКА
 */
export function getCskaTeam(match: MatchWithTeams): FootballTeam | null {
  return match.homeTeam?.name === 'ЦСКА' ? match.homeTeam : match.awayTeam
}
