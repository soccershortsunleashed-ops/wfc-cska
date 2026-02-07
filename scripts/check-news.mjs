#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
});

const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const count = await prisma.news.count();
    console.log(`\n📰 Новости в базе данных: ${count}\n`);

    if (count > 0) {
      const latest = await prisma.news.findMany({
        orderBy: { publishedAt: 'desc' },
        take: 5,
        select: {
          title: true,
          publishedAt: true,
          category: true,
        },
      });

      console.log('Последние 5 новостей:');
      latest.forEach((news, i) => {
        console.log(`${i + 1}. ${news.title}`);
        console.log(`   ${news.publishedAt.toLocaleDateString('ru-RU')} - ${news.category}`);
      });
    }
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
