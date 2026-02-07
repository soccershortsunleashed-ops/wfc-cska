import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Читаем извлеченные данные
const dataPath = path.join(__dirname, '../seed/youth-players-extracted.json');
const players = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const baseUrl = 'https://wfccska.ru';
const outputDir = path.join(__dirname, '../public/seed-assets');

// Создаем папку если не существует
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    const outputPath = path.join(outputDir, filename);
    
    // Проверяем, существует ли файл
    if (fs.existsSync(outputPath)) {
      console.log(`✓ Файл уже существует: ${filename}`);
      resolve();
      return;
    }
    
    console.log(`Скачиваю: ${filename} из ${fullUrl}`);
    
    const file = fs.createWriteStream(outputPath);
    https.get(fullUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Ошибка ${response.statusCode} для ${fullUrl}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✓ Скачано: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log(`Найдено игроков: ${players.length}\n`);
  
  for (const player of players) {
    if (player.photoUrl) {
      const ext = path.extname(player.photoUrl);
      const filename = `playerPhoto-${player.slug}${ext}`;
      
      try {
        await downloadImage(player.photoUrl, filename);
        // Небольшая задержка между запросами
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`✗ Ошибка при скачивании ${filename}:`, error.message);
      }
    } else {
      console.log(`⚠ Нет фото для: ${player.fullName} (${player.number})`);
    }
  }
  
  console.log('\nГотово!');
}

main().catch(console.error);
