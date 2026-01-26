import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const videosDir = join(__dirname, '..', 'videos');

async function recordDemo() {
  console.log('🎬 Начинаем запись видео-демонстрации...\n');

  const browser = await chromium.launch({
    headless: false, // Показываем браузер для лучшей записи
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: videosDir,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  try {
    // 1. Открываем главную страницу
    console.log('📄 1. Открываем главную страницу...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 2. Демонстрация Header и навигации
    console.log('🔝 2. Демонстрация Header...');
    await page.mouse.move(500, 75); // Наводим на Header
    await page.waitForTimeout(1000);
    
    // Наводим на пункты меню
    const menuItems = ['Главная', 'Команда', 'Матчи', 'Новости', 'Медиа', 'Клуб'];
    for (const item of menuItems) {
      const menuItem = page.locator(`text="${item}"`).first();
      if (await menuItem.isVisible()) {
        await menuItem.hover();
        await page.waitForTimeout(500);
      }
    }
    await page.waitForTimeout(1000);

    // 3. Демонстрация Floating Dock (соцсети)
    console.log('🎭 3. Демонстрация Floating Dock (соцсети)...');
    await page.mouse.move(1850, 75); // Двигаемся к соцсетям
    await page.waitForTimeout(1000);
    
    // Наводим на каждую иконку соцсети
    const socialIcons = await page.locator('.md\\:flex.h-16.gap-4 a').all();
    for (const icon of socialIcons) {
      await icon.hover();
      await page.waitForTimeout(800); // Показываем анимацию увеличения
    }
    await page.waitForTimeout(1000);

    // 4. Прокручиваем к Hero секции
    console.log('🎨 4. Демонстрация Hero секции...');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(2000);
    
    // Наводим на кнопку Hero
    const heroButton = page.locator('text="Купить билеты"').first();
    if (await heroButton.isVisible()) {
      await heroButton.hover();
      await page.waitForTimeout(1000);
    }

    // 5. Прокручиваем к карточкам матчей
    console.log('⚽ 5. Демонстрация карточек матчей...');
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'smooth' }));
    await page.waitForTimeout(2000);
    
    // Наводим на карточки матчей
    const matchCards = await page.locator('.border-2.transition-all').all();
    for (const card of matchCards.slice(0, 2)) {
      await card.hover();
      await page.waitForTimeout(1500); // Показываем эффект парения
      await page.mouse.move(960, 540); // Убираем hover
      await page.waitForTimeout(500);
    }

    // Наводим на кнопки в карточках
    const buyButton = page.locator('text="Купить билет"').first();
    if (await buyButton.isVisible()) {
      await buyButton.hover();
      await page.waitForTimeout(1000);
    }

    // 6. Прокручиваем к секции новостей
    console.log('📰 6. Демонстрация секции новостей...');
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'smooth' }));
    await page.waitForTimeout(2000);
    
    // Наводим на карточки новостей
    const newsCards = await page.locator('.group.overflow-hidden').all();
    for (const card of newsCards.slice(0, 3)) {
      await card.hover();
      await page.waitForTimeout(1000);
    }

    // 7. Прокручиваем к карусели игроков
    console.log('🎠 7. Демонстрация карусели игроков...');
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'smooth' }));
    await page.waitForTimeout(2000);
    
    // Ждём автоматическую прокрутку карусели
    await page.waitForTimeout(3000);
    
    // Кликаем на стрелки карусели
    const nextButton = page.locator('button[aria-label="Next slide"]');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(1000);
      await nextButton.click();
      await page.waitForTimeout(1000);
    }

    // 8. Прокручиваем к спонсорам
    console.log('🤝 8. Демонстрация секции спонсоров...');
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'smooth' }));
    await page.waitForTimeout(2000);
    
    // Наводим на логотипы спонсоров
    const sponsorLogos = await page.locator('.grayscale.transition-all').all();
    for (const logo of sponsorLogos.slice(0, 4)) {
      await logo.hover();
      await page.waitForTimeout(800);
    }

    // 9. Прокручиваем к Footer
    console.log('🔽 9. Демонстрация Footer...');
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'smooth' }));
    await page.waitForTimeout(2000);

    // 10. Переходим на страницу команды
    console.log('👥 10. Переход на страницу команды...');
    await page.click('text="Команда"');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 11. Демонстрация фильтров
    console.log('🔍 11. Демонстрация фильтров...');
    
    // Прокручиваем к фильтрам
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(1500);
    
    // Фильтр по позиции - используем более надёжные селекторы
    const positionButtons = await page.locator('button').all();
    
    // Ищем кнопки фильтров
    for (const button of positionButtons) {
      const text = await button.textContent();
      if (text && text.includes('Вратари')) {
        await button.click();
        await page.waitForTimeout(1500);
        break;
      }
    }
    
    for (const button of positionButtons) {
      const text = await button.textContent();
      if (text && text.includes('Защитники')) {
        await button.click();
        await page.waitForTimeout(1500);
        break;
      }
    }
    
    for (const button of positionButtons) {
      const text = await button.textContent();
      if (text && text.includes('Все позиции')) {
        await button.click();
        await page.waitForTimeout(1500);
        break;
      }
    }

    // 12. Демонстрация поиска
    console.log('🔎 12. Демонстрация поиска...');
    const searchInput = page.locator('input[placeholder*="Поиск"]');
    await searchInput.click();
    await page.waitForTimeout(500);
    
    await searchInput.fill('Плешкова');
    await page.waitForTimeout(2000);
    
    await searchInput.clear();
    await page.waitForTimeout(1000);

    // 13. Наводим на карточки игроков
    console.log('🏃‍♀️ 13. Демонстрация карточек игроков...');
    const playerCards = await page.locator('.group.cursor-pointer').all();
    for (const card of playerCards.slice(0, 3)) {
      await card.hover();
      await page.waitForTimeout(1000);
    }

    // 14. Открываем модальное окно игрока
    console.log('📋 14. Открытие модального окна игрока...');
    if (playerCards.length > 0) {
      await playerCards[0].click();
      await page.waitForTimeout(2000);
      
      // Закрываем модальное окно
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }

    // 15. Переходим на профиль игрока
    console.log('👤 15. Переход на профиль игрока...');
    await page.goto('http://localhost:3000/players/pleshkova-yuliya-aleksandrovna', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Прокручиваем профиль
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(2000);
    
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(2000);

    // 16. Возвращаемся на главную
    console.log('🏠 16. Возвращаемся на главную...');
    await page.click('text="Назад к составу"');
    await page.waitForTimeout(2000);
    
    await page.click('text="Главная"');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Финальная прокрутка вверх
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(2000);

    console.log('\n✅ Запись завершена!');
    console.log('⏳ Сохраняем видео...');

  } catch (error) {
    console.error('❌ Ошибка при записи:', error);
  } finally {
    await context.close();
    await browser.close();
    
    console.log('\n✨ Видео сохранено в папку videos/');
    console.log('📁 Путь:', videosDir);
  }
}

recordDemo();
