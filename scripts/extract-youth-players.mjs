import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Читаем HTML файл
const htmlPath = path.join(__dirname, '../../wfccska.ru/molodezh.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Регулярное выражение для извлечения данных игроков
const playerPattern = /<a href="\/komanda\/igroki\/([^"]+)\/" class="card-player">[\s\S]*?<img src="([^"]*)" class="card-player__img">[\s\S]*?<span class="card-player__number">(\d+)<\/span>\s*<span class="card-player__name">([^<]+)<\/span>[\s\S]*?<div class="property__val">([^<]*)<\/div>[\s\S]*?<div class="property__val">([^<]*)<\/div>[\s\S]*?<div class="property__val">(\d*)<\/div>[\s\S]*?<div class="property__val">(\d*)<\/div>/g;

const players = [];
let match;

while ((match = playerPattern.exec(html)) !== null) {
  const [, slug, photoUrl, number, name, birthDate, nationality, height, weight] = match;
  
  // Разбиваем имя на фамилию и имя
  const nameParts = name.trim().split(' ');
  const lastName = nameParts[0];
  const firstName = nameParts.slice(1).join(' ') || lastName;
  
  // Проверяем, есть ли фото (не placeholder)
  const hasPhoto = photoUrl && !photoUrl.includes('empty_player.png');
  
  players.push({
    slug: slug.trim(),
    number: parseInt(number),
    lastName: lastName.trim(),
    firstName: firstName.trim(),
    fullName: name.trim(),
    birthDate: birthDate.trim(),
    nationality: nationality.trim(),
    heightCm: height ? parseInt(height) : null,
    weightKg: weight ? parseInt(weight) : null,
    photoUrl: hasPhoto ? photoUrl : '',
    team: 'YOUTH'
  });
}

console.log(`Найдено игроков: ${players.length}`);
console.log(JSON.stringify(players, null, 2));

// Сохраняем в файл
const outputPath = path.join(__dirname, '../seed/youth-players-extracted.json');
fs.writeFileSync(outputPath, JSON.stringify(players, null, 2));
console.log(`\nДанные сохранены в: ${outputPath}`);
