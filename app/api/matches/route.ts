import { NextRequest, NextResponse } from 'next/server'
import { matchesService } from '@/lib/services/matches.service'
import { MatchStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Получаем параметры из query string
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const tournament = searchParams.get('tournament') || undefined
    const season = searchParams.get('season') || undefined
    const status = searchParams.get('status') as MatchStatus | undefined
    const isHome = searchParams.get('isHome') === 'true' ? true : 
                   searchParams.get('isHome') === 'false' ? false : undefined
    const opponentName = searchParams.get('opponentName') || undefined
    const orderBy = (searchParams.get('orderBy') || 'matchDate') as 'matchDate' | 'createdAt'
    const orderDirection = (searchParams.get('orderDirection') || 'desc') as 'asc' | 'desc'

    const result = await matchesService.list({
      filters: {
        tournament,
        season,
        status,
        isHome,
        opponentName,
      },
      page,
      pageSize,
      orderBy,
      orderDirection,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    )
  }
}
