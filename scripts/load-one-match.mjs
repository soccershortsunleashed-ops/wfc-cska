#!/usr/bin/env node

/**
 * Тестовый скрипт для загрузки данных одного матча
 * Использование: node scripts/load-one-match.mjs 688301
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

const TOKEN = process.env.RUSTAT_TOKEN
const RUSTAT_API_URL = 'https://api-football.rustatsport.ru'
const RUSTAT_MATCH_ID = process.argv[2] || '688301'

async function fetchRustatData(endpoint, options = {}) {
  const response = await fetch(`${RUSTAT_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.status}`)
  }

  return response.json()
}

async function loadMatch() {
  console.log(`\n📥 Загрузка данных для матча ${RUSTAT_MATCH_ID}...\n`)

  try {
    // Находим матч в БД
    const match = await prisma.match.findFirst({
      where: { rustatId: parseInt(RUSTAT_MATCH_ID) }
    })

    if (!match) {
      console.log(`❌ Матч с rustatId=${RUSTAT_MATCH_ID} не найден в БД`)
      return
    }

    console.log(`✅ Найден матч: ${match.opponentName} (${new Date(match.matchDate).toLocaleDateString('ru-RU')})`)
    console.log()

    // Загружаем данные
    console.log('  1/5 Загрузка info...')
    const info = await fetchRustatData(`/matches/${RUSTAT_MATCH_ID}/info`)
    
    console.log('  2/5 Загрузка players...')
    const players = await fetchRustatData(`/matches/${RUSTAT_MATCH_ID}/players`)
    
    console.log('  3/5 Загрузка tactics...')
    const tactics = await fetchRustatData(`/matches/${RUSTAT_MATCH_ID}/tactics`)
    
    console.log('  4/5 Загрузка teamStats...')
    const teamStats = await fetchRustatData(`/matches/teams/stats`, {
      method: 'POST',
      body: JSON.stringify({
        match_id: parseInt(RUSTAT_MATCH_ID),
        params: [[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0]],
      }),
    })
    
    console.log('  5/5 Загрузка playerStats...')
    const playerStats = await fetchRustatData(`/matches/players/stats`, {
      method: 'POST',
      body: JSON.stringify({
        gk: false,
        match_id: parseInt(RUSTAT_MATCH_ID),
        params: [[1, 0], [288, 0], [719, 0], [196, 0], [393, 0]],
      }),
    })

    const data = {
      info,
      players,
      tactics,
      teamStats,
      playerStats,
      syncedAt: new Date().toISOString(),
    }

    // Сохраняем в БД
    await prisma.match.update({
      where: { id: match.id },
      data: {
        rustatData: JSON.stringify(data),
        rustatSynced: true,
        rustatSyncedAt: new Date(),
      },
    })

    console.log()
    console.log('✅ Данные успешно загружены и сохранены!')
    console.log(`💾 Размер данных: ${(JSON.stringify(data).length / 1024).toFixed(2)} KB`)

  } catch (error) {
    console.error('\n❌ Ошибка:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

loadMatch()
