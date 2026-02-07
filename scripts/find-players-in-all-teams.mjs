import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('\n🔍 Поиск игроков "Семёнова" и "Мясникова" во всех командах\n')
  
  // Поиск Семёновой
  const semenova = await prisma.player.findMany({
    where: {
      OR: [
        { lastName: { contains: 'Семён' } },
        { firstName: { contains: 'Семён' } }
      ]
    }
  })
  
  console.log(`Найдено "Семёнова": ${semenova.length}`)
  for (const p of semenova) {
    const hasPhoto = p.photoUrl ? '📷' : '❌'
    const hasRustat = p.rustatId ? `RuStat: ${p.rustatId}` : 'Без RuStat'
    console.log(`  ${hasPhoto} №${p.number} ${p.firstName} ${p.lastName} (${p.team}) - ${hasRustat}`)
  }
  
  // Поиск Мясниковой
  const myasnikova = await prisma.player.findMany({
    where: {
      OR: [
        { lastName: { contains: 'Мясник' } },
        { firstName: { contains: 'Мясник' } }
      ]
    }
  })
  
  console.log(`\nНайдено "Мясникова": ${myasnikova.length}`)
  for (const p of myasnikova) {
    const hasPhoto = p.photoUrl ? '📷' : '❌'
    const hasRustat = p.rustatId ? `RuStat: ${p.rustatId}` : 'Без RuStat'
    console.log(`  ${hasPhoto} №${p.number} ${p.firstName} ${p.lastName} (${p.team}) - ${hasRustat}`)
  }
  
  // Проверим всех игроков с фото, но без RuStat
  console.log(`\n\n📋 ВСЕ ИГРОКИ С ФОТО, НО БЕЗ RUSTAT:\n`)
  
  const withPhotoNoRustat = await prisma.player.findMany({
    where: {
      photoUrl: { not: null },
      rustatId: null
    },
    orderBy: {
      team: 'asc'
    }
  })
  
  for (const p of withPhotoNoRustat) {
    console.log(`  №${p.number} ${p.firstName} ${p.lastName} (${p.team})`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
