import { NextResponse } from 'next/server'
import { matchesService } from '@/lib/services/matches.service'

export async function GET() {
  try {
    const tournaments = await matchesService.getTournaments()

    return NextResponse.json(tournaments)
  } catch (error) {
    console.error('Error fetching tournaments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tournaments' },
      { status: 500 }
    )
  }
}
