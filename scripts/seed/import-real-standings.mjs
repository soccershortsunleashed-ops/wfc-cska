// Import real standings data scraped from official website into database
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize Prisma with Better SQLite3 adapter
const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})
const prisma = new PrismaClient({ adapter })

async function importStandings() {
  console.log('🔄 Importing real standings data from official website...\n')

  // Read scraped data
  const dataPath = path.join(__dirname, '../../seed/standings-real.json')
  const standingsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

  console.log(`📊 Found ${standingsData.length} seasons to import\n`)

  let totalTeams = 0

  for (const season of standingsData) {
    console.log(`Processing ${season.seasonName} (${season.tournament})...`)

    // Delete existing data for this season
    const deleted = await prisma.standingsTeam.deleteMany({
      where: {
        season: season.seasonName,
        tournament: season.tournament
      }
    })

    if (deleted.count > 0) {
      console.log(`  ✓ Deleted ${deleted.count} existing records`)
    }

    // Insert new data
    for (const team of season.teams) {
      await prisma.standingsTeam.create({
        data: {
          season: season.seasonName,
          tournament: season.tournament,
          position: team.position,
          teamName: team.teamName,
          teamLogoUrl: null, // Logo URLs not available from standings page
          played: team.played,
          won: team.won,
          drawn: team.drawn,
          lost: team.lost,
          goalsFor: team.goalsFor,
          goalsAgainst: team.goalsAgainst,
          goalDifference: team.goalsFor - team.goalsAgainst,
          points: team.points,
          form: null // Form data not available from standings page
        }
      })
    }

    console.log(`  ✓ Imported ${season.teams.length} teams`)
    totalTeams += season.teams.length
  }

  console.log(`\n✅ Import complete!`)
  console.log(`📊 Total: ${standingsData.length} seasons, ${totalTeams} team records`)
}

importStandings()
  .catch((error) => {
    console.error('❌ Error importing standings:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
