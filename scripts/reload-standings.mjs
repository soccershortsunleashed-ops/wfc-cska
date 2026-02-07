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

console.log('🗑️  Удаление старых данных турнирных таблиц...\n');

const deleted = await prisma.standingsTeam.deleteMany();
console.log(`✅ Удалено записей: ${deleted.count}\n`);

console.log('📊 Загрузка новых данных...\n');

// Read standings data
const dataPath = path.join(__dirname, '../seed/standings-real.json');
const standingsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

console.log(`Найдено ${standingsData.length} сезонов\n`);

let totalTeams = 0;

for (const season of standingsData) {
  console.log(`Обработка ${season.seasonName} (${season.tournament})...`);

  for (const team of season.teams) {
    await prisma.standingsTeam.create({
      data: {
        season: season.seasonName,
        tournament: season.tournament,
        position: team.position,
        teamName: team.teamName,
        teamLogoUrl: null,
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

await prisma.$disconnect();
