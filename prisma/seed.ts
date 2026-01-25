import { PrismaClient, Position, Team, MatchType } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.match.deleteMany()
  await prisma.news.deleteMany()
  await prisma.player.deleteMany()

  // Create Players
  const players = await Promise.all([
    // Goalkeepers
    prisma.player.create({
      data: {
        slug: 'petrova-tatyana',
        firstName: 'Татьяна',
        lastName: 'Петрова',
        number: 1,
        position: Position.GOALKEEPER,
        birthDate: new Date('1995-03-15'),
        nationality: 'Россия',
        heightCm: 175,
        weightKg: 65,
        photoUrl: '/images/players/petrova.jpg',
        team: Team.MAIN,
      },
    }),
    prisma.player.create({
      data: {
        slug: 'nikolich-milena',
        firstName: 'Милена',
        lastName: 'Николич',
        number: 30,
        position: Position.GOALKEEPER,
        birthDate: new Date('1998-07-22'),
        nationality: 'Сербия',
        heightCm: 178,
        weightKg: 68,
        photoUrl: '/images/players/nikolich.jpg',
        team: Team.MAIN,
      },
    }),

    // Defenders
    prisma.player.create({
      data: {
        slug: 'myasnikova-yuliya',
        firstName: 'Юлия',
        lastName: 'Мясникова',
        number: 2,
        position: Position.DEFENDER,
        birthDate: new Date('1996-05-10'),
        nationality: 'Россия',
        heightCm: 170,
        weightKg: 62,
        photoUrl: '/images/players/myasnikova.jpg',
        team: Team.MAIN,
      },
    }),
    prisma.player.create({
      data: {
        slug: 'semenova-elizaveta',
        firstName: 'Елизавета',
        lastName: 'Семенова',
        number: 4,
        position: Position.DEFENDER,
        birthDate: new Date('1997-11-08'),
        nationality: 'Россия',
        heightCm: 168,
        weightKg: 60,
        photoUrl: '/images/players/semenova.jpg',
        team: Team.MAIN,
      },
    }),
    prisma.player.create({
      data: {
        slug: 'shishkina-sofiya',
        firstName: 'София',
        lastName: 'Шишкина',
        number: 5,
        position: Position.DEFENDER,
        birthDate: new Date('1999-02-14'),
        nationality: 'Россия',
        heightCm: 172,
        weightKg: 63,
        photoUrl: '/images/players/shishkina.jpg',
        team: Team.MAIN,
      },
    }),
    prisma.player.create({
      data: {
        slug: 'bratko-ekaterina',
        firstName: 'Екатерина',
        lastName: 'Братко',
        number: 15,
        position: Position.DEFENDER,
        birthDate: new Date('1994-09-20'),
        nationality: 'Россия',
        heightCm: 169,
        weightKg: 61,
        photoUrl: '/images/players/bratko.jpg',
        team: Team.MAIN,
      },
    }),

    // Midfielders
    prisma.player.create({
      data: {
        slug: 'ananeva-anastasiya',
        firstName: 'Анастасия',
        lastName: 'Ананьева',
        number: 6,
        position: Position.MIDFIELDER,
        birthDate: new Date('1998-04-12'),
        nationality: 'Россия',
        heightCm: 165,
        weightKg: 58,
        photoUrl: '/images/players/ananeva.jpg',
        team: Team.MAIN,
      },
    }),
    prisma.player.create({
      data: {
        slug: 'achoyan-marine',
        firstName: 'Марине',
        lastName: 'Ачоян',
        number: 8,
        position: Position.MIDFIELDER,
        birthDate: new Date('1996-06-25'),
        nationality: 'Армения',
        heightCm: 167,
        weightKg: 59,
        photoUrl: '/images/players/achoyan.jpg',
        team: Team.MAIN,
      },
    }),
    prisma.player.create({
      data: {
        slug: 'dolmatova-polina',
        firstName: 'Полина',
        lastName: 'Долматова',
        number: 10,
        position: Position.MIDFIELDER,
        birthDate: new Date('1997-08-30'),
        nationality: 'Россия',
        heightCm: 166,
        weightKg: 57,
        photoUrl: '/images/players/dolmatova.jpg',
        team: Team.MAIN,
      },
    }),
    prisma.player.create({
      data: {
        slug: 'chavich-mina',
        firstName: 'Мина',
        lastName: 'Чавич',
        number: 14,
        position: Position.MIDFIELDER,
        birthDate: new Date('1995-12-05'),
        nationality: 'Сербия',
        heightCm: 168,
        weightKg: 60,
        photoUrl: '/images/players/chavich.jpg',
        team: Team.MAIN,
      },
    }),
    prisma.player.create({
      data: {
        slug: 'kokoeva-ellina',
        firstName: 'Эллина',
        lastName: 'Кокоева',
        number: 17,
        position: Position.MIDFIELDER,
        birthDate: new Date('1999-03-18'),
        nationality: 'Россия',
        heightCm: 164,
        weightKg: 56,
        photoUrl: '/images/players/kokoeva.jpg',
        team: Team.MAIN,
      },
    }),

    // Forwards
    prisma.player.create({
      data: {
        slug: 'gomes-erika',
        firstName: 'Эрика',
        lastName: 'Гомес',
        number: 7,
        position: Position.FORWARD,
        birthDate: new Date('1996-01-20'),
        nationality: 'Бразилия',
        heightCm: 170,
        weightKg: 62,
        photoUrl: '/images/players/gomes.jpg',
        team: Team.MAIN,
      },
    }),
    prisma.player.create({
      data: {
        slug: 'damyanovich-nevena',
        firstName: 'Невена',
        lastName: 'Дамьянович',
        number: 9,
        position: Position.FORWARD,
        birthDate: new Date('1994-11-11'),
        nationality: 'Сербия',
        heightCm: 173,
        weightKg: 64,
        photoUrl: '/images/players/damyanovich.jpg',
        team: Team.MAIN,
      },
    }),
    prisma.player.create({
      data: {
        slug: 'kraynova-darya',
        firstName: 'Дарья',
        lastName: 'Крайнова',
        number: 11,
        position: Position.FORWARD,
        birthDate: new Date('1998-05-28'),
        nationality: 'Россия',
        heightCm: 169,
        weightKg: 61,
        photoUrl: '/images/players/kraynova.jpg',
        team: Team.MAIN,
      },
    }),
    prisma.player.create({
      data: {
        slug: 'kadyntseva-yaroslava',
        firstName: 'Ярослава',
        lastName: 'Кадынцева',
        number: 19,
        position: Position.FORWARD,
        birthDate: new Date('1997-09-15'),
        nationality: 'Россия',
        heightCm: 171,
        weightKg: 63,
        photoUrl: '/images/players/kadyntseva.jpg',
        team: Team.MAIN,
      },
    }),
  ])

  console.log(`✅ Created ${players.length} players`)

  // Create News
  const news = await Promise.all([
    prisma.news.create({
      data: {
        slug: 'pobeda-v-chempionate',
        title: 'Уверенная победа в чемпионате',
        excerpt: 'ЖФК ЦСКА одержал уверенную победу над соперником со счетом 3:0',
        coverImageUrl: '/images/news/victory.jpg',
        publishedAt: new Date('2026-01-18'),
      },
    }),
    prisma.news.create({
      data: {
        slug: 'novyj-igrok-v-sostave',
        title: 'Новый игрок в составе команды',
        excerpt: 'ЖФК ЦСКА объявляет о подписании контракта с новым игроком',
        coverImageUrl: '/images/news/new-player.jpg',
        publishedAt: new Date('2026-01-15'),
      },
    }),
    prisma.news.create({
      data: {
        slug: 'trenirovochnyj-sbor',
        title: 'Команда начала тренировочный сбор',
        excerpt: 'ЖФК ЦСКА отправился на тренировочный сбор для подготовки к следующему сезону',
        coverImageUrl: '/images/news/training.jpg',
        publishedAt: new Date('2026-01-12'),
      },
    }),
    prisma.news.create({
      data: {
        slug: 'intervyu-s-kapitanom',
        title: 'Интервью с капитаном команды',
        excerpt: 'Капитан ЖФК ЦСКА рассказала о целях команды на текущий сезон',
        coverImageUrl: '/images/news/interview.jpg',
        publishedAt: new Date('2026-01-10'),
      },
    }),
    prisma.news.create({
      data: {
        slug: 'blagotvoritelnaya-akciya',
        title: 'Благотворительная акция клуба',
        excerpt: 'ЖФК ЦСКА провел благотворительную акцию для детских домов',
        coverImageUrl: '/images/news/charity.jpg',
        publishedAt: new Date('2026-01-08'),
      },
    }),
    prisma.news.create({
      data: {
        slug: 'podgotovka-k-matchu',
        title: 'Подготовка к важному матчу',
        excerpt: 'Команда усиленно готовится к предстоящему матчу чемпионата',
        coverImageUrl: '/images/news/preparation.jpg',
        publishedAt: new Date('2026-01-05'),
      },
    }),
  ])

  console.log(`✅ Created ${news.length} news articles`)

  // Create Matches
  const matches = await Promise.all([
    prisma.match.create({
      data: {
        type: MatchType.UPCOMING,
        opponentName: 'Спартак',
        opponentLogoUrl: '/images/teams/spartak.png',
        matchDate: new Date('2026-01-25T15:00:00'),
        venue: 'Арена ЦСКА',
      },
    }),
    prisma.match.create({
      data: {
        type: MatchType.LAST,
        opponentName: 'Локомотив',
        opponentLogoUrl: '/images/teams/lokomotiv.png',
        matchDate: new Date('2026-01-18T14:00:00'),
        venue: 'Стадион Локомотив',
        scoreHome: 3,
        scoreAway: 0,
      },
    }),
  ])

  console.log(`✅ Created ${matches.length} matches`)

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
