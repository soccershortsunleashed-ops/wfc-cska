#!/usr/bin/env node
import fs from "fs";
import path from "path";
import fg from "fast-glob";
import * as cheerio from "cheerio";

const args = process.argv.slice(2);
const getArg = (name, fallback = null) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};

const ROOT = path.resolve(getArg("--root", "../wfccska.ru"));
const OUT_DIR = path.resolve(getArg("--out", "./seed"));
const SITE_HOST_PREFIX = getArg("--hostPrefix", "");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

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

function toSlug(s) {
  const base = normalizeSpace(s)
    .toLowerCase()
    .replace(/ё/g, "e")
    .replace(/[^a-z0-9а-я\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || `item-${Math.random().toString(16).slice(2)}`;
}

function absUrlMaybe(href) {
  if (!href) return "";
  if (href.startsWith("http")) return href;
  // Убираем относительные пути типа ../../../
  const clean = href.replace(/^(\.\.\/)+/, "");
  if (href.startsWith("/")) return SITE_HOST_PREFIX ? `${SITE_HOST_PREFIX}${href}` : href;
  return clean;
}

function toLocalPathFromHref(href) {
  if (!href) return "";
  // Убираем относительные пути типа ../../../
  const clean = href.replace(/^(\.\.\/)+/, "");
  const rel = clean.startsWith("/") ? clean.slice(1) : clean;
  return path.join(ROOT, rel);
}

function collectImage($el) {
  const img = $el.find("img").first();
  let src = img.attr("src") || img.attr("data-src") || "";
  if (!src) {
    const source = $el.find("source").first();
    src = source.attr("srcset") || "";
    if (src.includes(" ")) src = src.split(" ")[0];
  }
  if (!src) {
    const style = $el.attr("style") || "";
    const m = style.match(/background-image:\s*url\(([^)]+)\)/i);
    if (m) src = m[1].replace(/['"]/g, "");
  }
  return src;
}

function tryLoadExistingPlayersJson() {
  const candidates = [
    path.resolve("../players-data.json"),
    path.resolve("./players-data.json"),
    path.resolve("../../players-data.json"),
    path.resolve(path.dirname(ROOT), "../players-data.json"),
    path.resolve("../redesign/players-data.json"),
  ];

  console.log("[extract-seed] Looking for players-data.json in:");
  candidates.forEach(fp => console.log(`  - ${fp}`));

  for (const fp of candidates) {
    if (fs.existsSync(fp)) {
      console.log(`[extract-seed] ✅ Found: ${fp}`);
      try {
        const raw = JSON.parse(fs.readFileSync(fp, "utf8"));
        if (Array.isArray(raw) && raw.length) return raw;
        if (raw && Array.isArray(raw.players)) return raw.players;
      } catch (e) {
        console.warn(`[extract-seed] Failed to parse ${fp}:`, e);
      }
    }
  }
  console.log("[extract-seed] ❌ players-data.json not found");
  return null;
}

function normalizePlayerFromAny(p) {
  const fullName = normalizeSpace(p.fullName || p.name || `${p.lastName || ""} ${p.firstName || ""}`);
  const slug = p.slug || toSlug(fullName);
  
  // Извлекаем имя и фамилию
  const nameParts = fullName.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  
  return {
    slug,
    firstName,
    lastName,
    number: Number(p.number ?? p.num ?? 0) || 0,
    position: normalizeSpace(p.position || p.role || p.amplua || "MIDFIELDER"),
    birthDate: normalizeSpace(p.birthDate || p.dob || p.birthday || "2000-01-01"),
    nationality: normalizeSpace(p.nationality || p.country || "Россия"),
    heightCm: p.heightCm != null ? Number(p.heightCm) : (p.height ? Number(p.height) : 170),
    weightKg: p.weightKg != null ? Number(p.weightKg) : (p.weight ? Number(p.weight) : 65),
    photoUrl: p.photoUrl || p.photo || p.img || "",
    team: normalizeSpace(p.team || "MAIN"),
  };
}

async function extractPlayersFromHtml() {
  // Сначала попробуем найти папку с игроками
  const playersDir = path.join(ROOT, "komanda", "igroki");
  
  if (fs.existsSync(playersDir)) {
    console.log(`[extract-seed] Found players directory: ${playersDir}`);
    
    const playerFolders = fs.readdirSync(playersDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log(`[extract-seed] Found ${playerFolders.length} player folders`);
    
    const players = [];
    const assets = [];
    
    for (const folderName of playerFolders) {
      const playerPath = path.join(playersDir, folderName);
      const indexPath = path.join(playerPath, "index.html");
      
      if (!fs.existsSync(indexPath)) continue;
      
      const html = readFileSafe(indexPath);
      if (!html) continue;
      
      const $ = cheerio.load(html);
      
      // Извлекаем данные из selected option в селекторе игроков
      const selectedOption = $('option[selected="selected"]').first();
      const optionHtml = selectedOption.attr('data-content') || '';
      
      // Парсим HTML внутри data-content
      const $option = cheerio.load(optionHtml);
      const numText = normalizeSpace($option('.player__number').text());
      const nameText = normalizeSpace($option('.player__titles').clone().children().remove().end().text());
      const posText = normalizeSpace($option('.player__position').text());
      
      // Извлекаем дополнительные данные из p-header__props
      const propItems = $('.p-header__prop-item');
      const birthText = propItems.eq(0).text().trim(); // 16.01.2007
      const weightText = propItems.eq(1).text().trim(); // 57 кг
      const heightText = propItems.eq(2).text().trim(); // 165 см
      
      // Страна
      const nationalityText = normalizeSpace($('.p-header__country').text());
      
      // Фото игрока
      const imgSrc = $('.p-header__img').attr('src') || '';
      
      if (!nameText || nameText.length < 3) {
        console.log(`[extract-seed] Skipping ${folderName}: no name found`);
        continue;
      }
      
      const nameParts = nameText.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      const slug = folderName; // используем имя папки как slug
      
      if (players.some((p) => p.slug === slug)) continue;
      
      const maybeNumber = Number((numText || "").replace(/[^\d]/g, ""));
      const photoUrl = absUrlMaybe(imgSrc);
      
      if (photoUrl) {
        assets.push({ 
          type: "playerPhoto", 
          slug, 
          url: photoUrl, 
          localPath: toLocalPathFromHref(photoUrl) 
        });
      }
      
      // Парсим рост и вес
      const heightMatch = heightText.match(/(\d+)/);
      const weightMatch = weightText.match(/(\d+)/);
      
      // Парсим дату рождения (формат DD.MM.YYYY -> YYYY-MM-DD)
      let birthDate = "2000-01-01";
      const birthMatch = birthText.match(/(\d{2})\.(\d{2})\.(\d{4})/);
      if (birthMatch) {
        birthDate = `${birthMatch[3]}-${birthMatch[2]}-${birthMatch[1]}`;
      }
      
      players.push({
        slug,
        firstName,
        lastName,
        number: Number.isFinite(maybeNumber) ? maybeNumber : 0,
        position: posText || "MIDFIELDER",
        birthDate,
        nationality: nationalityText || "Россия",
        heightCm: heightMatch ? Number(heightMatch[1]) : 170,
        weightKg: weightMatch ? Number(weightMatch[1]) : 65,
        photoUrl,
        team: "MAIN",
      });
      
      console.log(`[extract-seed] ✅ Extracted player: ${nameText} (#${maybeNumber})`);
    }
    
    return { players, assets };
  }
  
  // Fallback: старый метод поиска
  console.log("[extract-seed] Players directory not found, trying HTML parsing...");
  
  const htmlFiles = await fg(["**/*.html"], {
    cwd: ROOT,
    absolute: true,
    suppressErrors: true,
  });

  const candidateFiles = htmlFiles.filter((fp) => {
    const rel = fp.toLowerCase();
    return rel.includes(`${path.sep}komanda${path.sep}`) || rel.includes("igroki");
  });

  const players = [];
  const assets = [];

  for (const fp of candidateFiles) {
    const html = readFileSafe(fp);
    if (!html) continue;

    const $ = cheerio.load(html);

    const links = $("a")
      .filter((_, el) => {
        const href = $(el).attr("href") || "";
        return href.includes("igroki") || href.includes("player") || href.includes("komanda");
      })
      .slice(0, 100);

    links.each((_, el) => {
      const a = $(el);
      const href = a.attr("href") || "";
      const card = a.closest("article, .card, .team, .player, li, .item");
      const scope = card.length ? card : a.parent();

      const imgSrc = collectImage(scope);
      const nameText = normalizeSpace(scope.find("h3, h4, .name, .title").first().text()) || normalizeSpace(a.text());

      if (!nameText || nameText.length < 6) return;

      const numText = normalizeSpace(scope.find(".num, .number").first().text());
      const maybeNumber = Number((numText || "").replace(/[^\d]/g, ""));

      const posText = normalizeSpace(scope.find(".pos, .position, .role").first().text());

      const nameParts = nameText.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      const slug = toSlug(nameText);

      if (players.some((p) => p.slug === slug)) return;

      const photoUrl = absUrlMaybe(imgSrc);

      if (photoUrl) {
        assets.push({ 
          type: "playerPhoto", 
          slug, 
          url: photoUrl, 
          localPath: toLocalPathFromHref(photoUrl) 
        });
      }

      players.push({
        slug,
        firstName,
        lastName,
        number: Number.isFinite(maybeNumber) ? maybeNumber : 0,
        position: posText || "MIDFIELDER",
        birthDate: "2000-01-01",
        nationality: "Россия",
        heightCm: 170,
        weightKg: 65,
        photoUrl,
        team: "MAIN",
      });
    });
  }

  return { players, assets };
}

async function extractNews() {
  const newsDir = path.join(ROOT, "novosti", "vse-novosti");
  
  if (fs.existsSync(newsDir)) {
    console.log(`[extract-seed] Found news directory: ${newsDir}`);
    
    const news = [];
    const assets = [];
    
    // Ищем новости в подпапках: novosti-osnovy, club, exclusive, novosti-dublja
    const categories = ["novosti-osnovy", "club", "exclusive", "novosti-dublja"];
    
    for (const category of categories) {
      const categoryPath = path.join(newsDir, category);
      if (!fs.existsSync(categoryPath)) continue;
      
      console.log(`[extract-seed] Scanning category: ${category}`);
      
      const newsFolders = fs.readdirSync(categoryPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      for (const folderName of newsFolders) {
        const newsPath = path.join(categoryPath, folderName);
        const indexPath = path.join(newsPath, "index.html");
        
        if (!fs.existsSync(indexPath)) continue;
        
        const html = readFileSafe(indexPath);
        if (!html) continue;
        
        const $ = cheerio.load(html);
        
        // Извлекаем данные из meta-тегов
        const title = normalizeSpace($('title').text()).split('—')[0].trim();
        const excerpt = normalizeSpace($('meta[name="description"]').attr('content') || '');
        const coverUrl = absUrlMaybe($('meta[property="og:image"]').attr('content') || '');
        
        // Пытаемся найти дату публикации
        let publishedAt = new Date().toISOString();
        const dateText = normalizeSpace($('time, .date, .news-date').first().text());
        if (dateText) {
          // Пытаемся распарсить дату
          const dateMatch = dateText.match(/(\d{2})\.(\d{2})\.(\d{4})/);
          if (dateMatch) {
            publishedAt = new Date(`${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`).toISOString();
          }
        }
        
        if (!title || title.length < 10) {
          console.log(`[extract-seed] Skipping ${folderName}: no title found`);
          continue;
        }
        
        const slug = folderName;
        if (news.some((n) => n.slug === slug)) continue;
        
        if (coverUrl) {
          assets.push({ 
            type: "newsCover", 
            slug, 
            url: coverUrl, 
            localPath: toLocalPathFromHref(coverUrl) 
          });
        }
        
        news.push({
          slug,
          title,
          excerpt: excerpt || "Новость от ЖФК ЦСКА",
          coverImageUrl: coverUrl || "",
          publishedAt,
        });
        
        console.log(`[extract-seed] ✅ Extracted news: ${title.slice(0, 50)}...`);
        
        // Ограничиваем количество новостей
        if (news.length >= 12) break;
      }
      
      if (news.length >= 12) break;
    }
    
    return { news, assets };
  }
  
  // Fallback: старый метод
  console.log("[extract-seed] News directory not found, trying HTML parsing...");
  
  const htmlFiles = await fg(["**/*.html"], { cwd: ROOT, absolute: true, suppressErrors: true });
  const candidate = htmlFiles.filter((fp) => fp.toLowerCase().includes(`${path.sep}novosti${path.sep}`));

  const news = [];
  const assets = [];

  for (const fp of candidate) {
    const html = readFileSafe(fp);
    if (!html) continue;
    const $ = cheerio.load(html);

    $("a").each((_, el) => {
      const a = $(el);
      const href = a.attr("href") || "";
      const card = a.closest("article, .news-item, .item, li, .card");
      const title = normalizeSpace(card.find("h3, h4, .title, .name").first().text()) || normalizeSpace(a.text());

      if (!title || title.length < 10) return;
      if (!href || href === "#") return;

      const slug = toSlug(title);
      if (news.some((n) => n.slug === slug)) return;

      const cover = collectImage(card);
      const dateText = normalizeSpace(card.find("time, .date, .news-date").first().text());
      const excerpt = normalizeSpace(card.find("p, .excerpt, .preview, .desc").first().text()).slice(0, 240);

      const coverUrl = absUrlMaybe(cover);
      if (coverUrl) {
        assets.push({ 
          type: "newsCover", 
          slug, 
          url: coverUrl, 
          localPath: toLocalPathFromHref(coverUrl) 
        });
      }

      news.push({
        slug,
        title,
        excerpt: excerpt || "Новость от ЖФК ЦСКА",
        coverImageUrl: coverUrl || "",
        publishedAt: dateText || new Date().toISOString(),
      });
    });
  }

  return { news: news.slice(0, 12), assets };
}

async function extractMatches() {
  const matchesIndexPath = path.join(ROOT, "matches", "index.html");
  
  if (fs.existsSync(matchesIndexPath)) {
    console.log(`[extract-seed] Found matches page: ${matchesIndexPath}`);
    
    const html = readFileSafe(matchesIndexPath);
    if (!html) {
      console.log("[extract-seed] Failed to read matches page");
      return { matches: [], assets: [] };
    }
    
    const $ = cheerio.load(html);
    const matches = [];
    const assets = [];
    
    // 1. Извлекаем последний завершенный матч из боковой панели
    const lastMatchCard = $('#last-match .c-match__detail').first();
    if (lastMatchCard.length) {
      const dateText = normalizeSpace(lastMatchCard.find('.c-match__date').text());
      const venue = normalizeSpace(lastMatchCard.find('.c-match__location').text());
      
      // Команда соперника (левая сторона)
      const opponentName = normalizeSpace(lastMatchCard.find('.c-match__left .c-match__club').text());
      const opponentLogo = lastMatchCard.find('.c-match__left .c-match__img').attr('src') || '';
      const scoreAway = normalizeSpace(lastMatchCard.find('.c-match__left .c-match__score').text());
      
      // ЦСКА (правая сторона)
      const scoreHome = normalizeSpace(lastMatchCard.find('.c-match__right .c-match__score').text());
      
      if (opponentName && scoreHome && scoreAway) {
        const logoUrl = absUrlMaybe(opponentLogo);
        if (logoUrl) {
          assets.push({
            type: "opponentLogo",
            url: logoUrl,
            localPath: toLocalPathFromHref(opponentLogo)
          });
        }
        
        // Парсим дату (формат: "08 ноября 2025, 13:00 МСК")
        let matchDate = new Date().toISOString();
        const dateMatch = dateText.match(/(\d{2})\s+(\w+)\s+(\d{4}),\s+(\d{2}):(\d{2})/);
        if (dateMatch) {
          const months = {
            'января': '01', 'февраля': '02', 'марта': '03', 'апреля': '04',
            'мая': '05', 'июня': '06', 'июля': '07', 'августа': '08',
            'сентября': '09', 'октября': '10', 'ноября': '11', 'декабря': '12'
          };
          const day = dateMatch[1];
          const month = months[dateMatch[2]] || '01';
          const year = dateMatch[3];
          const hour = dateMatch[4];
          const minute = dateMatch[5];
          matchDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`).toISOString();
        }
        
        matches.push({
          type: "LAST",
          opponentName,
          opponentLogoUrl: logoUrl || "",
          matchDate,
          venue: venue || "Стадион ЦСКА",
          scoreHome: Number(scoreHome) || 0,
          scoreAway: Number(scoreAway) || 0,
        });
        
        console.log(`[extract-seed] ✅ Extracted last match: ЦСКА ${scoreHome}:${scoreAway} ${opponentName}`);
      }
    }
    
    // 2. Извлекаем ближайший матч (если есть вкладка "Ближайший")
    const upcomingMatchCard = $('#upcoming-match .c-match__detail').first();
    if (upcomingMatchCard.length) {
      const dateText = normalizeSpace(upcomingMatchCard.find('.c-match__date').text());
      const venue = normalizeSpace(upcomingMatchCard.find('.c-match__location').text());
      
      // Ищем название команды соперника
      const opponentName = normalizeSpace(
        upcomingMatchCard.find('.c-match__club').first().text() ||
        upcomingMatchCard.find('.c-match__team-name').first().text()
      );
      const opponentLogo = upcomingMatchCard.find('.c-match__img').first().attr('src') || '';
      
      if (opponentName) {
        const logoUrl = absUrlMaybe(opponentLogo);
        if (logoUrl) {
          assets.push({
            type: "opponentLogo",
            url: logoUrl,
            localPath: toLocalPathFromHref(opponentLogo)
          });
        }
        
        // Парсим дату
        let matchDate = new Date().toISOString();
        const dateMatch = dateText.match(/(\d{2})\s+(\w+)\s+(\d{4}),\s+(\d{2}):(\d{2})/);
        if (dateMatch) {
          const months = {
            'января': '01', 'февраля': '02', 'марта': '03', 'апреля': '04',
            'мая': '05', 'июня': '06', 'июля': '07', 'августа': '08',
            'сентября': '09', 'октября': '10', 'ноября': '11', 'декабря': '12'
          };
          const day = dateMatch[1];
          const month = months[dateMatch[2]] || '01';
          const year = dateMatch[3];
          const hour = dateMatch[4];
          const minute = dateMatch[5];
          matchDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`).toISOString();
        }
        
        matches.push({
          type: "UPCOMING",
          opponentName,
          opponentLogoUrl: logoUrl || "",
          matchDate,
          venue: venue || "Стадион ЦСКА",
          scoreHome: null,
          scoreAway: null,
        });
        
        console.log(`[extract-seed] ✅ Extracted upcoming match: ЦСКА vs ${opponentName}`);
      }
    }
    
    // 3. Если нет ближайшего матча, извлекаем первый из списка без счета
    if (!matches.some(m => m.type === "UPCOMING")) {
      const firstUpcoming = $('.list-matches__item').filter((_, el) => {
        const scoreDiv = $(el).find('.list-matches__score');
        return scoreDiv.length === 0 || scoreDiv.text().trim() === '';
      }).first();
      
      if (firstUpcoming.length) {
        const dateText = normalizeSpace(firstUpcoming.find('.list-matches__date').text());
        const tournamentName = normalizeSpace(firstUpcoming.find('.list-matches__name').text());
        const opponentName = normalizeSpace(firstUpcoming.find('.list-matches__team-name').text());
        const opponentLogo = firstUpcoming.find('.list-matches__team-logo img').attr('src') || '';
        const isHome = firstUpcoming.find('.i-home').length > 0;
        
        if (opponentName) {
          const logoUrl = absUrlMaybe(opponentLogo);
          if (logoUrl) {
            assets.push({
              type: "opponentLogo",
              url: logoUrl,
              localPath: toLocalPathFromHref(opponentLogo)
            });
          }
          
          // Парсим дату (формат: "29 апр, 14:00")
          let matchDate = new Date().toISOString();
          const dateMatch = dateText.match(/(\d{2})\s+(\w+),\s+(\d{2}):(\d{2})/);
          if (dateMatch) {
            const months = {
              'янв': '01', 'фев': '02', 'мар': '03', 'апр': '04',
              'мая': '05', 'июн': '06', 'июл': '07', 'авг': '08',
              'сен': '09', 'окт': '10', 'ноя': '11', 'дек': '12'
            };
            const day = dateMatch[1];
            const month = months[dateMatch[2]] || '01';
            const year = new Date().getFullYear(); // Используем текущий год
            const hour = dateMatch[3];
            const minute = dateMatch[4];
            matchDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`).toISOString();
          }
          
          matches.push({
            type: "UPCOMING",
            opponentName,
            opponentLogoUrl: logoUrl || "",
            matchDate,
            venue: isHome ? "Стадион ЦСКА" : `Стадион ${opponentName}`,
            scoreHome: null,
            scoreAway: null,
          });
          
          console.log(`[extract-seed] ✅ Extracted upcoming match from list: ЦСКА vs ${opponentName}`);
        }
      }
    }
    
    return { matches, assets };
  }
  
  // Fallback: старый метод
  console.log("[extract-seed] Matches page not found, trying HTML parsing...");
  
  const htmlFiles = await fg(["**/*.html"], { cwd: ROOT, absolute: true, suppressErrors: true });
  const candidate = htmlFiles.filter((fp) => fp.toLowerCase().includes(`${path.sep}matches${path.sep}`));

  const matches = [];
  const assets = [];

  for (const fp of candidate) {
    const html = readFileSafe(fp);
    if (!html) continue;

    const $ = cheerio.load(html);

    const items = $("article, .match, .match-item, .game, .game-item, li").slice(0, 80);

    items.each((_, el) => {
      const item = $(el);
      const text = normalizeSpace(item.text());
      if (text.length < 30) return;

      const opponent = normalizeSpace(item.find(".opponent, .team2, .rival, .match-opponent, .name").first().text());
      const dateText = normalizeSpace(item.find("time, .date, .match-date").first().text());
      const scoreText = normalizeSpace(item.find(".score, .result").first().text());
      const scoreNums = scoreText.match(/(\d+)\s*[:\-]\s*(\d+)/);

      const logo = collectImage(item);
      const logoUrl = absUrlMaybe(logo);
      if (logoUrl) {
        assets.push({ 
          type: "opponentLogo", 
          url: logoUrl, 
          localPath: toLocalPathFromHref(logoUrl) 
        });
      }

      const type = scoreNums ? "COMPLETED" : "UPCOMING";
      const key = `${type}-${opponent}-${dateText}-${scoreText}`.toLowerCase();
      if (matches.some((m) => m._key === key)) return;

      matches.push({
        _key: key,
        type,
        opponentName: opponent || "Соперник",
        opponentLogoUrl: logoUrl || "",
        matchDate: dateText || new Date().toISOString(),
        venue: normalizeSpace(item.find(".venue, .place").first().text()) || "Стадион ЦСКА",
        scoreHome: scoreNums ? Number(scoreNums[1]) : null,
        scoreAway: scoreNums ? Number(scoreNums[2]) : null,
      });
    });
  }

  const upcoming = matches.find((m) => m.type === "UPCOMING");
  const last = matches.find((m) => m.type === "COMPLETED" || m.type === "LAST");
  const final = [];
  if (upcoming) final.push(stripKey(upcoming));
  if (last) final.push(stripKey(last));

  return { matches: final, assets };
}

function stripKey(m) {
  const { _key, ...rest } = m;
  return rest;
}

async function main() {
  console.log("[extract-seed] ROOT:", ROOT);
  ensureDir(OUT_DIR);

  const assetsManifest = [];

  // Players
  const existingPlayers = tryLoadExistingPlayersJson();
  let players = [];
  let playerAssets = [];

  if (existingPlayers) {
    console.log("[extract-seed] Found existing players-data.json, normalizing…");
    players = existingPlayers.map(normalizePlayerFromAny);
    playerAssets = players
      .filter((p) => p.photoUrl)
      .map((p) => ({
        type: "playerPhoto",
        slug: p.slug,
        url: p.photoUrl,
        localPath: toLocalPathFromHref(p.photoUrl),
      }));
  } else {
    console.log("[extract-seed] Parsing players from HTML…");
    const res = await extractPlayersFromHtml();
    players = res.players;
    playerAssets = res.assets;
  }

  // News
  console.log("[extract-seed] Parsing news…");
  const newsRes = await extractNews();

  // Matches
  console.log("[extract-seed] Parsing matches…");
  const matchesRes = await extractMatches();

  // Save
  writeJson(path.join(OUT_DIR, "players.json"), players);
  writeJson(path.join(OUT_DIR, "news.json"), newsRes.news);
  writeJson(path.join(OUT_DIR, "matches.json"), matchesRes.matches);

  assetsManifest.push(...playerAssets, ...newsRes.assets, ...matchesRes.assets);
  writeJson(path.join(OUT_DIR, "assets-manifest.json"), assetsManifest);

  console.log("[extract-seed] Done.");
  console.log(`Players: ${players.length}`);
  console.log(`News: ${newsRes.news.length}`);
  console.log(`Matches: ${matchesRes.matches.length}`);
  console.log(`Assets: ${assetsManifest.length}`);
  console.log(`[extract-seed] Output dir: ${OUT_DIR}`);
}

main().catch((e) => {
  console.error("[extract-seed] ERROR:", e);
  process.exit(1);
});
