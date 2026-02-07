#!/usr/bin/env node

/**
 * Скрипт для синхронизации матчей 2025 года с RuStat API
 * 
 * Что делает:
 * 1. Получает все матчи ЦСКА из RuStat API
 * 2. Фильтрует матчи 2025 года
 * 3. Сопоставляет их с матчами в нашей БД по дате и командам
 * 4. Обновляет rustatId в БД
 * 
 * Использование:
 *   node scripts/sync-rustat-matches-2025.mjs
 */

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

// Токен из браузера
const TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ikg3eDZQWGJab3VLIiwidHlwIjoiSldUIn0.eyJhY2wiOm51bGwsImFjdGl2ZSI6dHJ1ZSwiYXVkIjpbInJ1c3RhdF9mb290YmFsbCJdLCJhdXRoX3R5cGUiOiJjb2RlIiwiY2xpZW50X2lkIjoicnVzdGF0X2Zvb3RiYWxsIiwiZW1haWwiOiJ2YWRpbS1maWZhQG1haWwucnUiLCJleHAiOjE3Njk2Mjk5NTksImlhdCI6MTc2OTYyOTY1OSwiaXNzIjoiaHR0cHM6Ly9hcGktYXV0aC5ydXN0YXRzcG9ydC5ydSIsInNjb3BlIjoib3BlbmlkIiwic2Vzc2lvbiI6IjViNjA5ZGEwMTM2N2VkMzA5Y2FlNjBkM2JlNDI4ODA5MTA1ZGMzZGM4ZGZmNDQ2MzJjMjNhNTcyOWU2NWMxYTkiLCJ0b3NfYWNjZXB0ZWQiOnRydWUsInR3b19mYWN0b3IiOmZhbHNlLCJ0eXAiOiJCZWFyZXIiLCJ1c2VyX2lkIjo2MDd9.F1TptlnzlK4JYeckkADSzLRM7ku_3zl2PQBM29EvzUfSbla4lkOB0cox-fOQSh3RNhvuxK01fF8HwTuIAzzE4zqzLGLOAGCkN8-8cD0-S5_0WZ-cL91kqmKygFs_ieIdL01HvfGpMU-iGU9k4Py2uLdsiFIFmOxwPVsqtkAa1S3sxlzyX_LWTvPrPPvIfuLiROtwQzbdtypdpK7fmnF9HE6fc4IQD0L73btd7l1NWNfa3_J3KZU-tZVnbZJo4BgKn8SdD9_XYwca3ZYMHM45bUpL_PuD0m4xxY0wPGXXli3dXhPRmjl5Hf6Aza9o9-gqrACTJkUmJZivLYkyvFVSVA'

const RUSTAT_API_URL = 'https://api-football.rustatsport.ru'
const CSKA_TEAM_ID = 13503

// Маппинг названий команд RuStat -> наши названия
const TEAM_NAME_MAPPING = {
  'ЦСКА': 'ЦСКА',
  'ЦСКА Москва': 'ЦСКА',
  'Зенит': 'Зенит',
  'Зенит Санкт-Петербург': 'Зенит',
  'Локомотив': 'Локомотив',
  'Краснодар': 'Краснодар',
  'Ростов': 'Ростов',
  'Чертаново': 'Чертаново',
  'Рубин': 'Рубин',
  'Спартак Москва': 'Спартак',
  'Спартак': 'Спартак',
  'Урал-УрФА': 'Урал',
  'Енисей': 'Енисей',
  'Звезда-2005': 'Звезда',
  'Динамо': 'Динамо',
  'Рязань-ВДВ': 'Рязань-ВДВ',
  'Крылья Советов Самара': 'Крылья Советов',
}

