import { NextResponse } from 'next/server'
import { standingsService } from '@/lib/services/standings.service'
import prisma from '@/lib/db/prisma'

export async function POST() {
  try {
    // Получаем уникальные турниры и сезоны из матчей
    const matches = await prisma.match.findMany({
      where: {
        status: 'FINISHED',
        tournament: { not: null },
      },
      select: {
        tournament: true,
        season: true,
      },
      distinct: ['tournament', 'season'],
    })

    const results = []

    for (const { tournament, season } of matches) {
      if (!tournament) continue

      const count = await standingsService.updateStandingsFromMatches(tournament, season)
      results.push({ tournament, season, teams: count })
    }

    return NextResponse.json({
      success: true,
      message: 'Турнирные таблицы обновлены',
      results,
    })
  } catch (error) {
    console.error('Error updating standings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update standings' },
      { status: 500 }
    )
  }
}
