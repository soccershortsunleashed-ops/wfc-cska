#!/usr/bin/env node

/**
 * Сопоставление игроков из БД с игроками в RuStat API
 * 
 * Алгоритм:
 * 1. Получить всех игроков основного состава из БД
 * 2. Получить список игроков ЦСКА из RuStat (из последнего матча)
 * 3. Сопоставить по имени и номеру
 * 4. Сохранить rustatId и rustatName в БД
 * 5. Создать отчет о несопоставленных игроках
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

const RUSTAT_API_URL = 'https://api-football.rustatsport.ru'
const RUSTAT_TOKEN = process.env.RUSTAT_TOKEN
const CSKA_TEAM_ID = 13503
const DEBUG = process.argv.includes('--debug')

if (!RUSTAT_TOKEN) {
  console.error('❌ RUSTAT_TOKEN не найден в .env файле!')
  process.exit(1)
}

// ============================================================================
// Получение игроков из RuStat
// ============================================================================

async function getRustatPlayers() {
  console.log('📥 Получение игроков ЦСКА из RuStat...\n')
  
  try {
    // Получаем игроков команды напрямую
    const playersResponse = await fetch(
      `${RUSTAT_API_URL}/teams/${CSKA_TEAM_ID}/players`,
      {
        headers: { 'Authorization': `Bearer ${RUSTAT_TOKEN}` },
      }
    )

    if (!playersResponse.ok) {
      throw new Error(`HTTP ${playersResponse.status}`)
    }

    const data = await playersResponse.json()
    
    // Данные приходят сгруппированными по позициям
    // Нужно извлечь всех игроков из всех групп
    const allPlayers = []
    
    if (Array.isArray(data)) {
      for (const group of data) {
        if (group.players && Array.isArray(group.players)) {
          allPlayers.push(...group.players)
        }
      }
    }
    
    console.log(`✅ Получено ${allPlayers.length} игроков ЦСКА\n`)
    
    return allPlayers

  } catch (error) {
    console.error('❌ Ошибка получения игроков:', error.message)
    throw error
  }
}

// ============================================================================
// Нормализация имен
// ============================================================================

function normalizeName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
}

function extractNames(fullName) {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length >= 2) {
    return {
      lastName: parts[0],
      firstName: parts[1],
    }
  }
  return { lastName: fullName, firstName: '' }
}

/**
 * Извлечь имя и фамилию из формата RuStat "И. Фамилия"
 */
function extractRustatNames(rustatName) {
  const parts = rustatName.trim().split(/\s+/)
  
  if (parts.length >= 2) {
    // Формат: "И. Фамилия" или "Имя Фамилия"
    const firstPart = parts[0]
    const lastName = parts.slice(1).join(' ')
    
    // Проверяем, сокращенное ли имя (заканчивается на точку)
    if (firstPart.endsWith('.')) {
      return {
        lastName,
        firstName: '',
        firstLetter: firstPart.charAt(0),
      }
    } else {
      return {
        lastName,
        firstName: firstPart,
        firstLetter: firstPart.charAt(0),
      }
    }
  }
  
  return { lastName: rustatName, firstName: '', firstLetter: '' }
}

// ============================================================================
// Сопоставление игроков
// ============================================================================

