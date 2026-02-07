import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Подсчет всех записей детальной статистики
  const totalStats = await prisma.playerMatchStats.count()
  console.log(`\n📊 Всего записей детальной статистики: ${totalStats}`)
  
  // Группировка по игрокам
  const playerStats = await prisma.playerMatchStats.groupBy({
    by: ['playerId'],
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    }
  })
  
  console.log(`\n📈 Топ-10 игроков по количеству записей:`)
  
  for (let i = 0; i < Math.min(10, playerStats.length); i++) {
    const stat = playerStats[i]
    const player = await prisma.player.findUnique({
      where: { id: stat.playerId }
    })
    
    if (player) {
      console.log(`${i + 1}. ${player.firstName} ${player.lastName}: ${stat._count.id} записей`)
    }
  }
  
  // Проверка Смирновой
  const smirnovaAll = await prisma.player.findMany({
    where: {
      lastName: {
        contains: 'Смирнов'
      }
    }
  })
  
  console.log(`\n🔍 Найдено игроков "Смирнов": ${smirnovaAll.length}`)
  
  for (const smirnova of smirnovaAll) {
    const smirnovaStats = await prisma.playerMatchStats.count({
      where: {
        playerId: smirnova.id
      }
    })
    
    console.log(`\n${smirnova.firstName} ${smirnova.lastName}:`)
    console.log(`  ID: ${smirnova.id}`)
    console.log(`  RuStat ID: ${smirnova.rustatId}`)
    console.log(`  Записей статистики: ${smirnovaStats}`)
    
    if (smirnovaStats > 0) {
      const sample = await prisma.playerMatchStats.findMany({
        where: {
          playerId: smirnova.id
        },
        take: 3,
        orderBy: {
          createdAt: 'desc'
        }
      })
      
      console.log(`  Примеры:`)
      sample.forEach((s, i) => {
        console.log(`    ${i + 1}. Матч: ${s.matchId}, Голы: ${s.goals}, Минуты: ${s.minutesPlayed}`)
      })
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
