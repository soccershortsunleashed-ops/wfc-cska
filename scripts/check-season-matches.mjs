#!/usr/bin/env node

import 'dotenv/config'

const RUSTAT_API_URL = 'https://api-football.rustatsport.ru'
const RUSTAT_TOKEN = process.env.RUSTAT_TOKEN
const CSKA_TEAM_ID = 13503

const response = await fetch(
  `${RUSTAT_API_URL}/teams/${CSKA_TEAM_ID}/matches?limit=100&offset=0`,
  {
    headers: { 'Authorization': `Bearer ${RUSTAT_TOKEN}` },
  }
)

const data = await response.json()

// Фильтруем по году 2025
const matches2025 = data.matches.filter(match => {
  const year = new Date(match.datetime).getFullYear()
  return year === 2025 && match.status_id === 5
})

console.log(`\n📅 Матчи 2025 года (завершенные): ${matches2025.length}`)

// Группируем по месяцам
const byMonth = {}
for (const match of matches2025) {
  const date = new Date(match.datetime)
  const month = date.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })
  if (!byMonth[month]) byMonth[month] = []
  byMonth[month].push(match)
}

console.log('\n📊 По месяцам:')
for (const [month, matches] of Object.entries(byMonth).sort()) {
  console.log(`   ${month}: ${matches.length} матчей`)
}

// Проверяем все матчи сезона (включая 2024 и 2026)
const allFinished = data.matches.filter(m => m.status_id === 5)
console.log(`\n📊 Всего завершенных матчей: ${allFinished.length}`)

// Показываем первые и последние 3 матча
console.log('\n🔍 Первые 3 матча:')
allFinished.slice(0, 3).forEach(m => {
  const date = new Date(m.datetime).toLocaleDateString('ru-RU')
  console.log(`   ${date} - ${m.team1_name} vs ${m.team2_name}`)
})

console.log('\n🔍 Последние 3 матча:')
allFinished.slice(-3).forEach(m => {
  const date = new Date(m.datetime).toLocaleDateString('ru-RU')
  console.log(`   ${date} - ${m.team1_name} vs ${m.team2_name}`)
})
