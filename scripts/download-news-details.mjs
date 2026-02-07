import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the news list
const newsListPath = path.join(__dirname, '..', 'seed', 'news-2025-list.json');
const newsList = JSON.parse(fs.readFileSync(newsListPath, 'utf-8'));

const outputDir = path.join(__dirname, '..', '..', 'wfccska.ru', 'novosti', 'details');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`📥 Начинаем загрузку ${newsList.length} детальных страниц новостей...\n`);

for (let i = 0; i < newsList.length; i++) {
  const newsItem = newsList[i];
  const newsId = newsItem.url.split('/').filter(Boolean).pop();
  const outputFile = path.join(outputDir, `${newsId}.html`);
  
  // Skip if already downloaded
  if (fs.existsSync(outputFile)) {
    console.log(`⏭️  [${i + 1}/${newsList.length}] ${newsId} уже загружен`);
    continue;
  }
  
  try {
    console.log(`📄 [${i + 1}/${newsList.length}] Загружаем: ${newsItem.title.substring(0, 50)}...`);
    
    // Use wget to download
    const wgetPath = path.join(__dirname, '..', '..', 'wget_tool', 'wget.exe');
    execSync(`"${wgetPath}" -q -O "${outputFile}" "${newsItem.url}"`, {
      stdio: 'inherit',
      timeout: 30000
    });
    
    console.log(`✅ [${i + 1}/${newsList.length}] Загружено: ${newsId}`);
    
    // Small delay to avoid overwhelming the server
    if (i < newsList.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.error(`❌ Ошибка при загрузке ${newsId}:`, error.message);
  }
}

console.log(`\n✅ Загрузка завершена! Все детальные страницы сохранены в: ${outputDir}`);
