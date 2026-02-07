import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

// Функция нормализации имени для сравнения
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\s+/g, '')
    .trim()
}

// Функция извлечения фамилии
function extractLastName(fullName) {
  // Для формата "Фамилия И." или "И. Фамилия"
  const parts = fullName.split(/\s+/)
  
  // Если первая часть - инициал (1-2 символа с точкой)
  if (parts[0].length <= 3 && parts[0].includes('.')) {
    return parts[1] || parts[0]
  }
  
  // Иначе первая часть - фамилия
  return parts[0]
}

async function main() {
  console.log('\n🔍 Сопоставление игроков по именам\n')
  
  // Игроки с фото, но без RuStat ID
  const withPhoto = await prisma.player.findMany({
    where: {
      team: 'MAIN',
      photoUrl: { not: null },
      rustatId: null
    }
  })
  
  // Игроки с RuStat ID, но без фото
  const withRustat = await prisma.player.findMany({
    where: {
      team: 'MAIN',
      rustatId: { not: null },
      photoUrl: null
    },
    include: {
      matchStats: true
    }
  })
  
  console.log(`Игроков с фото (без RuStat): ${withPhoto.length}`)
  console.log(`Игроков с RuStat (без фото): ${withRustat.length}\n`)
  
  const matches = []
  const unmatched = []
  
  for (const photoPlayer of withPhoto) {
    const photoLastName = normalizeName(photoPlayer.lastName)
    const photoFirstName = normalizeName(photoPlayer.firstName)
    
    console.log(`\n🔍 Ищем совпадение для: ${photoPlayer.firstName} ${photoPlayer.lastName}`)
    console.log(`   Нормализовано: ${photoFirstName} ${photoLastName}`)
    
    let bestMatch = null
    let matchType = null
    
    for (const rustatPlayer of withRustat) {
      const rustatLastName = normalizeName(extractLastName(rustatPlayer.lastName))
      const rustatFirstName = normalizeName(rustatPlayer.firstName)
      
      // Проверка по фамилии
      if (photoLastName === rustatLastName) {
        console.log(`   ✅ Совпадение по фамилии: ${rustatPlayer.firstName} ${rustatPlayer.lastName} (RuStat: ${rustatPlayer.rustatId})`)
        bestMatch = rustatPlayer
        matchType = 'lastName'
        break
      }
      
      // Проверка по имени (если фамилия в firstName)
      if (photoLastName === rustatFirstName) {
        console.log(`   ✅ Совпадение по имени: ${rustatPlayer.firstName} ${rustatPlayer.lastName} (RuStat: ${rustatPlayer.rustatId})`)
        bestMatch = rustatPlayer
        matchType = 'firstName'
        break
      }
    }
    
    if (bestMatch) {
      matches.push({
        photoPlayer,
        rustatPlayer: bestMatch,
        matchType
      })
    } else {
      console.log(`   ❌ Совпадение не найдено`)
      unmatched.push(photoPlayer)
    }
  }
  
  console.log(`\n\n📊 РЕЗУЛЬТАТЫ СОПОСТАВЛЕНИЯ:\n`)
  console.log(`✅ Найдено совпадений: ${matches.length}`)
  console.log(`❌ Не найдено совпадений: ${unmatched.length}\n`)
  
  if (matches.length > 0) {
    console.log(`\n✅ СОВПАДЕНИЯ:\n`)
    for (const match of matches) {
      const statsCount = match.rustatPlayer.matchStats.length
      console.log(`${match.photoPlayer.number}. ${match.photoPlayer.firstName} ${match.photoPlayer.lastName}`)
      console.log(`   ↔️  ${match.rustatPlayer.firstName} ${match.rustatPlayer.lastName}`)
      console.log(`   RuStat ID: ${match.rustatPlayer.rustatId}`)
      console.log(`   Статистика: ${statsCount} записей`)
      console.log(`   Тип совпадения: ${match.matchType}\n`)
    }
  }
  
  if (unmatched.length > 0) {
    console.log(`\n❌ НЕ НАЙДЕНЫ СОВПАДЕНИЯ:\n`)
    for (const player of unmatched) {
      console.log(`${player.number}. ${player.firstName} ${player.lastName}`)
    }
  }
  
  // Игроки с RuStat, которые не совпали
  const unmatchedRustat = withRustat.filter(r => 
    !matches.some(m => m.rustatPlayer.id === r.id)
  )
  
  if (unmatchedRustat.length > 0) {
    console.log(`\n⚠️  ИГРОКИ С RUSTAT БЕЗ СОВПАДЕНИЙ:\n`)
    for (const player of unmatchedRustat) {
      console.log(`${player.firstName} ${player.lastName} (RuStat: ${player.rustatId}, Статистика: ${player.matchStats.length} записей)`)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
