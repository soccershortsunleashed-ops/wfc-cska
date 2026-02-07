import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('\n🔧 Исправление дубликата Смирновой\n')
  
  // Найти оригинального игрока и дубликат
  const original = await prisma.player.findUnique({
    where: { id: 'cmkxijsg1001gcouc93y9yb64' }
  })
  
  const duplicate = await prisma.player.findUnique({
    where: { id: 'cml2rntwu000n7cuc7569wlk6' }
  })
  
  if (!original || !duplicate) {
    console.log('❌ Игроки не найдены')
    return
  }
  
  console.log(`✅ Оригинал: ${original.firstName} ${original.lastName} (${original.slug})`)
  console.log(`✅ Дубликат: ${duplicate.firstName} ${duplicate.lastName} (${duplicate.slug})`)
  
  // Подсчет записей
  const duplicateStatsCount = await prisma.playerMatchStats.count({
    where: { playerId: duplicate.id }
  })
  
  console.log(`\n📊 У дубликата ${duplicateStatsCount} записей детальной статистики`)
  
  // Перенос детальной статистики
  console.log('\n🔄 Перенос детальной статистики...')
  const updated = await prisma.playerMatchStats.updateMany({
    where: { playerId: duplicate.id },
    data: { playerId: original.id }
  })
  
  console.log(`✅ Перенесено записей: ${updated.count}`)
  
  // Удаление агрегированной статистики дубликата
  if (duplicate.stats) {
    await prisma.playerStats.delete({
      where: { playerId: duplicate.id }
    })
    console.log('✅ Удалена агрегированная статистика дубликата')
  }
  
  // Удаление дубликата
  await prisma.player.delete({
    where: { id: duplicate.id }
  })
  console.log('✅ Дубликат удален')
  
  // Проверка
  const finalCount = await prisma.playerMatchStats.count({
    where: { playerId: original.id }
  })
  
  console.log(`\n✅ Итого у оригинального игрока: ${finalCount} записей детальной статистики`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
