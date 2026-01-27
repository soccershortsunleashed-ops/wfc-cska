import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkMatches() {
  const total = await prisma.match.count()
  console.log(`\n📊 Всего матчей в базе: ${total}\n`)
  
  const matches = await prisma.match.findMany({
    orderBy: { matchDate: 'desc' },
    take: 10
  })
  
  console.log('🔝 Последние 10 матчей:\n')
  matches.forEach((m, i) => {
    const date = new Date(m.matchDate).toLocaleDateString('ru-RU')
    const score = m.scoreHome !== null && m.scoreAway !== null 
      ? `${m.scoreHome}:${m.scoreAway}` 
      : 'не сыгран'
    const home = m.isHome ? 'Дома' : 'В гостях'
    console.log(`${i+1}. ${date} - ${m.opponentName} (${home}) - ${score} - ${m.status}`)
  })
  
  await prisma.$disconnect()
}

checkMatches()
