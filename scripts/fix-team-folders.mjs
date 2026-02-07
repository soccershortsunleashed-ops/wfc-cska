#!/usr/bin/env node

/**
 * Исправляет структуру папок для логотипов команд
 * Создает папки для всех сезонов и переименовывает "superliga" → "Суперлига"
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.join(__dirname, '..', 'public', 'teams')

const SEASONS = ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026']

console.log('\n🔄 Исправление структуры папок для логотипов\n')
console.log('=' .repeat(80))
console.log()

// 1. Создаем папки для всех сезонов
console.log('📁 Создание папок для сезонов...\n')

for (const season of SEASONS) {
  const seasonDir = path.join(publicDir, season)
  const superligaDir = path.join(seasonDir, 'Суперлига')
  const friendlyDir = path.join(seasonDir, 'Товарищеские')
  
  // Создаем папку сезона
  if (!fs.existsSync(seasonDir)) {
    fs.mkdirSync(seasonDir, { recursive: true })
    console.log(`   ✅ Создана папка: ${season}/`)
  }
  
  // Создаем папку Суперлига
  if (!fs.existsSync(superligaDir)) {
    fs.mkdirSync(superligaDir, { recursive: true })
    console.log(`   ✅ Создана папка: ${season}/Суперлига/`)
  }
  
  // Создаем папку Товарищеские
  if (!fs.existsSync(friendlyDir)) {
    fs.mkdirSync(friendlyDir, { recursive: true })
    console.log(`   ✅ Создана папка: ${season}/Товарищеские/`)
  }
}

// 2. Переносим файлы из старых папок
console.log('\n📦 Перенос логотипов из старых папок...\n')

for (const season of SEASONS) {
  const oldSuperligaDir = path.join(publicDir, season, 'superliga')
  const newSuperligaDir = path.join(publicDir, season, 'Суперлига')
  
  if (fs.existsSync(oldSuperligaDir)) {
    const files = fs.readdirSync(oldSuperligaDir)
    
    for (const file of files) {
      const oldPath = path.join(oldSuperligaDir, file)
      const newPath = path.join(newSuperligaDir, file)
      
      if (fs.statSync(oldPath).isFile()) {
        fs.copyFileSync(oldPath, newPath)
        console.log(`   ✅ Скопирован: ${season}/superliga/${file} → ${season}/Суперлига/${file}`)
      }
    }
    
    // Удаляем старую папку
    fs.rmSync(oldSuperligaDir, { recursive: true, force: true })
    console.log(`   🗑️  Удалена старая папка: ${season}/superliga/`)
  }
  
  const oldFriendlyDir = path.join(publicDir, season, 'friendly')
  const newFriendlyDir = path.join(publicDir, season, 'Товарищеские')
  
  if (fs.existsSync(oldFriendlyDir)) {
    const files = fs.readdirSync(oldFriendlyDir)
    
    for (const file of files) {
      const oldPath = path.join(oldFriendlyDir, file)
      const newPath = path.join(newFriendlyDir, file)
      
      if (fs.statSync(oldPath).isFile()) {
        fs.copyFileSync(oldPath, newPath)
        console.log(`   ✅ Скопирован: ${season}/friendly/${file} → ${season}/Товарищеские/${file}`)
      }
    }
    
    // Удаляем старую папку
    fs.rmSync(oldFriendlyDir, { recursive: true, force: true })
    console.log(`   🗑️  Удалена старая папка: ${season}/friendly/`)
  }
}

console.log()
console.log('=' .repeat(80))
console.log('\n✅ Структура папок исправлена!')
console.log()
