#!/usr/bin/env node
import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";

const args = process.argv.slice(2);
const getArg = (name, fallback = null) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};

const ROOT = path.resolve(getArg("--root", "../wfccska.ru"));
const OUT_DIR = path.resolve(getArg("--out", "./seed"));

function readFileSafe(fp) {
  try {
    return fs.readFileSync(fp, "utf8");
  } catch {
    return null;
  }
}

function writeJson(fp, data) {
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

async function extractMatches() {
  const matchesDir = path.join(ROOT, "matches", "spisok-matchej");
  
  if (!fs.existsSync(matchesDir)) {
    console.log("[extract-matches] Matches directory not found");
    return { matches: [], assets: [] };
  }
  
  console.log(`[extract-matches] Found matches directory: ${matchesDir}`);
  
  const matchFolders = fs.readdirSync(matchesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort((a, b) => Number(b) - Number(a)); // Сортируем по убыванию (новые матчи первыми)
  
  console.log(`[extract-matches] Found ${matchFolders.length} match folders`);
  
  const matches = [];
  const assets = [];
  let processedCount = 0;
  const maxMatches = 150; // Увеличиваем для поиска предстоящих матчей
  
  for (const folderName of matchFolders) {
    if (processedCount >= maxMatches) break;
    
    const matchPath = path.join(matchesDir, folderName);
    const indexPath = path.join(matchPath, "index.html");
    
    if (!fs.existsSync(indexPath)) continue;
    
    const html = readFileSafe(indexPath);
    if (!html) continue;
    
    const $ = cheerio.load(html);
    
    // Извлекаем данные из title (формат: "ЖФК ЦСКА - Зенит, 01.08.2020, Чемпионат России")
    const titleText = normalizeSpace($('title').text());
    const titleMatch = titleText.match(/^ЖФК ЦСКА\s*-\s*(.+?),\s*(\d{2}\.\d{2}\.\d{4}),\s*(.+?)\s*—/);
    
    if (!titleMatch) {
      console.log(`[extract-matches] Skipping ${folderName}: cannot parse title "${titleText}"`);
      continue;
    }
    
    const opponentName = normalizeSpace(titleMatch[1]);
    const dateStr = titleMatch[2]; // DD.MM.YYYY
    const tournament = normalizeSpace(titleMatch[3]);
    
    // Извлекаем счет из header-main-content__score
    const scoreText = normalizeSpace($('.header-main-content__score-main-time').text());
    const scoreMatch = scoreText.match(/(\d+)\s*:\s*(\d+)/);
    
    // Определяем тип матча (завершенный или предстоящий)
    const hasScore = scoreMatch !== null;
    const type = hasScore ? "COMPLETED" : "UPCOMING";
    
    // Извлекаем логотип соперника (гостевая команда - справа)
    const opponentLogo = $('.header-main-content__guest-team-info').closest('.header-main-content__team-info-wrapper')
                          .find('.header-main-content__team-logo-wrapper img').attr('src') || '';
    
    // Извлекаем логотип ЦСКА (домашняя команда - слева)
    const cskaLogo = $('.header-main-content__host-team-info').closest('.header-main-content__team-info-wrapper')
                      .find('.header-main-content__team-logo-wrapper img').attr('src') || '';
    
    // Извлекаем место проведения (стадион)
    const stadiumName = normalizeSpace($('.header-main-content__stadium-name').text());
    const stadiumLocation = normalizeSpace($('.header-main-content__stadium-location').text());
    const venue = stadiumName ? `${stadiumName}, ${stadiumLocation}` : "Стадион ЦСКА";
    
    // Парсим дату (формат: DD.MM.YYYY)
    let matchDate = new Date().toISOString();
    const dateParts = dateStr.split('.');
    if (dateParts.length === 3) {
      const day = dateParts[0];
      const month = dateParts[1];
      const year = dateParts[2];
      matchDate = new Date(`${year}-${month}-${day}T14:00:00`).toISOString();
    }
    
    // Добавляем логотип в assets
    if (opponentLogo) {
      const logoUrl = absUrlMaybe(opponentLogo);
      if (logoUrl) {
        // Создаем slug из имени соперника (транслитерация для безопасных имен файлов)
        const translitMap = {
          'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
          'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
          'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
          'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        };
        
        const slug = opponentName.toLowerCase()
          .split('')
          .map(char => translitMap[char] || char)
          .join('')
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9\-]/g, '');
        
        assets.push({
          type: "opponentLogo",
          url: logoUrl,
          localPath: toLocalPathFromHref(opponentLogo),
          slug: slug
        });
      }
    }
    
    // Добавляем логотип ЦСКА в assets (только один раз)
    if (cskaLogo && processedCount === 0) {
      const logoUrl = absUrlMaybe(cskaLogo);
      if (logoUrl) {
        assets.push({
          type: "cskaLogo",
          url: logoUrl,
          localPath: toLocalPathFromHref(cskaLogo),
          slug: "cska"
        });
      }
    }
    
    // Создаем объект матча
    const match = {
      type,
      opponentName,
      opponentLogoUrl: absUrlMaybe(opponentLogo) || "",
      cskaLogoUrl: absUrlMaybe(cskaLogo) || "",
      matchDate,
      venue,
      tournament,
      scoreHome: hasScore ? Number(scoreMatch[1]) : null, // ЦСКА слева (первое число)
      scoreAway: hasScore ? Number(scoreMatch[2]) : null, // Соперник справа (второе число)
    };
    
    matches.push(match);
    processedCount++;
    
    if (hasScore) {
      console.log(`[extract-matches] ✅ Extracted completed match: ${opponentName} ${match.scoreAway}:${match.scoreHome} ЦСКА (${dateStr})`);
    } else {
      console.log(`[extract-matches] ✅ Extracted upcoming match: ${opponentName} vs ЦСКА (${dateStr})`);
    }
  }
  
  // Сортируем матчи по дате (новые первыми)
  matches.sort((a, b) => new Date(b.matchDate) - new Date(a.matchDate));
  
  // Берем последний завершенный и ближайший предстоящий для главной страницы
  const completedMatches = matches.filter(m => m.type === "COMPLETED");
  const upcomingMatches = matches.filter(m => m.type === "UPCOMING");
  
  const finalMatches = [];
  
  // Последний завершенный матч
  if (completedMatches.length > 0) {
    const lastMatch = { ...completedMatches[0], type: "LAST" };
    finalMatches.push(lastMatch);
  }
  
  // Ближайший предстоящий матч
  if (upcomingMatches.length > 0) {
    // Сортируем предстоящие по дате (ближайший первым)
    upcomingMatches.sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate));
    const nextMatch = { ...upcomingMatches[0], type: "UPCOMING" };
    finalMatches.push(nextMatch);
  }
  
  console.log(`[extract-matches] Total matches processed: ${processedCount}`);
  console.log(`[extract-matches] Completed matches: ${completedMatches.length}`);
  console.log(`[extract-matches] Upcoming matches: ${upcomingMatches.length}`);
  console.log(`[extract-matches] Selected for homepage: ${finalMatches.length}`);
  
  return { matches: finalMatches, assets };
}

async function main() {
  console.log("[extract-matches] ROOT:", ROOT);
  console.log("[extract-matches] OUT_DIR:", OUT_DIR);
  
  const { matches, assets } = await extractMatches();
  
  // Сохраняем результаты
  writeJson(path.join(OUT_DIR, "matches.json"), matches);
  writeJson(path.join(OUT_DIR, "matches-assets.json"), assets);
  
  console.log("[extract-matches] Done.");
  console.log(`Matches: ${matches.length}`);
  console.log(`Assets: ${assets.length}`);
}

main().catch((e) => {
  console.error("[extract-matches] ERROR:", e);
  process.exit(1);
});
