#!/usr/bin/env node

/**
 * Скрипт для тестирования страницы матча с RuStat данными
 * 
 * Проверяет:
 * - Наличие матчей с RuStat данными
 * - Корректность загрузки данных
 * - Доступность всех вкладок
 */

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🔍 Поиск матчей с RuStat данными...\n')

  // Получаем все матчи с RuStat данными
  const matches = await prisma.match.findMany({
    where: {
      rustatId: { not: null },
      rustatSynced: true,
      rustatData: { not: null },
    },
    orderBy: {
      matchDate: 'desc',
    },
    take: 10,
  })

  if (matches.length === 0) {
    console.log('❌ Не найдено матчей с RuStat данными')
    console.log('💡 Запустите: npm run sync-rustat-2025')
    return
  }

  console.log(`✅ Найдено ${matches.length} матчей с RuStat данными\n`)

  // Анализируем каждый матч
  for (const match of matches) {
    const data = JSON.parse(match.rustatData)
    const hasTeamStats = !!data.teamStats
    const hasPlayerStats = !!data.playerStats
    const hasTactics = !!data.tactics
    
    const date = new Date(match.matchDate).toLocaleDateString('ru-RU')
    const score = match.homeScore !== null ? `${match.homeScore}:${match.awayScore}` : 'не сыгран'
    
    console.log(`📊 ${match.opponentName} (${date})`)
    console.log(`   Slug: ${match.slug}`)
    console.log(`   Счет: ${score}`)
    console.log(`   RuStat ID: ${match.rustatId}`)
    console.log(`   Вкладки:`)
    console.log(`     ✅ Информация`)
    console.log(`     ${hasTactics ? '✅' : '❌'} Расстановка`)
    console.log(`     ${hasTeamStats ? '✅' : '❌'} Статистика команд`)
    console.log(`     ${hasPlayerStats ? '✅' : '❌'} Статистика игроков`)
    console.log(`   URL: http://localhost:3000/matches/${match.slug}`)
    console.log()
  }

  // Статистика
  const withTeamStats = matches.filter(m => {
    const data = JSON.parse(m.rustatData)
    return !!data.teamStats
  }).length

  const withPlayerStats = matches.filter(m => {
    const data = JSON.parse(m.rustatData)
    return !!data.playerStats
  }).length

  console.log('📈 Статистика:')
  console.log(`   Всего матчей: ${matches.length}`)
  console.log(`   Со статистикой команд: ${withTeamStats}`)
  console.log(`   Со статистикой игроков: ${withPlayerStats}`)
  console.log()

  // Рекомендуемый матч для тестирования
  const bestMatch = matches.find(m => {
    const data = JSON.parse(m.rustatData)
    return data.teamStats && data.playerStats && data.tactics
  })

  if (bestMatch) {
    console.log('🎯 Рекомендуемый матч для тестирования:')
    console.log(`   ${bestMatch.opponentName}`)
    console.log(`   http://localhost:3000/matches/${bestMatch.slug}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
