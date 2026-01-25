import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const lastMatch = await prisma.match.findFirst({
    where: { type: 'LAST' }
  })
  
  console.log('Last Match Data:')
  console.log(JSON.stringify(lastMatch, null, 2))
  
  const upcomingMatch = await prisma.match.findFirst({
    where: { type: 'UPCOMING' }
  })
  
  console.log('\nUpcoming Match Data:')
  console.log(JSON.stringify(upcomingMatch, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
