#!/usr/bin/env node
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Список команд для поиска логотипов
const teams = [
  'Динамо', 'Енисей', 'ЖФК ЦСКА', 'Звезда-2005', 'Зенит', 'Краснодар',
  'Крылья Советов', 'Локомотив', 'Ростов', 'Рубин', 'Рязань-ВДВ',
  'Спартак', 'Чертаново', 'Лидар', 'Строгино', 'Кубаночка',
  'Торпедо Ижевск', 'Дончанка', 'Россиянка'
];

const teamLogos = {};

console.log('🌐 Запуск браузера...\n');

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

// Функция для скачивания изображения
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

// Проходим по сезонам
const seasons = ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016'];

for (const season of seasons) {
  console.log(`\n📅 Обработка сезона ${season}...`);
  
  await page.goto(`https://wfccska.ru/matches/spisok-matchej/?year=${season}`, {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  
  // Получаем ссылки на матчи
  const matchLinks = await page.$$eval('a[href*="/matches/spisok-matchej/"]', links => 
    links.map(link => link.href).filter(href => /\/\d+\/$/.test(href)).slice(0, 5)
  );
  
  console.log(`  Найдено ${matchLinks.length} матчей`);
  
  // Проверяем первые несколько матчей
  for (const matchUrl of matchLinks.slice(0, 3)) {
    try {
      await page.goto(matchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Извлекаем логотипы команд
      const logos = await page.$$eval('img[alt]', imgs => 
        imgs.filter(img => img.src.includes('upload/iblock'))
          .map(img => ({ alt: img.alt, src: img.src }))
      );
      
      for (const logo of logos) {
        if (teams.includes(logo.alt) && !teamLogos[logo.alt]) {
          teamLogos[logo.alt] = logo.src;
          console.log(`    ✅ ${logo.alt}: ${logo.src}`);
        }
      }
      
      // Если нашли все логотипы, выходим
      if (Object.keys(teamLogos).length === teams.length) {
        break;
      }
    } catch (error) {
      console.log(`    ⚠️  Ошибка при обработке ${matchUrl}: ${error.message}`);
    }
  }
  
  if (Object.keys(teamLogos).length === teams.length) {
    break;
  }
}

await browser.close();

console.log(`\n\n📊 Найдено логотипов: ${Object.keys(teamLogos).length} из ${teams.length}\n`);

// Сохраняем маппинг
const mappingPath = path.join(__dirname, '../seed/team-logos-urls.json');
fs.writeFileSync(mappingPath, JSON.stringify(teamLogos, null, 2), 'utf-8');
console.log(`✅ Маппинг сохранен в ${mappingPath}\n`);

// Скачиваем логотипы
console.log('📥 Скачивание логотипов...\n');

const outputDir = path.join(__dirname, '../public/seed-assets/team-logos-official');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

for (const [teamName, logoUrl] of Object.entries(teamLogos)) {
  try {
    const ext = path.extname(new URL(logoUrl).pathname) || '.png';
    const filename = `${teamName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}${ext}`;
    const filepath = path.join(outputDir, filename);
    
    await downloadImage(logoUrl, filepath);
    console.log(`  ✅ ${teamName} -> ${filename}`);
  } catch (error) {
    console.log(`  ❌ ${teamName}: ${error.message}`);
  }
}

console.log('\n✅ Готово!');
