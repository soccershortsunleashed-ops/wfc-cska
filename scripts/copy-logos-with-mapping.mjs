import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

console.log('🚀 Копирование логотипов с использованием маппинга...\n')

// Читаем маппинг
const mappingPath = path.join(projectRoot, 'seed', 'matches-assets.json')
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'))

console.log(`📊 Найдено записей в маппинге: ${mapping.length}\n`)

let copied = 0
let errors = 0

for (const asset of mapping) {
  const { url, slug, type } = asset
  
  // Целевой путь
  const targetPath = path.join(projectRoot, 'public', url)
  const targetDir = path.dirname(targetPath)
  
  // Создаём директорию если не существует
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }
  
  // Проверяем, существует ли уже файл
  if (fs.existsSync(targetPath)) {
    console.log(`✓ ${url} (уже существует)`)
    copied++
    continue
  }
  
  // Исходный файл в seed-assets
  const sourceFileName = `${type}-${slug}${path.extname(url)}`
  const sourcePath = path.join(projectRoot, 'public', 'seed-assets', sourceFileName)
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath)
    console.log(`✅ ${url}`)
    copied++
  } else {
    console.log(`❌ ${url} (источник не найден: ${sourceFileName})`)
    errors++
  }
}

console.log(`\n📊 Статистика:`)
console.log(`   Скопировано: ${copied}`)
console.log(`   Ошибок: ${errors}`)

console.log('\n✅ Готово!')
