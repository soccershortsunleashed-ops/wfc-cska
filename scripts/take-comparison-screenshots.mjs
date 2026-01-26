import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const screenshotsDir = join(__dirname, '..', 'screenshots', 'comparison');

async function takeScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  try {
    // Скриншоты старого сайта
    console.log('📸 Делаем скриншоты старого сайта wfccska.ru...');
    
    const oldPage = await context.newPage();
    oldPage.setDefaultTimeout(60000); // 60 секунд
    
    // Главная страница старого сайта
    await oldPage.goto('https://wfccska.ru/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await oldPage.waitForTimeout(3000);
    await oldPage.screenshot({ 
      path: join(screenshotsDir, 'old-homepage.png'),
      fullPage: true 
    });
    console.log('✅ Скриншот старой главной страницы сохранён');

    // Страница команды старого сайта
    await oldPage.goto('https://wfccska.ru/komanda/igroki/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await oldPage.waitForTimeout(3000);
    await oldPage.screenshot({ 
      path: join(screenshotsDir, 'old-players.png'),
      fullPage: true 
    });
    console.log('✅ Скриншот старой страницы команды сохранён');

    // Viewport скриншот старой главной
    await oldPage.goto('https://wfccska.ru/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await oldPage.waitForTimeout(3000);
    await oldPage.screenshot({ 
      path: join(screenshotsDir, 'old-homepage-viewport.png')
    });
    console.log('✅ Скриншот старой главной (viewport) сохранён');

    await oldPage.close();

    // Скриншоты нового сайта
    console.log('📸 Делаем скриншоты нового сайта...');
    
    const newPage = await context.newPage();
    
    // Главная страница нового сайта
    await newPage.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await newPage.waitForTimeout(2000);
    await newPage.screenshot({ 
      path: join(screenshotsDir, 'new-homepage.png'),
      fullPage: true 
    });
    console.log('✅ Скриншот новой главной страницы сохранён');

    // Страница команды нового сайта
    await newPage.goto('http://localhost:3000/players', { waitUntil: 'networkidle' });
    await newPage.waitForTimeout(2000);
    await newPage.screenshot({ 
      path: join(screenshotsDir, 'new-players.png'),
      fullPage: true 
    });
    console.log('✅ Скриншот новой страницы команды сохранён');

    // Профиль игрока нового сайта
    await newPage.goto('http://localhost:3000/players/pleshkova-yuliya-aleksandrovna', { waitUntil: 'networkidle' });
    await newPage.waitForTimeout(2000);
    await newPage.screenshot({ 
      path: join(screenshotsDir, 'new-player-profile.png'),
      fullPage: true 
    });
    console.log('✅ Скриншот профиля игрока сохранён');

    // Viewport скриншот новой главной
    await newPage.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await newPage.waitForTimeout(2000);
    await newPage.screenshot({ 
      path: join(screenshotsDir, 'new-homepage-viewport.png')
    });
    console.log('✅ Скриншот новой главной (viewport) сохранён');

    await newPage.close();

    console.log('\n✨ Все скриншоты успешно созданы!');
    console.log(`📁 Сохранены в: ${screenshotsDir}`);

  } catch (error) {
    console.error('❌ Ошибка при создании скриншотов:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshots();
