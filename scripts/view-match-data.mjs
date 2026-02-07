#!/usr/bin/env node

/**
 * Просмотр данных матча из БД
 * 
 * Использование:
 *   node scripts/view-match-data.mjs spartak-2025-11-02
 *   node scripts/view-match-data.mjs --list  # список всех матчей
 */

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function listMatches() {
  const matches = await prisma.match.findMany({
    where: {
      matchDate: {
        gte: new Date('2025-01-01'),
        lt: new Date('2026-01-01'),
      },
    },
    select: {
      slug: true,
      opponentName: true,
      matchDate: true,
      rustatId: true,
      rustatSynced: true,
    },
    orderBy: {
      matchDate: 'asc',
    },
  })

  console.log('\n📋 Список матчей 2025 года:\n')
  matches.forEach(m => {
    const date = new Date(m.matchDate).toLocaleDateString('ru-RU')
    const status = m.rustatSynced ? '✅' : '❌'
    console.log(`${status} ${date}: ЦСКА vs ${m.opponentName}`)
    console.log(`   Slug: ${m.slug}`)
    console.log(`   RuStat ID: ${m.rustatId || 'не указан'}`)
    console.log()
  })
}

async function viewMatch(slug) {
  const match = await prisma.match.findUnique({
    where: { slug },
  })

  if (!match) {
    console.error(`\n❌ Матч с slug "${slug}" не найден\n`)
    process.exit(1)
  }

  console.log('\n' + '='.repeat(80))
  console.log(`📋 Матч: ЦСКА vs ${match.opponentName}`)
  console.log('='.repeat(80))
  console.log()

  console.log('📅 Основная информация:')
  console.log(`   Дата: ${new Date(match.matchDate).toLocaleString('ru-RU')}`)
  console.log(`   Место: ${match.location || 'не указано'}`)
  console.log(`   Счет: ${match.cskaScore} : ${match.opponentScore}`)
  console.log(`   Статус: ${match.status}`)
  console.log(`   Slug: ${match.slug}`)
  console.log()

  console.log('🔗 RuStat данные:')
  console.log(`   RuStat ID: ${match.rustatId || 'не указан'}`)
  console.log(`   Синхронизирован: ${match.rustatSynced ? '✅ Да' : '❌ Нет'}`)
  if (match.rustatSyncedAt) {
    console.log(`   Дата синхронизации: ${new Date(match.rustatSyncedAt).toLocaleString('ru-RU')}`)
  }
  console.log()

  if (match.rustatData) {
    const data = JSON.parse(match.rustatData)
    
    console.log('📦 Загруженные данные:')
    console.log(`   ✅ Info: ${data.info ? 'Да' : 'Нет'}`)
    console.log(`   ✅ Players: ${data.players ? `Да (${data.players.length} игроков)` : 'Нет'}`)
    console.log(`   ✅ Tactics: ${data.tactics ? 'Да' : 'Нет'}`)
    if (data.tactics) {
      console.log(`      - Начальная расстановка: ${data.tactics.start?.length || 0} игроков`)
      console.log(`      - Конечная расстановка: ${data.tactics.end?.length || 0} игроков`)
    }
    console.log(`   ✅ Team Stats: ${data.teamStats ? 'Да' : 'Нет'}`)
    console.log(`   ✅ Player Stats: ${data.playerStats ? `Да (${data.playerStats.length} игроков)` : 'Нет'}`)
    console.log()

    if (data.info) {
      console.log('ℹ️  Информация о матче:')
      console.log(`   Турнир: ${data.info.tournament?.name_rus || 'не указан'}`)
      console.log(`   Команда 1: ${data.info.team1?.name_rus || 'не указана'}`)
      console.log(`   Команда 2: ${data.info.team2?.name_rus || 'не указана'}`)
      console.log(`   Счет: ${data.info.team1?.score || 0} : ${data.info.team2?.score || 0}`)
      console.log(`   Видео: ${data.info.has_video ? '✅ Доступно' : '❌ Недоступно'}`)
      console.log()
    }

    if (data.teamStats) {
      console.log('📊 Статистика команд (примеры):')
      const team1Stats = data.teamStats.team1?.stats || []
      const team2Stats = data.teamStats.team2?.stats || []
      
      // Index (рейтинг)
      const team1Index = team1Stats.find(s => s.param_id === 1)
      const team2Index = team2Stats.find(s => s.param_id === 1)
      if (team1Index && team2Index) {
        console.log(`   Index: ${team1Index.value} vs ${team2Index.value}`)
      }

      // Голы
      const team1Goals = team1Stats.find(s => s.param_id === 196)
      const team2Goals = team2Stats.find(s => s.param_id === 196)
      if (team1Goals && team2Goals) {
        console.log(`   Голы: ${team1Goals.value} vs ${team2Goals.value}`)
      }

      console.log(`   Всего параметров: ${team1Stats.length}`)
      console.log()
    }

    if (data.playerStats && data.playerStats.length > 0) {
      console.log('👥 Топ-5 игроков по рейтингу:')
      const sortedPlayers = [...data.playerStats]
        .sort((a, b) => {
          const aIndex = a.stats?.find(s => s.param_id === 1)?.value || 0
          const bIndex = b.stats?.find(s => s.param_id === 1)?.value || 0
          return bIndex - aIndex
        })
        .slice(0, 5)

      sortedPlayers.forEach((player, i) => {
        const indexStat = player.stats?.find(s => s.param_id === 1)
        const minutesStat = player.stats?.find(s => s.param_id === 288)
        const goalsStat = player.stats?.find(s => s.param_id === 196)
        
        console.log(`   ${i + 1}. ${player.player?.name_rus || 'Неизвестно'}`)
        console.log(`      Рейтинг: ${indexStat?.value || '-'}`)
        console.log(`      Минуты: ${minutesStat?.value || '-'}'`)
        console.log(`      Голы: ${goalsStat?.value || '-'}`)
      })
      console.log()
    }

    console.log('💾 Размер данных:')
    console.log(`   JSON: ${(match.rustatData.length / 1024).toFixed(2)} KB`)
    console.log()
  } else {
    console.log('⚠️  RuStat данные не загружены')
    console.log()
  }

  console.log('🌐 URL:')
  console.log(`   http://localhost:3000/matches/${match.slug}`)
  console.log()
  console.log('='.repeat(80))
  console.log()
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log('\n📖 Использование:')
    console.log('   node scripts/view-match-data.mjs <slug>')
    console.log('   node scripts/view-match-data.mjs --list')
    console.log()
    console.log('Примеры:')
    console.log('   node scripts/view-match-data.mjs spartak-2025-11-02')
    console.log('   node scripts/view-match-data.mjs --list')
    console.log()
    process.exit(0)
  }

  if (args[0] === '--list' || args[0] === '-l') {
    await listMatches()
  } else {
    await viewMatch(args[0])
  }

  await prisma.$disconnect()
}

main()
