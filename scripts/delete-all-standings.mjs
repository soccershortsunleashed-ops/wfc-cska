import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:../dev.db'
})

const prisma = new PrismaClient({ adapter })

async function deleteAll() {
  try {
    const deleted = await prisma.standingsTeam.deleteMany({})
    console.log(`✓ Удалено ${deleted.count} записей`)
  } catch (error) {
    console.error('Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteAll()
