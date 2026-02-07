// API endpoint to import real standings data from scraped JSON file
import { NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import fs from 'fs'
import path from 'path'

export async function POST() {
  try {
    console.log('🔄 Importing real standings data...')

    // Read scraped data
    const dataPath = path.join(process.cwd(), 'seed', 'standings-real.json')
    
    // Check if file exists
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json(
        { success: false, error: `File not found: ${dataPath}` },
        { status: 404 }
      )
    }
    
    const standingsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

    console.log(`📊 Found ${standingsData.length} seasons to import`)

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

    console.log(`✅ Import complete! Total: ${standingsData.length} seasons, ${totalTeams} team records`)

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${standingsData.length} seasons with ${totalTeams} team records`,
      seasons: standingsData.length,
      teams: totalTeams
    })
  } catch (error) {
    console.error('❌ Error importing standings:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
