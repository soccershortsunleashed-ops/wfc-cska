import { NextRequest, NextResponse } from 'next/server'
import { matchesService } from '@/lib/services/matches.service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')

    const matches = await matchesService.getPast(limit)

    return NextResponse.json(matches)
  } catch (error) {
    console.error('Error fetching past matches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch past matches' },
      { status: 500 }
    )
  }
}
