import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dataPath = join(__dirname, '../seed/standings-real.json')

// Read file
const content = readFileSync(dataPath, 'utf-8')
const data = JSON.parse(content)

// Fix tournament name
for (const season of data) {
  season.tournament = 'Суперлига'
  console.log(`Fixed season ${season.seasonName}`)
}

// Write back
writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8')

console.log('\n✅ Tournament names fixed!')
