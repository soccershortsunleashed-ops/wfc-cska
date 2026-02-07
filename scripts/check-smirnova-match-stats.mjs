import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  const player = await prisma.player.findFirst({
    where: {
      lastName: {
        contains: 'Смирнов'
      }
    },
    include: {
      matchStats: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  if (!player) {
    console.log('❌ Игрок не найден')
    return
  }

  console.log(`\n📊 ${player.firstName} ${player.lastName}`)
  console.log(`RuStat ID: ${player.rustatId}`)
  console.log(`\n📈 Детальная статистика матчей:`)
  console.log(`Всего записей: ${player.matchStats.length}`)
  
  if (player.matchStats.length > 0) {
    console.log(`\nПоследние 5 записей:`)
    player.matchStats.slice(0, 5).forEach((stat, i) => {
      console.log(`${i + 1}. Матч ID: ${stat.matchId}, Минуты: ${stat.minutesPlayed}, Голы: ${stat.goals}, Создано: ${stat.createdAt}`)
    })
    
    // Подсчет уникальных матчей
    const uniqueMatches = new Set(player.matchStats.map(s => s.matchId))
    console.log(`\nУникальных матчей: ${uniqueMatches.size}`)
    
    // Агрегация
    const totalGoals = player.matchStats.reduce((sum, s) => sum + s.goals, 0)
    const totalAssists = player.matchStats.reduce((sum, s) => sum + s.assists, 0)
    const totalMinutes = player.matchStats.reduce((sum, s) => sum + s.minutesPlayed, 0)
    const totalYellow = player.matchStats.reduce((sum, s) => sum + s.yellowCards, 0)
    
    console.log(`\n📊 Агрегированные данные из детальной статистики:`)
    console.log(`Матчи: ${uniqueMatches.size}`)
    console.log(`Голы: ${totalGoals}`)
    console.log(`Ассисты: ${totalAssists}`)
    console.log(`Минуты: ${totalMinutes}`)
    console.log(`Желтые: ${totalYellow}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
