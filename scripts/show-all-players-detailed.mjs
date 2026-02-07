import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('\n📋 ВСЕ ИГРОКИ ОСНОВНОГО СОСТАВА\n')
  
  const allPlayers = await prisma.player.findMany({
    where: {
      team: 'MAIN'
    },
    orderBy: [
      { lastName: 'asc' },
      { firstName: 'asc' }
    ]
  })
  
  console.log(`Всего: ${allPlayers.length}\n`)
  
  for (const player of allPlayers) {
    const hasPhoto = player.photoUrl ? '📷' : '❌'
    const hasRustat = player.rustatId ? `✅ ${player.rustatId}` : '❌'
    const leftClub = player.leftClub ? '🚪' : '  '
    
    console.log(`${leftClub} ${hasPhoto} ${hasRustat.padEnd(15)} | №${String(player.number).padStart(2)} | ${player.firstName} ${player.lastName}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
