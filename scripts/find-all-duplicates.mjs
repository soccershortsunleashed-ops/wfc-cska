import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('\n🔍 Поиск дубликатов игроков по rustatId\n')
  
  // Найти все rustatId с дубликатами
  const allPlayers = await prisma.player.findMany({
    where: {
      rustatId: {
        not: null
      }
    },
    orderBy: {
      rustatId: 'asc'
    }
  })
  
  // Группировка по rustatId
  const grouped = {}
  for (const player of allPlayers) {
    if (!grouped[player.rustatId]) {
      grouped[player.rustatId] = []
    }
    grouped[player.rustatId].push(player)
  }
  
  // Найти дубликаты
  const duplicates = Object.entries(grouped).filter(([_, players]) => players.length > 1)
  
  console.log(`📊 Всего игроков с RuStat ID: ${allPlayers.length}`)
  console.log(`⚠️  Найдено дубликатов: ${duplicates.length}\n`)
  
  if (duplicates.length === 0) {
    console.log('✅ Дубликатов не найдено!')
    return
  }
  
  for (const [rustatId, players] of duplicates) {
    console.log(`\n🔴 RuStat ID: ${rustatId}`)
    
    for (const player of players) {
      const matchStatsCount = await prisma.playerMatchStats.count({
        where: { playerId: player.id }
      })
      
      console.log(`\n  📊 ${player.firstName} ${player.lastName}`)
      console.log(`     ID: ${player.id}`)
      console.log(`     Slug: ${player.slug}`)
      console.log(`     Номер: ${player.number}`)
      console.log(`     Создан: ${player.createdAt}`)
      console.log(`     Детальная статистика: ${matchStatsCount} записей`)
    }
  }
  
  console.log(`\n\n📝 Итого найдено ${duplicates.length} групп дубликатов`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
