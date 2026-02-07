// Simple script to import real standings data
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function importStandings() {
  console.log('🔄 Importing real standings data...\n')

  try {
    // Read scraped data
    const dataPath = path.join(__dirname, '../seed/standings-real.json')
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
            teamLogoUrl: null,
            played: team.played,
            won: team.won,
            drawn: team.drawn,
            lost: team.lost,
            goalsFor: team.goalsFor,
            goalsAgainst: team.goalsAgainst,
            goalDifference: team.goalsFor - team.goalsAgainst,
            points: team.points,
            form: null
          }
        })
      }

      console.log(`  ✓ Imported ${season.teams.length} teams`)
      totalTeams += season.teams.length
    }

    console.log(`\n✅ Import complete!`)
    console.log(`📊 Total: ${standingsData.length} seasons, ${totalTeams} team records`)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

importStandings()
