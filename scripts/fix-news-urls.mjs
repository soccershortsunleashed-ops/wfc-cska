#!/usr/bin/env node
import fs from "fs";
import path from "path";

const SEED_DIR = path.resolve("./seed");
const newsPath = path.join(SEED_DIR, "news.json");
const assetsPath = path.join(SEED_DIR, "assets-manifest.json");

// Read the files
const news = JSON.parse(fs.readFileSync(newsPath, "utf8"));
const assets = JSON.parse(fs.readFileSync(assetsPath, "utf8"));

// Create a map of old URLs to new URLs for news covers
const urlMap = {};
assets.forEach(asset => {
  if (asset.type === 'newsCover' && asset.slug) {
    const oldUrl = asset.url;
    const newUrl = `/seed-assets/newsCover-${asset.slug}.jpg`;
    urlMap[oldUrl] = newUrl;
  }
});

// Update news items
let updated = 0;
news.forEach(item => {
  if (item.coverImageUrl && urlMap[item.coverImageUrl]) {
    item.coverImageUrl = urlMap[item.coverImageUrl];
    updated++;
  }
});

// Write back
fs.writeFileSync(newsPath, JSON.stringify(news, null, 2), "utf8");

console.log(`✅ Updated ${updated} news items with local image URLs`);
console.log(`📝 Updated file: ${newsPath}`);
