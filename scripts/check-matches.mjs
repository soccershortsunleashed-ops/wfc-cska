import { PrismaClient } from '@prisma/client'

// Устанавливаем DATABASE_URL перед созданием клиента
process.env.DATABASE_URL = 'file:./dev.db'

const prisma = new PrismaClient()

async function checkMatches() {
  try {
    console.log('🔍 Проверка матчей в базе данных...\n')

    // Получаем первые 5 матчей
    const matches = await prisma.match.findMany({
      take: 5,
      orderBy: { matchDate: 'desc' },
      select: {
        slug: true,
        opponentName: true,
        matchDate: true,
        opponentLogoUrl: true,
        scoreHome: true,
        scoreAway: true,
      },
    })

    console.log(`📊 Найдено матчей: ${matches.length}\n`)

    matches.forEach((match, index) => {
      console.log(`${index + 1}. ${match.opponentName}`)
      console.log(`   Slug: ${match.slug}`)
      console.log(`   Дата: ${new Date(match.matchDate).toLocaleDateString('ru-RU')}`)
      console.log(`   Счёт: ${match.scoreHome ?? '-'} : ${match.scoreAway ?? '-'}`)
      console.log(`   Лого: ${match.opponentLogoUrl || 'нет'}`)
      console.log('')
    })

    // Проверяем конкретный матч по slug
    const testSlug = matches[0]?.slug
    if (testSlug) {
      console.log(`\n🔍 Проверка getBySlug("${testSlug}")...`)
      const match = await prisma.match.findUnique({
        where: { slug: testSlug },
      })
      console.log(match ? '✅ Матч найден!' : '❌ Матч не найден!')
    }

    // Общая статистика
    const total = await prisma.match.count()
    console.log(`\n📈 Всего матчей в базе: ${total}`)

  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkMatches()
