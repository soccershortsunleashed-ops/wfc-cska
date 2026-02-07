#!/usr/bin/env node

/**
 * Агрегация статистики игроков из детальной статистики матчей
 */

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function aggregatePlayerStats() {
  console.log('📊 Агрегация статистики игроков из детальной статистики матчей\n')

  // Получаем всех игроков с детальной статистикой
  const players = await prisma.player.findMany({
    where: {
      matchStats: {
        some: {}
      }
    },
    include: {
      matchStats: true
    }
  })

  console.log(`Найдено игроков с детальной статистикой: ${players.length}\n`)

  let updated = 0

  for (const player of players) {
    const stats = player.matchStats

    // Агрегируем статистику
    const aggregated = {
      gamesPlayed: stats.length,
      minutesPlayed: stats.reduce((sum, s) => sum + s.minutesPlayed, 0),
      goals: stats.reduce((sum, s) => sum + s.goals, 0),
      assists: stats.reduce((sum, s) => sum + s.assists, 0),
      yellowCards: stats.reduce((sum, s) => sum + s.yellowCards, 0),
      redCards: stats.reduce((sum, s) => sum + s.redCards, 0),
      shots: stats.reduce((sum, s) => sum + s.shots, 0),
      shotsOnTarget: stats.reduce((sum, s) => sum + s.shotsOnTarget, 0),
      passes: stats.reduce((sum, s) => sum + s.passes, 0),
      passesAccurate: stats.reduce((sum, s) => sum + s.passesAccurate, 0),
      keyPasses: stats.reduce((sum, s) => sum + s.keyPasses, 0),
      duels: stats.reduce((sum, s) => sum + s.duels, 0),
      duelsWon: stats.reduce((sum, s) => sum + s.duelsWon, 0),
      interceptions: stats.reduce((sum, s) => sum + s.interceptions, 0),
      tackles: stats.reduce((sum, s) => sum + s.tackles, 0),
      tacklesWon: 0, // Нет данных
      blocks: stats.reduce((sum, s) => sum + s.blocks, 0),
      clearances: stats.reduce((sum, s) => sum + s.clearances, 0),
      dribbles: 0, // Нет данных
      dribblesSuccess: 0, // Нет данных
      foulsDrawn: 0, // Нет данных
      foulsCommitted: 0, // Нет данных
    }

    // Вычисляем проценты
    aggregated.shotAccuracy = aggregated.shots > 0 
      ? (aggregated.shotsOnTarget / aggregated.shots * 100) 
      : null

    aggregated.passAccuracy = aggregated.passes > 0 
      ? (aggregated.passesAccurate / aggregated.passes * 100) 
      : null

    aggregated.duelWinRate = aggregated.duels > 0 
      ? (aggregated.duelsWon / aggregated.duels * 100) 
      : null

    // Сохраняем или обновляем
    await prisma.playerStats.upsert({
      where: { playerId: player.id },
      update: {
        ...aggregated,
        rustatSynced: true,
        rustatSyncedAt: new Date(),
      },
      create: {
        playerId: player.id,
        ...aggregated,
        rustatSynced: true,
        rustatSyncedAt: new Date(),
      }
    })

    console.log(`✅ ${player.firstName} ${player.lastName}:`)
    console.log(`   Матчи: ${aggregated.gamesPlayed}, Минуты: ${aggregated.minutesPlayed}`)
    console.log(`   Голы: ${aggregated.goals}, Ассисты: ${aggregated.assists}`)
    console.log(`   Удары: ${aggregated.shots} (${aggregated.shotsOnTarget} в створ, ${aggregated.shotAccuracy?.toFixed(1)}%)`)
    console.log(`   Передачи: ${aggregated.passes} (${aggregated.passesAccurate} точных, ${aggregated.passAccuracy?.toFixed(1)}%)`)
    console.log(`   Единоборства: ${aggregated.duels} (${aggregated.duelsWon} выигранных, ${aggregated.duelWinRate?.toFixed(1)}%)\n`)

    updated++
  }

  console.log(`\n✅ Обновлено статистики игроков: ${updated}`)
}

async function main() {
  try {
    await aggregatePlayerStats()
  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
