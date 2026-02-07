#!/usr/bin/env node

import 'dotenv/config'

const token = process.env.RUSTAT_TOKEN
const CSKA_TEAM_ID = 13503

async function checkMatches() {
  console.log('📅 Проверка доступных матчей...\n')
  
  const response = await fetch(
    `https://api-football.rustatsport.ru/teams/${CSKA_TEAM_ID}/matches?limit=10&offset=0`,
    {
      headers: { 'Authorization': `Bearer ${token}` },
    }
  )

  const data = await response.json()
  
  console.log(`Найдено матчей: ${data.matches.length}\n`)
  
  for (const match of data.matches.slice(0, 5)) {
    const date = new Date(match.datetime).toLocaleDateString('ru-RU')
    const team1 = data.teams.find(t => t.id === match.team1.id)
    const team2 = data.teams.find(t => t.id === match.team2.id)
    const status = match.status_id === 5 ? '✅ Завершен' : '⏳ Не завершен'
    
    console.log(`ID: ${match.id}`)
    console.log(`   ${date}: ${team1?.name_rus} vs ${team2?.name_rus}`)
    console.log(`   Статус: ${status}`)
    console.log(`   Счет: ${match.team1.score}:${match.team2.score}`)
    console.log()
  }
}

checkMatches()
