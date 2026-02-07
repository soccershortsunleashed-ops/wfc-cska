/**
 * JavaScript версия утилит для работы с командами (для использования в скриптах)
 */

/**
 * Формирует URL логотипа команды
 * @param {Object} team - Команда
 * @returns {string} URL логотипа
 */
export function getTeamLogoUrl(team) {
  if (!team.logoFileName) {
    return '/placeholder-team-logo.png'
  }
  
  // Извлекаем год из сезона: "2025" → "2025"
  const year = team.season
  return `/teams/${year}/${team.competition}/${team.logoFileName}`
}

/**
 * Ищет команду по названию с учетом aliases
 * @param {Object} prisma - Prisma Client
 * @param {string} name - Название команды
 * @param {string} season - Сезон
 * @param {string} competition - Турнир
 * @returns {Promise<Object|null>} Команда или null
 */
export async function findTeamByName(
  prisma,
  name,
  season,
  competition = 'Суперлига'
) {
  const normalizedName = name.trim()
  
  // 1. Поиск по основному названию
  let team = await prisma.footballTeam.findFirst({
    where: {
      name: normalizedName,
      season,
      competition,
    },
  })
  
  if (team) return team
  
  // 2. Поиск по полному названию
  team = await prisma.footballTeam.findFirst({
    where: {
      fullName: normalizedName,
      season,
      competition,
    },
  })
  
  if (team) return team
  
  // 3. Поиск по aliases
  const teams = await prisma.footballTeam.findMany({
    where: {
      season,
      competition,
      aliases: {
        not: null,
      },
    },
  })
  
  for (const t of teams) {
    if (t.aliases) {
      try {
        const aliases = JSON.parse(t.aliases)
        if (aliases.some(alias => alias.toLowerCase() === normalizedName.toLowerCase())) {
          return t
        }
      } catch (error) {
        console.error(`Error parsing aliases for team ${t.name}:`, error)
      }
    }
  }
  
  return null
}

/**
 * Создает команду из данных RuStat
 * @param {Object} prisma - Prisma Client
 * @param {Object} rustatTeam - Данные команды из RuStat
 * @param {string} season - Сезон
 * @param {string} competition - Турнир
 * @returns {Promise<Object>} Созданная команда
 */
export async function createTeamFromRustat(
  prisma,
  rustatTeam,
  season,
  competition = 'Суперлига'
) {
  // Нормализуем название
  const name = normalizeTeamName(rustatTeam.name_rus)
  
  return await prisma.footballTeam.create({
    data: {
      name,
      fullName: rustatTeam.name_rus,
      season,
      competition,
      rustatId: rustatTeam.id,
      aliases: JSON.stringify([rustatTeam.name_rus, name]),
    },
  })
}

/**
 * Нормализует название команды
 * @param {string} name - Исходное название
 * @returns {string} Нормализованное название
 */
function normalizeTeamName(name) {
  const mapping = {
    'ЦСКА Москва': 'ЦСКА',
    'Спартак Москва': 'Спартак',
    'Зенит Санкт-Петербург': 'Зенит',
    'Динамо Москва': 'Динамо',
    'Локомотив Москва': 'Локомотив',
    'Крылья Советов Самара': 'Крылья Советов',
    'Звезда-2005': 'Звезда',
    'Звезда-2005 Пермь': 'Звезда',
    'Урал-УрФА': 'Урал',
    'Чертаново Москва': 'Чертаново',
    'Рубин Казань': 'Рубин',
    'Енисей Красноярск': 'Енисей',
  }
  
  return mapping[name] || name
}
