import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function takeScreenshots() {
  console.log('🚀 Starting screenshot capture...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60000); // 60 seconds timeout

  try {
    // Screenshot 1: Homepage
    console.log('📸 Capturing homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000); // Wait for animations and images
    await page.screenshot({ 
      path: join(__dirname, '../screenshots/homepage-final-update.png'),
      fullPage: true 
    });
    console.log('✅ Homepage screenshot saved');

    // Screenshot 2: Player profile
    console.log('📸 Capturing player profile...');
    await page.goto('http://localhost:3000/players/petrova-tatyana-sergeevna', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: join(__dirname, '../screenshots/player-profile-final.png'),
      fullPage: true 
    });
    console.log('✅ Player profile screenshot saved');

    // Screenshot 3: Match card section (homepage - specific section)
    console.log('📸 Capturing match card section...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    const matchSection = await page.locator('section:has-text("Матчи")').first();
    if (matchSection) {
      await matchSection.screenshot({ 
        path: join(__dirname, '../screenshots/match-card-section-final.png')
      });
      console.log('✅ Match card section screenshot saved');
    }

  } catch (error) {
    console.error('❌ Error taking screenshots:', error);
  } finally {
    await browser.close();
    console.log('🎉 Screenshot capture complete!');
  }
}

takeScreenshots();
