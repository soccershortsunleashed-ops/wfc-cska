#!/usr/bin/env node

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function updateFirstNews() {
  try {
    console.log('🔄 Обновление первой новости...\n');

    // Проверяем наличие изображения
    const imagePath = join(__dirname, '../public/seed-assets/featured-news-bridge-cska.jpg');
    const imageExists = existsSync(imagePath);

    if (!imageExists) {
      console.log('⚠️  Изображение не найдено!');
      console.log('📁 Ожидаемый путь:', imagePath);
      process.exit(1);
    }

    console.log('✅ Изображение найдено!');

    // Подключаемся к базе данных
    const dbPath = join(__dirname, '../dev.db');
    const db = new Database(dbPath);

    // Получаем первую новость (самую свежую)
    const firstNews = db.prepare('SELECT * FROM News ORDER BY publishedAt DESC LIMIT 1').get();

    if (!firstNews) {
      console.log('❌ Новости не найдены в базе данных');
      process.exit(1);
    }

    console.log('📰 Найдена новость:', firstNews.title);
    console.log('🆔 ID:', firstNews.id);

    // Обновляем первую новость (только изображение и дату)
    const stmt = db.prepare(`
      UPDATE News 
      SET coverImageUrl = ?, 
          updatedAt = ?
      WHERE id = ?
    `);

    const newsData = {
      coverImageUrl: '/seed-assets/featured-news-bridge-cska.jpg',
      updatedAt: new Date().toISOString(),
    };

    stmt.run(
      newsData.coverImageUrl,
      newsData.updatedAt,
      firstNews.id
    );

    console.log('\n✅ Изображение первой новости обновлено!');
    console.log('🖼️  Новое изображение:', newsData.coverImageUrl);
    console.log('\n🎉 Готово! Обновите страницу (Ctrl+F5), чтобы увидеть изменения.');
    console.log('🌐 http://localhost:3000\n');

    db.close();

  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

updateFirstNews();
