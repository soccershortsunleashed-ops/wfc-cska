#!/usr/bin/env node
/**
 * Скрипт для копирования логотипов команд из wfccska.ru в public/seed-assets
 */

import fs from "fs";
import path from "path";

const ROOT = path.resolve("../wfccska.ru");
const PUBLIC_DIR = path.resolve("./public/seed-assets");
const ASSETS_FILE = path.resolve("./seed/matches-assets.json");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dest) {
  try {
    fs.copyFileSync(src, dest);
    return true;
  } catch (err) {
    console.error(`❌ Error copying ${src}:`, err.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Копирование логотипов команд...\n");
  
  // Читаем список ассетов
  const assetsData = fs.readFileSync(ASSETS_FILE, "utf8");
  const assets = JSON.parse(assetsData);
  
  console.log(`📊 Найдено ${assets.length} логотипов\n`);
  
  // Создаем директорию для ассетов
  ensureDir(PUBLIC_DIR);
  
  let copiedCount = 0;
  let skippedCount = 0;
  
  for (const asset of assets) {
    const { type, localPath, slug } = asset;
    
    if (!fs.existsSync(localPath)) {
      console.log(`⚠️  Файл не найден: ${localPath}`);
      skippedCount++;
      continue;
    }
    
    // Определяем расширение файла
    const ext = path.extname(localPath);
    const destFileName = `${type}-${slug}${ext}`;
    const destPath = path.join(PUBLIC_DIR, destFileName);
    
    if (copyFile(localPath, destPath)) {
      console.log(`✅ ${destFileName}`);
      copiedCount++;
    } else {
      skippedCount++;
    }
  }
  
  console.log(`\n📊 Статистика:`);
  console.log(`   Скопировано: ${copiedCount}`);
  console.log(`   Пропущено: ${skippedCount}`);
  console.log(`\n✅ Готово!`);
}

main().catch((e) => {
  console.error("\n❌ ОШИБКА:", e);
  process.exit(1);
});
