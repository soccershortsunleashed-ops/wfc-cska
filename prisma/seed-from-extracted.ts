import { PrismaClient, Position, PlayerTeam, MatchType } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import fs from 'fs'
import path from 'path'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

type PlayerSeed = {
  slug: string
  firstName: string
  lastName: string
  number: number
  position: string
  birthDate: string
  nationality: string
  heightCm: number | null
  weightKg: number | null
  photoUrl: string
  team: string
}

type NewsSeed = {
  slug: string
  title: string
  excerpt: string
  coverImageUrl: string
  publishedAt: string
}

type MatchSeed = {
  type: string
  opponentName: string
  opponentLogoUrl: string
  cskaLogoUrl?: string
  matchDate: string
  venue: string
  scoreHome: number | null
  scoreAway: number | null
}

function readJson<T>(p: string): T | null {
  try {
    if (!fs.existsSync(p)) return null
    return JSON.parse(fs.readFileSync(p, 'utf8')) as T
  } catch (e) {
    console.warn(`Failed to read ${p}:`, e)
    return null
  }
}

function normalizePosition(pos: string): Position {
  const normalized = pos.toUpperCase()
  if (normalized.includes('ВРАТАР') || normalized.includes('GOALKEEPER')) return Position.GOALKEEPER
  // ВАЖНО: проверяем ПОЛУЗАЩИТ перед ЗАЩИТ, т.к. "ПОЛУЗАЩИТНИК" содержит "ЗАЩИТ"
  if (normalized.includes('ПОЛУЗАЩИТ') || normalized.includes('MIDFIELDER')) return Position.MIDFIELDER
  if (normalized.includes('ЗАЩИТ') || normalized.includes('DEFENDER')) return Position.DEFENDER
  if (normalized.includes('НАПАДАЮЩ') || normalized.includes('FORWARD')) return Position.FORWARD
  return Position.MIDFIELDER
}

function normalizeTeam(team: string): PlayerTeam {
  const normalized = team.toUpperCase()
  if (normalized.includes('YOUTH') || normalized.includes('МОЛОДЕЖ')) return PlayerTeam.YOUTH
  if (normalized.includes('JUNIOR') || normalized.includes('ЮНИОР')) return PlayerTeam.JUNIOR
  return PlayerTeam.MAIN
}

function normalizeMatchType(type: string): MatchType {
  const normalized = type.toUpperCase()
  if (normalized.includes('UPCOMING') || normalized.includes('БЛИЖАЙШ')) return MatchType.UPCOMING
  if (normalized.includes('COMPLETED') || normalized.includes('LAST') || normalized.includes('ПОСЛЕД')) return MatchType.LAST
  return MatchType.UPCOMING
}

async function main() {
  console.log('🌱 Seeding database from extracted data...')

  const seedDir = path.resolve(process.cwd(), 'seed')
  const playersPath = path.join(seedDir, 'players.json')
  const newsPath = path.join(seedDir, 'news.json')
  const matchesPath = path.join(seedDir, 'matches.json')

  // Try to load extracted data
  const extractedPlayers = readJson<PlayerSeed[]>(playersPath)
  const extractedNews = readJson<NewsSeed[]>(newsPath)
  const extractedMatches = readJson<MatchSeed[]>(matchesPath)

  // Clear existing data
  await prisma.match.deleteMany()
  await prisma.news.deleteMany()
  await prisma.player.deleteMany()

  console.log('✅ Cleared existing data')

  // Seed Players
  if (extractedPlayers && extractedPlayers.length > 0) {
    console.log(`📥 Seeding ${extractedPlayers.length} players from extracted data...`)
    
    for (const player of extractedPlayers) {
      try {
        await prisma.player.create({
          data: {
            slug: player.slug,
            firstName: player.firstName,
            lastName: player.lastName,
            number: player.number,
            position: normalizePosition(player.position),
            birthDate: new Date(player.birthDate),
            nationality: player.nationality,
            heightCm: player.heightCm || 170,
            weightKg: player.weightKg || 65,
            photoUrl: player.photoUrl || '',
            team: normalizeTeam(player.team),
          },
        })
      } catch (e) {
        console.warn(`Failed to create player ${player.slug}:`, e)
      }
    }
    
    const count = await prisma.player.count()
    console.log(`✅ Created ${count} players`)
  } else {
    console.log('⚠️  No extracted players found, using default seed data')
    // Fallback to default seed (можно добавить позже)
  }

  // Seed News
  if (extractedNews && extractedNews.length > 0) {
    console.log(`📥 Seeding ${extractedNews.length} news articles from extracted data...`)
    
    for (const newsItem of extractedNews) {
      try {
        // @ts-ignore - content field will be added later
        await prisma.news.create({
          data: {
            slug: newsItem.slug,
            title: newsItem.title,
            excerpt: newsItem.excerpt,
            content: newsItem.excerpt, // Use excerpt as content for now
            coverImageUrl: newsItem.coverImageUrl || '',
            publishedAt: new Date(newsItem.publishedAt),
          },
        })
      } catch (e) {
        console.warn(`Failed to create news ${newsItem.slug}:`, e)
      }
    }
    
    const count = await prisma.news.count()
    console.log(`✅ Created ${count} news articles`)
  } else {
    console.log('⚠️  No extracted news found')
  }

  // Seed Matches
  if (extractedMatches && extractedMatches.length > 0) {
    console.log(`📥 Seeding ${extractedMatches.length} matches from extracted data...`)
    
    for (const match of extractedMatches) {
      try {
        await prisma.match.create({
          // @ts-ignore - using old fields for seed data
          data: {
            type: normalizeMatchType(match.type),
            opponentName: match.opponentName,
            opponentLogoUrl: match.opponentLogoUrl || '',
            cskaLogoUrl: match.cskaLogoUrl || null,
            matchDate: new Date(match.matchDate),
            venue: match.venue,
            scoreHome: match.scoreHome,
            scoreAway: match.scoreAway,
          },
        })
      } catch (e) {
        console.warn(`Failed to create match:`, e)
      }
    }
    
    const count = await prisma.match.count()
    console.log(`✅ Created ${count} matches`)
  } else {
    console.log('⚠️  No extracted matches found')
  }

  console.log('🎉 Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
