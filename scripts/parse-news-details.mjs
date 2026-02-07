import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the news list
const newsListPath = path.join(__dirname, '..', 'seed', 'news-2025-list.json');
const newsList = JSON.parse(fs.readFileSync(newsListPath, 'utf-8'));

const detailsDir = path.join(__dirname, '..', '..', 'wfccska.ru', 'novosti', 'details');

console.log(`📰 Начинаем парсинг детальной информации для ${newsList.length} новостей...\n`);

const newsWithDetails = [];
let successCount = 0;
let errorCount = 0;

for (let i = 0; i < newsList.length; i++) {
  const newsItem = newsList[i];
  const newsId = newsItem.url.split('/').filter(Boolean).pop();
  const detailFile = path.join(detailsDir, `${newsId}.html`);
  
  if (!fs.existsSync(detailFile)) {
    console.log(`⏭️  [${i + 1}/${newsList.length}] ${newsId} - файл не найден, пропускаем`);
    errorCount++;
    continue;
  }
  
  try {
    const html = fs.readFileSync(detailFile, 'utf-8');
    const $ = cheerio.load(html);
    
    // Extract slug from URL
    const slug = newsId;
    
    // Extract title
    const title = $('.article__title').text().trim() || newsItem.title;
    
    // Extract date
    const dateText = $('.article__date').text().trim() || newsItem.date;
    
    // Extract cover image
    let coverImage = $('.article__img img').attr('src');
    if (coverImage && !coverImage.startsWith('http')) {
      coverImage = `https://wfccska.ru${coverImage}`;
    }
    if (!coverImage) {
      coverImage = newsItem.imageUrl;
    }
    
    // Extract content
    const contentHtml = $('.article__text').html() || '';
    
    // Extract excerpt (first paragraph or first 200 chars)
    let excerpt = $('.article__text p').first().text().trim();
    if (!excerpt) {
      excerpt = $('.article__text').text().trim().substring(0, 200) + '...';
    }
    
    // Extract category from URL
    const urlParts = newsItem.url.split('/');
    const categoryIndex = urlParts.indexOf('vse-novosti') + 1;
    const category = categoryIndex < urlParts.length ? urlParts[categoryIndex] : 'novosti';
    
    // Parse date to ISO format
    let publishedAt = null;
    if (dateText) {
      const dateParts = dateText.split('.');
      if (dateParts.length === 3) {
        const [day, month, year] = dateParts;
        publishedAt = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T12:00:00.000Z`;
      }
    }
    
    newsWithDetails.push({
      slug,
      title,
      excerpt,
      content: contentHtml,
      coverImageUrl: coverImage,
      publishedAt,
      category,
      originalUrl: newsItem.url,
      type: newsItem.type
    });
    
    successCount++;
    console.log(`✅ [${i + 1}/${newsList.length}] ${slug}`);
    
  } catch (error) {
    console.error(`❌ [${i + 1}/${newsList.length}] Ошибка при парсинге ${newsId}:`, error.message);
    errorCount++;
  }
}

console.log(`\n📊 Статистика:`);
console.log(`✅ Успешно обработано: ${successCount}`);
console.log(`❌ Ошибок: ${errorCount}`);
console.log(`📝 Всего новостей: ${newsWithDetails.length}`);

// Save to JSON
const outputPath = path.join(__dirname, '..', 'seed', 'news-2025-full.json');
fs.writeFileSync(outputPath, JSON.stringify(newsWithDetails, null, 2), 'utf-8');

console.log(`\n✅ Сохранено в: ${outputPath}`);
console.log(`\n📋 Пример первой новости:`);
if (newsWithDetails.length > 0) {
  const first = newsWithDetails[0];
  console.log(`\nЗаголовок: ${first.title}`);
  console.log(`Slug: ${first.slug}`);
  console.log(`Дата: ${first.publishedAt}`);
  console.log(`Категория: ${first.category}`);
  console.log(`Анонс: ${first.excerpt.substring(0, 100)}...`);
}

console.log(`\n✅ Этап 1.4 завершен! Детальная информация всех новостей готова.`);
console.log(`\n📝 Следующий шаг: Скачать все изображения локально`);
