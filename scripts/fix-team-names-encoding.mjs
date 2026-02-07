import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:../dev.db'
})

const prisma = new PrismaClient({ adapter })

async function fixTeamNames() {
  console.log('🔧 Исправление кодировки названий команд...\n')

  try {
    // Получаем все записи
    const allTeams = await prisma.standingsTeam.findMany()
    
    console.log(`Найдено ${allTeams.length} записей\n`)
    
    let fixed = 0
    let skipped = 0
    
    for (const team of allTeams) {
      try {
        // Пытаемся исправить двойную кодировку
        const teamNameBytes = Buffer.from(team.teamName, 'latin1')
        const fixedName = teamNameBytes.toString('utf-8')
        
        // Проверяем, что исправление имеет смысл (содержит кириллицу)
        if (/[А-Яа-яЁё]/.test(fixedName)) {
          await prisma.standingsTeam.update({
            where: { id: team.id },
            data: { teamName: fixedName }
          })
          
          console.log(`✓ ${team.teamName} → ${fixedName}`)
          fixed++
        } else {
          skipped++
        }
      } catch (e) {
        console.log(`⚠ Не удалось исправить: ${team.teamName}`)
        skipped++
      }
    }
    
    console.log(`\n✅ Готово!`)
    console.log(`   Исправлено: ${fixed}`)
    console.log(`   Пропущено: ${skipped}`)
    
  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixTeamNames()
