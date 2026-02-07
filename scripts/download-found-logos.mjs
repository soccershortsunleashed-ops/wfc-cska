#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Логотипы, найденные на официальном сайте ЖФК ЦСКА
const officialLogos = {
  'Спартак': 'https://wfccska.ru/upload/iblock/951/qgm6y9bwenjfkql7sg4mzvi10uxpt7ob/FC_Spartak_Moscow_Logotype.svg.png',
  'ЖФК ЦСКА': 'https://wfccska.ru/upload/iblock/ab2/j9egqr27xk8lsljr7h55sicicqkcn0zo/Dlya_sayta.png',
  'Зенит': 'https://wfccska.ru/upload/iblock/264/Na-sayt.png',
  'Чертаново': 'https://wfccska.ru/upload/iblock/275/lrdutcx0l2wa3lcmgykvkphw9cwj7843/CHERT_Symbol_.png',
  'Звезда-2005': 'https://wfccska.ru/upload/iblock/a0b/t1may0whct2i6et3ke7hz2n6ahtxjv1r/Zvezda_2005_logotip.png',
  'Россиянка': 'https://wfccska.ru/upload/iblock/47b/5ac4af46a7d59_173x173.jpg',
  'Кубаночка': 'https://wfccska.ru/upload/iblock/4c1/5abe11ce27a8c_173x173.jpg',
  'Рязань-ВДВ': 'https://wfccska.ru/upload/iblock/c74/11.png',
};

// Функция для скачивания изображения
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

console.log('📥 Скачивание логотипов с официального сайта ЖФК ЦСКА...\n');

const outputDir = path.join(__dirname, '../public/seed-assets');

for (const [teamName, logoUrl] of Object.entries(officialLogos)) {
  try {
    const ext = path.extname(new URL(logoUrl).pathname) || '.png';
    let filename;
    
    if (teamName === 'ЖФК ЦСКА') {
      filename = 'cskaLogo-cska.png';
    } else {
      const slug = teamName.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      filename = `opponentLogo-${slug}${ext}`;
    }
    
    const filepath = path.join(outputDir, filename);
    
    await downloadImage(logoUrl, filepath);
    console.log(`  ✅ ${teamName} -> ${filename}`);
  } catch (error) {
    console.log(`  ❌ ${teamName}: ${error.message}`);
  }
}

console.log('\n✅ Логотипы скачаны!');
console.log('\n📝 Найдено логотипов: 8 из 19 команд');
console.log('\n⚠️  Для остальных команд логотипы не найдены на официальном сайте:');
console.log('   - Динамо, Енисей, Краснодар, Крылья Советов, Локомотив');
console.log('   - Ростов, Рубин, Лидар, Строгино, Торпедо Ижевск, Дончанка');
console.log('\n💡 Эти команды будут использовать текущие логотипы из проекта.');
