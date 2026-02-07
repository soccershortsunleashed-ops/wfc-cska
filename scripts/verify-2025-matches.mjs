#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
});
const prisma = new PrismaClient({ adapter });

// Данные с официального сайта (сезон 2025)
const officialMatches = [
  { date: '2025-03-08', opponent: 'Рязань-ВДВ', scoreHome: 4, scoreAway: 0, isHome: false },
  { date: '2025-03-15', opponent: 'Енисей', scoreHome: 0, scoreAway: 1, isHome: false },
  { date: '2025-03-22', opponent: 'Ростов', scoreHome: 3, scoreAway: 0, isHome: false },
  { date: '2025-03-29', opponent: 'Звезда-2005', scoreHome: 0, scoreAway: 3, isHome: false },
  { date: '2025-04-13', opponent: 'Спартак', scoreHome: 1, scoreAway: 1, isHome: false },
  { date: '2025-04-26', opponent: 'Рубин', scoreHome: 1, scoreAway: 4, isHome: false },
  { date: '2025-05-04', opponent: 'Крылья Советов', scoreHome: 2, scoreAway: 0, isHome: false },
  { date: '2025-05-10', opponent: 'Чертаново', scoreHome: 0, scoreAway: 2, isHome: false },
  { date: '2025-05-17', opponent: 'Динамо', scoreHome: 1, scoreAway: 3, isHome: false },
  { date: '2025-05-24', opponent: 'Локомотив', scoreHome: 0, scoreAway: 1, isHome: false },
  { date: '2025-06-14', opponent: 'Краснодар', scoreHome: 1, scoreAway: 0, isHome: false },
  { date: '2025-06-21', opponent: 'Зенит', scoreHome: 2, scoreAway: 1, isHome: false },
  { date: '2025-07-06', opponent: 'Урал', scoreHome: 0, scoreAway: 8, isHome: false, tournament: 'Кубок' },
  { date: '2025-07-12', opponent: 'Звезда-2005', scoreHome: 2, scoreAway: 1, isHome: true },
  { date: '2025-07-19', opponent: 'Локомотив', scoreHome: 0, scoreAway: 3, isHome: true },
  { date: '2025-07-26', opponent: 'Ростов', scoreHome: 0, scoreAway: 3, isHome: true },
  { date: '2025-08-01', opponent: 'Краснодар', scoreHome: 0, scoreAway: 4, isHome: false, tournament: 'Кубок' },
  { date: '2025-08-10', opponent: 'Крылья Советов', scoreHome: 0, scoreAway: 2, isHome: true },
  { date: '2025-08-16', opponent: 'Енисей', scoreHome: 8, scoreAway: 0, isHome: true },
  { date: '2025-08-29', opponent: 'Спартак', scoreHome: 0, scoreAway: 1, isHome: false, tournament: 'Кубок' },
  { date: '2025-09-06', opponent: 'Рубин', scoreHome: 4, scoreAway: 0, isHome: true },
  { date: '2025-09-14', opponent: 'Спартак', scoreHome: 3, scoreAway: 2, isHome: true, tournament: 'Кубок' },
  { date: '2025-09-19', opponent: 'Рязань-ВДВ', scoreHome: 1, scoreAway: 3, isHome: true },
  { date: '2025-09-26', opponent: 'Чертаново', scoreHome: 2, scoreAway: 0, isHome: true },
  { date: '2025-10-03', opponent: 'Краснодар', scoreHome: 0, scoreAway: 0, isHome: true },
  { date: '2025-10-12', opponent: 'Зенит', scoreHome: 0, scoreAway: 0, isHome: false, tournament: 'Кубок', penalties: '4:3' },
  { date: '2025-10-19', opponent: 'Динамо', scoreHome: 1, scoreAway: 0, isHome: true },
  { date: '2025-11-02', opponent: 'Спартак', scoreHome: 2, scoreAway: 2, isHome: false },
  { date: '2025-11-08', opponent: 'Зенит', scoreHome: 0, scoreAway: 1, isHome: false }
];

console.log('🔍 Проверка матчей сезона 2025...\n');
console.log(`Всего матчей на официальном сайте: ${officialMatches.length}\n`);

// Получаем матчи из БД
const dbMatches = await prisma.match.findMany({
  where: {
    matchDate: {
      gte: new Date('2025-01-01'),
      lt: new Date('2026-01-01')
    }
  },
  orderBy: {
    matchDate: 'asc'
  }
});

console.log(`Матчей в базе данных: ${dbMatches.length}\n`);

let errors = 0;
let correct = 0;

console.log('Сравнение результатов:\n');
console.log('='.repeat(80));

for (const official of officialMatches) {
  const dbMatch = dbMatches.find(m => {
    const matchDate = m.matchDate.toISOString().slice(0, 10);
    return matchDate === official.date && m.opponentName === official.opponent;
  });

  if (!dbMatch) {
    console.log(`❌ ОТСУТСТВУЕТ: ${official.date} - ${official.opponent}`);
    errors++;
    continue;
  }

  // Проверяем счет
  const dbScore = `${dbMatch.scoreHome}:${dbMatch.scoreAway}`;
  const officialScore = `${official.scoreHome}:${official.scoreAway}`;

  if (dbMatch.scoreHome === official.scoreHome && dbMatch.scoreAway === official.scoreAway) {
    console.log(`✅ ${official.date} - ${official.opponent.padEnd(20)} ${officialScore}`);
    correct++;
  } else {
    console.log(`❌ ${official.date} - ${official.opponent.padEnd(20)} БД: ${dbScore} | Сайт: ${officialScore}`);
    errors++;
  }
}

console.log('='.repeat(80));
console.log(`\n📊 Итого:`);
console.log(`  ✅ Правильных: ${correct}`);
console.log(`  ❌ Ошибок: ${errors}`);
console.log(`  📝 Всего проверено: ${officialMatches.length}`);

if (errors > 0) {
  console.log(`\n⚠️  Найдено ${errors} ошибок! Требуется исправление.`);
} else {
  console.log(`\n🎉 Все результаты совпадают!`);
}

await prisma.$disconnect();
