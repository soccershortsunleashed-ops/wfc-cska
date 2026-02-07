#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '../seed/matches-full.json');

console.log('🔧 Исправление файла seed/matches-full.json...\n');

// Читаем файл
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Матчи для исправления (дата и соперник)
const matchesToFix = [
  { date: '2025-03-15', opponent: 'Енисей' },
  { date: '2025-03-29', opponent: 'Звезда-2005' },
  { date: '2025-04-26', opponent: 'Рубин' },
  { date: '2025-05-10', opponent: 'Чертаново' },
  { date: '2025-05-17', opponent: 'Динамо' },
  { date: '2025-06-14', opponent: 'Краснодар' },
  { date: '2025-07-06', opponent: 'Урал' },
  { date: '2025-07-19', opponent: 'Локомотив' },
  { date: '2025-07-26', opponent: 'Ростов' },
  { date: '2025-08-01', opponent: 'Краснодар' },
  { date: '2025-08-10', opponent: 'Крылья Советов' },
  { date: '2025-08-29', opponent: 'Спартак' },
  { date: '2025-09-19', opponent: 'Рязань-ВДВ' }
];

let fixed = 0;

for (const match of data) {
  const matchDate = match.matchDate.slice(0, 10);
  const needsFix = matchesToFix.find(m => m.date === matchDate && m.opponent === match.opponentName);
  
  if (needsFix) {
    const oldHome = match.scoreHome;
    const oldAway = match.scoreAway;
    
    // Меняем местами
    match.scoreHome = oldAway;
    match.scoreAway = oldHome;
    
    console.log(`✅ ${matchDate} - ${match.opponentName.padEnd(20)} ${oldHome}:${oldAway} → ${match.scoreHome}:${match.scoreAway}`);
    fixed++;
  }
}

// Сохраняем файл
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`\n📊 Итого исправлено: ${fixed} матчей`);
console.log(`✅ Файл сохранен: seed/matches-full.json`);
