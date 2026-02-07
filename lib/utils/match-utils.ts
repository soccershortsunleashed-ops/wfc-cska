import { Match, FootballTeam } from '@prisma/client'

type MatchWithTeams = Match & {
  homeTeam: FootballTeam | null
  awayTeam: FootballTeam | null
}

/**
 * Формирует место проведения матча
 * @param match - Матч с данными команд
 * @returns Место проведения
 */
export function getMatchVenue(match: MatchWithTeams): string {
  // Если есть переопределение - используем его
  if (match.venue) {
    return match.venue
  }
  
  // Иначе формируем из данных команды-хозяина
  if (match.homeTeam) {
    const { stadium, city } = match.homeTeam
    
    if (stadium && city) {
      return `${stadium}, ${city}`
    }
    
    if (stadium) {
      return stadium
    }
    
    if (city) {
      return city
    }
  }
  
  return 'Место проведения уточняется'
}

/**
 * Определяет, является ли ЦСКА командой-хозяином
 * @param match - Матч с данными команд
 * @returns true если ЦСКА дома
 */
export function isCskaHome(match: MatchWithTeams): boolean {
  if (match.homeTeam?.name === 'ЦСКА') {
    return true
  }
  
  if (match.awayTeam?.name === 'ЦСКА') {
    return false
  }
  
  // Fallback на старое поле
  return match.isHome ?? true
}

/**
 * Получает команду-соперника для ЦСКА
 * @param match - Матч с данными команд
 * @returns Команда-соперник или null
 */
export function getOpponentTeam(match: MatchWithTeams): FootballTeam | null {
  if (match.homeTeam?.name === 'ЦСКА') {
    return match.awayTeam
  }
  
  if (match.awayTeam?.name === 'ЦСКА') {
    return match.homeTeam
  }
  
  // Fallback: если ЦСКА дома, соперник - гость
  return match.isHome ? match.awayTeam : match.homeTeam
}
