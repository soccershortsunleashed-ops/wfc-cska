/**
 * Упрощенный RuStat API Service
 * 
 * Использует долгоживущий токен или переменную окружения RUSTAT_TOKEN
 * Для получения токена используйте браузер:
 * 1. Откройте https://football.rustatsport.ru
 * 2. Войдите в систему
 * 3. Откройте DevTools -> Network
 * 4. Найдите любой запрос к api-football.rustatsport.ru
 * 5. Скопируйте значение Authorization header (без "Bearer ")
 * 6. Добавьте в .env: RUSTAT_TOKEN=ваш_токен
 */

import type {
  RustatMatchInfo,
  RustatPlayer,
  RustatTactics,
  RustatTeamStatsResponse,
  RustatPlayerStatsResponse,
  RustatTeamMatchesResponse,
  RustatCachedData,
} from '@/lib/types/rustat.types'

const RUSTAT_API_URL = 'https://api-football.rustatsport.ru'
const CSKA_TEAM_ID = 13503

class RustatApiSimpleService {
  private token: string

  constructor() {
    this.token = process.env.RUSTAT_TOKEN || ''

    if (!this.token) {
      console.warn(
        'RUSTAT_TOKEN not configured. ' +
        'Get token from browser DevTools and add to .env'
      )
    }
  }

  /**
   * Установить токен вручную
   */
  setToken(token: string): void {
    this.token = token
  }

  /**
   * Базовый метод для запросов к API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.token) {
      throw new Error('RuStat token not configured')
    }

    const response = await fetch(`${RUSTAT_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`RuStat API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // ============================================================================
  // Team Methods
  // ============================================================================

  async getTeamMatches(
    teamId: number = CSKA_TEAM_ID,
    limit: number = 100,
    offset: number = 0
  ): Promise<RustatTeamMatchesResponse> {
    return this.request<RustatTeamMatchesResponse>(
      `/teams/${teamId}/matches?limit=${limit}&offset=${offset}`
    )
  }

  async getCSKAMatchesBySeason(season: number): Promise<RustatTeamMatchesResponse> {
    const allMatches = await this.getTeamMatches(CSKA_TEAM_ID, 100, 0)
    
    const filteredMatches = allMatches.matches.filter(match => {
      const year = new Date(match.datetime).getFullYear()
      return year === season
    })

    return {
      ...allMatches,
      matches: filteredMatches,
    }
  }

  // ============================================================================
  // Match Methods
  // ============================================================================

  async getMatchInfo(matchId: number): Promise<RustatMatchInfo> {
    return this.request<RustatMatchInfo>(`/matches/${matchId}/info`)
  }

  async getMatchPlayers(matchId: number): Promise<RustatPlayer[]> {
    return this.request<RustatPlayer[]>(`/matches/${matchId}/players`)
  }

  async getMatchTactics(matchId: number): Promise<RustatTactics> {
    return this.request<RustatTactics>(`/matches/${matchId}/tactics`)
  }

  async getMatchTeamStats(matchId: number): Promise<RustatTeamStatsResponse> {
    // Параметры для статистики команд (основные показатели)
    const params = [
      [1, 0],    // Index
      [120, 0],  // Голы
      [113, 0],  // Голевые моменты
      [545, 0],  // Фолы
      [202, 0],  // Желтые карточки
      [518, 0],  // Угловые
      [519, 0],  // Удары
      [520, 0],  // Удары в створ
      [268, 0],  // Передачи
      [350, 0],  // Передачи точные, %
      [164, 0],  // Единоборства
      [201, 0],  // Единоборства удачные, %
      [76, 0],   // Владение мячом, %
    ]

    return this.request<RustatTeamStatsResponse>('/matches/teams/stats', {
      method: 'POST',
      body: JSON.stringify({
        match_id: matchId,
        params,
      }),
    })
  }

  async getMatchPlayerStats(matchId: number): Promise<RustatPlayerStatsResponse> {
    // Параметры для статистики игроков (основные показатели)
    const params = [
      [1, 0],    // Index (рейтинг)
      [288, 0],  // Минуты на поле
      [196, 0],  // Голы
      [393, 0],  // Передачи голевые
      [641, 0],  // Удары
      [336, 0],  // Передачи
      [488, 0],  // Передачи точные, %
      [434, 0],  // Передачи ключевые
      [225, 0],  // Единоборства
      [262, 0],  // Единоборства удачные, %
      [719, 0],  // Позиция (position ID)
    ]

    return this.request<RustatPlayerStatsResponse>('/matches/players/stats', {
      method: 'POST',
      body: JSON.stringify({
        match_id: matchId,
        params,
      }),
    })
  }

  /**
   * Получить детальную статистику игроков в матче
   * Использует все доступные параметры из констант
   */
  async getMatchPlayerStatsDetailed(matchId: number): Promise<RustatPlayerStatsResponse> {
    // Импортируем константы динамически чтобы избежать циклических зависимостей
    const { ALL_PLAYER_PARAMS } = await import('@/lib/constants/rustat-player-params')

    return this.request<RustatPlayerStatsResponse>('/matches/players/stats', {
      method: 'POST',
      body: JSON.stringify({
        gk: false,
        match_id: matchId,
        params: ALL_PLAYER_PARAMS,
      }),
    })
  }