async function matchPlayers() {
  console.log('🔍 Сопоставление игроков...\n')
  
  try {
    // Получаем игроков из БД
    const dbPlayers = await prisma.player.findMany({
      where: {
        team: 'MAIN', // Только основной состав
      },
      orderBy: {
        number: 'asc',
      },
    })

    console.log(`   Игроков в БД: ${dbPlayers.length}`)

    // Получаем игроков из RuStat
    const rustatPlayers = await getRustatPlayers()

    let matched = 0
    let alreadyMatched = 0
    const unmatched = []

    for (const dbPlayer of dbPlayers) {
      // Пропускаем уже сопоставленных
      if (dbPlayer.rustatId) {
        alreadyMatched++
        continue
      }

      const dbFullName = `${dbPlayer.lastName} ${dbPlayer.firstName}`
      const dbNameNorm = normalizeName(dbFullName)
      const dbLastNameNorm = normalizeName(dbPlayer.lastName)
      const dbFirstNameNorm = normalizeName(dbPlayer.firstName)
      const dbFirstLetter = dbFirstNameNorm.charAt(0)

      if (DEBUG) {
        console.log(`\n🔍 Ищем: ${dbFullName} (#${dbPlayer.number})`)
        console.log(`   Нормализовано: "${dbNameNorm}"`)
        console.log(`   Фамилия: "${dbLastNameNorm}", Имя: "${dbFirstNameNorm}", Буква: "${dbFirstLetter}"`)
      }

      // Ищем совпадение
      let rustatPlayer = null
      let matchMethod = ''

      // 1. Точное совпадение по полному имени (БД: "Фамилия Имя", RuStat: "Имя Фамилия")
      rustatPlayer = rustatPlayers.find(rp => {
        const rpNameNorm = normalizeName(rp.name_rus)
        const rpReversed = rpNameNorm.split(' ').reverse().join(' ')
        return rpNameNorm === dbNameNorm || rpReversed === dbNameNorm
      })
      if (rustatPlayer) matchMethod = 'точное совпадение'

      // 2. Совпадение по фамилии и первой букве имени (RuStat: "И. Фамилия")
      if (!rustatPlayer) {
        rustatPlayer = rustatPlayers.find(rp => {
          const rpNames = extractRustatNames(rp.name_rus)
          const rpLastNameNorm = normalizeName(rpNames.lastName)
          const rpFirstLetter = normalizeName(rpNames.firstLetter)
          
          if (DEBUG && rpLastNameNorm === dbLastNameNorm) {
            console.log(`   Кандидат: ${rp.name_rus} (фамилия совпала, буква: "${rpFirstLetter}" vs "${dbFirstLetter}")`)
          }
          
          return rpLastNameNorm === dbLastNameNorm && rpFirstLetter === dbFirstLetter
        })
        if (rustatPlayer) matchMethod = 'фамилия + первая буква'
      }

      // 3. Совпадение по фамилии и полному имени (RuStat: "Имя Фамилия")
      if (!rustatPlayer) {
        rustatPlayer = rustatPlayers.find(rp => {
          const rpNames = extractRustatNames(rp.name_rus)
          const rpLastNameNorm = normalizeName(rpNames.lastName)
          const rpFirstNameNorm = normalizeName(rpNames.firstName)
          
          return rpLastNameNorm === dbLastNameNorm && rpFirstNameNorm === dbFirstNameNorm
        })
        if (rustatPlayer) matchMethod = 'фамилия + полное имя'
      }

      // 4. Совпадение только по фамилии (если уникальная)
      if (!rustatPlayer) {
        const candidates = rustatPlayers.filter(rp => {
          const rpNames = extractRustatNames(rp.name_rus)
          const rpLastNameNorm = normalizeName(rpNames.lastName)
          return rpLastNameNorm === dbLastNameNorm
        })
        
        if (DEBUG && candidates.length > 0) {
          console.log(`   Кандидаты по фамилии (${candidates.length}):`, candidates.map(c => c.name_rus).join(', '))
        }
        
        // Используем только если найден один кандидат
        if (candidates.length === 1) {
          rustatPlayer = candidates[0]
          matchMethod = 'уникальная фамилия'
        }
      }

      // 5. Совпадение по номеру (если уникальный)
      if (!rustatPlayer && dbPlayer.number) {
        const candidates = rustatPlayers.filter(rp => rp.number === dbPlayer.number)
        
        if (candidates.length === 1) {
          rustatPlayer = candidates[0]
          matchMethod = 'уникальный номер'
        }
      }

      if (rustatPlayer) {
        // Сохраняем сопоставление
        await prisma.player.update({
          where: { id: dbPlayer.id },
          data: {
            rustatId: rustatPlayer.id,
            rustatName: rustatPlayer.name_rus,
          },
        })

        console.log(`✅ ${dbFullName} (#${dbPlayer.number}) → RuStat ID: ${rustatPlayer.id} (${rustatPlayer.name_rus}) [${matchMethod}]`)
        matched++
      } else {
        console.log(`⚠️  ${dbFullName} (#${dbPlayer.number}) → не найден в RuStat`)
        unmatched.push(dbPlayer)
      }
    }

    // Итоги
    console.log()
    console.log('='.repeat(80))
    console.log('\n📊 Итоговая статистика:')
    console.log(`   ✅ Сопоставлено: ${matched}`)
    console.log(`   ⏭️  Уже сопоставлено: ${alreadyMatched}`)
    console.log(`   ⚠️  Не найдено: ${unmatched.length}`)
    console.log()

    if (unmatched.length > 0) {
      console.log('⚠️  Несопоставленные игроки:')
      for (const player of unmatched) {
        console.log(`   - ${player.lastName} ${player.firstName} (#${player.number})`)
      }
      console.log()
      console.log('💡 Эти игроки могут быть:')
      console.log('   - Имеют другое написание имени в RuStat')
      console.log('   - Новые игроки, еще не добавленные в RuStat')
      console.log('   - Игроки молодежного/юниорского состава')
      console.log()
      
      // Показываем всех игроков из RuStat для ручной проверки
      console.log('📋 Все игроки ЦСКА в RuStat:')
      for (const rp of rustatPlayers) {
        const alreadyMatched = await prisma.player.findFirst({
          where: { rustatId: rp.id }
        })
        const status = alreadyMatched ? '✅' : '  '
        console.log(`   ${status} #${rp.number || '??'} ${rp.name_rus} (ID: ${rp.id})`)
      }
      console.log()
    }

    return { matched, alreadyMatched, unmatched: unmatched.length }

  } catch (error) {
    console.error('\n❌ Критическая ошибка:', error.message)
    throw error
  }
}

// ============================================================================
// Главная функция
// ============================================================================

async function main() {
  console.log('\n🚀 Сопоставление игроков с RuStat API\n')
  console.log('='.repeat(80))
  console.log()

  try {
    const result = await matchPlayers()

    if (result.matched > 0) {
      console.log('✅ Сопоставление завершено успешно!')
      console.log('💡 Теперь можно запустить синхронизацию статистики:')
      console.log('   node scripts/sync-player-stats.mjs')
      console.log()
    } else if (result.alreadyMatched > 0) {
      console.log('✅ Все игроки уже сопоставлены!')
      console.log()
    }

  } catch (error) {
    console.error('\n❌ Ошибка выполнения:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
