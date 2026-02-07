#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../dev.db');
const backupDir = path.join(__dirname, '../backups');

// Создаем директорию для бэкапов, если её нет
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Генерируем имя файла с датой и временем
const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
const backupPath = path.join(backupDir, `dev.db.${timestamp}.backup`);

try {
  // Копируем файл базы данных
  fs.copyFileSync(dbPath, backupPath);
  
  console.log('✅ Резервная копия создана успешно!');
  console.log(`📁 Файл: ${backupPath}`);
  
  // Показываем размер файла
  const stats = fs.statSync(backupPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`📊 Размер: ${sizeMB} MB`);
  
  // Показываем список всех бэкапов
  const backups = fs.readdirSync(backupDir)
    .filter(f => f.startsWith('dev.db.') && f.endsWith('.backup'))
    .sort()
    .reverse();
  
  console.log(`\n📋 Всего резервных копий: ${backups.length}`);
  console.log('\nПоследние 5 копий:');
  backups.slice(0, 5).forEach((backup, i) => {
    const backupFullPath = path.join(backupDir, backup);
    const backupStats = fs.statSync(backupFullPath);
    const backupSizeMB = (backupStats.size / (1024 * 1024)).toFixed(2);
    const backupDate = new Date(backupStats.mtime).toLocaleString('ru-RU');
    console.log(`  ${i + 1}. ${backup} (${backupSizeMB} MB, ${backupDate})`);
  });
  
  // Удаляем старые бэкапы (оставляем последние 10)
  if (backups.length > 10) {
    console.log(`\n🗑️  Удаление старых резервных копий (оставляем последние 10)...`);
    const toDelete = backups.slice(10);
    toDelete.forEach(backup => {
      const backupFullPath = path.join(backupDir, backup);
      fs.unlinkSync(backupFullPath);
      console.log(`  Удалено: ${backup}`);
    });
  }
  
} catch (error) {
  console.error('❌ Ошибка создания резервной копии:', error.message);
  process.exit(1);
}
