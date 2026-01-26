import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const videosDir = join(__dirname, '..', 'videos', 'demos');

async function recordShortDemo(name, recordFunction) {
  console.log(`\n🎬 Записываем: ${name}...`);
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: videosDir,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  try {
    await recordFunction(page);
    console.log(`✅ ${name} записано!`);
  } catch (error) {
    console.error(`❌ Ошибка при записи ${name}:`, error.message);
  } finally {
    await context.close();
    await browser.close();
  }
}

// 1. Демо Header и навигации
async function demoHeader(page) {
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  // Наводим на пункты меню
  const menuItems = ['Главная', 'Команда', 'Матчи', 'Новости', 'Медиа', 'Клуб'];
  for (const item of menuItems) {
    try {
      const menuItem = page.locator(`text="${item}"`).first();
      await menuItem.hover({ timeout: 5000 });
      await page.waitForTimeout(600);
    } catch (e) {
      // Пропускаем, если элемент не найден
    }
  }
  await page.waitForTimeout(1000);
}

// 2. Демо Floating Dock (соцсети)
async function demoFloatingDock(page) {
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  // Наводим на иконки соцсетей
  const socialIcons = await page.locator('.md\\:flex.h-16.gap-4 a').all();
  for (const icon of socialIcons) {
    await icon.hover();
    await page.waitForTimeout(1000);
  }
  await page.waitForTimeout(1000);
}

// 3. Демо карточек матчей
async function demoMatchCards(page) {
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  // Прокручиваем к матчам
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'smooth' }));
  await page.waitForTimeout(1500);
  
  // Наводим на карточки
  const matchCards = await page.locator('.border-2.transition-all').all();
  for (const card of matchCards.slice(0, 2)) {
    await card.hover();
    await page.waitForTimeout(1500);
    await page.mouse.move(960, 540);
    await page.waitForTimeout(500);
  }
}

// 4. Демо карусели игроков
async function demoCarousel(page) {
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  // Прокручиваем к карусели
  await page.evaluate(() => {
    const carousel = document.querySelector('[class*="carousel"]');
    if (carousel) {
      carousel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 2000, behavior: 'smooth' });
    }
  });
  await page.waitForTimeout(2000);
  
  // Ждём автопрокрутку
  await page.waitForTimeout(4000);
  
  // Кликаем на стрелки
  try {
    const nextButton = page.locator('button[aria-label="Next slide"]');
    await nextButton.click({ timeout: 5000 });
    await page.waitForTimeout(1000);
    await nextButton.click({ timeout: 5000 });
    await page.waitForTimeout(1000);
  } catch (e) {
    // Стрелки могут быть не видны
  }
}

// 5. Демо фильтрации игроков
async function demoPlayerFilters(page) {
  await page.goto('http://localhost:3000/players', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Прокручиваем вверх
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1000);
  
  // Кликаем на фильтры
  const buttons = await page.locator('button').all();
  
  for (const button of buttons) {
    const text = await button.textContent();
    if (text && text.includes('Вратари')) {
      await button.click();
      await page.waitForTimeout(2000);
      break;
    }
  }
  
  for (const button of buttons) {
    const text = await button.textContent();
    if (text && text.includes('Защитники')) {
      await button.click();
      await page.waitForTimeout(2000);
      break;
    }
  }
  
  for (const button of buttons) {
    const text = await button.textContent();
    if (text && text.includes('Все позиции')) {
      await button.click();
      await page.waitForTimeout(2000);
      break;
    }
  }
}

// 6. Демо поиска игроков
async function demoPlayerSearch(page) {
  await page.goto('http://localhost:3000/players', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  const searchInput = page.locator('input[placeholder*="Поиск"]');
  await searchInput.click();
  await page.waitForTimeout(500);
  
  await searchInput.fill('Плешкова');
  await page.waitForTimeout(2500);
  
  await searchInput.clear();
  await page.waitForTimeout(1500);
}

// 7. Демо карточек игроков с hover
async function demoPlayerCards(page) {
  await page.goto('http://localhost:3000/players', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Прокручиваем к карточкам
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
  await page.waitForTimeout(1000);
  
  const playerCards = await page.locator('.group.cursor-pointer').all();
  for (const card of playerCards.slice(0, 4)) {
    await card.hover();
    await page.waitForTimeout(1000);
  }
}

// 8. Демо профиля игрока
async function demoPlayerProfile(page) {
  await page.goto('http://localhost:3000/players/pleshkova-yuliya-aleksandrovna', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Прокручиваем профиль
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await page.waitForTimeout(2000);
  
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await page.waitForTimeout(2000);
  
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1500);
}

// Запускаем все демо
async function recordAllDemos() {
  console.log('🎬 Начинаем запись коротких демо-видео...\n');
  
  await recordShortDemo('01-header-navigation', demoHeader);
  await recordShortDemo('02-floating-dock-social', demoFloatingDock);
  await recordShortDemo('03-match-cards-hover', demoMatchCards);
  await recordShortDemo('04-players-carousel', demoCarousel);
  await recordShortDemo('05-player-filters', demoPlayerFilters);
  await recordShortDemo('06-player-search', demoPlayerSearch);
  await recordShortDemo('07-player-cards-hover', demoPlayerCards);
  await recordShortDemo('08-player-profile', demoPlayerProfile);
  
  console.log('\n✨ Все демо-видео записаны!');
  console.log(`📁 Сохранены в: ${videosDir}`);
  console.log('\n⚠️  Примечание: Файлы будут иметь случайные имена.');
  console.log('Переименуйте их в соответствии с порядком записи.');
}

recordAllDemos();
