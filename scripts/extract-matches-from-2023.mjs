#!/usr/bin/env node
/**
 * Скрипт для извлечения всех матчей с 2023 года с официального сайта wfccska.ru
 * Использование: node extract-matches-from-2023.mjs
 */

import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";

const ROOT = path.resolve("../wfccska.ru");
const OUT_DIR = path.resolve("./seed");

function readFileSafe(fp) {
  try {
    return fs.readFileSync(fp, "utf8");
  } catch {
    return null;
  }
}

function writeJson(fp, data) {
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), "utf8");
}

function normalizeSpace(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

function absUrlMaybe(href) {
  if (!href) return "";
  if (href.startsWith("http")) return href;
  const clean = href.replace(/^(\.\.\/)+/, "");
  if (href.startsWith("/")) return href;
  return clean;
}

function toLocalPathFromHref(href) {
  if (!href) return "";
  const clean = href.replace(/^(\.\.\/)+/, "");
  const rel = clean.startsWith("/") ? clean.slice(1) : clean;
  return path.join(ROOT, rel);
}

// Транслитерация для создания slug
function transliterate(text) {
  const translitMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    ' ': '-', '.': '', ',': '', '!': '', '?': '', '"': '', "'": '', '(': '', ')': ''
  };
  
  return text.toLowerCase()
    .split('')
    .map(char => translitMap[char] || char)
    .join('')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-')
    .replace(/^\-|\-$/g, '');
}

// Создание slug для матча
function createMatchSlug(opponentName, dateStr) {
  const opponentSlug = transliterate(opponentName);
  const dateParts = dateStr.split('.');
  if (dateParts.length === 3) {
    const [day, month, year] = dateParts;
    return `${opponentSlug}-${year}-${month}-${day}`;
  }
  return opponentSlug;
}

// Парсинг даты из формата DD.MM.YYYY
function parseMatchDate(dateStr, timeStr = "14:00") {
  const dateParts = dateStr.split('.');
  if (dateParts.length === 3) {
    const [day, month, year] = dateParts;
    return new Date(`${year}-${month}-${day}T${timeStr}:00`).toISOString();
  }
  return new Date().toISOString();
}

// Определение статуса матча
function determineMatchStatus(hasScore, matchDate) {
  if (!hasScore) {
    const now = new Date();
    const matchDateTime = new Date(matchDate);
    return matchDateTime > now ? "SCHEDULED" : "FINISHED";
  }
  return "FINISHED";
}

