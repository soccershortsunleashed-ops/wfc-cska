#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Читаем файл как binary buffer
const dataPath = path.join(__dirname, '../seed/standings-real.json');
const buffer = fs.readFileSync(dataPath);

// Декодируем из latin1 в UTF-8
const latin1String = buffer.toString('latin1');
const data = JSON.parse(latin1String);

// Функция для исправления кодировки
function fixEncoding(str) {
  // Преобразуем строку обратно в buffer через latin1, затем читаем как UTF-8
  const buf = Buffer.from(str, 'latin1');
  return buf.toString('utf-8');
}

// Исправляем кодировку для всех команд
data.forEach(season => {
  season.teams.forEach(team => {
    const fixed = fixEncoding(team.teamName);
    console.log(`${team.teamName} -> ${fixed}`);
    team.teamName = fixed;
  });
});

// Сохраняем исправленный файл
const outputPath = path.join(__dirname, '../seed/standings-real-all-fixed.json');
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');

console.log(`\n✅ Файл сохранен: ${outputPath}`);
console.log(`📊 Обработано сезонов: ${data.length}`);
