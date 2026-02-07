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
      stats: true
    }
  })

  if (!player) {
    console.log('❌ Игрок не найден')
    return
  }

  console.log('\n📊 Данные игрока:')
  console.log(`Имя: ${player.firstName} ${player.lastName}`)
  console.log(`Slug: ${player.slug}`)
  console.log(`RuStat ID: ${player.rustatId}`)
  console.log(`URL: http://localhost:3000/players/${player.slug}`)
  
  if (player.stats) {
    console.log('\n📈 Статистика:')
    console.log(`Матчи: ${player.stats.gamesPlayed}`)
    console.log(`Голы: ${player.stats.goals}`)
    console.log(`Ассисты: ${player.stats.assists}`)
    console.log(`Желтые: ${player.stats.yellowCards}`)
  } else {
    console.log('\n⚠️  Статистика отсутствует')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
