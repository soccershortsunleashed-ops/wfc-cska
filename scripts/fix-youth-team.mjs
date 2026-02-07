import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Читаем текущие данные
const playersPath = path.join(__dirname, '../seed/players.json');
const players = JSON.parse(fs.readFileSync(playersPath, 'utf8'));

// Читаем правильный список молодежки
const youthPath = path.join(__dirname, '../seed/youth-players-extracted.json');
const youthPlayers = JSON.parse(fs.readFileSync(youthPath, 'utf8'));
const youthSlugs = youthPlayers.map(p => p.slug);

console.log(`Всего игроков: ${players.length}`);
console.log(`Молодежка с сайта: ${youthSlugs.length}`);

// Исправляем команду для игроков молодежки
let fixed = 0;
players.forEach(player => {
  if (youthSlugs.includes(player.slug) && player.team !== 'YOUTH') {
    console.log(`Исправляю: ${player.number} - ${player.firstName} ${player.lastName} (${player.team} → YOUTH)`);
    player.team = 'YOUTH';
    fixed++;
  }
});

console.log(`\nИсправлено игроков: ${fixed}`);

// Сохраняем обновленные данные
fs.writeFileSync(playersPath, JSON.stringify(players, null, 2));
console.log(`Данные сохранены в: ${playersPath}`);

// Статистика
const stats = {
  MAIN: players.filter(p => p.team === 'MAIN').length,
  YOUTH: players.filter(p => p.team === 'YOUTH').length,
  JUNIOR: players.filter(p => p.team === 'JUNIOR').length,
};

console.log('\nСтатистика по командам:');
console.log(`  MAIN: ${stats.MAIN}`);
console.log(`  YOUTH: ${stats.YOUTH}`);
console.log(`  JUNIOR: ${stats.JUNIOR}`);
