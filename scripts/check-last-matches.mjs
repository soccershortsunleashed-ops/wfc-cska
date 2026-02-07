#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
});
const prisma = new PrismaClient({ adapter });

const matches = await prisma.match.findMany({
  where: {
    matchDate: {
      gte: new Date('2025-11-01')
    }
  },
  orderBy: {
    matchDate: 'desc'
  },
  take: 5
});

console.log('Последние матчи в ноябре 2025:\n');
matches.forEach(m => {
  const date = m.matchDate.toLocaleDateString('ru-RU');
  console.log(`${date} - ${m.opponentName}: ${m.scoreHome} : ${m.scoreAway}`);
});

await prisma.$disconnect();
