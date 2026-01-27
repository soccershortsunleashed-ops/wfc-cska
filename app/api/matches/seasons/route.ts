import { NextResponse } from 'next/server'
import { matchesService } from '@/lib/services/matches.service'

export async function GET() {
  try {
    const seasons = await matchesService.getSeasons()

    return NextResponse.json(seasons)
  } catch (error) {
    console.error('Error fetching seasons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch seasons' },
      { status: 500 }
    )
  }
}
