import { NextRequest, NextResponse } from 'next/server'
import { matchesService } from '@/lib/services/matches.service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '5')

    const matches = await matchesService.getUpcoming(limit)

    return NextResponse.json(matches)
  } catch (error) {
    console.error('Error fetching upcoming matches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch upcoming matches' },
      { status: 500 }
    )
  }
}
