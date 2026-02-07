#!/usr/bin/env node

import 'dotenv/config'

const RUSTAT_API_URL = 'https://api-football.rustatsport.ru'
const RUSTAT_TOKEN = process.env.RUSTAT_TOKEN
const CSKA_TEAM_ID = 13503

const response = await fetch(
  `${RUSTAT_API_URL}/teams/${CSKA_TEAM_ID}/matches?limit=5&offset=0`,
  {
    headers: { 'Authorization': `Bearer ${RUSTAT_TOKEN}` },
  }
)

const data = await response.json()

if (!data.matches || data.matches.length === 0) {
  console.log('❌ Нет матчей')
  console.log('Response:', JSON.stringify(data, null, 2))
  process.exit(1)
}

console.log('\n📋 Структура первого матча:')
console.log(JSON.stringify(data.matches[0], null, 2))
