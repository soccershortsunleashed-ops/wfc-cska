#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
});
const prisma = new PrismaClient({ adapter });

console.log('🔧 Исправление неправильных логотипов...\n');

// Исправляем Торпедо Ижевск
const torpedoUpdated = await prisma.standingsTeam.updateMany({
  where: {
    teamName: 'Торпедо Ижевск'
  },
  data: {
    teamLogoUrl: '/seed-assets/opponentLogo-torpedo-izhevsk.png'
  }
});

console.log(`✅ Торпедо Ижевск: обновлено ${torpedoUpdated.count} записей`);

// Исправляем Кубаночка
const kubanochkaUpdated = await prisma.standingsTeam.updateMany({
  where: {
    teamName: 'Кубаночка'
  },
  data: {
    teamLogoUrl: '/seed-assets/opponentLogo-kubanochka.png'
  }
});

console.log(`✅ Кубаночка: обновлено ${kubanochkaUpdated.count} записей`);

// Проверяем результат
console.log('\n🔍 Проверка исправленных логотипов:\n');

const torpedo = await prisma.standingsTeam.findFirst({
  where: { teamName: 'Торпедо Ижевск' },
  select: { teamName: true, teamLogoUrl: true, season: true }
});

const kubanochka = await prisma.standingsTeam.findFirst({
  where: { teamName: 'Кубаночка' },
  select: { teamName: true, teamLogoUrl: true, season: true }
});

console.log(`Торпедо Ижевск (${torpedo?.season}): ${torpedo?.teamLogoUrl}`);
console.log(`Кубаночка (${kubanochka?.season}): ${kubanochka?.teamLogoUrl}`);

await prisma.$disconnect();
console.log('\n✅ Готово!');
