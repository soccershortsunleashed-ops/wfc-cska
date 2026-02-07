#!/usr/bin/env node

/**
 * Прямое получение токена через API
 * Пробуем разные endpoints
 */

import 'dotenv/config'

const email = process.env.RUSTAT_EMAIL
const password = process.env.RUSTAT_PASSWORD

async function tryMethod1() {
  console.log('Метод 1: /api/auth/login')
  try {
    const response = await fetch('https://api-auth.rustatsport.ru/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    console.log('Status:', response.status)
    const data = await response.text()
    console.log('Response:', data.substring(0, 200))
    return response.ok ? data : null
  } catch (e) {
    console.log('Error:', e.message)
    return null
  }
}

async function tryMethod2() {
  console.log('\nМетод 2: /auth/login')
  try {
    const response = await fetch('https://api-auth.rustatsport.ru/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    console.log('Status:', response.status)
    const data = await response.text()
    console.log('Response:', data.substring(0, 200))
    return response.ok ? data : null
  } catch (e) {
    console.log('Error:', e.message)
    return null
  }
}

async function tryMethod3() {
  console.log('\nМетод 3: /oauth/token (client_credentials)')
  try {
    const response = await fetch('https://api-auth.rustatsport.ru/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: 'rustat_football',
        client_secret: password,
      }),
    })
    console.log('Status:', response.status)
    const data = await response.text()
    console.log('Response:', data.substring(0, 200))
    return response.ok ? data : null
  } catch (e) {
    console.log('Error:', e.message)
    return null
  }
}

async function tryMethod4() {
  console.log('\nМетод 4: /connect/token')
  try {
    const response = await fetch('https://api-auth.rustatsport.ru/connect/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: 'rustat_football',
        username: email,
        password: password,
        scope: 'openid',
      }),
    })
    console.log('Status:', response.status)
    const data = await response.text()
    console.log('Response:', data.substring(0, 200))
    return response.ok ? data : null
  } catch (e) {
    console.log('Error:', e.message)
    return null
  }
}

async function main() {
  console.log('🔐 Пробуем разные методы получения токена...\n')
  
  await tryMethod1()
  await tryMethod2()
  await tryMethod3()
  await tryMethod4()
  
  console.log('\n❌ Ни один метод не сработал')
  console.log('💡 Нужно получить токен через браузер')
}

main()
