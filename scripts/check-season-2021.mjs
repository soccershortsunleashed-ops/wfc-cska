#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
});
const prisma = new PrismaClient({ adapter });

console.log('📊 Проверка данных сезона 2021...\n');

const teams = await prisma.standingsTeam.findMany({
  where: {
    season: '2021',
    tournament: 'Суперлига'
  },
  orderBy: {
    position: 'asc'
  }
});

console.log(`Найдено команд: ${teams.length}\n`);

teams.forEach(team => {
  console.log(`${team.position}. ${team.teamName} - ${team.points} очков (${team.played} игр)`);
  console.log(`   Логотип: ${team.teamLogoUrl || 'НЕТ'}`);
});

await prisma.$disconnect();
