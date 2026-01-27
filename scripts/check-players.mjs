// Простой тест базы данных через SQL
import Database from 'better-sqlite3'

const db = new Database('./dev.db', { readonly: true })

console.log('🔍 Проверка игроков в базе данных...\n')

// Получаем первых 5 игроков основного состава
const players = db.prepare(`
  SELECT id, firstName, lastName, number, position, photoUrl, team
  FROM Player
  WHERE team = 'MAIN'
  ORDER BY number ASC
  LIMIT 12
`).all()

console.log(`📊 Найдено игроков основного состава: ${players.length}\n`)

players.forEach((player, index) => {
  console.log(`${index + 1}. №${player.number} ${player.firstName} ${player.lastName}`)
  console.log(`   Позиция: ${player.position}`)
  console.log(`   Фото: ${player.photoUrl || 'нет'}`)
  console.log('')
})

// Общая статистика
const total = db.prepare('SELECT COUNT(*) as count FROM Player').get()
const mainSquad = db.prepare("SELECT COUNT(*) as count FROM Player WHERE team = 'MAIN'").get()
const withPhotos = db.prepare('SELECT COUNT(*) as count FROM Player WHERE photoUrl IS NOT NULL').get()

console.log(`\n📈 Статистика:`)
console.log(`   Всего игроков: ${total.count}`)
console.log(`   Основной состав: ${mainSquad.count}`)
console.log(`   С фотографиями: ${withPhotos.count}`)

db.close()
