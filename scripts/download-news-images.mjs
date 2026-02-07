import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the news with full details
const newsPath = path.join(__dirname, '..', 'seed', 'news-2025-full.json');
const news = JSON.parse(fs.readFileSync(newsPath, 'utf-8'));

const outputDir = path.join(__dirname, '..', 'public', 'seed-assets', 'news');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`📥 Начинаем загрузку изображений для ${news.length} новостей...\n`);

let successCount = 0;
let errorCount = 0;
let skippedCount = 0;

const imageMapping = [];

for (let i = 0; i < news.length; i++) {
  const newsItem = news[i];
  
  if (!newsItem.coverImageUrl) {
    console.log(`⏭️  [${i + 1}/${news.length}] ${newsItem.slug} - нет изображения`);
    skippedCount++;
    continue;
  }
  
  try {
    // Generate filename from URL hash
    const hash = crypto.createHash('md5').update(newsItem.coverImageUrl).digest('hex');
    const ext = path.extname(newsItem.coverImageUrl.split('?')[0]) || '.jpg';
    const filename = `${newsItem.slug}-${hash.substring(0, 8)}${ext}`;
    const outputFile = path.join(outputDir, filename);
    
    // Skip if already downloaded
    if (fs.existsSync(outputFile)) {
      console.log(`⏭️  [${i + 1}/${news.length}] ${filename} уже загружен`);
      imageMapping.push({
        slug: newsItem.slug,
        originalUrl: newsItem.coverImageUrl,
        localPath: `/seed-assets/news/${filename}`
      });
      skippedCount++;
      continue;
    }
    
    console.log(`📄 [${i + 1}/${news.length}] Загружаем: ${newsItem.title.substring(0, 40)}...`);
    
    // Use wget to download
    const wgetPath = path.join(__dirname, '..', '..', 'wget_tool', 'wget.exe');
    execSync(`"${wgetPath}" -q -O "${outputFile}" "${newsItem.coverImageUrl}"`, {
      stdio: 'inherit',
      timeout: 30000
    });
    
    // Check if file was downloaded and has content
    if (fs.existsSync(outputFile) && fs.statSync(outputFile).size > 0) {
      console.log(`✅ [${i + 1}/${news.length}] Загружено: ${filename}`);
      imageMapping.push({
        slug: newsItem.slug,
        originalUrl: newsItem.coverImageUrl,
        localPath: `/seed-assets/news/${filename}`
      });
      successCount++;
    } else {
      console.log(`❌ [${i + 1}/${news.length}] Пустой файл: ${filename}`);
      if (fs.existsSync(outputFile)) {
        fs.unlinkSync(outputFile);
      }
      errorCount++;
    }
    
    // Small delay
    if (i < news.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  } catch (error) {
    console.error(`❌ [${i + 1}/${news.length}] Ошибка:`, error.message);
    errorCount++;
  }
}

console.log(`\n📊 Статистика:`);
console.log(`✅ Успешно загружено: ${successCount}`);
console.log(`⏭️  Пропущено: ${skippedCount}`);
console.log(`❌ Ошибок: ${errorCount}`);

// Save image mapping
const mappingPath = path.join(__dirname, '..', 'seed', 'news-images-mapping.json');
fs.writeFileSync(mappingPath, JSON.stringify(imageMapping, null, 2), 'utf-8');

console.log(`\n✅ Маппинг изображений сохранен в: ${mappingPath}`);
console.log(`\n✅ Этап 1.5 завершен! Изображения загружены в: ${outputDir}`);
