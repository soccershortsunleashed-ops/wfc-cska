#!/usr/bin/env node

/**
 * Скрипт для копирования логотипов команд в новую структуру
 * public/teams/{year}/{competition}/{team}.png
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.join(__dirname, '..', 'public')

// Маппинг логотипов команд
const TEAM_LOGOS = {
  'cska': 'upload/iblock/ab2/j9egqr27xk8lsljr7h55sicicqkcn0zo/Dlya_sayta.png',
  'zenit': 'upload/iblock/264/Na-sayt.png',
  'spartak': 'upload/iblock/951/qgm6y9bwenjfkql7sg4mzvi10uxpt7ob/FC_Spartak_Moscow_Logotype.svg.png',
  'dinamo': 'upload/iblock/b40/g0nmfdjnn0vcohqp4yjp3tz3jnfbxpd3/dynamo.png',
  'krasnodar': 'upload/iblock/188/Krasnodar.png',
  'chertanovo': 'upload/iblock/275/lrdutcx0l2wa3lcmgykvkphw9cwj7843/CHERT_Symbol_.png',
  'ryazan': 'upload/iblock/c74/11.png',
  'rubin': 'upload/iblock/915/5.png',
  'enisey': 'upload/iblock/313/Enisey.png',
  'krylia': 'upload/iblock/dbf/2.png',
  'rostov': 'upload/iblock/4c4/6.png',
  'lokomotiv': 'upload/iblock/953/12.png',
  'zvezda': 'upload/iblock/a0b/t1may0whct2i6et3ke7hz2n6ahtxjv1r/Zvezda_2005_logotip.png',
  'ural': 'upload/iblock/3dd/pal0i307iil3oa0s4wh6gc3zlpfe0360/ural.png',
}

function copyLogo(teamName, sourcePath, destPath) {
  const source = path.join(publicDir, sourcePath)
  const dest = path.join(publicDir, destPath)
  
  if (!fs.existsSync(source)) {
    console.log(`❌ ${teamName}: Файл не найден - ${sourcePath}`)
    return false
  }
  
  try {
    // Создаем директорию если не существует
    const destDir = path.dirname(dest)
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true })
    }
    
    // Копируем файл
    fs.copyFileSync(source, dest)
    console.log(`✅ ${teamName}: ${path.basename(dest)}`)
    return true
  } catch (error) {
    console.log(`❌ ${teamName}: Ошибка копирования - ${error.message}`)
    return false
  }
}

function main() {
  console.log('\n📋 Копирование логотипов команд в новую структуру\n')
  console.log('=' .repeat(80))
  console.log()
  
  let copied = 0
  let failed = 0
  
  // Копируем логотипы для сезона 2025/2026
  for (const [teamName, sourcePath] of Object.entries(TEAM_LOGOS)) {
    const ext = path.extname(sourcePath)
    const destPath = `teams/2025/superliga/${teamName}${ext}`
    
    if (copyLogo(teamName, sourcePath, destPath)) {
      copied++
    } else {
      failed++
    }
  }
  
  console.log()
  console.log('=' .repeat(80))
  console.log(`\n✅ Скопировано: ${copied}`)
  console.log(`❌ Ошибок: ${failed}`)
  console.log()
}

main()
