// Проверка логотипов последнего матча
import Database from 'better-sqlite3'

const db = new Database('./dev.db', { readonly: true })

console.log('🔍 Проверка логотипов последнего матча...\n')

// Последний матч
const last = db.prepare(`
  SELECT 
    slug, 
    opponentName, 
    matchDate, 
    opponentLogoUrl, 
    cskaLogoUrl, 
    scoreHome, 
    scoreAway, 
    status,
    isHome
  FROM Match
  WHERE status = 'FINISHED'
  ORDER BY matchDate DESC
  LIMIT 1
`).get()

if (last) {
  console.log('🏆 Последний матч:')
  console.log(`   Соперник: ${last.opponentName}`)
  console.log(`   Дата: ${new Date(last.matchDate).toLocaleString('ru-RU')}`)
  console.log(`   Счёт: ${last.scoreHome}:${last.scoreAway}`)
  console.log(`   Дома: ${last.isHome ? 'Да' : 'Нет'}`)
  console.log(`   Статус: ${last.status}`)
  console.log(`\n   📸 Логотипы:`)
  console.log(`   ЦСКА: ${last.cskaLogoUrl || '❌ НЕТ'}`)
  console.log(`   ${last.opponentName}: ${last.opponentLogoUrl || '❌ НЕТ'}`)
  
  // Проверяем существование файлов
  if (last.cskaLogoUrl) {
    const fs = await import('fs')
    const path = await import('path')
    const cskaPath = path.join('./public', last.cskaLogoUrl)
    const cskaExists = fs.existsSync(cskaPath)
    console.log(`\n   ✓ Файл ЦСКА существует: ${cskaExists ? '✅ Да' : '❌ Нет'}`)
    if (cskaExists) {
      console.log(`     Путь: ${cskaPath}`)
    }
  }
  
  if (last.opponentLogoUrl) {
    const fs = await import('fs')
    const path = await import('path')
    const oppPath = path.join('./public', last.opponentLogoUrl)
    const oppExists = fs.existsSync(oppPath)
    console.log(`   ✓ Файл соперника существует: ${oppExists ? '✅ Да' : '❌ Нет'}`)
    if (oppExists) {
      console.log(`     Путь: ${oppPath}`)
    }
  }
} else {
  console.log('   Не найден')
}

db.close()
