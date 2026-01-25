import { PrismaClient, Position } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

// Генератор случайной статистики в зависимости от позиции
function generateStats(position: Position, gamesPlayed: number) {
  const minutesPlayed = Math.floor(gamesPlayed * (60 + Math.random() * 30)); // 60-90 минут в среднем

  switch (position) {
    case 'GOALKEEPER':
      return {
        gamesPlayed,
        minutesPlayed,
        goals: 0,
        assists: 0,
        yellowCards: Math.floor(Math.random() * 3),
        redCards: Math.random() > 0.9 ? 1 : 0,
        cleanSheets: Math.floor(gamesPlayed * (0.3 + Math.random() * 0.3)), // 30-60% clean sheets
        goalsConceded: Math.floor(gamesPlayed * (0.5 + Math.random() * 1.5)), // 0.5-2 goals per game
        saves: Math.floor(gamesPlayed * (3 + Math.random() * 4)), // 3-7 saves per game
        shotsOnTarget: null,
        passAccuracy: 60 + Math.random() * 20, // 60-80%
      };

    case 'DEFENDER':
      return {
        gamesPlayed,
        minutesPlayed,
        goals: Math.floor(Math.random() * 3), // 0-2 goals
        assists: Math.floor(Math.random() * 5), // 0-4 assists
        yellowCards: Math.floor(Math.random() * 5),
        redCards: Math.random() > 0.85 ? 1 : 0,
        cleanSheets: null,
        goalsConceded: null,
        saves: null,
        shotsOnTarget: Math.floor(Math.random() * 8),
        passAccuracy: 70 + Math.random() * 20, // 70-90%
      };

    case 'MIDFIELDER':
      return {
        gamesPlayed,
        minutesPlayed,
        goals: Math.floor(Math.random() * 8), // 0-7 goals
        assists: Math.floor(Math.random() * 10), // 0-9 assists
        yellowCards: Math.floor(Math.random() * 4),
        redCards: Math.random() > 0.9 ? 1 : 0,
        cleanSheets: null,
        goalsConceded: null,
        saves: null,
        shotsOnTarget: Math.floor(Math.random() * 20),
        passAccuracy: 75 + Math.random() * 15, // 75-90%
      };

    case 'FORWARD':
      return {
        gamesPlayed,
        minutesPlayed,
        goals: Math.floor(3 + Math.random() * 12), // 3-14 goals
        assists: Math.floor(Math.random() * 8), // 0-7 assists
        yellowCards: Math.floor(Math.random() * 3),
        redCards: Math.random() > 0.95 ? 1 : 0,
        cleanSheets: null,
        goalsConceded: null,
        saves: null,
        shotsOnTarget: Math.floor(10 + Math.random() * 30),
        passAccuracy: 65 + Math.random() * 20, // 65-85%
      };
  }
}

async function main() {
  console.log('🌱 Seeding player statistics...');

  // Получаем всех игроков
  const players = await prisma.player.findMany();

  for (const player of players) {
    // Генерируем количество игр в зависимости от команды
    let gamesPlayed: number;
    if (player.team === 'MAIN') {
      gamesPlayed = Math.floor(10 + Math.random() * 15); // 10-24 games
    } else if (player.team === 'YOUTH') {
      gamesPlayed = Math.floor(8 + Math.random() * 12); // 8-19 games
    } else {
      gamesPlayed = Math.floor(5 + Math.random() * 10); // 5-14 games
    }

    const stats = generateStats(player.position, gamesPlayed);

    // Создаем или обновляем статистику
    await prisma.playerStats.upsert({
      where: { playerId: player.id },
      update: stats,
      create: {
        playerId: player.id,
        ...stats,
        season: '2025/2026',
      },
    });

    console.log(`✅ Stats created for ${player.firstName} ${player.lastName}`);
  }

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding stats:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
