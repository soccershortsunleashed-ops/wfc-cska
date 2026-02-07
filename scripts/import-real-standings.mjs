import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Create adapter with database URL (relative to project root)
const adapter = new PrismaBetterSqlite3({
  url: 'file:../dev.db'
})

// Create Prisma Client with adapter
const prisma = new PrismaClient({ adapter })

async function importRealStandings() {
  console.log('🔄 Importing real standings data from official website...\n')

  try {
    // Read scraped data
    const dataPath = join(__dirname, '../seed/standings-real.json')
    const fileContent = readFileSync(dataPath, 'utf-8')
    // Remove BOM if present
    const cleanContent = fileContent.replace(/^\uFEFF/, '')
    const standingsData = JSON.parse(cleanContent)

    console.log(`📊 Found ${standingsData.length} seasons to import\n`)

    let totalTeams = 0
    let totalDeleted = 0

    for (const season of standingsData) {
      // Fix double-encoded UTF-8 tournament name
      let tournamentName = season.tournament
      try {
        // Try to decode if it's double-encoded
        const buffer = Buffer.from(tournamentName, 'latin1')
        const decoded = buffer.toString('utf-8')
        if (decoded.includes('Суперлига')) {
          tournamentName = decoded
        }
      } catch (e) {
        // If decoding fails, use original
      }
      
      console.log(`⚽ Processing ${season.seasonName} (${tournamentName})...`)

      // Delete existing data for this season/tournament
      const deleted = await prisma.standingsTeam.deleteMany({
        where: {
          season: season.seasonName,
          tournament: tournamentName
        }
      })

      if (deleted.count > 0) {
        console.log(`   ✓ Deleted ${deleted.count} existing records`)
        totalDeleted += deleted.count
      }

      // Insert new data
      for (const team of season.teams) {
        await prisma.standingsTeam.create({
          data: {
            season: season.seasonName,
            tournament: tournamentName,
            position: team.position,
            teamName: team.teamName,
            teamLogoUrl: null, // Will be populated later from matches
            played: team.played,
            won: team.won,
            drawn: team.drawn,
            lost: team.lost,
            goalsFor: team.goalsFor,
            goalsAgainst: team.goalsAgainst,
            goalDifference: team.goalsFor - team.goalsAgainst,
            points: team.points,
            form: null // Will be calculated later from matches
          }
        })
      }

      console.log(`   ✓ Imported ${season.teams.length} teams`)
      totalTeams += season.teams.length
    }

    console.log(`\n✅ Import complete!`)
    console.log(`📊 Total: ${standingsData.length} seasons`)
    console.log(`🗑️  Deleted: ${totalDeleted} old records`)
    console.log(`✨ Imported: ${totalTeams} team records`)
    
    // Show breakdown by season
    console.log('\n📋 Season breakdown:')
    for (const season of standingsData) {
      console.log(`   ${season.seasonName}: ${season.teams.length} teams`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

importRealStandings()
