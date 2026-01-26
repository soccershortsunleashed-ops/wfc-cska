#!/usr/bin/env node

/**
 * Скрипт для создания правильного скриншота страницы команды старого сайта
 */

import puppeteer from 'puppeteer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function takeScreenshot() {
  let browser;
  
  try {
    console.log('🚀 Запуск браузера...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Устанавливаем размер viewport для desktop
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    });
    
    console.log('📸 Переход на страницу команды старого сайта...');
    await page.goto('https://wfccska.ru/komanda/osnovnoj-sostav/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    // Ждём загрузки контента
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Делаем скриншот viewport
    const screenshotPath = join(rootDir, 'screenshots/comparison/old-players-correct.png');
    await page.screenshot({
      path: screenshotPath,
      fullPage: false
    });
    
    console.log(`✅ Скриншот сохранён: ${screenshotPath}`);
    
    // Делаем полностраничный скриншот
    const fullScreenshotPath = join(rootDir, 'screenshots/comparison/old-players-correct-full.png');
    await page.screenshot({
      path: fullScreenshotPath,
      fullPage: true
    });
    
    console.log(`✅ Полный скриншот сохранён: ${fullScreenshotPath}`);
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

takeScreenshot();
