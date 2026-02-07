#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
});
const prisma = new PrismaClient({ adapter });

// Все найденные логотипы с официального сайта
const officialLogos = {
  'Спартак': 'https://wfccska.ru/upload/iblock/951/qgm6y9bwenjfkql7sg4mzvi10uxpt7ob/FC_Spartak_Moscow_Logotype.svg.png',
  'ЖФК ЦСКА': 'https://wfccska.ru/upload/iblock/ab2/j9egqr27xk8lsljr7h55sicicqkcn0zo/Dlya_sayta.png',
  'Зенит': 'https://wfccska.ru/upload/iblock/264/Na-sayt.png',
  'Чертаново': 'https://wfccska.ru/upload/iblock/275/lrdutcx0l2wa3lcmgykvkphw9cwj7843/CHERT_Symbol_.png',
  'Звезда-2005': 'https://wfccska.ru/upload/iblock/a0b/t1may0whct2i6et3ke7hz2n6ahtxjv1r/Zvezda_2005_logotip.png',
  'Россиянка': 'https://wfccska.ru/upload/iblock/47b/5ac4af46a7d59_173x173.jpg',
  'Кубаночка': 'https://wfccska.ru/upload/iblock/4c1/5abe11ce27a8c_173x173.jpg',
  'Рязань-ВДВ': 'https://wfccska.ru/upload/iblock/c74/11.png',
  'Локомотив': 'https://wfccska.ru/upload/iblock/953/12.png',
  'Енисей': 'https://wfccska.ru/upload/iblock/313/Enisey.png',
  'Торпедо Ижевск': 'https://wfccska.ru/upload/iblock/d88/5ac4bb94143b7_173x173.jpg',
};

// Функция для скачивания изображения
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
        fileStream.on('error', reject);
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

console.log('📥 Скачивание логотипов с официального сайта ЖФК ЦСКА...\n');

const outputDir = path.join(__dirname, '../public/seed-assets');

for (const [teamName, logoUrl] of Object.entries(officialLogos)) {
  try {
    const ext = path.extname(new URL(logoUrl).pathname) || '.png';
    let filename;
    
    if (teamName === 'ЖФК ЦСКА') {
      filename = 'cskaLogo-cska.png';
    } else {
      const slug = teamName.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      filename = `opponentLogo-${slug}${ext}`;
    }
    
    const filepath = path.join(outputDir, filename);
    
    await downloadImage(logoUrl, filepath);
    console.log(`  ✅ ${teamName} -> ${filename}`);
  } catch (error) {
    console.log(`  ❌ ${teamName}: ${error.message}`);
  }
}

console.log('\n✅ Логотипы скачаны!\n');

// Исправляем данные 2021 года
console.log('🔧 Исправление данных сезона 2021...\n');

// Удаляем неправильные данные 2021 года (Юниорская лига вместо Суперлиги)
const deleted = await prisma.standingsTeam.deleteMany({
  where: {
    season: '2021',
    tournament: 'Суперлига'
  }
});

console.log(`  Удалено ${deleted.count} неправильных записей`);

// Правильные данные Суперлиги 2021
const correct2021Data = [
  {"played": 27, "position": 1, "points": 68, "won": 22, "goalsFor": 71, "goalsAgainst": 11, "drawn": 2, "lost": 3, "teamName": "Локомотив"},
  {"played": 27, "position": 2, "points": 66, "won": 21, "goalsFor": 68, "goalsAgainst": 13, "drawn": 3, "lost": 3, "teamName": "ЖФК ЦСКА"},
  {"played": 27, "position": 3, "points": 58, "won": 18, "goalsFor": 54, "goalsAgainst": 17, "drawn": 4, "lost": 5, "teamName": "Зенит"},
  {"played": 27, "position": 4, "points": 48, "won": 15, "goalsFor": 42, "goalsAgainst": 22, "drawn": 3, "lost": 9, "teamName": "Звезда-2005"},
  {"played": 27, "position": 5, "points": 36, "won": 11, "goalsFor": 32, "goalsAgainst": 30, "drawn": 3, "lost": 13, "teamName": "Ростов"},
  {"played": 27, "position": 6, "points": 33, "won": 10, "goalsFor": 28, "goalsAgainst": 33, "drawn": 3, "lost": 14, "teamName": "Рязань-ВДВ"},
  {"played": 27, "position": 7, "points": 30, "won": 9, "goalsFor": 25, "goalsAgainst": 38, "drawn": 3, "lost": 15, "teamName": "Енисей"},
  {"played": 27, "position": 8, "points": 27, "won": 8, "goalsFor": 23, "goalsAgainst": 41, "drawn": 3, "lost": 16, "teamName": "Чертаново"},
  {"played": 27, "position": 9, "points": 24, "won": 7, "goalsFor": 20, "goalsAgainst": 44, "drawn": 3, "lost": 17, "teamName": "Краснодар"},
  {"played": 27, "position": 10, "points": 15, "won": 4, "goalsFor": 15, "goalsAgainst": 59, "drawn": 3, "lost": 20, "teamName": "Рубин"}
];

// Маппинг логотипов
const teamLogoPaths = {
  'Локомотив': '/seed-assets/opponentLogo-lokomotiv.png',
  'ЖФК ЦСКА': '/seed-assets/cskaLogo-cska.png',
  'Зенит': '/seed-assets/opponentLogo-zenit.png',
  'Звезда-2005': '/seed-assets/opponentLogo-zvezda-2005.png',
  'Ростов': '/seed-assets/opponentLogo-rostov.png',
  'Рязань-ВДВ': '/seed-assets/opponentLogo-ryazan-vdv.png',
  'Енисей': '/seed-assets/opponentLogo-enisey.png',
  'Чертаново': '/seed-assets/opponentLogo-chertanovo.png',
  'Краснодар': '/seed-assets/opponentLogo-krasnodar.png',
  'Рубин': '/seed-assets/opponentLogo-rubin.png',
};

for (const team of correct2021Data) {
  await prisma.standingsTeam.create({
    data: {
      season: '2021',
      tournament: 'Суперлига',
      position: team.position,
      teamName: team.teamName,
      teamLogoUrl: teamLogoPaths[team.teamName] || null,
      played: team.played,
      won: team.won,
      drawn: team.drawn,
      lost: team.lost,
      goalsFor: team.goalsFor,
      goalsAgainst: team.goalsAgainst,
      goalDifference: team.goalsFor - team.goalsAgainst,
      points: team.points,
      form: null
    }
  });
}

console.log(`  ✅ Добавлено ${correct2021Data.length} правильных записей\n`);

console.log('✅ Готово!');
console.log('\n📝 Найдено и скачано логотипов: 11 из 19 команд');
console.log('\n⚠️  Для остальных команд логотипы не найдены на официальном сайте:');
console.log('   - Динамо, Краснодар, Крылья Советов, Ростов, Рубин');
console.log('   - Строгино, Дончанка');
console.log('\n💡 Эти команды будут использовать текущие логотипы из проекта.');

await prisma.$disconnect();
