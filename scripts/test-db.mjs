// Простой тест базы данных через SQL
import Database from 'better-sqlite3'

const db = new Database('./dev.db', { readonly: true })

console.log('🔍 Проверка матчей в базе данных...\n')

// Получаем первые 5 матчей
const matches = db.prepare(`
  SELECT slug, opponentName, matchDate, opponentLogoUrl, cskaLogoUrl, scoreHome, scoreAway
  FROM Match
  ORDER BY matchDate DESC
  LIMIT 5
`).all()

console.log(`📊 Найдено матчей: ${matches.length}\n`)

matches.forEach((match, index) => {
  console.log(`${index + 1}. ${match.opponentName}`)
  console.log(`   Slug: ${match.slug}`)
  console.log(`   Дата: ${new Date(match.matchDate).toLocaleDateString('ru-RU')}`)
  console.log(`   Счёт: ${match.scoreHome ?? '-'} : ${match.scoreAway ?? '-'}`)
  console.log(`   Лого ЦСКА: ${match.cskaLogoUrl || 'нет'}`)
  console.log(`   Лого соперника: ${match.opponentLogoUrl || 'нет'}`)
  console.log('')
})

// Общая статистика
const total = db.prepare('SELECT COUNT(*) as count FROM Match').get()
console.log(`\n📈 Всего матчей в базе: ${total.count}`)

// Проверяем сколько матчей с логотипами
const withLogos = db.prepare('SELECT COUNT(*) as count FROM Match WHERE opponentLogoUrl IS NOT NULL').get()
console.log(`🖼️  Матчей с логотипами соперников: ${withLogos.count}`)

db.close()
