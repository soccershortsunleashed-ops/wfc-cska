#!/usr/bin/env node

import 'dotenv/config'

const token = process.env.RUSTAT_TOKEN
const matchId = 688301

console.log('📊 Получение статистики игроков...\n')

try {
  // Получаем статистику
  const params = [
    [1, 0], [288, 0], [196, 0], [393, 0], [641, 0], [643, 0],
    [336, 0], [488, 0], [434, 0], [225, 0], [262, 0],
    [202, 0], [203, 0], [291, 0], [731, 0], [766, 0], [342, 0],
    [399, 0], [401, 0], [460, 0], [462, 0], [726, 0], [728, 0], [719, 0],
  ]

  const response = await fetch(
    'https://api-football.rustatsport.ru/matches/players/stats',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gk: false,
        match_id: matchId,
        params,
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const data = await response.json()
  
  console.log(`✅ Получена статистика для ${data.length} игроков\n`)
  
  // Анализируем первого игрока
  if (data.length > 0) {
    const player = data[0]
    console.log(`Игрок ID: ${player.player_id}`)
    console.log(`Параметров: ${player.stats.length}\n`)
    
    console.log('Все параметры (lexic ID):')
    const params = player.stats.map(s => s.p).sort((a, b) => a - b)
    console.log(params.join(', '))
    console.log()
    
    console.log('Детальная статистика:')
    player.stats.forEach(stat => {
      console.log(`  [${stat.p}] = ${stat.v}`)
    })
  }

} catch (error) {
  console.error('❌ Ошибка:', error.message)
}
