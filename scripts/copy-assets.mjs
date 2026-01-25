#!/usr/bin/env node
import fs from "fs";
import path from "path";

const SEED_DIR = path.resolve("./seed");
const PUBLIC_DIR = path.resolve("./public");
const ASSETS_DIR = path.join(PUBLIC_DIR, "seed-assets");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyFileSafe(src, dest) {
  try {
    if (!fs.existsSync(src)) {
      console.warn(`[copy-assets] Source not found: ${src}`);
      return false;
    }
    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
    return true;
  } catch (e) {
    console.warn(`[copy-assets] Failed to copy ${src}:`, e.message);
    return false;
  }
}

function updateJsonUrls(jsonPath, urlMap) {
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  
  if (Array.isArray(data)) {
    data.forEach(item => {
      Object.keys(item).forEach(key => {
        if (typeof item[key] === 'string' && urlMap[item[key]]) {
          item[key] = urlMap[item[key]];
        }
      });
    });
  }
  
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf8");
}

async function main() {
  const manifestPath = path.join(SEED_DIR, "assets-manifest.json");
  const matchesAssetsPath = path.join(SEED_DIR, "matches-assets.json");
  
  // Collect all assets from both manifests
  const allAssets = [];
  
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    allAssets.push(...manifest);
  }
  
  if (fs.existsSync(matchesAssetsPath)) {
    const matchesAssets = JSON.parse(fs.readFileSync(matchesAssetsPath, "utf8"));
    allAssets.push(...matchesAssets);
  }
  
  if (allAssets.length === 0) {
    console.error("[copy-assets] No assets found. Run extract-seed and extract-matches first.");
    process.exit(1);
  }
  
  ensureDir(ASSETS_DIR);
  
  const urlMap = {};
  let copied = 0;
  let failed = 0;

  for (const asset of allAssets) {
    const { type, localPath, url, slug } = asset;
    
    if (!localPath || !fs.existsSync(localPath)) {
      failed++;
      continue;
    }

    const ext = path.extname(localPath);
    const filename = `${type}-${slug || Date.now()}${ext}`;
    const destPath = path.join(ASSETS_DIR, filename);
    const publicUrl = `/seed-assets/${filename}`;

    if (copyFileSafe(localPath, destPath)) {
      urlMap[url] = publicUrl;
      copied++;
    } else {
      failed++;
    }
  }

  // Update JSON files with new URLs
  console.log("[copy-assets] Updating JSON files with new URLs...");
  
  const playersPath = path.join(SEED_DIR, "players.json");
  const newsPath = path.join(SEED_DIR, "news.json");
  const matchesPath = path.join(SEED_DIR, "matches.json");

  if (fs.existsSync(playersPath)) updateJsonUrls(playersPath, urlMap);
  if (fs.existsSync(newsPath)) updateJsonUrls(newsPath, urlMap);
  if (fs.existsSync(matchesPath)) updateJsonUrls(matchesPath, urlMap);

  console.log("[copy-assets] Done.");
  console.log(`Copied: ${copied}`);
  console.log(`Failed: ${failed}`);
  console.log(`Assets directory: ${ASSETS_DIR}`);
}

main().catch((e) => {
  console.error("[copy-assets] ERROR:", e);
  process.exit(1);
});
