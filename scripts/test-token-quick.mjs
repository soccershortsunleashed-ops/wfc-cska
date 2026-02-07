#!/usr/bin/env node

const TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6Ikg3eDZQWGJab3VLIiwidHlwIjoiSldUIn0.eyJhY2wiOm51bGwsImFjdGl2ZSI6dHJ1ZSwiYXVkIjpbInJ1c3RhdF9mb290YmFsbCJdLCJhdXRoX3R5cGUiOiJjb2RlIiwiY2xpZW50X2lkIjoicnVzdGF0X2Zvb3RiYWxsIiwiZW1haWwiOiJ2YWRpbS1maWZhQG1haWwucnUiLCJleHAiOjE3Njk3MTg0MDYsImlhdCI6MTc2OTcxODEwNiwiaXNzIjoiaHR0cHM6Ly9hcGktYXV0aC5ydXN0YXRzcG9ydC5ydSIsInNjb3BlIjoib3BlbmlkIiwic2Vzc2lvbiI6ImFkOGQ2M2FlOTdhZTMxNzc3MWZhZTUyYzZmZTk5ZDQxNGExNWJmYTAxOTgxY2Q5ZTU4NTNiNzY3OTE2ZjdjMTYiLCJ0b3NfYWNjZXB0ZWQiOnRydWUsInR3b19mYWN0b3IiOmZhbHNlLCJ0eXAiOiJCZWFyZXIiLCJ1c2VyX2lkIjo2MDd9.CcwGv1PhW7_fdoSfxfXswo75EqV_3i4troCBkbERbUZDnw3fZDAaMH0G2uYclBtdl0GAguh-5nafeNRrNDaoTolU8AyCHVTPySgxsduE1mZtLUyvcEYPDAwqzfvEb7iCppe8G4ySUKHIjdETI20ukxKq2C2dwHBKrPvaq5pRk301Vr2Wq-1OsAI84qfhww3vPDs4xJCtblNrUtejY-b_JhVEa37-FHHO6c4dUrHaN-3PO9Y2SfcZBPGVAExYK99SPeH680QR_mGErJa-KNHJ7t5aOR6DHZ7ZEJb9F1ex2Xfa-_YmJyik7_kvH-75PGiqqSry_G0AKjQ24KWtVmPa3w"

const RUSTAT_API_URL = 'https://api-football.rustatsport.ru'
const CSKA_TEAM_ID = 13503

async function testToken() {
  console.log('\n🔍 Тестирование токена RuStat...\n')
  
  try {
    const response = await fetch(
      `${RUSTAT_API_URL}/teams/${CSKA_TEAM_ID}/matches?limit=1&offset=0`,
      {
        headers: { 'Authorization': `Bearer ${TOKEN}` },
      }
    )

    console.log(`Статус: ${response.status} ${response.statusText}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Токен работает!')
      console.log(`Найдено матчей: ${data.matches?.length || 0}`)
    } else {
      console.log('❌ Токен не работает')
      const text = await response.text()
      console.log('Ответ:', text.substring(0, 200))
    }
  } catch (error) {
    console.error('❌ Ошибка:', error.message)
  }
}

testToken()
