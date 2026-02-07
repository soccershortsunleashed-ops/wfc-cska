import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read coaching staff data
const coachingStaffPath = path.join(__dirname, '..', 'seed', 'coaching-staff.json');
const coachingStaff = JSON.parse(fs.readFileSync(coachingStaffPath, 'utf-8'));

// Create directory for photos
const photosDir = path.join(__dirname, '..', 'public', 'seed-assets', 'coaching-staff');
if (!fs.existsSync(photosDir)) {
  fs.mkdirSync(photosDir, { recursive: true });
}

// Download a single photo
function downloadPhoto(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(photosDir, filename);
    
    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`⏭️  Skipped (already exists): ${filename}`);
      resolve();
      return;
    }

    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

// Download all photos
async function downloadAllPhotos() {
  console.log(`📥 Downloading ${coachingStaff.length} coaching staff photos...\n`);
  
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const coach of coachingStaff) {
    try {
      const existed = fs.existsSync(path.join(photosDir, coach.photoFilename));
      await downloadPhoto(coach.photoUrl, coach.photoFilename);
      if (existed) {
        skipped++;
      } else {
        downloaded++;
      }
    } catch (error) {
      console.error(`❌ Failed to download ${coach.name}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Downloaded: ${downloaded}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total: ${coachingStaff.length}`);
}

downloadAllPhotos().catch(console.error);
