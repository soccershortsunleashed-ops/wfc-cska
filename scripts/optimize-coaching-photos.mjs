import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, '..', 'public', 'seed-assets', 'coaching-staff');
const outputDir = inputDir; // Same directory

async function optimizeImage(filename) {
  const inputPath = path.join(inputDir, filename);
  const tempPath = path.join(inputDir, `temp_${filename}`);
  
  try {
    console.log(`🔄 Optimizing: ${filename}`);
    
    // Read original file size
    const originalSize = fs.statSync(inputPath).size;
    
    // Optimize: resize to max 800px width, convert to JPEG with 85% quality
    await sharp(inputPath)
      .resize(800, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ quality: 85, progressive: true })
      .toFile(tempPath);
    
    // Get new file size
    const newSize = fs.statSync(tempPath).size;
    
    // Replace original with optimized
    fs.unlinkSync(inputPath);
    fs.renameSync(tempPath, inputPath.replace('.png', '.jpg'));
    
    const savedPercent = ((originalSize - newSize) / originalSize * 100).toFixed(1);
    console.log(`✅ ${filename}: ${(originalSize / 1024).toFixed(0)}KB → ${(newSize / 1024).toFixed(0)}KB (saved ${savedPercent}%)`);
    
    return { filename, originalSize, newSize, savedPercent };
  } catch (error) {
    console.error(`❌ Failed to optimize ${filename}:`, error.message);
    // Clean up temp file if it exists
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    return null;
  }
}

async function optimizeAll() {
  console.log('📸 Optimizing coaching staff photos...\n');
  
  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.png'));
  
  if (files.length === 0) {
    console.log('No PNG files found to optimize.');
    return;
  }
  
  const results = [];
  for (const file of files) {
    const result = await optimizeImage(file);
    if (result) {
      results.push(result);
    }
  }
  
  // Calculate totals
  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalNew = results.reduce((sum, r) => sum + r.newSize, 0);
  const totalSaved = ((totalOriginal - totalNew) / totalOriginal * 100).toFixed(1);
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files optimized: ${results.length}`);
  console.log(`   Total original: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Total optimized: ${(totalNew / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Total saved: ${totalSaved}%`);
}

optimizeAll().catch(console.error);
