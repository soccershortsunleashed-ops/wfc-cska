/**
 * Mapping параметров RuStat API (lexic ID) к полям статистики игроков
 * 
 * Основано на анализе существующих скриптов и API responses
 * Источник: scripts/sync-rustat-full.mjs, scripts/test-player-stats-api.mjs
 */

export const RUSTAT_PLAYER_PARAMS = {
  // Основные показатели
  RATING: 1,              // Рейтинг игрока (Index)
  MINUTES: 288,           // Минуты на поле
  GOALS: 196,             // Голы
  ASSISTS: 393,           // Голевые передачи (ассисты)
  
  // Карточки
  YELLOW_CARDS: 202,      // Желтые карточки
  RED_CARDS: 203,         // Красные карточки
  
  // Удары
  SHOTS: 641,             // Удары всего
  SHOTS_ON_TARGET: 643,   // Удары в створ
  
  // Передачи
  PASSES: 336,            // Передачи всего
  PASSES_ACCURATE_PCT: 488, // Передачи точные, % (процент)
  KEY_PASSES: 434,        // Ключевые передачи
  
  // Единоборства
  DUELS: 225,             // Единоборства всего
  DUELS_WON_PCT: 262,     // Единоборства выигранные, % (процент)
  
  // Защита
  INTERCEPTIONS: 291,     // Перехваты
  TACKLES: 731,           // Отборы
  BLOCKS: 766,            // Блоки
  CLEARANCES: 342,        // Выносы
  
  // Атака
  DRIBBLES: 399,          // Дриблинг попытки
  DRIBBLES_SUCCESS: 401,  // Дриблинг успешный
  FOULS_DRAWN: 460,       // Фолы полученные
  FOULS_COMMITTED: 462,   // Фолы совершенные
  
  // Для вратарей
  SAVES: 726,             // Сейвы (отраженные удары)
  GOALS_CONCEDED: 728,    // Пропущенные голы
  
  // Позиция
  POSITION: 719,          // ID позиции на поле
} as const

export type RustatPlayerParam = typeof RUSTAT_PLAYER_PARAMS[keyof typeof RUSTAT_PLAYER_PARAMS]

/**
 * Человекочитаемые названия параметров (для отладки и логов)
 */
export const RUSTAT_PARAM_NAMES: Record<number, string> = {
  [RUSTAT_PLAYER_PARAMS.RATING]: 'Рейтинг',
  [RUSTAT_PLAYER_PARAMS.MINUTES]: 'Минуты на поле',
  [RUSTAT_PLAYER_PARAMS.GOALS]: 'Голы',
  [RUSTAT_PLAYER_PARAMS.ASSISTS]: 'Голевые передачи',
  [RUSTAT_PLAYER_PARAMS.YELLOW_CARDS]: 'Желтые карточки',
  [RUSTAT_PLAYER_PARAMS.RED_CARDS]: 'Красные карточки',
  [RUSTAT_PLAYER_PARAMS.SHOTS]: 'Удары всего',
  [RUSTAT_PLAYER_PARAMS.SHOTS_ON_TARGET]: 'Удары в створ',
  [RUSTAT_PLAYER_PARAMS.PASSES]: 'Передачи всего',
  [RUSTAT_PLAYER_PARAMS.PASSES_ACCURATE_PCT]: 'Передачи точные, %',
  [RUSTAT_PLAYER_PARAMS.KEY_PASSES]: 'Ключевые передачи',
  [RUSTAT_PLAYER_PARAMS.DUELS]: 'Единоборства всего',
  [RUSTAT_PLAYER_PARAMS.DUELS_WON_PCT]: 'Единоборства выигранные, %',
  [RUSTAT_PLAYER_PARAMS.INTERCEPTIONS]: 'Перехваты',
  [RUSTAT_PLAYER_PARAMS.TACKLES]: 'Отборы',
  [RUSTAT_PLAYER_PARAMS.BLOCKS]: 'Блоки',
  [RUSTAT_PLAYER_PARAMS.CLEARANCES]: 'Выносы',
  [RUSTAT_PLAYER_PARAMS.DRIBBLES]: 'Дриблинг попытки',
  [RUSTAT_PLAYER_PARAMS.DRIBBLES_SUCCESS]: 'Дриблинг успешный',
  [RUSTAT_PLAYER_PARAMS.FOULS_DRAWN]: 'Фолы полученные',
  [RUSTAT_PLAYER_PARAMS.FOULS_COMMITTED]: 'Фолы совершенные',
  [RUSTAT_PLAYER_PARAMS.SAVES]: 'Сейвы',
  [RUSTAT_PLAYER_PARAMS.GOALS_CONCEDED]: 'Пропущенные голы',
  [RUSTAT_PLAYER_PARAMS.POSITION]: 'Позиция',
}

/**
 * Список всех параметров для запроса к API
 * Используется в POST /matches/players/stats
 */
export const ALL_PLAYER_PARAMS: Array<[number, number]> = [
  [RUSTAT_PLAYER_PARAMS.RATING, 0],
  [RUSTAT_PLAYER_PARAMS.MINUTES, 0],
  [RUSTAT_PLAYER_PARAMS.GOALS, 0],
  [RUSTAT_PLAYER_PARAMS.ASSISTS, 0],
  [RUSTAT_PLAYER_PARAMS.YELLOW_CARDS, 0],
  [RUSTAT_PLAYER_PARAMS.RED_CARDS, 0],
  [RUSTAT_PLAYER_PARAMS.SHOTS, 0],
  [RUSTAT_PLAYER_PARAMS.SHOTS_ON_TARGET, 0],
  [RUSTAT_PLAYER_PARAMS.PASSES, 0],
  [RUSTAT_PLAYER_PARAMS.PASSES_ACCURATE_PCT, 0],
  [RUSTAT_PLAYER_PARAMS.KEY_PASSES, 0],
  [RUSTAT_PLAYER_PARAMS.DUELS, 0],
  [RUSTAT_PLAYER_PARAMS.DUELS_WON_PCT, 0],
  [RUSTAT_PLAYER_PARAMS.INTERCEPTIONS, 0],
  [RUSTAT_PLAYER_PARAMS.TACKLES, 0],
  [RUSTAT_PLAYER_PARAMS.BLOCKS, 0],
  [RUSTAT_PLAYER_PARAMS.CLEARANCES, 0],
  [RUSTAT_PLAYER_PARAMS.DRIBBLES, 0],
  [RUSTAT_PLAYER_PARAMS.DRIBBLES_SUCCESS, 0],
  [RUSTAT_PLAYER_PARAMS.FOULS_DRAWN, 0],
  [RUSTAT_PLAYER_PARAMS.FOULS_COMMITTED, 0],
  [RUSTAT_PLAYER_PARAMS.SAVES, 0],
  [RUSTAT_PLAYER_PARAMS.GOALS_CONCEDED, 0],
  [RUSTAT_PLAYER_PARAMS.POSITION, 0],
]
