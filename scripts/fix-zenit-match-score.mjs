#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
});
const prisma = new PrismaClient({ adapter });

console.log('🔧 Исправление счета матча Зенит - ЦСКА (08.11.2025)...\n');

// Находим матч
const match = await prisma.match.findFirst({
  where: {
    opponentName: 'Зенит',
    matchDate: {
      gte: new Date('2025-11-08T00:00:00'),
      lt: new Date('2025-11-09T00:00:00')
    }
  }
});

if (!match) {
  console.log('❌ Матч не найден!');
  await prisma.$disconnect();
  process.exit(1);
}

console.log('Найден матч:');
console.log(`  Дата: ${match.matchDate.toLocaleDateString('ru-RU')}`);
console.log(`  Соперник: ${match.opponentName}`);
console.log(`  Текущий счет: ${match.scoreHome} : ${match.scoreAway}`);
console.log(`  ❌ НЕПРАВИЛЬНО - показывает, что Зенит победил\n`);

// Исправляем счет
// Правильный счет: Зенит 0 : 1 ЦСКА (ЦСКА победил в гостях)
await prisma.match.update({
  where: { id: match.id },
  data: {
    scoreHome: 0,  // Зенит (хозяева)
    scoreAway: 1   // ЦСКА (гости)
  }
});

console.log('✅ Счет исправлен!');
console.log(`  Правильный счет: 0 : 1`);
console.log(`  Зенит 0 : 1 ЖФК ЦСКА (ЦСКА победил в гостях)\n`);

// Проверяем
const updated = await prisma.match.findUnique({
  where: { id: match.id }
});

console.log('Проверка:');
console.log(`  ${updated.opponentName}: ${updated.scoreHome} : ${updated.scoreAway} ✅`);

await prisma.$disconnect();
