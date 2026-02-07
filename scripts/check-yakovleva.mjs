import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('\n🔍 Поиск Дарьи Яковлевой\n')
  
  const player = await prisma.player.findFirst({
    where: {
      OR: [
        { lastName: { contains: 'Яковлев' } },
        { firstName: { contains: 'Дарь' } }
      ]
    },
    include: {
      stats: true,
      matchStats: true
    }
  })
  
  if (!player) {
    console.log('❌ Игрок не найден')
    return
  }
  
  console.log(`📊 ${player.firstName} ${player.lastName}`)
  console.log(`Номер: ${player.number}`)
  console.log(`RuStat ID: ${player.rustatId || 'НЕТ'}`)
  console.log(`Фото: ${player.photoUrl ? 'ДА' : 'НЕТ'}`)
  console.log(`leftClub: ${player.leftClub}`)
  console.log(`Slug: ${player.slug}`)
  
  if (player.stats) {
    console.log(`\n📈 Агрегированная статистика:`)
    console.log(`Матчи: ${player.stats.gamesPlayed}`)
    console.log(`Голы: ${player.stats.goals}`)
    console.log(`Ассисты: ${player.stats.assists}`)
    console.log(`Желтые: ${player.stats.yellowCards}`)
    console.log(`Синхронизировано: ${player.stats.rustatSynced}`)
    console.log(`Дата синхронизации: ${player.stats.rustatSyncedAt}`)
  } else {
    console.log(`\n⚠️  Агрегированная статистика отсутствует`)
  }
  
  console.log(`\n📋 Детальная статистика: ${player.matchStats.length} записей`)
  
  if (player.matchStats.length > 0) {
    console.log(`\nПримеры:`)
    player.matchStats.slice(0, 5).forEach((stat, i) => {
      console.log(`${i + 1}. Матч: ${stat.matchId}, Голы: ${stat.goals}, Минуты: ${stat.minutesPlayed}`)
    })
  }
  
  // Проверим, есть ли игрок с таким же именем в RuStat
  console.log(`\n🔍 Поиск в RuStat игроков с похожим именем...`)
  
  const similarPlayers = await prisma.player.findMany({
    where: {
      OR: [
        { rustatName: { contains: 'Яковлев' } },
        { firstName: { contains: 'Дарь' } },
        { lastName: { contains: 'Яковлев' } }
      ]
    }
  })
  
  console.log(`\nНайдено похожих игроков: ${similarPlayers.length}`)
  for (const p of similarPlayers) {
    console.log(`  - ${p.firstName} ${p.lastName} (RuStat: ${p.rustatId}, leftClub: ${p.leftClub})`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
