import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('\n🔧 Исправление всех дубликатов игроков\n')
  
  // Найти все rustatId с дубликатами
  const allPlayers = await prisma.player.findMany({
    where: {
      rustatId: {
        not: null
      }
    },
    orderBy: {
      createdAt: 'asc' // Сортировка по дате создания (старые первыми)
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
  
  console.log(`📊 Найдено групп дубликатов: ${duplicates.length}\n`)
  
  if (duplicates.length === 0) {
    console.log('✅ Дубликатов не найдено!')
    return
  }
  
  let totalFixed = 0
  let totalDeleted = 0
  let totalMoved = 0
  
  for (const [rustatId, players] of duplicates) {
    // Оригинальный игрок - самый старый (первый в списке)
    const original = players[0]
    const duplicatePlayers = players.slice(1)
    
    console.log(`\n🔄 RuStat ID: ${rustatId}`)
    console.log(`   Оригинал: ${original.firstName} ${original.lastName} (${original.slug})`)
    console.log(`   Дубликатов: ${duplicatePlayers.length}`)
    
    for (const duplicate of duplicatePlayers) {
      // Подсчет записей
      const duplicateStatsCount = await prisma.playerMatchStats.count({
        where: { playerId: duplicate.id }
      })
      
      console.log(`\n   📦 Обработка: ${duplicate.firstName} ${duplicate.lastName}`)
      console.log(`      Детальная статистика: ${duplicateStatsCount} записей`)
      
      if (duplicateStatsCount > 0) {
        // Перенос детальной статистики
        const updated = await prisma.playerMatchStats.updateMany({
          where: { playerId: duplicate.id },
          data: { playerId: original.id }
        })
        console.log(`      ✅ Перенесено записей: ${updated.count}`)
        totalMoved += updated.count
      }
      
      // Удаление агрегированной статистики дубликата
      const hasStats = await prisma.playerStats.findUnique({
        where: { playerId: duplicate.id }
      })
      
      if (hasStats) {
        await prisma.playerStats.delete({
          where: { playerId: duplicate.id }
        })
        console.log(`      ✅ Удалена агрегированная статистика`)
      }
      
      // Удаление дубликата
      await prisma.player.delete({
        where: { id: duplicate.id }
      })
      console.log(`      ✅ Дубликат удален`)
      totalDeleted++
    }
    
    totalFixed++
  }
  
  console.log(`\n\n📊 ИТОГО:`)
  console.log(`   ✅ Исправлено групп: ${totalFixed}`)
  console.log(`   ✅ Удалено дубликатов: ${totalDeleted}`)
  console.log(`   ✅ Перенесено записей статистики: ${totalMoved}`)
  
  console.log(`\n🔄 Запустите агрегацию для обновления статистики:`)
  console.log(`   node scripts/aggregate-player-stats.mjs`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
