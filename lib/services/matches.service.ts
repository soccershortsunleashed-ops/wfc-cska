import prisma from '../db/prisma'
import { MatchType, MatchStatus, Prisma } from '@prisma/client'

export interface MatchFilters {
  tournament?: string
  season?: string
  status?: MatchStatus
  isHome?: boolean
  opponentName?: string
}

export interface MatchListOptions {
  filters?: MatchFilters
  page?: number
  pageSize?: number
  orderBy?: 'matchDate' | 'createdAt'
  orderDirection?: 'asc' | 'desc'
}

export const matchesService = {
  /**
   * Получить список матчей с фильтрами и пагинацией
   */
  async list(options: MatchListOptions = {}) {
    const {
      filters = {},
      page = 1,
      pageSize = 20,
      orderBy = 'matchDate',
      orderDirection = 'desc',
    } = options

    const where: Prisma.MatchWhereInput = {}

    // Применяем фильтры
    if (filters.tournament) {
      where.tournament = { contains: filters.tournament, mode: 'insensitive' }
    }
    if (filters.season) {
      where.season = filters.season
    }
    if (filters.status) {
      where.status = filters.status
    }
    if (filters.isHome !== undefined) {
      where.isHome = filters.isHome
    }
    if (filters.opponentName) {
      where.opponentName = { contains: filters.opponentName, mode: 'insensitive' }
    }

    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where,
        orderBy: { [orderBy]: orderDirection },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.match.count({ where }),
    ])

    return {
      matches,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  },

  /**
   * Получить матч по ID
   */
  async getById(id: string) {
    return prisma.match.findUnique({
      where: { id },
    })
  },

  /**
   * Получить матч по slug
   */
  async getBySlug(slug: string) {
    return prisma.match.findUnique({
      where: { slug },
    })
  },

  /**
   * Получить матчи по турниру
   */
  async getByTournament(tournament: string, options: Omit<MatchListOptions, 'filters'> = {}) {
    return this.list({
      ...options,
      filters: { tournament },
    })
  },

  /**
   * Получить матчи по сезону
   */
  async getBySeason(season: string, options: Omit<MatchListOptions, 'filters'> = {}) {
    return this.list({
      ...options,
      filters: { season },
    })
  },

  /**
   * Получить предстоящие матчи
   */
  async getUpcoming(limit = 5) {
    const now = new Date()
    
    return prisma.match.findMany({
      where: {
        matchDate: { gte: now },
        status: { in: [MatchStatus.SCHEDULED, MatchStatus.LIVE] },
      },
      orderBy: { matchDate: 'asc' },
      take: limit,
    })
  },

  /**
   * Получить прошедшие матчи
   */
  async getPast(limit = 10) {
    return prisma.match.findMany({
      where: {
        status: MatchStatus.FINISHED,
      },
      orderBy: { matchDate: 'desc' },
      take: limit,
    })
  },

  /**
   * Получить ближайший предстоящий матч
   */
  async getNextMatch() {
    const now = new Date()
    
    return prisma.match.findFirst({
      where: {
        matchDate: { gte: now },
        status: { in: [MatchStatus.SCHEDULED, MatchStatus.LIVE] },
      },
      orderBy: { matchDate: 'asc' },
    })
  },

  /**
   * Получить последний сыгранный матч
   */
  async getLastMatch() {
    return prisma.match.findFirst({
      where: {
        status: MatchStatus.FINISHED,
      },
      orderBy: { matchDate: 'desc' },
    })
  },

  /**
   * Получить предстоящий и последний матч (для главной страницы)
   */
  async getUpcomingAndLast() {
    const [upcoming, last] = await Promise.all([
      this.getNextMatch(),
      this.getLastMatch(),
    ])

    return { upcoming, last }
  },

  /**
   * Получить список всех турниров
   */
  async getTournaments() {
    const matches = await prisma.match.findMany({
      select: { tournament: true },
      distinct: ['tournament'],
      where: { tournament: { not: null } },
      orderBy: { tournament: 'asc' },
    })

    return matches
      .map((m) => m.tournament)
      .filter((t): t is string => t !== null)
  },

  /**
   * Получить список всех сезонов
   */
  async getSeasons() {
    const matches = await prisma.match.findMany({
      select: { season: true },
      distinct: ['season'],
      orderBy: { season: 'desc' },
    })

    return matches.map((m) => m.season)
  },

  /**
   * Получить статистику по матчам
   */
  async getStats(filters?: MatchFilters) {
    const where: Prisma.MatchWhereInput = {}

    if (filters?.tournament) {
      where.tournament = { contains: filters.tournament, mode: 'insensitive' }
    }
    if (filters?.season) {
      where.season = filters.season
    }

    const [total, wins, draws, losses, goalsScored, goalsConceded] = await Promise.all([
      prisma.match.count({
        where: { ...where, status: MatchStatus.FINISHED },
      }),
      prisma.match.count({
        where: {
          ...where,
          status: MatchStatus.FINISHED,
          scoreHome: { gt: prisma.match.fields.scoreAway },
        },
      }),
      prisma.match.count({
        where: {
          ...where,
          status: MatchStatus.FINISHED,
          scoreHome: { equals: prisma.match.fields.scoreAway },
        },
      }),
      prisma.match.count({
        where: {
          ...where,
          status: MatchStatus.FINISHED,
          scoreHome: { lt: prisma.match.fields.scoreAway },
        },
      }),
      prisma.match.aggregate({
        where: { ...where, status: MatchStatus.FINISHED },
        _sum: { scoreHome: true },
      }),
      prisma.match.aggregate({
        where: { ...where, status: MatchStatus.FINISHED },
        _sum: { scoreAway: true },
      }),
    ])

    return {
      total,
      wins,
      draws,
      losses,
      goalsScored: goalsScored._sum.scoreHome || 0,
      goalsConceded: goalsConceded._sum.scoreAway || 0,
    }
  },
}
