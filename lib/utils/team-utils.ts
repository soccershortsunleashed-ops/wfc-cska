import { FootballTeam, PrismaClient } from '@prisma/client'

/**
 * Формирует URL логотипа команды
 * @param team - Команда
 * @returns URL логотипа
 */
export function getTeamLogoUrl(team: FootballTeam): string {
  if (!team.logoFileName) {
    return '/placeholder-team-logo.png'
  }
  
  // Извлекаем год из сезона: "2025" → "2025"
  const year = team.season
  return `/teams/${year}/${team.competition}/${team.logoFileName}`
}

/**
 * Ищет команду по названию с учетом aliases
 * @param prisma - Prisma Client
 * @param name - Название команды
 * @param season - Сезон
 * @param competition - Турнир
 * @returns Команда или null
 */
export async function findTeamByName(
  prisma: PrismaClient,
  name: string,
  season: string,
  competition: string = 'Суперлига'
): Promise<FootballTeam | null> {
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
        const aliases = JSON.parse(t.aliases) as string[]
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
 * @param prisma - Prisma Client
 * @param rustatTeam - Данные команды из RuStat
 * @param season - Сезон
 * @param competition - Турнир
 * @returns Созданная команда
 */
export async function createTeamFromRustat(
  prisma: PrismaClient,
  rustatTeam: { id: number; name_rus: string },
  season: string,
  competition: string = 'Суперлига'
): Promise<FootballTeam> {
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
 * @param name - Исходное название
 * @returns Нормализованное название
 */
function normalizeTeamName(name: string): string {
  const mapping: Record<string, string> = {
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
