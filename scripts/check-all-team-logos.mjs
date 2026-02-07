#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
});
const prisma = new PrismaClient({ adapter });

console.log('🔍 Проверка логотипов всех команд во всех сезонах...\n');

// Получаем все уникальные команды
const allTeams = await prisma.standingsTeam.findMany({
  select: {
    teamName: true,
    teamLogoUrl: true,
    season: true
  },
  orderBy: [
    { season: 'desc' },
    { teamName: 'asc' }
  ]
});

// Группируем по командам
const teamsByName = new Map();

allTeams.forEach(team => {
  if (!teamsByName.has(team.teamName)) {
    teamsByName.set(team.teamName, []);
  }
  teamsByName.get(team.teamName).push({
    season: team.season,
    logo: team.teamLogoUrl
  });
});

console.log(`Найдено ${teamsByName.size} уникальных команд\n`);

// Проверяем каждую команду
const teamsWithoutLogos = [];
const teamsWithDifferentLogos = [];

for (const [teamName, seasons] of teamsByName.entries()) {
  const logos = new Set(seasons.map(s => s.logo));
  
  if (logos.has(null)) {
    teamsWithoutLogos.push(teamName);
    console.log(`❌ ${teamName}: НЕТ ЛОГОТИПА в сезонах ${seasons.filter(s => !s.logo).map(s => s.season).join(', ')}`);
  } else if (logos.size > 1) {
    teamsWithDifferentLogos.push(teamName);
    console.log(`⚠️  ${teamName}: РАЗНЫЕ ЛОГОТИПЫ`);
    seasons.forEach(s => console.log(`   ${s.season}: ${s.logo}`));
  } else {
    console.log(`✅ ${teamName}: ${seasons[0].logo}`);
  }
}

console.log(`\n📊 Итого:`);
console.log(`   Всего команд: ${teamsByName.size}`);
console.log(`   Команд без логотипов: ${teamsWithoutLogos.length}`);
console.log(`   Команд с разными логотипами: ${teamsWithDifferentLogos.length}`);

if (teamsWithoutLogos.length > 0) {
  console.log(`\n❌ Команды без логотипов:`);
  teamsWithoutLogos.forEach(team => console.log(`   - ${team}`));
}

await prisma.$disconnect();
