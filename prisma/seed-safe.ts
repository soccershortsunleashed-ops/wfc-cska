import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import fs from 'fs'
import path from 'path'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

/**
 * БЕЗОПАСНЫЙ СКРИПТ ЗАГРУЗКИ ДАННЫХ
 * 
 * Этот скрипт НЕ удаляет существующие данные!
 * Он только добавляет новые записи или обновляет существующие.
 * 
 * Использование:
 *   npm run seed:safe
 */

function readJson<T>(filePath: string): T | null {
  try {
    const fullPath = path.resolve(process.cwd(), filePath)
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Файл не найден: ${filePath}`)
      return null
    }
    return JSON.parse(fs.readFileSync(fullPath, 'utf8')) as T
  } catch (e) {
    console.warn(`❌ Ошибка чтения ${filePath}:`, e)
    return null
  }
}

async function loadStandings() {
  console.log('\n📊 Загрузка турнирных таблиц...')
  
  const data = readJson<any[]>('seed/standings-real-all-fixed.json')
  if (!data) return
  
  let added = 0
  let skipped = 0
  
  for (const season of data) {
    for (const team of season.teams) {
      // Проверяем, существует ли уже эта запись
      const existing = await prisma.standingsTeam.findFirst({
        where: {
          season: season.seasonName,
          tournament: season.tournament,
          teamName: team.teamName
        }
      })
      
      if (existing) {
        skipped++
        continue
      }
      
      // Добавляем только новые записи
      await prisma.standingsTeam.create({
        data: {
          season: season.seasonName,
          tournament: season.tournament,
          position: team.position,
          teamName: team.teamName,
          teamLogoUrl: team.teamLogoUrl || null,
          played: team.played,
          won: team.won,
          drawn: team.drawn,
          lost: team.lost,
          goalsFor: team.goalsFor,
          goalsAgainst: team.goalsAgainst,
          goalDifference: team.goalsFor - team.goalsAgainst,
          points: team.points,
          form: team.form || null
        }
      })
      added++
    }
  }
  
  console.log(`  ✅ Добавлено: ${added}, Пропущено (уже есть): ${skipped}`)
}

async function loadPlayers() {
  console.log('\n👥 Загрузка игроков...')
  
  const data = readJson<any[]>('seed/players.json')
  if (!data) return
  
  let added = 0
  let updated = 0
  
  for (const player of data) {
    const existing = await prisma.player.findUnique({
      where: { slug: player.slug }
    })
    
    const playerData = {
      firstName: player.firstName,
      lastName: player.lastName,
      number: player.number,
      position: player.position,
      birthDate: new Date(player.birthDate),
      nationality: player.nationality,
      heightCm: player.heightCm || 170,
      weightKg: player.weightKg || 65,
      photoUrl: player.photoUrl || '',
      team: player.team
    }
    
    if (existing) {
      // Обновляем существующего игрока
      await prisma.player.update({
        where: { slug: player.slug },
        data: playerData
      })
      updated++
    } else {
      // Добавляем нового игрока
      await prisma.player.create({
        data: {
          slug: player.slug,
          ...playerData
        }
      })
      added++
    }
  }
  
  console.log(`  ✅ Добавлено: ${added}, Обновлено: ${updated}`)
}

async function loadNews() {
  console.log('\n📰 Загрузка новостей...')
  
  const data = readJson<any[]>('seed/news-2025-full.json')
  if (!data) return
  
  let added = 0
  let skipped = 0
  
  for (const newsItem of data) {
    const existing = await prisma.news.findUnique({
      where: { slug: newsItem.slug }
    })
    
    if (existing) {
      skipped++
      continue
    }
    
    await prisma.news.create({
      data: {
        slug: newsItem.slug,
        title: newsItem.title,
        excerpt: newsItem.excerpt,
        content: newsItem.content || newsItem.excerpt || '',
        coverImageUrl: newsItem.coverImageUrl || '',
        publishedAt: new Date(newsItem.publishedAt),
        category: newsItem.category || null,
        // @ts-ignore - tags field doesn't exist in schema
        // tags: newsItem.tags || null,
        // author: newsItem.author || null,
        // views: newsItem.views || 0,
        // featured: newsItem.featured || false
      }
    })
    added++
  }
  
  console.log(`  ✅ Добавлено: ${added}, Пропущено (уже есть): ${skipped}`)
}

async function loadMatches() {
  console.log('\n⚽ Загрузка матчей...')
  
  const data = readJson<any[]>('seed/matches-full.json')
  if (!data) return
  
  let added = 0
  let updated = 0
  
  for (const match of data) {
    // Ищем существующий матч по дате и сопернику
    const existing = await prisma.match.findFirst({
      where: {
        matchDate: new Date(match.matchDate),
        opponentName: match.opponentName
      }
    })
    
    const matchData = {
      // @ts-ignore - using old fields for seed data
      type: match.type,
      opponentName: match.opponentName,
      opponentLogoUrl: match.opponentLogoUrl || '',
      cskaLogoUrl: match.cskaLogoUrl || null,
      matchDate: new Date(match.matchDate),
      venue: match.venue,
      scoreHome: match.scoreHome,
      scoreAway: match.scoreAway,
      tournament: match.tournament || null,
      season: match.season || null
    }
    
    if (existing) {
      // Обновляем существующий матч
      await prisma.match.update({
        where: { id: existing.id },
        data: matchData
      })
      updated++
    } else {
      // Добавляем новый матч
      await prisma.match.create({
        // @ts-ignore - using old fields for seed data
        data: matchData
      })
      added++
    }
  }
  
  console.log(`  ✅ Добавлено: ${added}, Обновлено: ${updated}`)
}

async function loadCoachingStaff() {
  console.log('\n👔 Загрузка тренерского штаба...')
  console.log('  ⚠️  Модель CoachingStaff не существует в схеме - пропускаем')
  
  // @ts-ignore - CoachingStaff model doesn't exist
  /*
  const data = readJson<any[]>('seed/coaching-staff.json')
  if (!data) return
  
  let added = 0
  let updated = 0
  
  for (const staff of data) {
    const existing = await prisma.coachingStaff.findUnique({
      where: { slug: staff.slug }
    })
    
    const staffData = {
      firstName: staff.firstName,
      lastName: staff.lastName,
      role: staff.role,
      birthDate: staff.birthDate ? new Date(staff.birthDate) : null,
      nationality: staff.nationality,
      photoUrl: staff.photoUrl || '',
      team: staff.team,
      bio: staff.bio || null
    }
    
    if (existing) {
      await prisma.coachingStaff.update({
        where: { slug: staff.slug },
        data: staffData
      })
      updated++
    } else {
      await prisma.coachingStaff.create({
        data: {
          slug: staff.slug,
          ...staffData
        }
      })
      added++
    }
  }
  
  console.log(`  ✅ Добавлено: ${added}, Обновлено: ${updated}`)
  */
}

async function checkDatabase() {
  console.log('\n📋 Проверка текущего состояния базы данных...')
  
  const counts = {
    players: await prisma.player.count(),
    news: await prisma.news.count(),
    matches: await prisma.match.count(),
    standings: await prisma.standingsTeam.count(),
    // coaching: await prisma.coachingStaff.count() // Model doesn't exist
  }
  
  console.log(`  Игроки: ${counts.players}`)
  console.log(`  Новости: ${counts.news}`)
  console.log(`  Матчи: ${counts.matches}`)
  console.log(`  Турнирные таблицы: ${counts.standings}`)
  // console.log(`  Тренерский штаб: ${counts.coaching}`)
  
  return counts
}

async function main() {
  console.log('🌱 БЕЗОПАСНАЯ ЗАГРУЗКА ДАННЫХ')
  console.log('=' .repeat(50))
  console.log('⚠️  Этот скрипт НЕ удаляет существующие данные!')
  console.log('=' .repeat(50))
  
  // Проверяем состояние до загрузки
  const beforeCounts = await checkDatabase()
  
  // Загружаем данные
  await loadStandings()
  await loadPlayers()
  await loadNews()
  await loadMatches()
  await loadCoachingStaff()
  
  // Проверяем состояние после загрузки
  console.log('\n' + '='.repeat(50))
  const afterCounts = await checkDatabase()
  
  console.log('\n📊 Изменения:')
  console.log(`  Игроки: ${beforeCounts.players} → ${afterCounts.players} (+${afterCounts.players - beforeCounts.players})`)
  console.log(`  Новости: ${beforeCounts.news} → ${afterCounts.news} (+${afterCounts.news - beforeCounts.news})`)
  console.log(`  Матчи: ${beforeCounts.matches} → ${afterCounts.matches} (+${afterCounts.matches - beforeCounts.matches})`)
  console.log(`  Турнирные таблицы: ${beforeCounts.standings} → ${afterCounts.standings} (+${afterCounts.standings - beforeCounts.standings})`)
  // console.log(`  Тренерский штаб: ${beforeCounts.coaching} → ${afterCounts.coaching} (+${afterCounts.coaching - beforeCounts.coaching})`)
  
  console.log('\n🎉 Загрузка завершена успешно!')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка загрузки:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
