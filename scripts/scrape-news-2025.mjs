import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the downloaded HTML file
const htmlPath = path.join(__dirname, '..', '..', 'wfccska.ru', 'novosti', 'vse-novosti', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

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
      type: 'featured'
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
      type: 'column'
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
      type: 'list'
    });
  }
});

// Filter for 2025 year
const news2025 = news.filter(item => {
  if (!item.date) return false;
  const parts = item.date.split('.');
  if (parts.length !== 3) return false;
  const year = parseInt(parts[2]);
  return year === 2025;
});

console.log(`\n📰 Найдено новостей на странице: ${news.length}`);
console.log(`📅 Новостей за 2025 год: ${news2025.length}`);

// Save to JSON
const outputPath = path.join(__dirname, '..', 'seed', 'news-scraped-page1.json');
fs.writeFileSync(outputPath, JSON.stringify(news2025, null, 2), 'utf-8');

console.log(`\n✅ Сохранено в: ${outputPath}`);
console.log(`\n📋 Примеры новостей:`);
news2025.slice(0, 3).forEach((item, i) => {
  console.log(`\n${i + 1}. ${item.title}`);
  console.log(`   Дата: ${item.date}`);
  console.log(`   URL: ${item.url}`);
});

console.log(`\n⚠️  Примечание: Это только первая страница. Нужно проверить пагинацию для получения всех новостей.`);
