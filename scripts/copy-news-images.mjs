#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WFCCSKA_ROOT = path.resolve(__dirname, "../../wfccska.ru");
const SEED_DIR = path.resolve(__dirname, "../seed");
const PUBLIC_DIR = path.resolve(__dirname, "../public/seed-assets");

// Ensure public directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// Read news.json
const newsPath = path.join(SEED_DIR, "news.json");
const news = JSON.parse(fs.readFileSync(newsPath, "utf8"));

console.log(`📰 Found ${news.length} news articles`);

let copied = 0;
let failed = 0;

// Process each news item
for (const item of news) {
  if (!item.coverImageUrl || item.coverImageUrl === "") {
    console.log(`⚠️  No image for: ${item.slug}`);
    continue;
  }

  // Extract filename from URL
  const urlParts = item.coverImageUrl.split('/');
  const filename = urlParts[urlParts.length - 1];
  
  console.log(`\n🔍 Looking for: ${filename}`);
  
  // Search for the file in wfccska.ru/upload/iblock
  const uploadDir = path.join(WFCCSKA_ROOT, "upload", "iblock");
  
  if (!fs.existsSync(uploadDir)) {
    console.log(`❌ Upload directory not found: ${uploadDir}`);
    failed++;
    continue;
  }

  // Find the file recursively
  let foundFile = null;
  
  function searchFile(dir) {
    if (foundFile) return;
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        if (foundFile) break;
        
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          searchFile(fullPath);
        } else if (item === filename) {
          foundFile = fullPath;
          break;
        }
      }
    } catch (e) {
      // Skip directories we can't read
    }
  }
  
  searchFile(uploadDir);
  
  if (foundFile) {
    // Copy to public/seed-assets with new name
    const destFilename = `newsCover-${item.slug}.jpg`;
    const destPath = path.join(PUBLIC_DIR, destFilename);
    
    try {
      fs.copyFileSync(foundFile, destPath);
      console.log(`✅ Copied: ${destFilename}`);
      copied++;
      
      // Update the URL in news item
      item.coverImageUrl = `/seed-assets/${destFilename}`;
    } catch (e) {
      console.log(`❌ Failed to copy: ${e.message}`);
      failed++;
    }
  } else {
    console.log(`❌ File not found: ${filename}`);
    failed++;
  }
}

// Write updated news.json
fs.writeFileSync(newsPath, JSON.stringify(news, null, 2), "utf8");

console.log(`\n📊 Summary:`);
console.log(`✅ Copied: ${copied}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📝 Updated: ${newsPath}`);
