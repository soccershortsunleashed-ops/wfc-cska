import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:../dev.db'
})
const prisma = new PrismaClient({ adapter })

/**
 * Преобразует формат сезона из турнирной таблицы в формат матчей
 * 2025 -> 2024/2025
 * 2026 -> 2025/2026
 */
function convertSeasonFormat(season) {
  const year = parseInt(season)
  return `${year - 1}/${year}`
}

/**
 * Рассчитывает форму команды на основе последних матчей
 */
async function calculateTeamForm() {
  console.log('🔄 Расчет формы команд на основе матчей...\n')

  try {
    // Получаем все команды из турнирной таблицы
    const standings = await prisma.standingsTeam.findMany({
      orderBy: [
        { season: 'desc' },
        { tournament: 'asc' },
        { position: 'asc' }
      ]
    })

    console.log(`📊 Найдено команд в турнирной таблице: ${standings.length}\n`)

    let updated = 0
    let skipped = 0

    for (const team of standings) {
      const { id, teamName, tournament, season, played } = team

      console.log(`⚽ Обработка: ${teamName} (${tournament}, ${season})`)

      // Пропускаем команды, которые еще не сыграли ни одного матча
      if (played === 0) {
        console.log(`   ⚠️  Сезон не начался (сыграно матчей: 0)`)
        await prisma.standingsTeam.update({
          where: { id },
          data: { form: null }
        })
        skipped++
        continue
      }

      // Преобразуем формат сезона для поиска матчей
      const matchSeason = convertSeasonFormat(season)

      // Определяем, это ЦСКА или соперник
      const isCska = teamName === 'ЦСКА' || teamName === 'ЖФК ЦСКА'

      let matches = []

      if (isCska) {
        // Для ЦСКА берем все матчи в Суперлиге/Чемпионате России
        matches = await prisma.match.findMany({
          where: {
            season: matchSeason,
            status: 'FINISHED',
            scoreHome: { not: null },
            scoreAway: { not: null },
            OR: [
              { tournament: 'Суперлига' },
              { tournament: 'Чемпионат России' }
            ]
          },
          orderBy: { matchDate: 'desc' },
          take: 5 // Последние 5 матчей
        })
      } else {
        // Для соперников ищем матчи против них
        matches = await prisma.match.findMany({
          where: {
            season: matchSeason,
            status: 'FINISHED',
            scoreHome: { not: null },
            scoreAway: { not: null },
            opponentName: teamName,
            OR: [
              { tournament: 'Суперлига' },
              { tournament: 'Чемпионат России' }
            ]
          },
          orderBy: { matchDate: 'desc' },
          take: 5 // Последние 5 матчей
        })
      }

      if (matches.length === 0) {
        console.log(`   ⚠️  Нет завершенных матчей (сезон ${matchSeason})`)
        skipped++
        continue
      }

      // Рассчитываем форму
      const form = []
      
      for (const match of matches.reverse()) { // Разворачиваем, чтобы форма была от старых к новым
        let result = 'D' // По умолчанию ничья
        
        let teamScore, opponentScore

        if (isCska) {
          // Для ЦСКА
          if (match.isHome) {
            teamScore = match.scoreHome
            opponentScore = match.scoreAway
          } else {
            teamScore = match.scoreAway
            opponentScore = match.scoreHome
          }
        } else {
          // Для соперника (в матчах ЦСКА)
          if (match.isHome) {
            // ЦСКА дома, соперник в гостях
            teamScore = match.scoreAway
            opponentScore = match.scoreHome
          } else {
            // ЦСКА в гостях, соперник дома
            teamScore = match.scoreHome
            opponentScore = match.scoreAway
          }
        }

        if (teamScore > opponentScore) {
          result = 'W' // Победа
        } else if (teamScore < opponentScore) {
          result = 'L' // Поражение
        }

        form.push(result)
      }

      const formString = form.join('')

      // Обновляем форму в базе данных
      await prisma.standingsTeam.update({
        where: { id },
        data: { form: formString }
      })

      console.log(`   ✅ Форма обновлена: ${formString} (${matches.length} матчей, сезон ${matchSeason})`)
      updated++
    }

    console.log(`\n✅ Расчет завершен!`)
    console.log(`📊 Обновлено команд: ${updated}`)
    console.log(`⚠️  Пропущено (нет матчей): ${skipped}`)

  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

calculateTeamForm()
