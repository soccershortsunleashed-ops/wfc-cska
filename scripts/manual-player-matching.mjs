import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

// Ручное сопоставление игроков
// Формат: { photoPlayerName: 'Имя Фамилия', rustatPlayerName: 'Фамилия И.', rustatId: number }
const MANUAL_MATCHES = [
  {
    photoPlayerName: 'Долматова Полина',
    rustatPlayerName: 'Долматова П.',
    rustatId: 381858,
    comment: 'Полное совпадение по фамилии'
  }
  // Добавьте другие совпадения здесь
]

async function main() {
  console.log('\n🔧 Ручное сопоставление игроков\n')
  
  let matched = 0
  let errors = 0
  
  for (const match of MANUAL_MATCHES) {
    console.log(`\n📝 Обработка: ${match.photoPlayerName} ↔️  ${match.rustatPlayerName}`)
    console.log(`   Комментарий: ${match.comment}`)
    
    // Найти игрока с фото
    const photoPlayer = await prisma.player.findFirst({
      where: {
        OR: [
          {
            firstName: { contains: match.photoPlayerName.split(' ')[0] },
            lastName: { contains: match.photoPlayerName.split(' ')[1] }
          },
          {
            firstName: { contains: match.photoPlayerName.split(' ')[1] },
            lastName: { contains: match.photoPlayerName.split(' ')[0] }
          }
        ],
        photoUrl: { not: null }
      }
    })
    
    if (!photoPlayer) {
      console.log(`   ❌ Игрок с фото не найден: ${match.photoPlayerName}`)
      errors++
      continue
    }
    
    // Найти игрока с RuStat ID
    const rustatPlayer = await prisma.player.findFirst({
      where: {
        rustatId: match.rustatId
      },
      include: {
        matchStats: true,
        stats: true
      }
    })
    
    if (!rustatPlayer) {
      console.log(`   ❌ Игрок с RuStat ID не найден: ${match.rustatId}`)
      errors++
      continue
    }
    
    console.log(`   ✅ Найдены оба игрока:`)
    console.log(`      С фото: ${photoPlayer.firstName} ${photoPlayer.lastName} (ID: ${photoPlayer.id}, №${photoPlayer.number})`)
    console.log(`      С RuStat: ${rustatPlayer.firstName} ${rustatPlayer.lastName} (ID: ${rustatPlayer.id}, RuStat: ${rustatPlayer.rustatId})`)
    console.log(`      Статистика: ${rustatPlayer.matchStats.length} записей`)
    
    // Перенос данных
    console.log(`\n   🔄 Перенос данных...`)
    
    // 1. Присвоить RuStat ID игроку с фото
    await prisma.player.update({
      where: { id: photoPlayer.id },
      data: {
        rustatId: rustatPlayer.rustatId,
        rustatName: rustatPlayer.rustatName
      }
    })
    console.log(`      ✅ RuStat ID присвоен`)
    
    // 2. Перенести детальную статистику
    if (rustatPlayer.matchStats.length > 0) {
      await prisma.playerMatchStats.updateMany({
        where: { playerId: rustatPlayer.id },
        data: { playerId: photoPlayer.id }
      })
      console.log(`      ✅ Перенесено ${rustatPlayer.matchStats.length} записей детальной статистики`)
    }
    
    // 3. Удалить агрегированную статистику RuStat игрока (если есть)
    if (rustatPlayer.stats) {
      await prisma.playerStats.delete({
        where: { playerId: rustatPlayer.id }
      })
      console.log(`      ✅ Удалена агрегированная статистика RuStat игрока`)
    }
    
    // 4. Удалить RuStat игрока
    await prisma.player.delete({
      where: { id: rustatPlayer.id }
    })
    console.log(`      ✅ RuStat игрок удален`)
    
    matched++
  }
  
  console.log(`\n\n📊 ИТОГО:`)
  console.log(`   ✅ Сопоставлено: ${matched}`)
  console.log(`   ❌ Ошибок: ${errors}`)
  
  if (matched > 0) {
    console.log(`\n🔄 Запустите агрегацию для обновления статистики:`)
    console.log(`   node scripts/aggregate-player-stats.mjs`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
