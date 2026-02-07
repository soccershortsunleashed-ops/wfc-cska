#!/usr/bin/env node

/**
 * Анализ данных игроков для поиска информации о событиях
 */

// Токен из браузера (обновлен 28.01.2026 23:56)
const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ikg3eDZQWGJab3VLIiwidHlwIjoiSldUIn0.eyJhY2wiOm51bGwsImFjdGl2ZSI6dHJ1ZSwiYXVkIjpbInJ1c3RhdF9mb290YmFsbCJdLCJhdXRoX3R5cGUiOiJjb2RlIiwiY2xpZW50X2lkIjoicnVzdGF0X2Zvb3RiYWxsIiwiZW1haWwiOiJ2YWRpbS1maWZhQG1haWwucnUiLCJleHAiOjE3Njk2MzM4MTUsImlhdCI6MTc2OTYzMzUxNSwiaXNzIjoiaHR0cHM6Ly9hcGktYXV0aC5ydXN0YXRzcG9ydC5ydSIsInNjb3BlIjoib3BlbmlkIiwic2Vzc2lvbiI6IjViNjA5ZGEwMTM2N2VkMzA5Y2FlNjBkM2JlNDI4ODA5MTA1ZGMzZGM4ZGZmNDQ2MzJjMjNhNTcyOWU2NWMxYTkiLCJ0b3NfYWNjZXB0ZWQiOnRydWUsInR3b19mYWN0b3IiOmZhbHNlLCJ0eXAiOiJCZWFyZXIiLCJ1c2VyX2lkIjo2MDd9.Y2niMQspw5DPU-20K-HrmAc-7mHRGbI6_-J2NN93K3HX3zJfi3-y21wRT_pgPlFksFANGn7nz6jk5L6xl69ztA3BzQ4gxIk2w_j4RJQc9dtxMCUPuSTyMlPtU5wHTrMnr2To3Nlg-r-jmchwRXmYFyDCEmeeCXVV3mo-SoI9dpzqLbN7h7LwBfsqurd_HmH5V1D8NCWv58dBgUgcG4HBDUoXVY-hlxPfIrZB7kt1Z3GvG0biyAqLDXWx_PObtQsaD1m72QzyQciXaXZTmVlCWeU33LC44r3_aVoy3-6P45qYbfVYxsxzZVzJrPXj8Qu_41xTs2I3ndktOTQ9gOFnnQ'
const matchId = 688301 // Зенит 0:1 ЦСКА

async function analyzePlayers() {
  try {
    console.log('=== АНАЛИЗ ДАННЫХ ИГРОКОВ ===\n')

    const response = await fetch(
      `https://api-football.rustatsport.ru/matches/${matchId}/players`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    if (!response.ok) {
      console.error(`❌ Ошибка: ${response.status} ${response.statusText}`)
      return
    }

    const players = await response.json()

    console.log('✅ Данные получены!')
    console.log(`Тип данных: ${typeof players}`)
    console.log(`Количество игроков: ${Array.isArray(players) ? players.length : 'не массив'}`)

    if (Array.isArray(players) && players.length > 0) {
      console.log('\n📋 Структура первого игрока:')
      console.log(JSON.stringify(players[0], null, 2))

      console.log('\n🔍 Поля каждого игрока:')
      const fields = Object.keys(players[0])
      fields.forEach((field) => {
        console.log(`  - ${field}: ${typeof players[0][field]}`)
      })

      // Ищем поля, которые могут содержать события
      console.log('\n\n=== ПОИСК ПОЛЕЙ С СОБЫТИЯМИ ===')
      const eventFields = fields.filter((f) =>
        f.toLowerCase().includes('goal') ||
        f.toLowerCase().includes('card') ||
        f.toLowerCase().includes('sub') ||
        f.toLowerCase().includes('event') ||
        f.toLowerCase().includes('action') ||
        f.toLowerCase().includes('minute')
      )

      if (eventFields.length > 0) {
        console.log('✅ Найдены потенциальные поля с событиями:')
        eventFields.forEach((field) => {
          console.log(`  - ${field}:`, players[0][field])
        })
      } else {
        console.log('❌ Поля с событиями не найдены')
      }
    }

    console.log('\n\n💡 ВЫВОД:')
    console.log('Данные игроков НЕ содержат информацию о событиях (голы, замены, карточки)')
    console.log('Нужно искать другой endpoint!')
  } catch (error) {
    console.error('❌ Ошибка:', error.message)
  }
}

analyzePlayers()
