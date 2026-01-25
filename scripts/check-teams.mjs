import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const teams = await prisma.player.groupBy({
    by: ['team'],
    _count: true,
  })
  
  console.log('Распределение игроков по командам:')
  console.log(JSON.stringify(teams, null, 2))
  
  console.log('\nВсе игроки:')
  const allPlayers = await prisma.player.findMany({
    select: {
      firstName: true,
      lastName: true,
      number: true,
      team: true,
    },
    orderBy: {
      number: 'asc'
    }
  })
  
  allPlayers.forEach(p => {
    console.log(`${p.number}. ${p.firstName} ${p.lastName} - ${p.team}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
