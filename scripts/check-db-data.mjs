#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('📊 ПРОВЕРКА ДАННЫХ В БАЗЕ');
  console.log('='.repeat(60));
  
  // Игроки
  console.log('\n👥 ИГРОКИ:');
  const playersByTeam = await prisma.player.groupBy({
    by: ['team'],
    _count: true
  });
  playersByTeam.forEach(group => {
    console.log(`  ${group.team}: ${group._count} игроков`);
  });
  const totalPlayers = await prisma.player.count();
  console.log(`  ВСЕГО: ${totalPlayers} игроков`);
  
  // Новости
  console.log('\n📰 НОВОСТИ:');
  const totalNews = await prisma.news.count();
  console.log(`  Всего новостей: ${totalNews}`);
  
  const latestNews = await prisma.news.findMany({
    take: 3,
    orderBy: { publishedAt: 'desc' },
    select: { title: true, publishedAt: true }
  });
  console.log('  Последние 3 новости:');
  latestNews.forEach((news, i) => {
    const date = news.publishedAt.toLocaleDateString('ru-RU');
    console.log(`    ${i + 1}. ${news.title} (${date})`);
  });
  
  // Матчи
  console.log('\n⚽ МАТЧИ:');
  const matchesByType = await prisma.match.groupBy({
    by: ['type'],
    _count: true
  });
  matchesByType.forEach(group => {
    console.log(`  ${group.type}: ${group._count} матчей`);
  });
  const totalMatches = await prisma.match.count();
  console.log(`  ВСЕГО: ${totalMatches} матчей`);
  
  // Турнирные таблицы
  console.log('\n📊 ТУРНИРНЫЕ ТАБЛИЦЫ:');
  const standingsBySeason = await prisma.standingsTeam.groupBy({
    by: ['season'],
    _count: true,
    orderBy: { season: 'desc' }
  });
  console.log('  По сезонам:');
  standingsBySeason.forEach(group => {
    console.log(`    ${group.season}: ${group._count} команд`);
  });
  const totalStandings = await prisma.standingsTeam.count();
  console.log(`  ВСЕГО: ${totalStandings} записей`);
  
  // Проверка логотипов команд
  console.log('\n🎨 ЛОГОТИПЫ КОМАНД:');
  const teamsWithLogos = await prisma.standingsTeam.findMany({
    where: { teamLogoUrl: { not: null } },
    distinct: ['teamName'],
    select: { teamName: true, teamLogoUrl: true }
  });
  console.log(`  Команд с логотипами: ${teamsWithLogos.length}`);
  
  const teamsWithoutLogos = await prisma.standingsTeam.findMany({
    where: { teamLogoUrl: null },
    distinct: ['teamName'],
    select: { teamName: true }
  });
  if (teamsWithoutLogos.length > 0) {
    console.log(`  ⚠️  Команды БЕЗ логотипов (${teamsWithoutLogos.length}):`);
    teamsWithoutLogos.forEach(team => {
      console.log(`    - ${team.teamName}`);
    });
  }
  
  // Тренерский штаб
  console.log('\n👔 ТРЕНЕРСКИЙ ШТАБ:');
  try {
    const coachingByTeam = await prisma.coachingStaff.groupBy({
      by: ['team'],
      _count: true
    });
    coachingByTeam.forEach(group => {
      console.log(`  ${group.team}: ${group._count} человек`);
    });
    const totalCoaching = await prisma.coachingStaff.count();
    console.log(`  ВСЕГО: ${totalCoaching} человек`);
  } catch (e) {
    console.log('  ⚠️  Таблица не найдена или пуста');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Проверка завершена');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
