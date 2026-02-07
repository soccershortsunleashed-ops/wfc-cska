#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Исправление кодировки в standings-real.json...\n');

// Read file as buffer to preserve original bytes
const filePath = path.join(__dirname, '../seed/standings-real.json');
const buffer = fs.readFileSync(filePath);

// Try to decode as latin-1 first, then re-encode as UTF-8
const latin1Content = buffer.toString('latin1');
const data = JSON.parse(latin1Content);

// Fix team names
let fixedCount = 0;
for (const season of data) {
  for (const team of season.teams) {
    try {
      // Convert latin-1 string back to bytes, then decode as UTF-8
      const bytes = Buffer.from(team.teamName, 'latin1');
      const fixed = bytes.toString('utf8');
      
      if (fixed !== team.teamName) {
        console.log(`Исправлено: "${team.teamName}" → "${fixed}"`);
        team.teamName = fixed;
        fixedCount++;
      }
    } catch (err) {
      console.error(`Ошибка при исправлении: ${team.teamName}`);
    }
  }
  
  // Fix tournament name if exists
  if (season.tournament) {
    try {
      const bytes = Buffer.from(season.tournament, 'latin1');
      const fixed = bytes.toString('utf8');
      
      if (fixed !== season.tournament) {
        console.log(`Исправлен турнир: "${season.tournament}" → "${fixed}"`);
        season.tournament = fixed;
        fixedCount++;
      }
    } catch (err) {
      console.error(`Ошибка при исправлении турнира: ${season.tournament}`);
    }
  }
}

// Save with proper UTF-8 encoding
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

console.log(`\n✅ Исправлено записей: ${fixedCount}`);
console.log('✅ Файл сохранен с правильной кодировкой UTF-8');
