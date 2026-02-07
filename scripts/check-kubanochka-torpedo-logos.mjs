#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
});
const prisma = new PrismaClient({ adapter });

const teams = await prisma.standingsTeam.findMany({
  where: {
    OR: [
      { teamName: 'Кубаночка' },
      { teamName: 'Торпедо Ижевск' }
    ]
  },
  select: {
    teamName: true,
    teamLogoUrl: true,
    season: true
  }
});

console.log('Логотипы Кубаночки и Торпедо Ижевск в базе:\n');
teams.forEach(t => {
  console.log(`${t.season} - ${t.teamName}: ${t.teamLogoUrl}`);
});

await prisma.$disconnect();
