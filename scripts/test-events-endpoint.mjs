#!/usr/bin/env node

/**
 * Тестирование различных endpoints для получения событий матча
 */

import 'dotenv/config'

const token = process.env.RUSTAT_TOKEN
const matchId = 688301

async function testEndpoints() {
  const endpoints = [
    `/matches/${matchId}/events`,
    `/matches/${matchId}/lineup`,
    `/matches/${matchId}/line-up`,
    `/matches/${matchId}/timeline`,
    `/matches/${matchId}/actions`,
    `/matches/${matchId}/substitutions`,
    `/matches/${matchId}/goals`,
    `/matches/${matchId}/cards`,
  ]

  console.log('Testing RuStat API endpoints for match events...\n')

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`https://api-football.rustatsport.ru${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      console.log(`${endpoint} -> ${response.status}`)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ SUCCESS!')
        console.log('Data preview:', JSON.stringify(data).substring(0, 300))
        console.log('\n')
      } else if (response.status === 404) {
        console.log('❌ Not found\n')
      } else {
        console.log(`⚠️ Error: ${response.statusText}\n`)
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}\n`)
    }
  }
}

testEndpoints()
