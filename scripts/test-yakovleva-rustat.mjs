import dotenv from 'dotenv'

dotenv.config()

async function main() {
  console.log('\n🔍 Проверка Дарьи Яковлевой в RuStat API\n')
  
  const RUSTAT_TOKEN = process.env.RUSTAT_TOKEN
  
  if (!RUSTAT_TOKEN) {
    console.log('❌ RUSTAT_TOKEN не найден в .env')
    return
  }
  
  const PLAYER_ID = 649721
  
  // Попробуем получить статистику игрока
  const url = `https://football.rustatsport.ru/api/players/${PLAYER_ID}/stats`
  
  console.log(`📡 Запрос: ${url}`)
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${RUSTAT_TOKEN}`,
      'Content-Type': 'application/json'
    }
  })
  
  console.log(`Статус: ${response.status}`)
  
  if (response.ok) {
    const data = await response.json()
    console.log(`\n✅ Данные получены:`)
    console.log(JSON.stringify(data, null, 2))
  } else {
    const text = await response.text()
    console.log(`\n❌ Ошибка:`)
    console.log(text)
  }
}

main().catch(console.error)
