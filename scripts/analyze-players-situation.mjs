import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('\n📊 Анализ игроков основного состава\n')
  
  // Все игроки основного состава
  const allPlayers = await prisma.player.findMany({
    where: {
      team: 'MAIN'
    },
    orderBy: {
      lastName: 'asc'
    }
  })
  
  console.log(`Всего игроков основного состава: ${allPlayers.length}\n`)
  
  // Группировка
  const withPhoto = allPlayers.filter(p => p.photoUrl)
  const withoutPhoto = allPlayers.filter(p => !p.photoUrl)
  const withRustatId = allPlayers.filter(p => p.rustatId)
  const withoutRustatId = allPlayers.filter(p => !p.rustatId)
  
  console.log(`✅ С фото: ${withPhoto.length}`)
  console.log(`❌ Без фото: ${withoutPhoto.length}`)
  console.log(`✅ С RuStat ID: ${withRustatId.length}`)
  console.log(`❌ Без RuStat ID: ${withoutRustatId.length}\n`)
  
  // Игроки с фото, но без RuStat ID
  const withPhotoNoRustat = allPlayers.filter(p => p.photoUrl && !p.rustatId)
  console.log(`🎯 С фото, но БЕЗ RuStat ID: ${withPhotoNoRustat.length}`)
  
  if (withPhotoNoRustat.length > 0) {
    console.log('\nСписок игроков с фото, но без RuStat ID:')
    for (const player of withPhotoNoRustat) {
      console.log(`  ${player.number}. ${player.firstName} ${player.lastName} (${player.position})`)
    }
  }
  
  // Игроки с RuStat ID, но без фото
  const withRustatNoPhoto = allPlayers.filter(p => p.rustatId && !p.photoUrl)
  console.log(`\n⚠️  С RuStat ID, но БЕЗ фото: ${withRustatNoPhoto.length}`)
  
  if (withRustatNoPhoto.length > 0) {
    console.log('\nСписок игроков с RuStat ID, но без фото:')
    for (const player of withRustatNoPhoto) {
      const matchStatsCount = await prisma.playerMatchStats.count({
        where: { playerId: player.id }
      })
      console.log(`  ${player.number}. ${player.firstName} ${player.lastName} (RuStat: ${player.rustatId}, Статистика: ${matchStatsCount} записей)`)
    }
  }
  
  // Идеальные игроки (с фото И с RuStat ID)
  const perfect = allPlayers.filter(p => p.photoUrl && p.rustatId)
  console.log(`\n✨ Идеальные (с фото И RuStat ID): ${perfect.length}`)
  
  if (perfect.length > 0) {
    console.log('\nСписок идеальных игроков:')
    for (const player of perfect) {
      console.log(`  ${player.number}. ${player.firstName} ${player.lastName}`)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
