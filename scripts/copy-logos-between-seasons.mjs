#!/usr/bin/env node

/**
 * Скрипт для копирования логотипов команд между сезонами
 * 
 * Использование:
 *   node scripts/copy-logos-between-seasons.mjs --from 2025 --to 2026
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Парсинг аргументов командной строки
const args = process.argv.slice(2)
const fromIndex = args.indexOf('--from')
const toIndex = args.indexOf('--to')

if (fromIndex === -1 || toIndex === -1) {
  console.error('❌ Использование: node copy-logos-between-seasons.mjs --from 2025 --to 2026')
  process.exit(1)
}

const fromSeason = args[fromIndex + 1]
const toSeason = args[toIndex + 1]

if (!fromSeason || !toSeason) {
  console.error('❌ Укажите оба сезона: --from и --to')
  process.exit(1)
}

const publicDir = path.join(__dirname, '..', 'public', 'teams')
const fromDir = path.join(publicDir, fromSeason)
const toDir = path.join(publicDir, toSeason)

console.log(`📋 Копирование логотипов из сезона ${fromSeason} в ${toSeason}`)
console.log(`   Из: ${fromDir}`)
console.log(`   В:  ${toDir}`)

// Проверка существования исходной папки
if (!fs.existsSync(fromDir)) {
  console.error(`❌ Папка сезона ${fromSeason} не найдена: ${fromDir}`)
  process.exit(1)
}

// Создание целевой папки если не существует
if (!fs.existsSync(toDir)) {
  fs.mkdirSync(toDir, { recursive: true })
  console.log(`✅ Создана папка: ${toDir}`)
}

// Копирование для каждого турнира
const competitions = ['Суперлига', 'Товарищеские']
let totalCopied = 0

for (const competition of competitions) {
  const fromCompDir = path.join(fromDir, competition)
  const toCompDir = path.join(toDir, competition)

  if (!fs.existsSync(fromCompDir)) {
    console.log(`⚠️  Пропущено: ${competition} (папка не найдена)`)
    continue
  }

  // Создание папки турнира
  if (!fs.existsSync(toCompDir)) {
    fs.mkdirSync(toCompDir, { recursive: true })
  }

  // Копирование файлов
  const files = fs.readdirSync(fromCompDir)
  const logoFiles = files.filter(f => f.endsWith('.png') || f.endsWith('.svg'))

  for (const file of logoFiles) {
    const fromFile = path.join(fromCompDir, file)
    const toFile = path.join(toCompDir, file)

    fs.copyFileSync(fromFile, toFile)
    totalCopied++
  }

  console.log(`✅ ${competition}: скопировано ${logoFiles.length} логотипов`)
}

console.log(`\n🎉 Готово! Всего скопировано: ${totalCopied} файлов`)
