#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
});
const prisma = new PrismaClient({ adapter });

// Логотипы с официального сайта ЖФК ЦСКА
const officialLogos = {
  'Спартак': 'https://wfccska.ru/upload/iblock/951/qgm6y9bwenjfkql7sg4mzvi10uxpt7ob/FC_Spartak_Moscow_Logotype.svg.png',
  'ЖФК ЦСКА': 'https://wfccska.ru/upload/iblock/ab2/j9egqr27xk8lsljr7h55sicicqkcn0zo/Dlya_sayta.png',
  'Зенит': 'https://wfccska.ru/upload/iblock/264/Na-sayt.png',
  'Чертаново': 'https://wfccska.ru/upload/iblock/275/lrdutcx0l2wa3lcmgykvkphw9cwj7843/CHERT_Symbol_.png',
  'Звезда-2005': 'https://wfccska.ru/upload/iblock/a0b/t1may0whct2i6et3ke7hz2n6ahtxjv1r/Zvezda_2005_logotip.png',
  'Россиянка': 'https://wfccska.ru/upload/iblock/47b/5ac4af46a7d59_173x173.jpg',
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
    const filename = `opponentLogo-${teamName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}${ext}`;
    const filepath = path.join(outputDir, filename);
    
    await downloadImage(logoUrl, filepath);
    console.log(`  ✅ ${teamName} -> ${filename}`);
  } catch (error) {
    console.log(`  ❌ ${teamName}: ${error.message}`);
  }
}

console.log('\n✅ Логотипы скачаны!\n');

// Теперь обновляем пути в базе данных
console.log('🔄 Обновление путей к логотипам в базе данных...\n');

const teamLogoPaths = {
  'Спартак': '/seed-assets/opponentLogo-spartak.png',
  'ЖФК ЦСКА': '/seed-assets/cskaLogo-cska.png',
  'Зенит': '/seed-assets/opponentLogo-zenit.png',
  'Чертаново': '/seed-assets/opponentLogo-chertanovo.png',
  'Звезда-2005': '/seed-assets/opponentLogo-zvezda-2005.png',
  'Россиянка': '/seed-assets/opponentLogo-rossiyanka.jpg',
};

for (const [teamName, logoPath] of Object.entries(teamLogoPaths)) {
  const updated = await prisma.standingsTeam.updateMany({
    where: { teamName },
    data: { teamLogoUrl: logoPath }
  });
  
  console.log(`  ✅ ${teamName}: обновлено ${updated.count} записей`);
}

console.log('\n✅ Готово!');

await prisma.$disconnect();
