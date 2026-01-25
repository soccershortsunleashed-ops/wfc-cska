import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read players.json
const playersPath = path.resolve(__dirname, '../seed/players.json')
const players = JSON.parse(fs.readFileSync(playersPath, 'utf8'))

console.log(`📊 Analyzing ${players.length} players...`)

// Categorize players based on birth year
// Main squad: Born before 2005 (20+ years old in 2025)
// Youth team: Born 2005-2007 (18-20 years old)
// Junior team: Born 2008 or later (17 and younger)

const categorized = players.map(player => {
  const birthYear = new Date(player.birthDate).getFullYear()
  
  let team
  if (birthYear < 2005) {
    team = 'MAIN'
  } else if (birthYear >= 2005 && birthYear <= 2007) {
    team = 'YOUTH'
  } else {
    team = 'JUNIOR'
  }
  
  return {
    ...player,
    team
  }
})

// Count by team
const mainCount = categorized.filter(p => p.team === 'MAIN').length
const youthCount = categorized.filter(p => p.team === 'YOUTH').length
const juniorCount = categorized.filter(p => p.team === 'JUNIOR').length

console.log('\n📋 Categorization results:')
console.log(`   MAIN squad (born before 2005): ${mainCount} players`)
console.log(`   YOUTH team (born 2005-2007): ${youthCount} players`)
console.log(`   JUNIOR team (born 2008+): ${juniorCount} players`)

// Show some examples
console.log('\n✅ MAIN squad examples:')
categorized
  .filter(p => p.team === 'MAIN')
  .slice(0, 5)
  .forEach(p => {
    const year = new Date(p.birthDate).getFullYear()
    console.log(`   ${p.firstName} ${p.lastName} (${year})`)
  })

console.log('\n👥 YOUTH team examples:')
categorized
  .filter(p => p.team === 'YOUTH')
  .slice(0, 5)
  .forEach(p => {
    const year = new Date(p.birthDate).getFullYear()
    console.log(`   ${p.firstName} ${p.lastName} (${year})`)
  })

console.log('\n🌟 JUNIOR team examples:')
categorized
  .filter(p => p.team === 'JUNIOR')
  .slice(0, 5)
  .forEach(p => {
    const year = new Date(p.birthDate).getFullYear()
    console.log(`   ${p.firstName} ${p.lastName} (${year})`)
  })

// Write updated data
fs.writeFileSync(playersPath, JSON.stringify(categorized, null, 2), 'utf8')

console.log('\n✅ Updated players.json with team categorization')
console.log('📝 Next step: Run "npm run db:seed" to update the database')
