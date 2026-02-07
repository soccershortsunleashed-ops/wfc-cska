#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const player = await prisma.player.findFirst({
    where: { lastName: 'Смирнова' },
    include: { stats: true }
  })

  if (!player || !player.stats) {
    console.log('❌ Данные не найдены')
    return
  }

  const s = player.stats

  console.log('\n📊 ПОЛНАЯ СТАТИСТИКА: Надежда Смирнова (#10)\n')
  console.log('='.repeat(60))
  
  console.log('\n🎯 ОСНОВНАЯ СТАТИСТИКА:')
  console.log('  Матчи:', s.gamesPlayed)
  console.log('  Минуты:', s.minutesPlayed)
  console.log('  Голы:', s.goals)
  console.log('  Ассисты:', s.assists)
  
  console.log('\n📋 КАРТОЧКИ:')
  console.log('  Желтые карточки:', s.yellowCards)
  console.log('  Красные карточки:', s.redCards)
  
  console.log('\n⚽ УДАРЫ:')
  console.log('  Удары всего:', s.shots)
  console.log('  Удары в створ:', s.shotsOnTarget)
  console.log('  Точность ударов:', s.shotAccuracy ? s.shotAccuracy.toFixed(1) + '%' : 'N/A')
  
  console.log('\n🎯 ПЕРЕДАЧИ:')
  console.log('  Передачи всего:', s.passes)
  console.log('  Передачи точные:', s.passesAccurate)
  console.log('  Точность передач:', s.passAccuracy ? s.passAccuracy.toFixed(1) + '%' : 'N/A')
  console.log('  Ключевые передачи:', s.keyPasses)
  
  console.log('\n🤼 ЕДИНОБОРСТВА:')
  console.log('  Единоборства всего:', s.duels)
  console.log('  Единоборства выигранные:', s.duelsWon)
  console.log('  Процент выигранных:', s.duelWinRate ? s.duelWinRate.toFixed(1) + '%' : 'N/A')
  
  console.log('\n🛡️ ЗАЩИТА:')
  console.log('  Перехваты:', s.interceptions)
  console.log('  Отборы:', s.tackles)
  console.log('  Отборы успешные:', s.tacklesWon)
  console.log('  Блоки:', s.blocks)
  console.log('  Выносы:', s.clearances)
  
  console.log('\n⚡ АТАКА:')
  console.log('  Дриблинг попытки:', s.dribbles)
  console.log('  Дриблинг успешный:', s.dribblesSuccess)
  console.log('  Фолы полученные:', s.foulsDrawn)
  console.log('  Фолы совершенные:', s.foulsCommitted)
  
  console.log('\n🥅 ДЛЯ ВРАТАРЕЙ:')
  console.log('  Сейвы:', s.saves || 'N/A')
  console.log('  Пропущенные голы:', s.goalsConceded || 'N/A')
  console.log('  Процент отраженных:', s.savePercentage ? s.savePercentage.toFixed(1) + '%' : 'N/A')
  console.log('  "Сухие" матчи:', s.cleanSheets || 'N/A')
  
  console.log('\n⚽ ПЕНАЛЬТИ:')
  console.log('  Забитые:', s.penaltiesScored)
  console.log('  Незабитые:', s.penaltiesMissed)
  
  console.log('\n📅 МЕТА:')
  console.log('  Сезон:', s.season)
  console.log('  RuStat Player ID:', s.rustatPlayerId)
  console.log('  Синхронизировано:', s.rustatSyncedAt?.toLocaleString('ru-RU'))
  
  console.log('\n' + '='.repeat(60))
  console.log()
}

main().finally(() => prisma.$disconnect())
