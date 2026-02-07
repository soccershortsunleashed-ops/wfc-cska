import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { rustatApiService } from '@/lib/services/rustat-api.service'
import type { RustatCachedData } from '@/lib/types/rustat.types'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

// Время жизни кэша - 24 часа
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

/**
 * GET /api/matches/[id]/rustat
 * 
 * Получает детальные данные матча из RuStat API
 * Использует кэш в БД если данные свежие (< 24 часа)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params

    // Получаем матч из БД
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    })

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    // Проверяем есть ли rustatId
    if (!match.rustatId) {
      return NextResponse.json(
        { error: 'Match not synced with RuStat API' },
        { status: 404 }
      )
    }

    // Проверяем кэш
    const now = new Date()
    const cacheValid = 
      match.rustatSynced &&
      match.rustatData &&
      match.rustatSyncedAt &&
      (now.getTime() - match.rustatSyncedAt.getTime()) < CACHE_TTL_MS

    if (cacheValid) {
      console.log(`[RuStat API] Using cached data for match ${matchId}`)
      return NextResponse.json({
        cached: true,
        syncedAt: match.rustatSyncedAt,
        data: JSON.parse(match.rustatData!),
      })
    }

    // Загружаем свежие данные из RuStat API
    console.log(`[RuStat API] Fetching fresh data for match ${matchId} (RuStat ID: ${match.rustatId})`)
    
    const rustatData = await rustatApiService.getMatchFullData(match.rustatId)

    // Сохраняем в кэш
    await prisma.match.update({
      where: { id: matchId },
      data: {
        rustatData: JSON.stringify(rustatData),
        rustatSynced: true,
        rustatSyncedAt: now,
      },
    })

    console.log(`[RuStat API] Data cached for match ${matchId}`)

    return NextResponse.json({
      cached: false,
      syncedAt: now,
      data: rustatData,
    })

  } catch (error) {
    console.error('[RuStat API] Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch match data from RuStat API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/matches/[id]/rustat/refresh
 * 
 * Принудительно обновляет данные из RuStat API (игнорирует кэш)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params

    // Получаем матч из БД
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    })

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    if (!match.rustatId) {
      return NextResponse.json(
        { error: 'Match not synced with RuStat API' },
        { status: 404 }
      )
    }

    console.log(`[RuStat API] Force refresh for match ${matchId} (RuStat ID: ${match.rustatId})`)
    
    // Загружаем свежие данные
    const rustatData = await rustatApiService.getMatchFullData(match.rustatId)
    const now = new Date()

    // Сохраняем в кэш
    await prisma.match.update({
      where: { id: matchId },
      data: {
        rustatData: JSON.stringify(rustatData),
        rustatSynced: true,
        rustatSyncedAt: now,
      },
    })

    return NextResponse.json({
      success: true,
      syncedAt: now,
      data: rustatData,
    })

  } catch (error) {
    console.error('[RuStat API] Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to refresh match data from RuStat API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
