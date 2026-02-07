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
    const { tournament = 'Суперлига', season = '2026' } = filters

    const standings = await prisma.standingsTeam.findMany({
      where: {
        tournament,
        season,
      },
      include: {
        team: true, // Включаем данные команды
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
  async getTeamPosition(teamId: string, tournament: string, season: string) {
    return prisma.standingsTeam.findFirst({
      where: {
        teamId,
        tournament,
        season,
      },
      include: {
        team: true,
      },
    })
  },

  /**
   * Обновить турнирную таблицу на основе результатов матчей
   */
  async updateStandingsFromMatches(tournament: string, season: string) {
    // Получаем все завершенные матчи турнира с данными команд
    const matches = await prisma.match.findMany({
      where: {
        tournament,
        season,
        status: 'FINISHED',
        scoreHome: { not: null },
        scoreAway: { not: null },
        homeTeamId: { not: null },
        awayTeamId: { not: null },
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: { matchDate: 'asc' },
    })

    // Собираем статистику по командам (используем teamId как ключ)
    const teamsStats = new Map<string, any>()

    matches.forEach((match) => {
      if (!match.homeTeam || !match.awayTeam) return

      const homeTeamId = match.homeTeam.id
      const awayTeamId = match.awayTeam.id
      const homeScore = match.scoreHome!
      const awayScore = match.scoreAway!

      // Инициализируем статистику для команд
      if (!teamsStats.has(homeTeamId)) {
        teamsStats.set(homeTeamId, {
          teamId: homeTeamId,
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
      if (!teamsStats.has(awayTeamId)) {
        teamsStats.set(awayTeamId, {
          teamId: awayTeamId,
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

      const homeStats = teamsStats.get(homeTeamId)!
      const awayStats = teamsStats.get(awayTeamId)!

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
          teamId: team.teamId,
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
