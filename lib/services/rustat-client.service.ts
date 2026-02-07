/**
 * Клиентский сервис для работы с RuStat API через Next.js API routes
 */

import type { RustatCachedData } from '@/lib/types/rustat.types'

export interface RustatApiResponse {
  cached: boolean
  syncedAt: string
  data: RustatCachedData
}

export interface RustatApiError {
  error: string
  details?: string
}

/**
 * Получить данные матча из RuStat API
 * Использует кэш если данные свежие
 */
export async function getMatchRustatData(
  matchId: string
): Promise<RustatApiResponse> {
  const response = await fetch(`/api/matches/${matchId}/rustat`)

  if (!response.ok) {
    const error: RustatApiError = await response.json()
    throw new Error(error.details || error.error)
  }

  return response.json()
}

/**
 * Принудительно обновить данные матча из RuStat API
 * Игнорирует кэш
 */
export async function refreshMatchRustatData(
  matchId: string
): Promise<RustatApiResponse> {
  const response = await fetch(`/api/matches/${matchId}/rustat`, {
    method: 'POST',
  })

  if (!response.ok) {
    const error: RustatApiError = await response.json()
    throw new Error(error.details || error.error)
  }

  return response.json()
}

/**
 * Проверить доступность данных RuStat для матча
 */
export async function checkMatchRustatAvailability(
  matchId: string
): Promise<boolean> {
  try {
    await getMatchRustatData(matchId)
    return true
  } catch {
    return false
  }
}