async function extractMatches() {
  const matchesDir = path.join(ROOT, "matches", "spisok-matchej");
  
  if (!fs.existsSync(matchesDir)) {
    console.log("❌ Matches directory not found:", matchesDir);
    return { matches: [], assets: [] };
  }
  
  console.log("📂 Found matches directory:", matchesDir);
  
  const matchFolders = fs.readdirSync(matchesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort((a, b) => Number(b) - Number(a)); // Сортируем по убыванию (новые первыми)
  
  console.log(`📊 Found ${matchFolders.length} match folders`);
  
  const matches = [];
  const assets = [];
  const logoMap = new Map(); // Для отслеживания уникальных логотипов
  let processedCount = 0;
  let skippedCount = 0;
  
  for (const folderName of matchFolders) {
    const matchPath = path.join(matchesDir, folderName);
    const indexPath = path.join(matchPath, "index.html");
    
    if (!fs.existsSync(indexPath)) {
      skippedCount++;
      continue;
    }
    
    const html = readFileSafe(indexPath);
    if (!html) {
      skippedCount++;
      continue;
    }
    
    const $ = cheerio.load(html);
    
    // Извлекаем данные из title
    // Формат 1: "ЖФК ЦСКА - Зенит, 01.08.2020, Чемпионат России" (домашний)
    // Формат 2: "Зенит - ЖФК ЦСКА, 01.08.2020, Чемпионат России" (выездной)
    const titleText = normalizeSpace($('title').text());
    
    let opponentName, dateStr, tournament, isHome;
    
    // Пробуем домашний формат
    let titleMatch = titleText.match(/^ЖФК ЦСКА\s*-\s*(.+?),\s*(\d{2}\.\d{2}\.\d{4}),\s*(.+?)(?:\s*—|$)/);
    if (titleMatch) {
      opponentName = normalizeSpace(titleMatch[1]);
      dateStr = titleMatch[2];
      tournament = normalizeSpace(titleMatch[3]);
      isHome = true;
    } else {
      // Пробуем выездной формат
      titleMatch = titleText.match(/^(.+?)\s*-\s*ЖФК ЦСКА,\s*(\d{2}\.\d{2}\.\d{4}),\s*(.+?)(?:\s*—|$)/);
      if (titleMatch) {
        opponentName = normalizeSpace(titleMatch[1]);
        dateStr = titleMatch[2];
        tournament = normalizeSpace(titleMatch[3]);
        isHome = false;
      } else {
        console.log(`⚠️  Skipping ${folderName}: cannot parse title "${titleText}"`);
        skippedCount++;
        continue;
      }
    }
    
    // Извлекаем счет
    const scoreText = normalizeSpace($('.header-main-content__score-main-time').text());
    const scoreMatch = scoreText.match(/(\d+)\s*:\s*(\d+)/);
    const hasScore = scoreMatch !== null;
    
    // Извлекаем год из даты (для определения сезона)
    const year = parseInt(dateStr.split('.')[2]);
    
    // Извлекаем время матча (если есть)
    const timeText = normalizeSpace($('.header-main-content__date-time').text());
    const timeMatch = timeText.match(/(\d{2}):(\d{2})/);
    const matchTime = timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : "14:00";
    
    // Парсим дату
    const matchDate = parseMatchDate(dateStr, matchTime);
    
    // Определяем статус
    const status = determineMatchStatus(hasScore, matchDate);
    
    // Извлекаем логотипы
    // Находим все логотипы
    const $allLogos = $('.header-main-content__team-logo-wrapper img');
    
    let opponentLogo = '';
    let cskaLogo = '';
    
    // Проходим по всем логотипам и определяем по alt атрибуту
    $allLogos.each(function() {
      const alt = $(this).attr('alt') || '';
      const src = $(this).attr('src') || '';
      
      if (alt.includes('ЦСКА') || alt.includes('ЖФК ЦСКА')) {
        cskaLogo = src;
      } else if (alt && src) {
        // Это логотип соперника
        opponentLogo = src;
      }
    });
    
    // Если не нашли логотипы, пробуем альтернативный метод
    if (!opponentLogo || !cskaLogo) {
      const $logos = $('.header-main-content__team-logo-wrapper');
      
      $logos.each(function() {
        const $img = $(this).find('img');
        const alt = $img.attr('alt') || '';
        const src = $img.attr('src') || '';
        
        if (alt.includes('ЦСКА') || alt.includes('ЖФК ЦСКА')) {
          cskaLogo = src;
        } else if (alt.includes(opponentName)) {
          opponentLogo = src;
        }
      });
    }
    
    // Извлекаем место проведения
    const stadiumName = normalizeSpace($('.header-main-content__stadium-name').text());
    const stadiumLocation = normalizeSpace($('.header-main-content__stadium-location').text());
    const stadium = stadiumName || "Арена Химки";
    const venue = stadiumName && stadiumLocation ? `${stadiumName}, ${stadiumLocation}` : stadium;
    
    // Извлекаем тур (если есть)
    const roundText = normalizeSpace($('.header-main-content__round').text());
    const round = roundText || null;
    
    // Извлекаем посещаемость (если есть)
    const attendanceText = normalizeSpace($('.match-info__attendance').text());
    const attendanceMatch = attendanceText.match(/(\d+)/);
    const attendance = attendanceMatch ? parseInt(attendanceMatch[1]) : null;
    
    // Извлекаем судью (если есть)
    const referee = normalizeSpace($('.match-info__referee').text()) || null;
    
    // Создаем slug
    const slug = createMatchSlug(opponentName, dateStr);
    
    // Добавляем логотип соперника в assets
    if (opponentLogo) {
      const opponentSlug = transliterate(opponentName);
      if (!logoMap.has(opponentSlug)) {
        logoMap.set(opponentSlug, true);
        assets.push({
          type: "opponentLogo",
          url: absUrlMaybe(opponentLogo),
          localPath: toLocalPathFromHref(opponentLogo),
          slug: opponentSlug
        });
      }
    }
    
    // Добавляем логотип ЦСКА (только один раз)
    if (cskaLogo && !logoMap.has('cska')) {
      logoMap.set('cska', true);
      assets.push({
        type: "cskaLogo",
        url: absUrlMaybe(cskaLogo),
        localPath: toLocalPathFromHref(cskaLogo),
        slug: "cska"
      });
    }
    
    // Определяем сезон
    const month = parseInt(dateStr.split('.')[1]);
    const season = month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
    
    // Определяем счет в зависимости от того, домашний или выездной матч
    let scoreHome = null;
    let scoreAway = null;
    
    if (hasScore) {
      const score1 = parseInt(scoreMatch[1]); // Первая команда в заголовке
      const score2 = parseInt(scoreMatch[2]); // Вторая команда в заголовке
      
      if (isHome) {
        // Домашний матч: "ЖФК ЦСКА - Соперник" => ЦСКА слева
        scoreHome = score1; // Счет ЦСКА
        scoreAway = score2; // Счет соперника
      } else {
        // Выездной матч: "Соперник - ЖФК ЦСКА" => ЦСКА справа
        scoreHome = score2; // Счет ЦСКА
        scoreAway = score1; // Счет соперника
      }
    }
    
    // Создаем объект матча
    const match = {
      slug,
      status,
      opponentName,
      opponentLogoUrl: absUrlMaybe(opponentLogo) || "",
      cskaLogoUrl: absUrlMaybe(cskaLogo) || "",
      isHome,
      matchDate,
      venue,
      stadium,
      tournament,
      season,
      round,
      scoreHome,
      scoreAway,
      attendance,
      referee,
      highlights: null,
      description: null
    };
    
    matches.push(match);
    processedCount++;
    
    const statusEmoji = status === "FINISHED" ? "✅" : "📅";
    const scoreInfo = hasScore ? `${match.scoreHome}:${match.scoreAway}` : "—:—";
    console.log(`${statusEmoji} ${opponentName} ${scoreInfo} (${dateStr}, ${season})`);
  }
  
  // Сортируем матчи по дате (новые первыми)
  matches.sort((a, b) => new Date(b.matchDate) - new Date(a.matchDate));
  
  console.log("\n📊 Статистика:");
  console.log(`   Обработано: ${processedCount}`);
  console.log(`   Пропущено: ${skippedCount}`);
  console.log(`   Логотипов: ${assets.length}`);
  
  // Группируем по сезонам
  const bySeason = {};
  matches.forEach(m => {
    if (!bySeason[m.season]) bySeason[m.season] = 0;
    bySeason[m.season]++;
  });
  
  console.log("\n📅 По сезонам:");
  Object.keys(bySeason).sort().forEach(season => {
    console.log(`   ${season}: ${bySeason[season]} матчей`);
  });
  
  return { matches, assets };
}

async function main() {
  console.log("🚀 Начинаем извлечение матчей с 2023 года...\n");
  console.log("📂 ROOT:", ROOT);
  console.log("📂 OUT_DIR:", OUT_DIR);
  console.log("");
  
  const { matches, assets } = await extractMatches();
  
  // Сохраняем результаты
  const matchesPath = path.join(OUT_DIR, "matches-full.json");
  const assetsPath = path.join(OUT_DIR, "matches-assets.json");
  
  writeJson(matchesPath, matches);
  writeJson(assetsPath, assets);
  
  console.log("\n✅ Готово!");
  console.log(`📄 Матчи сохранены: ${matchesPath}`);
  console.log(`🖼️  Ассеты сохранены: ${assetsPath}`);
}

main().catch((e) => {
  console.error("\n❌ ОШИБКА:", e);
  process.exit(1);
});
