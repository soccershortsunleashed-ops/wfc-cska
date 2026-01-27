import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkMatches() {
  const matches = await prisma.match.findMany({
    orderBy: { matchDate: 'desc' },
    take: 10
  })
  
  console.log(`Total matches found: ${matches.length}\n`)
  
  matches.forEach(m => {
    const date = new Date(m.matchDate).toISOString().split('T')[0]
    console.log(`${date} - ${m.opponentName} (${m.status}) - isHome: ${m.isHome}`)
  })
  
  await prisma.$disconnect()
}

checkMatches()
