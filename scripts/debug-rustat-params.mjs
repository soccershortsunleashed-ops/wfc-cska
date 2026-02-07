#!/usr/bin/env node

const TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6Ikg3eDZQWGJab3VLIiwidHlwIjoiSldUIn0.eyJhY2wiOm51bGwsImFjdGl2ZSI6dHJ1ZSwiYXVkIjpbInJ1c3RhdF9mb290YmFsbCJdLCJhdXRoX3R5cGUiOiJjb2RlIiwiY2xpZW50X2lkIjoicnVzdGF0X2Zvb3RiYWxsIiwiZW1haWwiOiJ2YWRpbS1maWZhQG1haWwucnUiLCJleHAiOjE3Njk3MTkwNjEsImlhdCI6MTc2OTcxODc2MSwiaXNzIjoiaHR0cHM6Ly9hcGktYXV0aC5ydXN0YXRzcG9ydC5ydSIsInNjb3BlIjoib3BlbmlkIiwic2Vzc2lvbiI6ImFkOGQ2M2FlOTdhZTMxNzc3MWZhZTUyYzZmZTk5ZDQxNGExNWJmYTAxOTgxY2Q5ZTU4NTNiNzY3OTE2ZjdjMTYiLCJ0b3NfYWNjZXB0ZWQiOnRydWUsInR3b19mYWN0b3IiOmZhbHNlLCJ0eXAiOiJCZWFyZXIiLCJ1c2VyX2lkIjo2MDd9.XjzPKMS9h5Hwe-ThZBne8yxuObFdcvkOg-FBQTpJJxk8_0Fi3oo7A0Gi6BYS_giVkJu6d-eV7ockqdMqpnKUgGexDggPp5JN5ZaCtnJWWBa5NtNdbrWP6XtHHscPIhRYbjuCETmFsj7XYOp5sAFuN_T3gvnMJwfV573N9bG7uwdESmGFONpVd_zRmNwizaroPSx3b2ge1Yz0gANbmkf5k8FM_u-1tSKgCb62i0cwOOdOABFsyBH4KqA0fZfPUgsF9aa1LozTNeS_MMa1jZCWfYamhnPdQM0Lw-4gN_HW7i6xPdwbiKonI33f5aytV5CoasTQceOGHcynBbhP2D1PTg"

const RUSTAT_API_URL = 'https://api-football.rustatsport.ru'
const SMIRNOVA_RUSTAT_ID = 1373001
const MATCH_ID = 687917 // Первый матч 2025 года

const ALL_PLAYER_PARAMS = [
  [1, 0], [288, 0], [196, 0], [393, 0], [641, 0], [643, 0], [336, 0], [488, 0],
  [434, 0], [225, 0], [262, 0], [202, 0], [203, 0], [291, 0], [731, 0], [766, 0],
  [342, 0], [399, 0], [401, 0], [460, 0], [462, 0], [726, 0], [728, 0], [719, 0],
]

async function debugMatch() {
  console.log('\n🔍 Отладка параметров RuStat API\n')
  console.log('='.repeat(80))
  console.log(`\nМатч ID: ${MATCH_ID}`)
  console.log(`Игрок: Смирнова (RuStat ID: ${SMIRNOVA_RUSTAT_ID})\n`)

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
        params: ALL_PLAYER_PARAMS,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    const smirnovaData = data.find(p => p.player_id === SMIRNOVA_RUSTAT_ID)

    if (!smirnovaData) {
      console.log('❌ Смирнова не найдена в этом матче')
      return
    }

    console.log('✅ Данные найдены!\n')
    console.log('Параметры (p = ID параметра, v = значение, o = порядок):\n')

    // Сортируем по ID параметра
    const sortedStats = smirnovaData.stats.sort((a, b) => a.p - b.p)

    for (const stat of sortedStats) {
      const paramName = getParamName(stat.p)
      console.log(`  [${stat.p}] ${paramName}: ${stat.v}`)
    }

    console.log('\n' + '='.repeat(80))
    console.log()

  } catch (error) {
    console.error('❌ Ошибка:', error.message)
  }
}

function getParamName(paramId) {
  const names = {
    1: 'Рейтинг (Index)',
    196: 'Голы',
    202: 'Желтые карточки',
    203: 'Красные карточки',
    225: 'Единоборства',
    262: 'Единоборства выигранные %',
    288: 'Минуты',
    291: 'Перехваты',
    336: 'Передачи',
    342: 'Выносы',
    393: 'Ассисты',
    399: 'Дриблинг попытки',
    401: 'Дриблинг успешный',
    434: 'Ключевые передачи',
    460: 'Фолы полученные',
    462: 'Фолы совершенные',
    488: 'Передачи точные %',
    641: 'Удары',
    643: 'Удары в створ',
    719: 'Позиция',
    726: 'Сейвы',
    728: 'Пропущенные голы',
    731: 'Отборы',
    766: 'Блоки',
  }
  return names[paramId] || `Неизвестный параметр ${paramId}`
}

debugMatch()
