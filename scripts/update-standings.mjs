import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateStandings() {
  console.log('🔄 Обновление турнирной таблицы...\n')

  try {
    // Получаем уникальные турниры и сезоны из матчей
    const matches = await prisma.match.findMany({
      where: {
        status: 'FINISHED',
        tournament: { not: null },
      },
      select: {
        tournament: true,
        season: true,
      },
      distinct: ['tournament', 'season'],
    })

    console.log(`📊 Найдено ${matches.length} уникальных турниров/сезонов\n`)

    for (const { tournament, season } of matches) {
      if (!tournament) continue

      console.log(`⚽ Обрабатываем: ${tournament} (${season})`)

      // Получаем все завершенные матчи турнира
      const tournamentMatches = await prisma.match.findMany({
        where: {
          tournament,
          season,
          status: 'FINISHED',
          scoreHome: { not: null },
          scoreAway: { not: null },
        },
        orderBy: { matchDate: 'asc' },
      })

      console.log(`   Матчей: ${tournamentMatches.length}`)

      // Собираем статистику по командам
      const teamsStats = new Map()

      tournamentMatches.forEach((match) => {
        const homeTeam = match.isHome ? 'ЦСКА' : match.opponentName
        const awayTeam = match.isHome ? match.opponentName : 'ЦСКА'
        const homeScore = match.scoreHome
        const awayScore = match.scoreAway

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

        const homeStats = teamsStats.get(homeTeam)
        const awayStats = teamsStats.get(awayTeam)

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

      // Сортируем команды
      const sortedTeams = Array.from(teamsStats.values()).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points
        const aDiff = a.goalsFor - a.goalsAgainst
        const bDiff = b.goalsFor - b.goalsAgainst
        if (bDiff !== aDiff) return bDiff - aDiff
        return b.goalsFor - a.goalsFor
      })

      console.log(`   Команд: ${sortedTeams.length}`)

      // Удаляем старые записи
      await prisma.standingsTeam.deleteMany({
        where: { tournament, season },
      })

      // Создаем новые записи
      for (let i = 0; i < sortedTeams.length; i++) {
        const team = sortedTeams[i]
        await prisma.standingsTeam.create({
          data: {
            teamName: team.teamName,
            teamLogoUrl: team.teamLogoUrl,
            tournament,
            season,
            position: i + 1,
            played: team.played,
            won: team.won,
            drawn: team.drawn,
            lost: team.lost,
            goalsFor: team.goalsFor,
            goalsAgainst: team.goalsAgainst,
            goalDifference: team.goalsFor - team.goalsAgainst,
            points: team.points,
            form: team.form.slice(-5).join(''),
          },
        })
      }

      console.log(`   ✅ Таблица обновлена\n`)
    }

    console.log('✨ Готово!')
  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateStandings()
