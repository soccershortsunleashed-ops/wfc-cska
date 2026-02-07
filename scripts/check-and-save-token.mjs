#!/usr/bin/env node

import fs from 'fs'

const token = process.argv[2]

if (!token) {
  console.error('❌ Токен не передан')
  console.error('Использование: node check-and-save-token.mjs <token>')
  process.exit(1)
}

// Проверяем токен
try {
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
  const expiresAt = new Date(payload.exp * 1000)
  const now = new Date()
  const minutesLeft = Math.floor((expiresAt - now) / 1000 / 60)
  
  console.log('✅ Токен валидный!')
  console.log(`   Email: ${payload.email}`)
  console.log(`   Действителен до: ${expiresAt.toLocaleString('ru-RU')}`)
  console.log(`   Осталось времени: ${minutesLeft} минут\n`)
  
  if (minutesLeft < 0) {
    console.error('❌ Токен уже истек!')
    process.exit(1)
  }
  
  // Обновляем .env
  const envPath = '.env'
  let envContent = fs.readFileSync(envPath, 'utf-8')
  
  const timestamp = now.toLocaleString('ru-RU', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  // Обновляем токен
  const tokenRegex = /RUSTAT_TOKEN="[^"]*"/
  if (tokenRegex.test(envContent)) {
    envContent = envContent.replace(tokenRegex, `RUSTAT_TOKEN="${token}"`)
  } else {
    envContent += `\nRUSTAT_TOKEN="${token}"\n`
  }
  
  // Обновляем комментарий с датой
  if (envContent.includes('# Обновлен:')) {
    envContent = envContent.replace(/# Обновлен: .*/, `# Обновлен: ${timestamp} (истекает ${expiresAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })})`)
  } else {
    envContent = envContent.replace(
      /RUSTAT_TOKEN=/,
      `# Обновлен: ${timestamp} (истекает ${expiresAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })})\nRUSTAT_TOKEN=`
    )
  }
  
  fs.writeFileSync(envPath, envContent)
  
  console.log('💾 Токен сохранен в .env файл\n')
  
} catch (error) {
  console.error('❌ Ошибка проверки токена:', error.message)
  process.exit(1)
}
