// Проверка ближайшего матча
import Database from 'better-sqlite3'

const db = new Database('./dev.db', { readonly: true })

console.log('🔍 Проверка ближайшего и последнего матча...\n')

const now = new Date().toISOString()

// Ближайший матч
const upcoming = db.prepare(`
  SELECT slug, opponentName, matchDate, opponentLogoUrl, cskaLogoUrl, scoreHome, scoreAway, status
  FROM Match
  WHERE matchDate >= ?
  AND status IN ('SCHEDULED', 'LIVE')
  ORDER BY matchDate ASC
  LIMIT 1
`).get(now)

console.log('📅 Ближайший матч:')
if (upcoming) {
  console.log(`   ${upcoming.opponentName}`)
  console.log(`   Дата: ${new Date(upcoming.matchDate).toLocaleString('ru-RU')}`)
  console.log(`   Статус: ${upcoming.status}`)
  console.log(`   Лого ЦСКА: ${upcoming.cskaLogoUrl || 'НЕТ'}`)
  console.log(`   Лого соперника: ${upcoming.opponentLogoUrl || 'НЕТ'}`)
} else {
  console.log('   Не найден')
}

console.log('')

// Последний матч
const last = db.prepare(`
  SELECT slug, opponentName, matchDate, opponentLogoUrl, cskaLogoUrl, scoreHome, scoreAway, status
  FROM Match
  WHERE status = 'FINISHED'
  ORDER BY matchDate DESC
  LIMIT 1
`).get()

console.log('🏆 Последний матч:')
if (last) {
  console.log(`   ${last.opponentName}`)
  console.log(`   Дата: ${new Date(last.matchDate).toLocaleString('ru-RU')}`)
  console.log(`   Счёт: ${last.scoreHome}:${last.scoreAway}`)
  console.log(`   Лого ЦСКА: ${last.cskaLogoUrl || 'НЕТ'}`)
  console.log(`   Лого соперника: ${last.opponentLogoUrl || 'НЕТ'}`)
} else {
  console.log('   Не найден')
}

db.close()
