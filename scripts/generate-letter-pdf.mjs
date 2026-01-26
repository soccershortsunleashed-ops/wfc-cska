#!/usr/bin/env node

/**
 * Скрипт для генерации только письма руководству
 */

import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import MarkdownIt from 'markdown-it';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const GITHUB_REPO = 'https://github.com/soccershortsunleashed-ops/wfc-cska';
const GITHUB_RAW = 'https://raw.githubusercontent.com/soccershortsunleashed-ops/wfc-cska/main';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

function replaceRelativeLinks(content, useLocalImages = true) {
  if (useLocalImages) {
    content = content.replace(/!\[([^\]]*)\]\(\.\/screenshots\//g, `![$1](screenshots/`);
    content = content.replace(/!\[([^\]]*)\]\(screenshots\//g, `![$1](screenshots/`);
  } else {
    content = content.replace(/!\[([^\]]*)\]\(\.\/screenshots\//g, `![$1](${GITHUB_RAW}/screenshots/`);
    content = content.replace(/!\[([^\]]*)\]\(screenshots\//g, `![$1](${GITHUB_RAW}/screenshots/`);
  }
  
  content = content.replace(/\[▶️([^\]]*)\]\(\.\/videos\//g, `[▶️$1](${GITHUB_RAW}/videos/`);
  content = content.replace(/\[▶️([^\]]*)\]\(videos\//g, `[▶️$1](${GITHUB_RAW}/videos/`);
  content = content.replace(/\]\(\.\/([A-Z-А-Я]+\.md)\)/g, `](${GITHUB_REPO}/blob/main/$1)`);
  
  return content;
}

function getHTMLTemplate(title, htmlContent) {
  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1a1a1a; padding: 40px; font-size: 11pt; background: white; }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { color: #0033A0; font-size: 28pt; font-weight: 700; margin-top: 0; margin-bottom: 20pt; padding-bottom: 10pt; border-bottom: 3px solid #E4002B; text-align: center; }
    h2 { color: #0033A0; font-size: 20pt; font-weight: 600; margin-top: 30pt; margin-bottom: 12pt; padding-top: 12pt; border-top: 1px solid #e0e0e0; page-break-after: avoid; }
    h3 { color: #0033A0; font-size: 16pt; font-weight: 600; margin-top: 18pt; margin-bottom: 10pt; page-break-after: avoid; }
    h4 { color: #333; font-size: 13pt; font-weight: 600; margin-top: 14pt; margin-bottom: 8pt; page-break-after: avoid; }
    p { margin-bottom: 10pt; text-align: justify; }
    a { color: #0033A0; text-decoration: none; border-bottom: 1px solid #0033A0; word-break: break-word; }
    ul, ol { margin-bottom: 12pt; padding-left: 25pt; }
    li { margin-bottom: 6pt; }
    table { width: 100%; border-collapse: collapse; margin: 16pt 0; font-size: 10pt; page-break-inside: avoid; }
    th { background-color: #0033A0; color: white; padding: 10pt; text-align: left; font-weight: 600; }
    td { padding: 10pt; border: 1px solid #e0e0e0; vertical-align: top; }
    tr:nth-child(even) { background-color: #f8f9fa; }
    blockquote { border-left: 4px solid #E4002B; padding-left: 16pt; margin: 12pt 0; color: #555; font-style: italic; }
    code { background-color: #f5f5f5; padding: 2pt 6pt; border-radius: 3pt; font-family: 'Courier New', monospace; font-size: 10pt; }
    pre { background-color: #f5f5f5; padding: 12pt; border-radius: 6pt; overflow-x: auto; margin: 12pt 0; }
    pre code { background-color: transparent; padding: 0; }
    img { max-width: 100%; height: auto; display: block; margin: 16pt auto; border: 1px solid #e0e0e0; border-radius: 6pt; page-break-inside: avoid; }
    hr { border: none; border-top: 2px solid #e0e0e0; margin: 24pt 0; }
    strong { color: #0033A0; font-weight: 600; }
    em { color: #E4002B; font-style: normal; }
    h1, h2, h3, h4, h5, h6 { page-break-after: avoid; }
    table, figure, img { page-break-inside: avoid; }
    @media print { body { padding: 0; } @page { margin: 20mm; size: A4; } }
  </style>
</head>
<body>
  <div class="container">${htmlContent}</div>
</body>
</html>
  `;
}

async function main() {
  let browser;
  
  try {
    console.log('📄 Генерация PDF письма руководству...\n');
    
    const inputPath = join(rootDir, 'ПИСЬМО-РУКОВОДСТВУ.md');
    let content = await readFile(inputPath, 'utf-8');
    
    console.log('🔗 Обработка ссылок...');
    content = replaceRelativeLinks(content, true);
    
    console.log('📝 Конвертация Markdown в HTML...');
    const htmlContent = md.render(content);
    const fullHTML = getHTMLTemplate('Письмо руководству', htmlContent);
    
    console.log('🌐 Запуск браузера...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      request.continue();
    });
    
    const tempHTMLPath = join(rootDir, 'temp-letter-pdf.html');
    const absoluteHTML = fullHTML.replace(
      /src="screenshots\//g,
      `src="file:///${rootDir.replace(/\\/g, '/')}/screenshots/`
    );
    
    await writeFile(tempHTMLPath, absoluteHTML, 'utf-8');
    
    await page.goto(`file:///${tempHTMLPath.replace(/\\/g, '/')}`, {
      waitUntil: 'networkidle0'
    });
    
    console.log('📄 Генерация PDF...');
    const outputPath = join(rootDir, 'ПИСЬМО-РУКОВОДСТВУ-NEW.pdf');
    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true,
      preferCSSPageSize: true
    });
    
    console.log(`✅ PDF создан: ПИСЬМО-РУКОВОДСТВУ-NEW.pdf`);
    console.log('\n📌 Закройте старый PDF и переименуйте новый файл!');
    
    try {
      await import('fs').then(fs => fs.promises.unlink(tempHTMLPath));
    } catch (e) {}
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();
