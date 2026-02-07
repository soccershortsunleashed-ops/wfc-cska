import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

const TEAMS_2025_SUPERLIGA = [
  {
    name: 'ЦСКА',
    fullName: 'ЦСКА Москва',
    shortName: 'ЦСКА',
    city: 'Москва',
    stadium: 'ВЭБ Арена',
    logoFileName: 'cska.png',
    aliases: JSON.stringify(['ЦСКА', 'ЦСКА Москва', 'CSKA']),
    season: '2026',
    competition: 'Суперлига',
    rustatId: 13503,
  },
  {
    name: 'Зенит',
    fullName: 'Зенит Санкт-Петербург',
    shortName: 'ЗЕН',
    city: 'Санкт-Петербург',
    stadium: 'Газпром Арена',
    logoFileName: 'zenit.png',
    aliases: JSON.stringify(['Зенит', 'Зенит СПб', 'Зенит Санкт-Петербург']),
    season: '2026',
    competition: 'Суперлига',
  },
  {
    name: 'Спартак',
    fullName: 'Спартак Москва',
    shortName: 'СПА',
    city: 'Москва',
    stadium: 'Спартак, поле №4',
    logoFileName: 'spartak.png',
    aliases: JSON.stringify(['Спартак', 'Спартак Москва']),
    season: '2026',
    competition: 'Суперлига',
  },
  {
    name: 'Локомотив',
    fullName: 'Локомотив Москва',
    shortName: 'ЛОК',
    city: 'Москва',
    stadium: 'Стадион Локомотив',
    logoFileName: 'lokomotiv.png',
    aliases: JSON.stringify(['Локомотив', 'Локо', 'Локомотив Москва']),
    season: '2026',
    competition: 'Суперлига',
  },
  {
    name: 'Краснодар',
    fullName: 'Краснодар',
    shortName: 'КРА',
    city: 'Краснодар',
    stadium: 'Краснодар Арена',
    logoFileName: 'krasnodar.png',
    aliases: JSON.stringify(['Краснодар']),
    season: '2026',
    competition: 'Суперлига',
  },
  {
    name: 'Динамо',
    fullName: 'Динамо Москва',
    shortName: 'ДИН',
    city: 'Москва',
    stadium: 'ВТБ Арена',
    logoFileName: 'dinamo.png',
    aliases: JSON.stringify(['Динамо', 'Динамо Москва']),
    season: '2026',
    competition: 'Суперлига',
  },
  {
    name: 'Ростов',
    fullName: 'Ростов',
    shortName: 'РОС',
    city: 'Ростов-на-Дону',
    stadium: 'Ростов Арена',
    logoFileName: 'rostov.png',
    aliases: JSON.stringify(['Ростов']),
    season: '2026',
    competition: 'Суперлига',
  },
  {
    name: 'Чертаново',
    fullName: 'Чертаново Москва',
    shortName: 'ЧЕР',
    city: 'Москва',
    stadium: 'Стадион Чертаново',
    logoFileName: 'chertanovo.png',
    aliases: JSON.stringify(['Чертаново', 'Чертаново Москва']),
    season: '2026',
    competition: 'Суперлига',
  },
  {
    name: 'Рубин',
    fullName: 'Рубин Казань',
    shortName: 'РУБ',
    city: 'Казань',
    stadium: 'Ак Барс Арена',
    logoFileName: 'rubin.png',
    aliases: JSON.stringify(['Рубин', 'Рубин Казань']),
    season: '2026',
    competition: 'Суперлига',
  },
  {
    name: 'Урал',
    fullName: 'Урал-УрФА',
    shortName: 'УРА',
    city: 'Екатеринбург',
    stadium: 'Екатеринбург Арена',
    logoFileName: 'ural.png',
    aliases: JSON.stringify(['Урал', 'Урал-УрФА']),
    season: '2026',
    competition: 'Суперлига',
  },
  {
    name: 'Енисей',
    fullName: 'Енисей Красноярск',
    shortName: 'ЕНИ',
    city: 'Красноярск',
    stadium: 'Центральный стадион',
    logoFileName: 'enisey.png',
    aliases: JSON.stringify(['Енисей', 'Енисей Красноярск']),
    season: '2026',
    competition: 'Суперлига',
  },
  {
    name: 'Звезда',
    fullName: 'Звезда-2005 Пермь',
    shortName: 'ЗВЕ',
    city: 'Пермь',
    stadium: 'Стадион Звезда',
    logoFileName: 'zvezda.png',
    aliases: JSON.stringify(['Звезда', 'Звезда-2005', 'Звезда-2005 Пермь']),
    season: '2026',
    competition: 'Суперлига',
  },
  {
    name: 'Рязань-ВДВ',
    fullName: 'Рязань-ВДВ',
    shortName: 'РЯЗ',
    city: 'Рязань',
    stadium: 'Стадион Спартак',
    logoFileName: 'ryazan.png',
    aliases: JSON.stringify(['Рязань', 'Рязань-ВДВ']),
    season: '2026',
    competition: 'Суперлига',
  },
  {
    name: 'Крылья Советов',
    fullName: 'Крылья Советов Самара',
    shortName: 'КРС',
    city: 'Самара',
    stadium: 'Самара Арена',
    logoFileName: 'krylia.png',
    aliases: JSON.stringify(['Крылья Советов', 'КС Самара', 'Крылья Советов Самара']),
    season: '2026',
    competition: 'Суперлига',
  },
]

async function main() {
  console.log('🌱 Seeding teams for 2026 season...\n')
  
  let created = 0
  let updated = 0
  
  for (const teamData of TEAMS_2025_SUPERLIGA) {
    const existing = await prisma.footballTeam.findFirst({
      where: {
        name: teamData.name,
        season: teamData.season,
        competition: teamData.competition,
      },
    })
    
    if (existing) {
      await prisma.footballTeam.update({
        where: { id: existing.id },
        data: teamData,
      })
      console.log(`✅ Обновлено: ${teamData.name}`)
      updated++
    } else {
      await prisma.footballTeam.create({
        data: teamData,
      })
      console.log(`✅ Создано: ${teamData.name}`)
      created++
    }
  }
  
  console.log('\n' + '='.repeat(80))
  console.log(`\n📊 Итого:`)
  console.log(`   Создано: ${created}`)
  console.log(`   Обновлено: ${updated}`)
  console.log(`   Всего команд: ${TEAMS_2025_SUPERLIGA.length}`)
  console.log('\n✅ Teams seeded successfully!\n')
}

main()
  .catch((error) => {
    console.error('❌ Error seeding teams:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