  async getMatchFullData(matchId: number): Promise<RustatCachedData> {
    try {
      const [info, players, tactics, teamStats, playerStats] = await Promise.all([
        this.getMatchInfo(matchId),
        this.getMatchPlayers(matchId),
        this.getMatchTactics(matchId),
        this.getMatchTeamStats(matchId).catch(() => undefined),
        this.getMatchPlayerStats(matchId).catch(() => undefined),
      ])

      return {
        info,
        players,
        tactics,
        teamStats,
        playerStats,
        syncedAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error(`Failed to fetch full data for match ${matchId}:`, error)
      throw error
    }
  }

  // ============================================================================
  // Player Stats Methods
  // ============================================================================

  /**
   * Получить список игроков ЦСКА из последнего матча
   */
  async getCSKAPlayers(): Promise<RustatPlayer[]> {
    const matchesResponse = await this.getTeamMatches(CSKA_TEAM_ID, 1, 0)
    
    if (matchesResponse.matches.length === 0) {
      throw new Error('No matches found for CSKA')
    }

    const lastMatch = matchesResponse.matches[0]
    const players = await this.getMatchPlayers(lastMatch.id)
    
    // Фильтруем только игроков ЦСКА
    return players.filter(p => p.team_id === CSKA_TEAM_ID)
  }

  /**
   * Получить статистику игроков за сезон
   * Агрегирует данные по всем матчам сезона
   * 
   * @param season - Год сезона (например, 2025)
   * @param teamId - ID команды (по умолчанию ЦСКА)
   * @param onProgress - Callback для отслеживания прогресса
   */
  async getPlayerSeasonStats(
    season: number,
    teamId: number = CSKA_TEAM_ID,
    onProgress?: (current: number, total: number) => void
  ): Promise<RustatPlayerStatsResponse> {
    // Получаем все матчи сезона
    const matchesResponse = await this.getCSKAMatchesBySeason(season)
    const finishedMatches = matchesResponse.matches.filter(m => m.status_id === 5)
    
    if (finishedMatches.length === 0) {
      return []
    }

    // Собираем статистику по всем матчам
    const allPlayerStats = new Map<number, RustatPlayerStatsResponse[0]>()
    
    for (let i = 0; i < finishedMatches.length; i++) {
      const match = finishedMatches[i]
      
      if (onProgress) {
        onProgress(i + 1, finishedMatches.length)
      }

      try {
        const matchStats = await this.getMatchPlayerStatsDetailed(match.id)
        
        // Агрегируем статистику
        for (const playerStat of matchStats) {
          const existing = allPlayerStats.get(playerStat.player_id)
          
          if (existing) {
            // Суммируем статистику
            for (const stat of playerStat.stats) {
              const existingStat = existing.stats.find(s => s.p === stat.p)
              if (existingStat) {
                // Для процентных показателей нужно пересчитывать
                // Пока просто суммируем, пересчет будет в утилитах
                existingStat.v += stat.v
              } else {
                existing.stats.push({ ...stat })
              }
            }
          } else {
            allPlayerStats.set(playerStat.player_id, { ...playerStat })
          }
        }
        
        // Задержка между запросами
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`Failed to get stats for match ${match.id}:`, error)
      }
    }
    
    return Array.from(allPlayerStats.values())
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  async healthCheck(): Promise<boolean> {
    try {
      await this.getTeamMatches(CSKA_TEAM_ID, 1, 0)
      return true
    } catch {
      return false
    }
  }

  getCSKATeamId(): number {
    return CSKA_TEAM_ID
  }
}

// Экспортируем singleton
export const rustatApiService = new RustatApiSimpleService()
