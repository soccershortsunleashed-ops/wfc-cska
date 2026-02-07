import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('\n🔧 Присвоение RuStat ID Дарье Яковлевой\n')
  
  // Найти Дарью Яковлеву
  const player = await prisma.player.findFirst({
    where: {
      firstName: { contains: 'Дарь' },
      lastName: { contains: 'Яковлев' }
    }
  })
  
  if (!player) {
    console.log('❌ Игрок не найден')
    return
  }
  
  console.log(`✅ Найден: ${player.firstName} ${player.lastName}`)
  console.log(`   ID: ${player.id}`)
  console.log(`   Текущий RuStat ID: ${player.rustatId || 'НЕТ'}`)
  
  // Присвоить RuStat ID
  const RUSTAT_ID = 649721
  
  await prisma.player.update({
    where: { id: player.id },
    data: {
      rustatId: RUSTAT_ID,
      rustatName: 'Д. Яковлева'
    }
  })
  
  console.log(`\n✅ RuStat ID присвоен: ${RUSTAT_ID}`)
  console.log(`\n🔄 Теперь запустите синхронизацию:`)
  console.log(`   node scripts/rustat-complete-sync.mjs`)
  console.log(`   node scripts/aggregate-player-stats.mjs`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
