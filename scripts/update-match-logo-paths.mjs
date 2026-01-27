#!/usr/bin/env node
/**
 * Скрипт для обновления путей к логотипам в matches-full.json
 */

import fs from "fs";
import path from "path";

const MATCHES_FILE = path.resolve("./seed/matches-full.json");
const ASSETS_FILE = path.resolve("./seed/matches-assets.json");

// Транслитерация для создания slug
function transliterate(text) {
  const translitMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    ' ': '-', '.': '', ',': '', '!': '', '?': '', '"': '', "'": '', '(': '', ')': ''
  };
  
  return text.toLowerCase()
    .split('')
    .map(char => translitMap[char] || char)
    .join('')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-')
    .replace(/^\-|\-$/g, '');
}

async function main() {
  console.log("🚀 Обновление путей к логотипам...\n");
  
  // Читаем данные
  const matchesData = fs.readFileSync(MATCHES_FILE, "utf8");
  const matches = JSON.parse(matchesData);
  
  const assetsData = fs.readFileSync(ASSETS_FILE, "utf8");
  const assets = JSON.parse(assetsData);
  
  // Создаем карту логотипов
  const logoMap = new Map();
  assets.forEach(asset => {
    const ext = path.extname(asset.localPath);
    const fileName = `${asset.type}-${asset.slug}${ext}`;
    logoMap.set(asset.slug, `/seed-assets/${fileName}`);
  });
  
  // Обновляем пути в матчах
  let updatedCount = 0;
  matches.forEach(match => {
    const opponentSlug = transliterate(match.opponentName);
    
    // Обновляем логотип соперника
    if (logoMap.has(opponentSlug)) {
      match.opponentLogoUrl = logoMap.get(opponentSlug);
      updatedCount++;
    }
    
    // Обновляем логотип ЦСКА
    if (logoMap.has('cska')) {
      match.cskaLogoUrl = logoMap.get('cska');
    }
  });
  
  // Сохраняем обновленные данные
  fs.writeFileSync(MATCHES_FILE, JSON.stringify(matches, null, 2), "utf8");
  
  console.log(`✅ Обновлено ${updatedCount} матчей`);
  console.log(`📄 Файл сохранен: ${MATCHES_FILE}`);
}

main().catch((e) => {
  console.error("\n❌ ОШИБКА:", e);
  process.exit(1);
});
