import prisma from '../db/prisma'
import { Prisma } from '@prisma/client'

export interface StandingsFilters {
  tournament?: string
  season?: string
}

export const standingsService = {
  /**
   * Получить турнирную таблицу
   */
  async getStandings(filters: StandingsFilters = {}) {
    const { tournament = 'Суперлига', season = '2025/2026' } = filters

    const standings = await prisma.standingsTeam.findMany({
      where: {
        tournament,
        season,
      },
      orderBy: [
        { position: 'asc' },
        { points: 'desc' },
        { goalDifference: 'desc' },
        { goalsFor: 'desc' },
      ],
    })

    return standings
  },

  /**
   * Получить позицию команды
   */
  async getTeamPosition(teamName: string, tournament: string, season: string) {
    return prisma.standingsTeam.findUnique({
      where: {
        teamName_tournament_season: {
          teamName,
          tournament,
          season,
        },
      },
    })
  },

  /**
   * Обновить турнирную таблицу на основе результатов матчей
   */
  async updateStandingsFromMatches(tournament: string, season: string) {
    // Получаем все завершенные матчи турнира
    const matches = await prisma.match.findMany({
      where: {
        tournament,
        season,
        status: 'FINISHED',
        scoreHome: { not: null },
        scoreAway: { not: null },
      },
      orderBy: { matchDate: 'asc' },
    })

    // Собираем статистику по командам
    const teamsStats = new Map<string, any>()

    matches.forEach((match) => {
      const homeTeam = match.isHome ? 'ЦСКА' : match.opponentName
      const awayTeam = match.isHome ? match.opponentName : 'ЦСКА'
      const homeScore = match.scoreHome!
      const awayScore = match.scoreAway!

      // Инициализируем статистику для команд
      if (!teamsStats.has(homeTeam)) {
        teamsStats.set(homeTeam, {
          teamName: homeTeam,
          teamLogoUrl: match.isHome ? match.cskaLogoUrl : match.opponentLogoUrl,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
          form: [],
        })
      }
      if (!teamsStats.has(awayTeam)) {
        teamsStats.set(awayTeam, {
          teamName: awayTeam,
          teamLogoUrl: match.isHome ? match.opponentLogoUrl : match.cskaLogoUrl,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
          form: [],
        })
      }

      const homeStats = teamsStats.get(homeTeam)!
      const awayStats = teamsStats.get(awayTeam)!

      // Обновляем статистику
      homeStats.played++
      awayStats.played++
      homeStats.goalsFor += homeScore
      homeStats.goalsAgainst += awayScore
      awayStats.goalsFor += awayScore
      awayStats.goalsAgainst += homeScore

      if (homeScore > awayScore) {
        homeStats.won++
        homeStats.points += 3
        awayStats.lost++
        homeStats.form.push('W')
        awayStats.form.push('L')
      } else if (homeScore < awayScore) {
        awayStats.won++
        awayStats.points += 3
        homeStats.lost++
        homeStats.form.push('L')
        awayStats.form.push('W')
      } else {
        homeStats.drawn++
        awayStats.drawn++
        homeStats.points++
        awayStats.points++
        homeStats.form.push('D')
        awayStats.form.push('D')
      }
    })

    // Сортируем команды по очкам, разнице мячей и забитым голам
    const sortedTeams = Array.from(teamsStats.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      const aDiff = a.goalsFor - a.goalsAgainst
      const bDiff = b.goalsFor - b.goalsAgainst
      if (bDiff !== aDiff) return bDiff - aDiff
      return b.goalsFor - a.goalsFor
    })

    // Удаляем старые записи и создаем новые
    await prisma.standingsTeam.deleteMany({
      where: { tournament, season },
    })

    // Создаем записи в таблице
    const createPromises = sortedTeams.map((team, index) => {
      return prisma.standingsTeam.create({
        data: {
          teamName: team.teamName,
          teamLogoUrl: team.teamLogoUrl,
          tournament,
          season,
          position: index + 1,
          played: team.played,
          won: team.won,
          drawn: team.drawn,
          lost: team.lost,
          goalsFor: team.goalsFor,
          goalsAgainst: team.goalsAgainst,
          goalDifference: team.goalsFor - team.goalsAgainst,
          points: team.points,
          form: team.form.slice(-5).join(''), // Последние 5 матчей
        },
      })
    })

    await Promise.all(createPromises)

    return sortedTeams.length
  },

  /**
   * Получить список турниров
   */
  async getTournaments() {
    const standings = await prisma.standingsTeam.findMany({
      select: { tournament: true },
      distinct: ['tournament'],
      orderBy: { tournament: 'asc' },
    })

    return standings.map((s) => s.tournament)
  },

  /**
   * Получить список сезонов
   */
  async getSeasons() {
    const standings = await prisma.standingsTeam.findMany({
      select: { season: true },
      distinct: ['season'],
      orderBy: { season: 'desc' },
    })

    return standings.map((s) => s.season)
  },
}
