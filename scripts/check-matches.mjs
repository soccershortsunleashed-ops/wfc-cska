import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Проверка матчей в базе данных...\n')

  // Получаем все матчи
  const matches = await prisma.match.findMany({
    take: 5,
    orderBy: { matchDate: 'desc' }
  })

  console.log(`Всего матчей в базе: ${await prisma.match.count()}`)
  console.log('\nПоследние 5 матчей:')
  
  matches.forEach((match, index) => {
    console.log(`\n${index + 1}. ${match.opponentName}`)
    console.log(`   ID: ${match.id}`)
    console.log(`   Slug: ${match.slug}`)
    console.log(`   Дата: ${match.matchDate}`)
    console.log(`   Статус: ${match.status}`)
  })

  // Проверяем уникальность slug
  console.log('\n\nПроверка уникальности slug...')
  const slugs = matches.map(m => m.slug)
  const uniqueSlugs = new Set(slugs)
  
  if (slugs.length === uniqueSlugs.size) {
    console.log('✓ Все slug уникальны')
  } else {
    console.log('✗ Есть дублирующиеся slug!')
  }

  // Пробуем найти матч по slug
  if (matches.length > 0) {
    const testSlug = matches[0].slug
    console.log(`\n\nПопытка найти матч по slug: "${testSlug}"`)
    
    try {
      const foundMatch = await prisma.match.findUnique({
        where: { slug: testSlug }
      })
      
      if (foundMatch) {
        console.log('✓ Матч найден успешно!')
        console.log(`   Соперник: ${foundMatch.opponentName}`)
      } else {
        console.log('✗ Матч не найден')
      }
    } catch (error) {
      console.log('✗ Ошибка при поиске:', error.message)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
