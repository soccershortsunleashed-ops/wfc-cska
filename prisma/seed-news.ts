import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import fs from 'fs';
import path from 'path';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Начинаем загрузку новостей в базу данных...\n');

  // Read news data
  const newsPath = path.join(process.cwd(), 'seed', 'news-2025-full.json');
  const newsData = JSON.parse(fs.readFileSync(newsPath, 'utf-8'));

  // Read image mapping
  const mappingPath = path.join(process.cwd(), 'seed', 'news-images-mapping.json');
  let imageMapping: Record<string, string> = {};
  
  if (fs.existsSync(mappingPath)) {
    const mappingData = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
    imageMapping = mappingData.reduce((acc: Record<string, string>, item: any) => {
      acc[item.slug] = item.localPath;
      return acc;
    }, {});
  }

  console.log(`📰 Найдено ${newsData.length} новостей для загрузки`);
  console.log(`🖼️  Найдено ${Object.keys(imageMapping).length} изображений\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const newsItem of newsData) {
    try {
      // Use local image if available, otherwise use original URL
      const coverImageUrl = imageMapping[newsItem.slug] || newsItem.coverImageUrl;

      await prisma.news.upsert({
        where: { slug: newsItem.slug },
        update: {
          title: newsItem.title,
          excerpt: newsItem.excerpt,
          content: newsItem.content,
          coverImageUrl,
          publishedAt: new Date(newsItem.publishedAt),
          category: newsItem.category,
          originalUrl: newsItem.originalUrl,
          type: newsItem.type,
        },
        create: {
          slug: newsItem.slug,
          title: newsItem.title,
          excerpt: newsItem.excerpt,
          content: newsItem.content,
          coverImageUrl,
          publishedAt: new Date(newsItem.publishedAt),
          category: newsItem.category,
          originalUrl: newsItem.originalUrl,
          type: newsItem.type,
        },
      });

      successCount++;
      console.log(`✅ [${successCount}/${newsData.length}] ${newsItem.title.substring(0, 50)}...`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Ошибка при загрузке ${newsItem.slug}:`, error);
    }
  }

  console.log(`\n📊 Статистика:`);
  console.log(`✅ Успешно загружено: ${successCount}`);
  console.log(`❌ Ошибок: ${errorCount}`);

  // Verify
  const totalNews = await prisma.news.count();
  console.log(`\n📰 Всего новостей в базе данных: ${totalNews}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
