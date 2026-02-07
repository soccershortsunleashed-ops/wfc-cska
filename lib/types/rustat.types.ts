// RuStat API Types

// ============================================================================
// Auth
// ============================================================================

export interface RustatAuthResponse {
  access_token: string
  token_type: string
  expires_in: number
}

// ============================================================================
// Match Info
// ============================================================================

export interface RustatMatchInfo {
  date: string // "08.11.2025"
  tournament: {
    id: number
    name_rus: string
    name_eng: string
  }
  team1: {
    id: number
    name_rus: string
    name_eng: string
    score: number
  }
  team2: {
    id: number
    name_rus: string
    name_eng: string
    score: number
  }
  status_id: number // 5 = finished
  has_video: boolean
}

// ============================================================================
// Players
// ============================================================================

export interface RustatPlayer {
  id: number
  team_id: number
  name_rus: string
  name_eng: string
  is_gk: boolean
  num: number
  ord: number // порядок в списке
  gender_id: number | null
}

// ============================================================================
// Tactics / Lineup
// ============================================================================

export interface RustatTacticsPlayer {
  id: number
  position_id: number
}

export interface RustatTacticsTeam {
  team_id: number
  shirt_color: string // hex без #
  number_color: string // hex без #
  lexic: number // ID тактической схемы
  players: RustatTacticsPlayer[]
}

export interface RustatTactics {
  start: RustatTacticsTeam[]
  end: RustatTacticsTeam[]
}

// ============================================================================
// Team Stats
// ============================================================================

export interface RustatTeamStatValue {
  p: number // parameter ID (lexic)
  o: number // offset/modifier
  v: number // value
}

export interface RustatTeamStatsResponse {
  [teamId: string]: RustatTeamStatValue[]
}

// ============================================================================
// Player Stats
// ============================================================================

export interface RustatPlayerStatValue {
  p: number // parameter ID (lexic)
  o: number // offset/modifier
  v: number // value
}

export interface RustatPlayerStatsItem {
  player_id: number
  stats: RustatPlayerStatValue[]
}

export type RustatPlayerStatsResponse = RustatPlayerStatsItem[]

// ============================================================================
// Match Events (для будущего использования)
// ============================================================================

export interface RustatMatchEvent {
  id: number
  match_id: number
  minute: number
  type: 'goal' | 'substitution' | 'yellow_card' | 'red_card' | 'penalty'
  team_id: number
  player_id: number
  player_out_id?: number // для замен
  assist_player_id?: number // для голов
  description?: string
}

// ============================================================================
// Cached Match Data (что храним в БД)
// ============================================================================

export interface RustatCachedData {
  info: RustatMatchInfo
  players: RustatPlayer[]
  tactics: RustatTactics
  teamStats?: RustatTeamStatsResponse
  playerStats?: RustatPlayerStatsResponse
  syncedAt: string // ISO timestamp
}

// ============================================================================
// Position IDs (для расстановки)
// ============================================================================

export const RUSTAT_POSITIONS = {
  // Вратари
  31: { name: 'ГК', x: 50, y: 95 },
  
  // Защитники
  12: { name: 'З Л', x: 20, y: 75 },
  22: { name: 'З ЛЦ', x: 35, y: 75 },
  42: { name: 'З ПЦ', x: 65, y: 75 },
  52: { name: 'З П', x: 80, y: 75 },
  
  // Полузащитники
  13: { name: 'ЗП Л', x: 20, y: 55 },
  14: { name: 'П Л', x: 20, y: 45 },
  23: { name: 'ЗП ЛЦ', x: 35, y: 55 },
  24: { name: 'П ЛЦ', x: 35, y: 45 },
  43: { name: 'ЗП ПЦ', x: 65, y: 55 },
  44: { name: 'П ПЦ', x: 65, y: 45 },
  53: { name: 'ЗП П', x: 80, y: 55 },
  54: { name: 'П П', x: 80, y: 45 },
  
  // Нападающие
  26: { name: 'Ф ЛЦ', x: 35, y: 20 },
  46: { name: 'Ф ПЦ', x: 65, y: 20 },
  36: { name: 'Ф Ц', x: 50, y: 15 },
} as const

export type RustatPositionId = keyof typeof RUSTAT_POSITIONS

// ============================================================================
// Helper Types
// ============================================================================

export interface RustatApiError {
  error: string
  message: string
  statusCode: number
}

export interface RustatTeamMatch {
  id: number
  datetime: string
  tournament_id: number
  team1: { id: number; score: number }
  team2: { id: number; score: number }
  status_id: number
  has_video: boolean
  referee_id?: number
}

export interface RustatTeamMatchesResponse {
  matches: RustatTeamMatch[]
  tournaments: Array<{
    id: number
    name_rus: string
    name_eng: string
  }>
  teams: Array<{
    id: number
    name_rus: string
    name_eng: string
    abbr_rus: string
    abbr_eng: string
  }>
  more: boolean
}
