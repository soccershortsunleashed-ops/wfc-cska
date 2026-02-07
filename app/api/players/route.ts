import { NextRequest, NextResponse } from 'next/server'
import { playersService } from '@/lib/services/players.service'
import { PlayersQuerySchema } from '@/lib/schemas/player.schema'
import { Position, PlayerTeam } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    const query: any = {}
    
    const position = searchParams.get('position')
    if (position) query.position = position
    
    const q = searchParams.get('q')
    if (q) query.q = q
    
    const sort = searchParams.get('sort')
    query.sort = sort || 'number'
    
    const team = searchParams.get('team')
    if (team) query.team = team

    // Validate query params
    const validatedQuery = PlayersQuerySchema.parse(query)

    const players = await playersService.list(validatedQuery)

    return NextResponse.json(players)
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    )
  }
}
