import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:../dev.db'
})

const prisma = new PrismaClient({ adapter })

async function cleanOldSeasons() {
  console.log('🧹 Удаление старых данных с неправильным форматом сезонов...\n')

  try {
    // Удаляем все сезоны с форматом "YYYY/YYYY"
    const oldSeasons = [
      '2025/2026',
      '2024/2025',
      '2023/2024',
      '2022/2023',
      '2021/2022',
      '2020/2021',
      '2019/2020',
      '2018/2019',
      '2017/2018',
      '2016/2017',
      '2015/2016'
    ]

    for (const season of oldSeasons) {
      const deleted = await prisma.standingsTeam.deleteMany({
        where: {
          season: season
        }
      })
      
      if (deleted.count > 0) {
        console.log(`✓ Удалено ${deleted.count} записей для сезона ${season}`)
      }
    }

    console.log('\n✅ Очистка завершена!')
    
    // Проверяем, что осталось
    const remaining = await prisma.standingsTeam.groupBy({
      by: ['season'],
      _count: true
    })
    
    console.log('\n📊 Оставшиеся сезоны:')
    remaining.forEach(s => console.log(`  ${s.season}: ${s._count} записей`))
    
  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanOldSeasons()
