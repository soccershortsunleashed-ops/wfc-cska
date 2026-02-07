#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
});
const prisma = new PrismaClient({ adapter });

// Маппинг команд на URL логотипов с официального сайта ЖФК ЦСКА
const teamLogosUrls = {
  'Чертаново': 'https://wfccska.ru/upload/iblock/275/lrdutcx0l2wa3lcmgykvkphw9cwj7843/CHERT_Symbol_.png',
  'Звезда-2005': 'https://wfccska.ru/upload/iblock/a0b/t1may0whct2i6et3ke7hz2n6ahtxjv1r/Zvezda_2005_logotip.png',
  // Добавим остальные команды после проверки
};

console.log('🔍 Получение списка всех команд из базы данных...\n');

// Получаем все уникальные команды
const teams = await prisma.standingsTeam.findMany({
  select: { teamName: true },
  distinct: ['teamName'],
  orderBy: { teamName: 'asc' }
});

console.log(`Найдено ${teams.length} уникальных команд:\n`);
teams.forEach(team => console.log(`  - ${team.teamName}`));

console.log('\n📝 Нужно найти логотипы для следующих команд на сайте wfccska.ru:');
console.log('   Перейдите на https://wfccska.ru/matches/spisok-matchej/');
console.log('   Выберите старые сезоны и откройте матчи с разными командами');
console.log('   Скопируйте URL логотипов из страниц матчей\n');

await prisma.$disconnect();
