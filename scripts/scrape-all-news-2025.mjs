import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const newsDir = path.join(__dirname, '..', '..', 'wfccska.ru', 'novosti', 'vse-novosti');
const totalPages = 73;

console.log(`📰 Начинаем парсинг ${totalPages} страниц новостей...\n`);

const allNews = [];

function parseNewsFromHtml(html, pageNum) {
  const $ = cheerio.load(html);
  const news = [];

  // Parse featured news (big news)
  $('.blog-top .news-big').each((i, elem) => {
    const $elem = $(elem);
    const url = $elem.attr('href');
    const title = $elem.find('.news-big__title').text().trim();
    const date = $elem.closest('.col-md-8').find('.date').first().text().trim();
    const bgImage = $elem.attr('style')?.match(/url\(([^)]+)\)/)?.[1];
    
    if (url && title) {
      news.push({
        url: `https://wfccska.ru${url}`,
        title,
        date,
        imageUrl: bgImage ? `https://wfccska.ru${bgImage}` : null,
        type: 'featured',
        page: pageNum
      });
    }
  });

  // Parse column news
  $('.blog-top .news-col').each((i, elem) => {
    const $elem = $(elem);
    const url = $elem.find('a').first().attr('href');
    const title = $elem.find('.news-col__title').text().trim();
    const date = $elem.closest('.col-md-4').find('.date').first().text().trim();
    const imageUrl = $elem.find('.news-col__img').attr('src');
    
    if (url && title) {
      news.push({
        url: `https://wfccska.ru${url}`,
        title,
        date,
        imageUrl: imageUrl ? `https://wfccska.ru${imageUrl}` : null,
        type: 'column',
        page: pageNum
      });
    }
  });

  // Parse blog list news
  $('.blog-list .blog-row').each((i, elem) => {
    const $elem = $(elem);
    const url = $elem.find('.blog-row__title').attr('href');
    const title = $elem.find('.blog-row__title').text().trim();
    const date = $elem.find('.date').text().trim();
    const imageUrl = $elem.find('.blog-row__img').attr('src');
    
    if (url && title) {
      news.push({
        url: `https://wfccska.ru${url}`,
        title,
        date,
        imageUrl: imageUrl ? `https://wfccska.ru${imageUrl}` : null,
        type: 'list',
        page: pageNum
      });
    }
  });

  return news;
}

// Parse all pages
for (let page = 1; page <= totalPages; page++) {
  const filename = page === 1 ? 'index.html' : `page${page}.html`;
  const filepath = path.join(newsDir, filename);
  
  if (!fs.existsSync(filepath)) {
    console.log(`⚠️  Страница ${page} не найдена: ${filename}`);
    continue;
  }
  
  try {
    const html = fs.readFileSync(filepath, 'utf-8');
    const news = parseNewsFromHtml(html, page);
    allNews.push(...news);
    console.log(`✅ Страница ${page}/${totalPages}: найдено ${news.length} новостей`);
  } catch (error) {
    console.error(`❌ Ошибка при парсинге страницы ${page}:`, error.message);
  }
}

console.log(`\n📊 Всего найдено новостей: ${allNews.length}`);

// Filter for 2025 year
const news2025 = allNews.filter(item => {
  if (!item.date) return false;
  const parts = item.date.split('.');
  if (parts.length !== 3) return false;
  const year = parseInt(parts[2]);
  return year === 2025;
});

console.log(`📅 Новостей за 2025 год: ${news2025.length}`);

// Remove duplicates by URL
const uniqueNews = [];
const seenUrls = new Set();

for (const item of news2025) {
  if (!seenUrls.has(item.url)) {
    seenUrls.add(item.url);
    uniqueNews.push(item);
  }
}

console.log(`🔄 Уникальных новостей за 2025 год: ${uniqueNews.length}`);

// Sort by date (newest first)
uniqueNews.sort((a, b) => {
  const dateA = a.date.split('.').reverse().join('-');
  const dateB = b.date.split('.').reverse().join('-');
  return dateB.localeCompare(dateA);
});

// Save to JSON
const outputPath = path.join(__dirname, '..', 'seed', 'news-2025-list.json');
fs.writeFileSync(outputPath, JSON.stringify(uniqueNews, null, 2), 'utf-8');

console.log(`\n✅ Сохранено в: ${outputPath}`);
console.log(`\n📋 Первые 5 новостей:`);
uniqueNews.slice(0, 5).forEach((item, i) => {
  console.log(`\n${i + 1}. ${item.title}`);
  console.log(`   Дата: ${item.date}`);
  console.log(`   URL: ${item.url}`);
});

console.log(`\n✅ Этап 1.3 завершен! Список всех новостей за 2025 год готов.`);
console.log(`\n📝 Следующий шаг: Скачать детальную информацию для каждой новости`);