async function getRustatMatches() {
  console.log('📥 Получение матчей ЦСКА из RuStat API...')
  
  const response = await fetch(
    `${RUSTAT_API_URL}/teams/${CSKA_TEAM_ID}/matches?limit=100&offset=0`,
    {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch matches: ${response.status}`)
  }

  const data = await response.json()
  
  // Фильтруем матчи 2025 года
  const matches2025 = data.matches.filter(match => {
    const year = new Date(match.datetime).getFullYear()
    return year === 2025
  })

  console.log(`✅ Получено ${matches2025.length} матчей 2025 года из RuStat`)
  
  return { matches: matches2025, teams: data.teams, tournaments: data.tournaments }
}

async function getDbMatches() {
  console.log('📥 Получение матчей из БД...')
  
  const matches = await prisma.match.findMany({
    where: {
      matchDate: {
        gte: new Date('2025-01-01'),
        lt: new Date('2026-01-01'),
      },
    },
    orderBy: {
      matchDate: 'asc',
    },
  })

  console.log(`✅ Получено ${matches.length} матчей из БД`)
  
  return matches
}

function normalizeTeamName(name) {
  return TEAM_NAME_MAPPING[name] || name
}

function matchesAreSame(dbMatch, rustatMatch, rustatTeams) {
  // Получаем названия команд из RuStat
  const rustatTeam1 = rustatTeams.find(t => t.id === rustatMatch.team1.id)
  const rustatTeam2 = rustatTeams.find(t => t.id === rustatMatch.team2.id)
  
  if (!rustatTeam1 || !rustatTeam2) return false

  const rustatTeam1Name = normalizeTeamName(rustatTeam1.name_rus)
  const rustatTeam2Name = normalizeTeamName(rustatTeam2.name_rus)
  
  // В БД у нас только opponentName, ЦСКА всегда одна из команд
  const dbOpponentName = normalizeTeamName(dbMatch.opponentName)

  // Проверяем совпадение: один из RuStat должен быть ЦСКА, другой - opponent
  const cskaInRustat = rustatTeam1Name === 'ЦСКА' || rustatTeam2Name === 'ЦСКА'
  const opponentInRustat = rustatTeam1Name === dbOpponentName || rustatTeam2Name === dbOpponentName
  
  if (!cskaInRustat || !opponentInRustat) return false

  // Проверяем дату (допускаем разницу в 1 день)
  const dbDate = new Date(dbMatch.matchDate)
  const rustatDate = new Date(rustatMatch.datetime)
  
  const dayDiff = Math.abs(dbDate - rustatDate) / (1000 * 60 * 60 * 24)
  
  return dayDiff < 1
}

async function syncMatches() {
  console.log('\n🔄 Начинаем синхронизацию матчей с RuStat...\n')
  console.log('=' .repeat(80))
  console.log()

  try {
    // Получаем данные
    const { matches: rustatMatches, teams: rustatTeams, tournaments } = await getRustatMatches()
    const dbMatches = await getDbMatches()

    console.log()
    console.log('🔍 Сопоставление матчей...\n')

    let matched = 0
    let notMatched = 0
    let alreadySynced = 0

    for (const dbMatch of dbMatches) {
      // Пропускаем уже синхронизированные
      if (dbMatch.rustatId) {
        alreadySynced++
        continue
      }

      // Ищем соответствующий матч в RuStat
      const rustatMatch = rustatMatches.find(rm => 
        matchesAreSame(dbMatch, rm, rustatTeams)
      )

      if (rustatMatch) {
        // Обновляем rustatId
        await prisma.match.update({
          where: { id: dbMatch.id },
          data: { rustatId: rustatMatch.id },
        })

        const date = new Date(dbMatch.matchDate).toLocaleDateString('ru-RU')
        console.log(
          `✅ ${date}: ЦСКА vs ${dbMatch.opponentName} ` +
          `→ RuStat ID: ${rustatMatch.id}`
        )
        matched++
      } else {
        const date = new Date(dbMatch.matchDate).toLocaleDateString('ru-RU')
        console.log(
          `❌ ${date}: ЦСКА vs ${dbMatch.opponentName} ` +
          `→ не найден в RuStat`
        )
        notMatched++
      }
    }

    console.log()
    console.log('=' .repeat(80))
    console.log('\n📊 Результаты синхронизации:')
    console.log(`   ✅ Сопоставлено: ${matched}`)
    console.log(`   ⏭️  Уже синхронизировано: ${alreadySynced}`)
    console.log(`   ❌ Не найдено: ${notMatched}`)
    console.log(`   📝 Всего матчей в БД: ${dbMatches.length}`)
    
    if (matched > 0) {
      console.log('\n✅ Синхронизация завершена успешно!')
      console.log('💡 Теперь можно загружать детальные данные матчей из RuStat API')
    }

  } catch (error) {
    console.error('\n❌ Ошибка:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

syncMatches()

