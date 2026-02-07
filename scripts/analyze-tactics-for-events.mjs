#!/usr/bin/env node

/**
 * Анализ данных tactics для извлечения событий (замены)
 */

import 'dotenv/config'

const token = process.env.RUSTAT_TOKEN
const matchId = 688301

async function analyzeTactics() {
  try {
    // Получаем tactics
    const tacticsResponse = await fetch(
      `https://api-football.rustatsport.ru/matches/${matchId}/tactics`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    const tactics = await tacticsResponse.json()

    // Получаем players
    const playersResponse = await fetch(
      `https://api-football.rustatsport.ru/matches/${matchId}/players`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    const playersData = await playersResponse.json()
    
    console.log('Players data type:', typeof playersData)
    console.log('Players data:', JSON.stringify(playersData).substring(0, 500))
    
    // Проверяем структуру данных
    const players = Array.isArray(playersData) ? playersData : playersData.players || []

    // Создаем мапу игроков
    const playersMap = new Map(players.map((p) => [p.id, p]))

    console.log('=== АНАЛИЗ ТАКТИКИ ДЛЯ ИЗВЛЕЧЕНИЯ СОБЫТИЙ ===\n')

    // Анализируем каждую команду
    for (const teamTactics of tactics.start) {
      const teamId = teamTactics.team_id
      const startPlayers = new Set(teamTactics.players.map((p) => p.id))

      // Находим конечную расстановку этой команды
      const endTactics = tactics.end.find((t) => t.team_id === teamId)
      const endPlayers = new Set(endTactics.players.map((p) => p.id))

      // Находим замены
      const playersOut = [...startPlayers].filter((id) => !endPlayers.has(id))
      const playersIn = [...endPlayers].filter((id) => !startPlayers.has(id))

      console.log(`\n📋 Команда ID: ${teamId}`)
      console.log(`Начальный состав: ${startPlayers.size} игроков`)
      console.log(`Конечный состав: ${endPlayers.size} игроков`)

      if (playersOut.length > 0 || playersIn.length > 0) {
        console.log('\n🔄 ЗАМЕНЫ:')

        // Пытаемся сопоставить замены
        for (let i = 0; i < Math.max(playersOut.length, playersIn.length); i++) {
          const outId = playersOut[i]
          const inId = playersIn[i]

          const outPlayer = playersMap.get(outId)
          const inPlayer = playersMap.get(inId)

          console.log(
            `  ${i + 1}. ${outPlayer ? outPlayer.name_rus + ' (' + outPlayer.num + ')' : 'N/A'} ➡️  ${inPlayer ? inPlayer.name_rus + ' (' + inPlayer.num + ')' : 'N/A'}`
          )
        }
      } else {
        console.log('✅ Замен не было')
      }
    }

    console.log('\n\n=== ВЫВОД ===')
    console.log(
      '✅ Данные о заменах можно извлечь из разницы между start и end в tactics'
    )
    console.log('❌ Точные минуты замен НЕ доступны в tactics')
    console.log('❌ Данные о голах и карточках НЕ доступны в tactics')
    console.log(
      '\n💡 Возможно, нужно использовать другой endpoint или данные из player stats'
    )
  } catch (error) {
    console.error('Ошибка:', error.message)
  }
}

analyzeTactics()
