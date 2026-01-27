import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const db = new Database(path.join(projectRoot, 'dev.db'))

console.log('🔧 Исправление путей к логотипам...\n')

// Получаем все уникальные пути к логотипам
const logos = db.prepare(`
  SELECT DISTINCT opponentLogoUrl, cskaLogoUrl
  FROM Match
  WHERE opponentLogoUrl IS NOT NULL OR cskaLogoUrl IS NOT NULL
`).all()

const uniqueLogos = new Set()
logos.forEach(row => {
  if (row.opponentLogoUrl) uniqueLogos.add(row.opponentLogoUrl)
  if (row.cskaLogoUrl) uniqueLogos.add(row.cskaLogoUrl)
})

console.log(`📊 Найдено уникальных путей: ${uniqueLogos.size}\n`)

let copied = 0
let errors = 0

// Для каждого пути создаём структуру папок и копируем файл
for (const logoPath of uniqueLogos) {
  const fullPath = path.join(projectRoot, 'public', logoPath)
  const dir = path.dirname(fullPath)
  
  // Создаём директорию если не существует
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  
  // Проверяем, существует ли уже файл
  if (fs.existsSync(fullPath)) {
    console.log(`✓ ${logoPath} (уже существует)`)
    copied++
    continue
  }
  
  // Ищем файл в seed-assets
  const fileName = path.basename(logoPath)
  const seedPath = path.join(projectRoot, 'public', 'seed-assets')
  
  // Ищем файл по разным вариантам имени
  const possibleNames = [
    fileName,
    `opponentLogo-${fileName}`,
    `cskaLogo-${fileName}`,
  ]
  
  let found = false
  for (const name of possibleNames) {
    const sourcePath = path.join(seedPath, name)
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, fullPath)
      console.log(`✅ ${logoPath}`)
      copied++
      found = true
      break
    }
  }
  
  if (!found) {
    console.log(`❌ ${logoPath} (не найден в seed-assets)`)
    errors++
  }
}

console.log(`\n📊 Статистика:`)
console.log(`   Скопировано: ${copied}`)
console.log(`   Ошибок: ${errors}`)

db.close()

console.log('\n✅ Готово!')
