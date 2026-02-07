#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, '../public/seed-assets');

// Маппинг старых имен на новые
const renameMap = {
  'opponentLogo-.png': [
    { old: 'opponentLogo-.png', new: 'opponentLogo-spartak.png', check: 54037 }, // Спартак
    { old: 'opponentLogo-.png', new: 'opponentLogo-zenit-new.png', check: 3639 }, // Зенит (новый)
    { old: 'opponentLogo-.png', new: 'opponentLogo-chertanovo-new.png', check: 3506 }, // Чертаново (новый)
    { old: 'opponentLogo-.png', new: 'opponentLogo-lokomotiv-new.png', check: 28656 }, // Локомотив (новый)
    { old: 'opponentLogo-.png', new: 'opponentLogo-enisey-new.png', check: 16699 }, // Енисей (новый)
  ],
  'opponentLogo--2005.png': 'opponentLogo-zvezda-2005-new.png', // Звезда-2005
  'opponentLogo-.jpg': 'opponentLogo-rossiyanka-new.jpg', // Россиянка
  'opponentLogo-.jpg': 'opponentLogo-kubanochka-new.jpg', // Кубаночка
  'opponentLogo--.png': 'opponentLogo-ryazan-vdv-new.png', // Рязань-ВДВ
  'opponentLogo--.jpg': 'opponentLogo-torpedo-izhevsk-new.jpg', // Торпедо Ижевск
};

console.log('📝 Переименование скачанных логотипов...\n');

// Получаем список всех файлов с временными метками
const files = fs.readdirSync(outputDir);
const recentFiles = files
  .map(f => ({
    name: f,
    path: path.join(outputDir, f),
    stat: fs.statSync(path.join(outputDir, f))
  }))
  .filter(f => f.stat.isFile())
  .sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);

console.log('Последние скачанные файлы:');
recentFiles.slice(0, 15).forEach(f => {
  const date = f.stat.mtime.toLocaleString('ru-RU');
  const size = f.stat.size;
  console.log(`  ${f.name} (${size} bytes, ${date})`);
});

// Переименовываем по размеру файла
const renames = [
  { size: 13523, oldName: 'cskaLogo-cska.png', newName: 'cskaLogo-cska.png' }, // Уже правильное имя
  { size: 54037, pattern: /^opponentLogo-.*\.png$/, newName: 'opponentLogo-spartak-new.png' },
  { size: 3639, pattern: /^opponentLogo-.*\.png$/, newName: 'opponentLogo-zenit-new.png' },
  { size: 3506, pattern: /^opponentLogo-.*\.png$/, newName: 'opponentLogo-chertanovo-new.png' },
  { size: 18975, pattern: /^opponentLogo-.*\.png$/, newName: 'opponentLogo-zvezda-2005-new.png' },
  { size: 6526, pattern: /^opponentLogo-.*\.jpg$/, newName: 'opponentLogo-rossiyanka-new.jpg' },
  { size: 12745, pattern: /^opponentLogo-.*\.jpg$/, newName: 'opponentLogo-kubanochka-new.jpg' },
  { size: 45293, pattern: /^opponentLogo-.*\.png$/, newName: 'opponentLogo-ryazan-vdv-new.png' },
  { size: 28656, pattern: /^opponentLogo-.*\.png$/, newName: 'opponentLogo-lokomotiv-new.png' },
  { size: 16699, pattern: /^opponentLogo-.*\.png$/, newName: 'opponentLogo-enisey-new.png' },
  { size: 8098, pattern: /^opponentLogo-.*\.jpg$/, newName: 'opponentLogo-torpedo-izhevsk-new.jpg' },
];

console.log('\n🔄 Переименование файлов по размеру:\n');

const today = new Date();
today.setHours(0, 0, 0, 0);

for (const rename of renames) {
  const file = recentFiles.find(f => {
    const matchesSize = f.stat.size === rename.size;
    const matchesPattern = rename.pattern ? rename.pattern.test(f.name) : f.name === rename.oldName;
    const isRecent = f.stat.mtime >= today;
    return matchesSize && matchesPattern && isRecent;
  });

  if (file) {
    const oldPath = file.path;
    const newPath = path.join(outputDir, rename.newName);
    
    try {
      fs.renameSync(oldPath, newPath);
      console.log(`  ✅ ${file.name} -> ${rename.newName}`);
    } catch (error) {
      console.log(`  ❌ ${file.name}: ${error.message}`);
    }
  } else {
    console.log(`  ⚠️  Не найден файл для ${rename.newName} (размер: ${rename.size})`);
  }
}

console.log('\n✅ Готово!');
