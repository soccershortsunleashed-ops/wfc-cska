#!/usr/bin/env node

/**
 * Добавляет ЦСКА во все сезоны
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

const SEASONS = [
  '2016',
  '2017',
  '2018',
  '2019',
  '2020',
  '2021',
  '2022',
  '2023',
  '2024',
  '2025',
  '2026',
]

async function main() {
  console.log('\n🌱 Добавление ЦСКА во все сезоны\n')
  console.log('=' .repeat(80))
  console.log()

  let created = 0
  let existing = 0

  for (const season of SEASONS) {
    const team = await prisma.footballTeam.findFirst({
      where: {
        name: 'ЦСКА',
        season,
        competition: 'Суперлига',
      },
    })

    if (team) {
      console.log(`✅ ${season}: ЦСКА уже существует`)
      existing++
    } else {
      await prisma.footballTeam.create({
        data: {
          name: 'ЦСКА',
          fullName: 'ЦСКА Москва',
          shortName: 'ЦСКА',
          city: 'Москва',
          stadium: 'ВЭБ Арена',
          logoFileName: 'cska.png',
          aliases: JSON.stringify(['ЦСКА', 'ЦСКА Москва', 'CSKA']),
          season,
          competition: 'Суперлига',
          rustatId: 13503,
        },
      })
      console.log(`✅ ${season}: ЦСКА создан`)
      created++
    }
  }

  console.log()
  console.log('=' .repeat(80))
  console.log(`\n📊 Итого:`)
  console.log(`   Создано: ${created}`)
  console.log(`   Уже существовало: ${existing}`)
  console.log()
}

main()
  .catch((error) => {
    console.error('\n❌ Ошибка:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
