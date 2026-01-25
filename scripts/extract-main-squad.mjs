import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { JSDOM } from 'jsdom'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read the main squad HTML page
const htmlPath = path.resolve(__dirname, '../../wfccska.ru/komanda/o-komande/index.html')
const html = fs.readFileSync(htmlPath, 'utf8')

// Parse HTML
const dom = new JSDOM(html)
const document = dom.window.document

// Extract player slugs from links
const playerLinks = document.querySelectorAll('a.card-player')
const mainSquadSlugs = new Set()

playerLinks.forEach(link => {
  const href = link.getAttribute('href')
  if (href && href.includes('../igroki/')) {
    const slug = href.replace('../igroki/', '').replace('/index.html', '')
    mainSquadSlugs.add(slug)
  }
})

console.log(`📋 Found ${mainSquadSlugs.size} players in main squad from HTML`)

// Read current players.json
const playersPath = path.resolve(__dirname, '../seed/players.json')
const players = JSON.parse(fs.readFileSync(playersPath, 'utf8'))

// Update team assignments
const updated = players.map(player => {
  if (mainSquadSlugs.has(player.slug)) {
    return { ...player, team: 'MAIN' }
  } else {
    // If not in main squad, categorize by age
    const birthYear = new Date(player.birthDate).getFullYear()
    const team = birthYear >= 2008 ? 'JUNIOR' : 'YOUTH'
    return { ...player, team }
  }
})

// Count results
const mainCount = updated.filter(p => p.team === 'MAIN').length
const youthCount = updated.filter(p => p.team === 'YOUTH').length
const juniorCount = updated.filter(p => p.team === 'JUNIOR').length

console.log('\n✅ Team assignments:')
console.log(`   MAIN squad: ${mainCount} players`)
console.log(`   YOUTH team: ${youthCount} players`)
console.log(`   JUNIOR team: ${juniorCount} players`)

// Show main squad players
console.log('\n📋 MAIN squad players:')
updated
  .filter(p => p.team === 'MAIN')
  .sort((a, b) => a.number - b.number)
  .forEach(p => {
    console.log(`   #${p.number} ${p.firstName} ${p.lastName}`)
  })

// Write updated data
fs.writeFileSync(playersPath, JSON.stringify(updated, null, 2), 'utf8')

console.log('\n✅ Updated players.json')
console.log('📝 Next: Run "npm run db:seed" to update database')
