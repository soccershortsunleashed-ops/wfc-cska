import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('\n🔍 Поиск игроков основного состава без RuStat ID\n')
  
  const players = await prisma.player.findMany({
    where: {
      team: 'MAIN',
      leftClub: false,
      rustatId: null
    },
    orderBy: {
      number: 'asc'
    }
  })
  
  console.log(`Найдено: ${players.length}\n`)
  
  for (const player of players) {
    const hasPhoto = player.photoUrl ? '📷' : '❌'
    console.log(`${hasPhoto} №${player.number} ${player.firstName} ${player.lastName}`)
  }
  
  if (players.length > 0) {
    console.log(`\n⚠️  Эти игроки не будут синхронизироваться с RuStat`)
    console.log(`   Нужно найти их RuStat ID и присвоить вручную`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
