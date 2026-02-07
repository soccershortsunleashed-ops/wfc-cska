#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🔍 Поиск Аксиньи Гоменко...\n')

  const player = await prisma.player.findFirst({
    where: {
      OR: [
        { firstName: { contains: 'Аксинья' } },
        { firstName: { contains: 'Aksinya' } },
      ],
      lastName: { contains: 'Гоменко' }
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

  const updated = await prisma.player.update({
    where: { id: player.id },
    data: {
      rustatId: 532833,
      rustatName: 'Аксинья Гоменко'
    }
  })

  console.log('✅ RuStat ID присвоен: 532833')
  console.log('✅ RuStat Name: Аксинья Гоменко\n')
  console.log('📊 Теперь можно синхронизировать статистику:')
  console.log('   node scripts/sync-single-player.mjs 532833')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
