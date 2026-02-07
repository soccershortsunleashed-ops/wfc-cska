#!/usr/bin/env node

/**
 * Тестирование endpoint /teams/matches/{id}/stats для получения данных LineUp
 */

// Токен из браузера (обновлен 28.01.2026 23:56)
const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ikg3eDZQWGJab3VLIiwidHlwIjoiSldUIn0.eyJhY2wiOm51bGwsImFjdGl2ZSI6dHJ1ZSwiYXVkIjpbInJ1c3RhdF9mb290YmFsbCJdLCJhdXRoX3R5cGUiOiJjb2RlIiwiY2xpZW50X2lkIjoicnVzdGF0X2Zvb3RiYWxsIiwiZW1haWwiOiJ2YWRpbS1maWZhQG1haWwucnUiLCJleHAiOjE3Njk2MzM4MTUsImlhdCI6MTc2OTYzMzUxNSwiaXNzIjoiaHR0cHM6Ly9hcGktYXV0aC5ydXN0YXRzcG9ydC5ydSIsInNjb3BlIjoib3BlbmlkIiwic2Vzc2lvbiI6IjViNjA5ZGEwMTM2N2VkMzA5Y2FlNjBkM2JlNDI4ODA5MTA1ZGMzZGM4ZGZmNDQ2MzJjMjNhNTcyOWU2NWMxYTkiLCJ0b3NfYWNjZXB0ZWQiOnRydWUsInR3b19mYWN0b3IiOmZhbHNlLCJ0eXAiOiJCZWFyZXIiLCJ1c2VyX2lkIjo2MDd9.Y2niMQspw5DPU-20K-HrmAc-7mHRGbI6_-J2NN93K3HX3zJfi3-y21wRT_pgPlFksFANGn7nz6jk5L6xl69ztA3BzQ4gxIk2w_j4RJQc9dtxMCUPuSTyMlPtU5wHTrMnr2To3Nlg-r-jmchwRXmYFyDCEmeeCXVV3mo-SoI9dpzqLbN7h7LwBfsqurd_HmH5V1D8NCWv58dBgUgcG4HBDUoXVY-hlxPfIrZB7kt1Z3GvG0biyAqLDXWx_PObtQsaD1m72QzyQciXaXZTmVlCWeU33LC44r3_aVoy3-6P45qYbfVYxsxzZVzJrPXj8Qu_41xTs2I3ndktOTQ9gOFnnQ'
const matchId = 688301 // Зенит 0:1 ЦСКА

async function testLineUpEndpoint() {
  try {
    console.log('=== ТЕСТИРОВАНИЕ ENDPOINT /teams/matches/{id}/stats ===\n')

    const response = await fetch(
      `https://api-football.rustatsport.ru/teams/matches/${matchId}/stats`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    if (!response.ok) {
      console.error(`❌ Ошибка: ${response.status} ${response.statusText}`)
      return
    }

    const data = await response.json()

    console.log('✅ Данные получены!')
    console.log('\n📊 Структура данных:')
    console.log(JSON.stringify(data, null, 2))

    console.log('\n\n=== АНАЛИЗ ===')
    console.log(`Найдено полей: ${Object.keys(data).length}`)
    Object.keys(data).forEach((key) => {
      console.log(`  - ${key}: ${Array.isArray(data[key]) ? `массив (${data[key].length} элементов)` : typeof data[key]}`)
    })

    // Проверяем наличие данных о событиях
    console.log('\n\n=== ПОИСК СОБЫТИЙ ===')
    const possibleEventFields = ['events', 'lineup', 'substitutions', 'goals', 'cards', 'actions']
    
    possibleEventFields.forEach((field) => {
      if (data[field]) {
        console.log(`✅ Найдено поле: ${field}`)
        console.log(`   Данные:`, JSON.stringify(data[field]).substring(0, 200))
      } else {
        console.log(`❌ Поле не найдено: ${field}`)
      }
    })
  } catch (error) {
    console.error('❌ Ошибка:', error.message)
  }
}

testLineUpEndpoint()
