import { NextRequest, NextResponse } from 'next/server'
import { matchesService } from '@/lib/services/matches.service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tournament = searchParams.get('tournament') || undefined
    const season = searchParams.get('season') || undefined

    const stats = await matchesService.getStats({
      tournament,
      season,
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching match stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch match stats' },
      { status: 500 }
    )
  }
}
