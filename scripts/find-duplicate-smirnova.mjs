import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Найти всех игроков с rustatId = 1373001
  const players = await prisma.player.findMany({
    where: {
      rustatId: 1373001
    },
    include: {
      stats: true,
      matchStats: {
        take: 3
      }
    }
  })
  
  console.log(`\n🔍 Найдено игроков с RuStat ID 1373001: ${players.length}\n`)
  
  for (const player of players) {
    console.log(`\n📊 Игрок:`)
    console.log(`  ID: ${player.id}`)
    console.log(`  Имя: ${player.firstName} ${player.lastName}`)
    console.log(`  Slug: ${player.slug}`)
    console.log(`  Номер: ${player.number}`)
    console.log(`  Создан: ${player.createdAt}`)
    console.log(`  Обновлен: ${player.updatedAt}`)
    
    const matchStatsCount = await prisma.playerMatchStats.count({
      where: { playerId: player.id }
    })
    
    console.log(`\n  📈 Статистика:`)
    if (player.stats) {
      console.log(`    Агрегированная: Матчи=${player.stats.gamesPlayed}, Голы=${player.stats.goals}, Ассисты=${player.stats.assists}`)
    } else {
      console.log(`    Агрегированная: НЕТ`)
    }
    console.log(`    Детальная: ${matchStatsCount} записей`)
    
    if (matchStatsCount > 0) {
      console.log(`\n  Примеры детальной статистики:`)
      player.matchStats.forEach((s, i) => {
        console.log(`    ${i + 1}. Матч: ${s.matchId}, Голы: ${s.goals}, Минуты: ${s.minutesPlayed}`)
      })
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
