import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:../dev.db'
})

const prisma = new PrismaClient({ adapter })

async function updateTeamLogos() {
  console.log('🔄 Обновление логотипов команд в турнирной таблице...\n')

  try {
    // Получаем маппинг команд и их логотипов из матчей
    const matches = await prisma.match.findMany({
      where: {
        opponentLogoUrl: { not: null }
      },
      select: {
        opponentName: true,
        opponentLogoUrl: true
      },
      distinct: ['opponentName']
    })
    
    // Создаем маппинг название команды -> логотип
    const teamLogos = new Map()
    matches.forEach(match => {
      teamLogos.set(match.opponentName, match.opponentLogoUrl)
    })
    
    // Добавляем логотип ЦСКА
    const cskaMatch = await prisma.match.findFirst({
      where: {
        cskaLogoUrl: { not: null }
      },
      select: {
        cskaLogoUrl: true
      }
    })
    
    if (cskaMatch?.cskaLogoUrl) {
      teamLogos.set('ЖФК ЦСКА', cskaMatch.cskaLogoUrl)
      teamLogos.set('ЦСКА', cskaMatch.cskaLogoUrl)
    }
    
    console.log(`📊 Найдено ${teamLogos.size} логотипов команд\n`)
    
    // Получаем все команды из турнирной таблицы
    const standingsTeams = await prisma.standingsTeam.findMany({
      select: {
        id: true,
        teamName: true,
        teamLogoUrl: true
      }
    })
    
    let updated = 0
    let notFound = 0
    
    for (const team of standingsTeams) {
      const logoUrl = teamLogos.get(team.teamName)
      
      if (logoUrl && logoUrl !== team.teamLogoUrl) {
        await prisma.standingsTeam.update({
          where: { id: team.id },
          data: { teamLogoUrl: logoUrl }
        })
        
        console.log(`✓ ${team.teamName}: ${logoUrl}`)
        updated++
      } else if (!logoUrl) {
        console.log(`⚠ ${team.teamName}: логотип не найден`)
        notFound++
      }
    }
    
    console.log(`\n✅ Готово!`)
    console.log(`   Обновлено: ${updated}`)
    console.log(`   Не найдено: ${notFound}`)
    
  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateTeamLogos()
