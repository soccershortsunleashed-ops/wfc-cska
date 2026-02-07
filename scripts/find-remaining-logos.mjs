#!/usr/bin/env node
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Команды, для которых нужно найти логотипы
const missingTeams = [
  'Динамо', 'Енисей', 'Краснодар', 'Крылья Советов', 'Локомотив',
  'Ростов', 'Рубин', 'Рязань-ВДВ', 'Лидар', 'Строгино',
  'Кубаночка', 'Торпедо Ижевск', 'Дончанка'
];

const teamLogos = {};

console.log('🌐 Запуск браузера...\n');

const browser = await puppeteer.launch({ headless: false }); // Видимый режим для отладки
const page = await browser.newPage();

// Проходим по сезонам в обратном порядке (старые сезоны)
const seasons = ['2019', '2018', '2017', '2016', '2020', '2021', '2022', '2023', '2024'];

for (const season of seasons) {
  console.log(`\n📅 Обработка сезона ${season}...`);
  
  await page.goto(`https://wfccska.ru/matches/spisok-matchej/?year=${season}`, {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  
  // Получаем ссылки на матчи
  const matchLinks = await page.$$eval('a[href*="/matches/spisok-matchej/"]', links => 
    links.map(link => link.href).filter(href => /\/\d+\/$/.test(href))
  );
  
  console.log(`  Найдено ${matchLinks.length} матчей`);
  
  // Проверяем все матчи
  for (const matchUrl of matchLinks) {
    try {
      await page.goto(matchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Извлекаем логотипы команд
      const logos = await page.$$eval('img[alt]', imgs => 
        imgs.filter(img => img.src.includes('upload/iblock'))
          .map(img => ({ alt: img.alt, src: img.src }))
      );
      
      for (const logo of logos) {
        if (missingTeams.includes(logo.alt) && !teamLogos[logo.alt]) {
          teamLogos[logo.alt] = logo.src;
          console.log(`    ✅ ${logo.alt}: ${logo.src}`);
          
          // Удаляем найденную команду из списка
          const index = missingTeams.indexOf(logo.alt);
          if (index > -1) {
            missingTeams.splice(index, 1);
          }
        }
      }
      
      // Если нашли все логотипы, выходим
      if (missingTeams.length === 0) {
        console.log('\n✅ Все логотипы найдены!');
        break;
      }
    } catch (error) {
      console.log(`    ⚠️  Ошибка: ${error.message}`);
    }
  }
  
  if (missingTeams.length === 0) {
    break;
  }
}

await browser.close();

console.log(`\n\n📊 Найдено логотипов: ${Object.keys(teamLogos).length}`);
console.log(`❌ Не найдено: ${missingTeams.length} - ${missingTeams.join(', ')}\n`);

// Сохраняем маппинг
const existingPath = path.join(__dirname, '../seed/team-logos-urls.json');
const existing = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));
const merged = { ...existing, ...teamLogos };

fs.writeFileSync(existingPath, JSON.stringify(merged, null, 2), 'utf-8');
console.log(`✅ Маппинг обновлен в ${existingPath}\n`);
