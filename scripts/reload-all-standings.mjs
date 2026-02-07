#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
});
const prisma = new PrismaClient({ adapter });

// Маппинг названий команд на логотипы
const teamLogos = {
  'ЖФК ЦСКА': '/seed-assets/cskaLogo-cska.png',
  'Спартак': '/seed-assets/opponentLogo-spartak.png',
  'Зенит': '/seed-assets/opponentLogo-zenit.png',
  'Локомотив': '/seed-assets/opponentLogo-lokomotiv.png',
  'Краснодар': '/seed-assets/opponentLogo-krasnodar.png',
  'Крылья Советов': '/seed-assets/opponentLogo-krylya-sovetov.png',
  'Динамо': '/seed-assets/opponentLogo-dinamo.png',
  'Чертаново': '/seed-assets/opponentLogo-chertanovo.png',
  'Рязань-ВДВ': '/seed-assets/opponentLogo-ryazan-vdv.png',
  'Рубин': '/seed-assets/opponentLogo-rubin.png',
  'Звезда-2005': '/seed-assets/opponentLogo-zvezda-2005.png',
  'Ростов': '/seed-assets/opponentLogo-rostov.png',
  'Енисей': '/seed-assets/opponentLogo-enisey.png',
  'Кубаночка': '/seed-assets/opponentLogo-kubanochka.png',
  'Торпедо Ижевск': '/seed-assets/opponentLogo-torpedo-izhevsk.png',
  'Россиянка': '/seed-assets/opponentLogo-rossiyanka.png',
  'Строгино': '/seed-assets/opponentLogo-strogino.png',
  'Лидар': '/seed-assets/opponentLogo-himki.png', // Используем Химки как заглушку
  'Дончанка': '/seed-assets/opponentLogo-donchanka.jpg',
};

console.log('🗑️  Удаление всех старых данных турнирных таблиц...\n');

const deleted = await prisma.standingsTeam.deleteMany();
console.log(`✅ Удалено записей: ${deleted.count}\n`);

console.log('📊 Загрузка новых данных с правильной кодировкой и логотипами...\n');

// Read standings data with correct encoding
const dataPath = path.join(__dirname, '../seed/standings-complete-fixed.json');
const standingsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

console.log(`Найдено ${standingsData.length} сезонов\n`);

let totalTeams = 0;
let teamsWithLogos = 0;
let teamsWithoutLogos = 0;
const missingLogos = new Set();

for (const season of standingsData) {
  console.log(`Обработка сезона ${season.seasonName} (${season.tournament})...`);

  for (const team of season.teams) {
    const logoUrl = teamLogos[team.teamName] || null;
    
    if (logoUrl) {
      teamsWithLogos++;
    } else {
      teamsWithoutLogos++;
      missingLogos.add(team.teamName);
      console.log(`  ⚠️  Логотип не найден для команды: ${team.teamName}`);
    }

    await prisma.standingsTeam.create({
      data: {
        season: season.seasonName,
        tournament: season.tournament,
        position: team.position,
        teamName: team.teamName,
        teamLogoUrl: logoUrl,
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

  console.log(`  ✓ Загружено ${season.teams.length} команд`);
  totalTeams += season.teams.length;
}

console.log(`\n✅ Загрузка завершена!`);
console.log(`📊 Всего: ${standingsData.length} сезонов, ${totalTeams} записей команд`);
console.log(`🖼️  Команд с логотипами: ${teamsWithLogos}`);
console.log(`⚠️  Команд без логотипов: ${teamsWithoutLogos}`);

if (missingLogos.size > 0) {
  console.log(`\n⚠️  Команды без логотипов:`);
  missingLogos.forEach(team => console.log(`   - ${team}`));
}

// Проверка данных
console.log('\n🔍 Проверка загруженных данных:\n');

const standings2025 = await prisma.standingsTeam.findMany({
  where: { season: '2025' },
  orderBy: { position: 'asc' },
  take: 3
});

console.log('Топ-3 команды сезона 2025:');
standings2025.forEach(team => {
  const logoStatus = team.teamLogoUrl ? '✓' : '✗';
  console.log(`  ${team.position}. ${team.teamName} - ${team.points} очков [${logoStatus}]`);
});

const standings2020 = await prisma.standingsTeam.findMany({
  where: { season: '2020' },
  orderBy: { position: 'asc' },
  take: 3
});

console.log('\nТоп-3 команды сезона 2020:');
standings2020.forEach(team => {
  const logoStatus = team.teamLogoUrl ? '✓' : '✗';
  console.log(`  ${team.position}. ${team.teamName} - ${team.points} очков [${logoStatus}]`);
});

await prisma.$disconnect();
