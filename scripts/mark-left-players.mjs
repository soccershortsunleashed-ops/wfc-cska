import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('\n🔧 Пометка игроков, ушедших в другие клубы\n')
  
  // 1. Семёнова Е. и Мясникова Ю. (с RuStat ID и статистикой)
  const playersWithStats = [
    { name: 'Семёнова Е.', rustatId: 1332179 },
    { name: 'Мясникова Ю.', rustatId: 1024269 }
  ]
  
  console.log('📝 Игроки с статистикой, ушедшие в другие клубы:\n')
  
  for (const playerInfo of playersWithStats) {
    const player = await prisma.player.findFirst({
      where: { rustatId: playerInfo.rustatId },
      include: {
        matchStats: true
      }
    })
    
    if (player) {
      await prisma.player.update({
        where: { id: player.id },
        data: { leftClub: true }
      })
      
      console.log(`✅ ${playerInfo.name}`)
      console.log(`   RuStat ID: ${player.rustatId}`)
      console.log(`   Статистика: ${player.matchStats.length} матчей`)
      console.log(`   Статус: leftClub = true\n`)
    } else {
      console.log(`❌ Не найден: ${playerInfo.name}\n`)
    }
  }
  
  // 2. Игроки без фото и без статистики
  console.log('\n📝 Игроки без фото и статистики (вероятно ушли):\n')
  
  const playersWithoutPhotoAndStats = await prisma.player.findMany({
    where: {
      team: 'MAIN',
      rustatId: { not: null },
      photoUrl: null,
      matchStats: { none: {} }
    }
  })
  
  console.log(`Найдено: ${playersWithoutPhotoAndStats.length}\n`)
  
  for (const player of playersWithoutPhotoAndStats) {
    await prisma.player.update({
      where: { id: player.id },
      data: { leftClub: true }
    })
    
    console.log(`✅ ${player.firstName} ${player.lastName}`)
    console.log(`   RuStat ID: ${player.rustatId}`)
    console.log(`   Статус: leftClub = true\n`)
  }
  
  // Итоговая статистика
  const totalLeft = await prisma.player.count({
    where: {
      team: 'MAIN',
      leftClub: true
    }
  })
  
  const activeMain = await prisma.player.count({
    where: {
      team: 'MAIN',
      leftClub: false
    }
  })
  
  console.log('\n📊 ИТОГО:')
  console.log(`   Помечено как ушедшие: ${totalLeft}`)
  console.log(`   Активных в основном составе: ${activeMain}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
