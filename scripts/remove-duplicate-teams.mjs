#!/usr/bin/env node

/**
 * Удаляет дубликаты команд, оставляя только одну запись для каждой команды в каждом сезоне
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('\n🧹 Удаление дубликатов команд\n')
  console.log('=' .repeat(80))
  console.log()

  // Получаем все команды
  const allTeams = await prisma.footballTeam.findMany({
    orderBy: [
      { season: 'asc' },
      { name: 'asc' },
      { id: 'asc' }
    ]
  })

  console.log(`📊 Всего команд в БД: ${allTeams.length}\n`)

  // Группируем по сезону и названию
  const grouped = new Map()
  
  for (const team of allTeams) {
    const key = `${team.season}:${team.name}`
    
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    
    grouped.get(key).push(team)
  }

  let duplicatesFound = 0
  let duplicatesRemoved = 0

  // Обрабатываем каждую группу
  for (const [key, teams] of grouped.entries()) {
    if (teams.length > 1) {
      const [season, name] = key.split(':')
      console.log(`🔍 Найдены дубликаты: ${name} (${season}) - ${teams.length} записей`)
      duplicatesFound += teams.length - 1

      // Оставляем первую запись (с наименьшим ID), удаляем остальные
      const [keepTeam, ...removeTeams] = teams

      console.log(`   ✅ Оставляем: ID ${keepTeam.id}`)

      for (const removeTeam of removeTeams) {
        // Переносим все связи на основную команду
        
        // Обновляем матчи где команда дома
        const homeMatchesCount = await prisma.match.count({
          where: { homeTeamId: removeTeam.id }
        })
        
        if (homeMatchesCount > 0) {
          await prisma.match.updateMany({
            where: { homeTeamId: removeTeam.id },
            data: { homeTeamId: keepTeam.id }
          })
          console.log(`   📝 Перенесено ${homeMatchesCount} матчей (дома)`)
        }

        // Обновляем матчи где команда в гостях
        const awayMatchesCount = await prisma.match.count({
          where: { awayTeamId: removeTeam.id }
        })
        
        if (awayMatchesCount > 0) {
          await prisma.match.updateMany({
            where: { awayTeamId: removeTeam.id },
            data: { awayTeamId: keepTeam.id }
          })
          console.log(`   📝 Перенесено ${awayMatchesCount} матчей (в гостях)`)
        }

        // Обновляем турнирную таблицу
        const standingsCount = await prisma.standingsTeam.count({
          where: { teamId: removeTeam.id }
        })
        
        if (standingsCount > 0) {
          await prisma.standingsTeam.updateMany({
            where: { teamId: removeTeam.id },
            data: { teamId: keepTeam.id }
          })
          console.log(`   📝 Перенесено ${standingsCount} записей турнирной таблицы`)
        }

        // Удаляем дубликат
        await prisma.footballTeam.delete({
          where: { id: removeTeam.id }
        })
        
        console.log(`   🗑️  Удален дубликат: ID ${removeTeam.id}`)
        duplicatesRemoved++
      }

      console.log()
    }
  }

  // Финальная статистика
  const finalCount = await prisma.footballTeam.count()

  console.log('=' .repeat(80))
  console.log(`\n📊 Итого:`)
  console.log(`   Было команд: ${allTeams.length}`)
  console.log(`   Найдено дубликатов: ${duplicatesFound}`)
  console.log(`   Удалено дубликатов: ${duplicatesRemoved}`)
  console.log(`   Осталось команд: ${finalCount}`)
  console.log()
}

main()
  .catch((error) => {
    console.error('\n❌ Ошибка:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
