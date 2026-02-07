import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = 'https://wfccska.ru/novosti/vse-novosti/';
const outputDir = path.join(__dirname, '..', '..', 'wfccska.ru', 'novosti', 'vse-novosti');
const totalPages = 73;

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`📥 Начинаем загрузку ${totalPages} страниц новостей...\n`);

for (let page = 1; page <= totalPages; page++) {
  const url = page === 1 ? baseUrl : `${baseUrl}?PAGEN_1=${page}`;
  const outputFile = path.join(outputDir, page === 1 ? 'index.html' : `page${page}.html`);
  
  // Skip if already downloaded
  if (fs.existsSync(outputFile)) {
    console.log(`⏭️  Страница ${page}/${totalPages} уже загружена`);
    continue;
  }
  
  try {
    console.log(`📄 Загружаем страницу ${page}/${totalPages}...`);
    
    // Use wget to download
    const wgetPath = path.join(__dirname, '..', '..', 'wget_tool', 'wget.exe');
    execSync(`"${wgetPath}" -q -O "${outputFile}" "${url}"`, {
      stdio: 'inherit'
    });
    
    console.log(`✅ Страница ${page}/${totalPages} загружена`);
    
    // Small delay to avoid overwhelming the server
    if (page < totalPages) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.error(`❌ Ошибка при загрузке страницы ${page}:`, error.message);
  }
}

console.log(`\n✅ Загрузка завершена! Все страницы сохранены в: ${outputDir}`);
