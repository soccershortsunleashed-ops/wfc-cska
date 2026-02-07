#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🔍 Поиск Марине Ачоян...\n')

  // Ищем игрока
  const player = await prisma.player.findFirst({
    where: {
      OR: [
        { firstName: { contains: 'Марине' } },
        { firstName: { contains: 'Marine' } },
      ],
      lastName: { contains: 'Ачоян' }
    }
  })

  if (!player) {
    console.log('❌ Игрок не найден')
    return
  }

  console.log(`✅ Найден игрок: ${player.firstName} ${player.lastName}`)
  console.log(`   ID: ${player.id}`)
  console.log(`   Номер: ${player.number}`)
  console.log(`   Текущий RuStat ID: ${player.rustatId || 'нет'}\n`)

  // Присваиваем RuStat ID
  const updated = await prisma.player.update({
    where: { id: player.id },
    data: {
      rustatId: 11553,
      rustatName: 'Марине Ачоян'
    }
  })

  console.log('✅ RuStat ID присвоен: 11553')
  console.log('✅ RuStat Name: Марине Ачоян\n')
  console.log('📊 Теперь можно синхронизировать статистику:')
  console.log('   node scripts/sync-single-player.mjs 11553')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
