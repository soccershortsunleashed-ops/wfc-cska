#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
});
const prisma = new PrismaClient({ adapter });

// Матчи с ошибками (нужно поменять местами scoreHome и scoreAway)
const matchesToFix = [
  { date: '2025-03-15', opponent: 'Енисей', correctHome: 0, correctAway: 1 },
  { date: '2025-03-29', opponent: 'Звезда-2005', correctHome: 0, correctAway: 3 },
  { date: '2025-04-26', opponent: 'Рубин', correctHome: 1, correctAway: 4 },
  { date: '2025-05-10', opponent: 'Чертаново', correctHome: 0, correctAway: 2 },
  { date: '2025-05-17', opponent: 'Динамо', correctHome: 1, correctAway: 3 },
  { date: '2025-06-14', opponent: 'Краснодар', correctHome: 1, correctAway: 0 },
  { date: '2025-07-06', opponent: 'Урал', correctHome: 0, correctAway: 8 },
  { date: '2025-07-19', opponent: 'Локомотив', correctHome: 0, correctAway: 3 },
  { date: '2025-07-26', opponent: 'Ростов', correctHome: 0, correctAway: 3 },
  { date: '2025-08-01', opponent: 'Краснодар', correctHome: 0, correctAway: 4 },
  { date: '2025-08-10', opponent: 'Крылья Советов', correctHome: 0, correctAway: 2 },
  { date: '2025-08-29', opponent: 'Спартак', correctHome: 0, correctAway: 1 },
  { date: '2025-09-19', opponent: 'Рязань-ВДВ', correctHome: 1, correctAway: 3 }
];

console.log('🔧 Исправление счетов матчей сезона 2025...\n');
console.log(`Матчей для исправления: ${matchesToFix.length}\n`);

let fixed = 0;
let notFound = 0;

for (const matchData of matchesToFix) {
  const match = await prisma.match.findFirst({
    where: {
      opponentName: matchData.opponent,
      matchDate: {
        gte: new Date(`${matchData.date}T00:00:00`),
        lt: new Date(`${matchData.date}T23:59:59`)
      }
    }
  });

  if (!match) {
    console.log(`❌ Не найден: ${matchData.date} - ${matchData.opponent}`);
    notFound++;
    continue;
  }

  const oldScore = `${match.scoreHome}:${match.scoreAway}`;
  const newScore = `${matchData.correctHome}:${matchData.correctAway}`;

  await prisma.match.update({
    where: { id: match.id },
    data: {
      scoreHome: matchData.correctHome,
      scoreAway: matchData.correctAway
    }
  });

  console.log(`✅ ${matchData.date} - ${matchData.opponent.padEnd(20)} ${oldScore} → ${newScore}`);
  fixed++;
}

console.log(`\n📊 Итого:`);
console.log(`  ✅ Исправлено: ${fixed}`);
console.log(`  ❌ Не найдено: ${notFound}`);

if (fixed > 0) {
  console.log(`\n🎉 Все ошибки исправлены!`);
}

await prisma.$disconnect();
