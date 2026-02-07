#!/usr/bin/env node

const TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6Ikg3eDZQWGJab3VLIiwidHlwIjoiSldUIn0.eyJhY2wiOm51bGwsImFjdGl2ZSI6dHJ1ZSwiYXVkIjpbInJ1c3RhdF9mb290YmFsbCJdLCJhdXRoX3R5cGUiOiJjb2RlIiwiY2xpZW50X2lkIjoicnVzdGF0X2Zvb3RiYWxsIiwiZW1haWwiOiJ2YWRpbS1maWZhQG1haWwucnUiLCJleHAiOjE3Njk3MTkwNjEsImlhdCI6MTc2OTcxODc2MSwiaXNzIjoiaHR0cHM6Ly9hcGktYXV0aC5ydXN0YXRzcG9ydC5ydSIsInNjb3BlIjoib3BlbmlkIiwic2Vzc2lvbiI6ImFkOGQ2M2FlOTdhZTMxNzc3MWZhZTUyYzZmZTk5ZDQxNGExNWJmYTAxOTgxY2Q5ZTU4NTNiNzY3OTE2ZjdjMTYiLCJ0b3NfYWNjZXB0ZWQiOnRydWUsInR3b19mYWN0b3IiOmZhbHNlLCJ0eXAiOiJCZWFyZXIiLCJ1c2VyX2lkIjo2MDd9.XjzPKMS9h5Hwe-ThZBne8yxuObFdcvkOg-FBQTpJJxk8_0Fi3oo7A0Gi6BYS_giVkJu6d-eV7ockqdMqpnKUgGexDggPp5JN5ZaCtnJWWBa5NtNdbrWP6XtHHscPIhRYbjuCETmFsj7XYOp5sAFuN_T3gvnMJwfV573N9bG7uwdESmGFONpVd_zRmNwizaroPSx3b2ge1Yz0gANbmkf5k8FM_u-1tSKgCb62i0cwOOdOABFsyBH4KqA0fZfPUgsF9aa1LozTNeS_MMa1jZCWfYamhnPdQM0Lw-4gN_HW7i6xPdwbiKonI33f5aytV5CoasTQceOGHcynBbhP2D1PTg"

const RUSTAT_API_URL = 'https://api-football.rustatsport.ru'
const MATCH_ID = 687917

// Запросим БЕЗ параметров - API вернет все доступные
async function findAllParams() {
  console.log('\n🔍 Поиск всех доступных параметров RuStat API\n')
  console.log('='.repeat(80))

  try {
    const response = await fetch(`${RUSTAT_API_URL}/matches/players/stats`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gk: false,
        match_id: MATCH_ID,
        params: [] // Пустой массив - вернет все параметры
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    
    if (data.length === 0) {
      console.log('❌ Нет данных')
      return
    }

    // Берем первого игрока
    const firstPlayer = data[0]
    console.log(`\nИгрок ID: ${firstPlayer.player_id}`)
    console.log(`Всего параметров: ${firstPlayer.stats.length}\n`)

    // Сортируем по ID
    const sortedStats = firstPlayer.stats.sort((a, b) => a.p - b.p)

    console.log('Все параметры:\n')
    for (const stat of sortedStats) {
      console.log(`  [${stat.p}] = ${stat.v}`)
    }

    console.log('\n' + '='.repeat(80))
    console.log()

  } catch (error) {
    console.error('❌ Ошибка:', error.message)
  }
}

findAllParams()
