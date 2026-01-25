import { NextResponse } from 'next/server'
import { matchesService } from '@/lib/services/matches.service'

export async function GET() {
  try {
    const matches = await matchesService.getUpcomingAndLast()

    return NextResponse.json(matches)
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    )
  }
}
