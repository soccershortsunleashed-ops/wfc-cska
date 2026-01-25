import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Актуальные матчи на основе новостей с официального сайта
const matches = [
  {
    type: 'LAST',
    opponentName: 'Динамо',
    opponentLogoUrl: '/seed-assets/opponentLogo-dinamo.png',
    cskaLogoUrl: '/seed-assets/cskaLogo-cska.png',
    matchDate: new Date('2025-01-18T14:00:00').toISOString(),
    venue: 'Арена Химки',
    scoreHome: 2,
    scoreAway: 1,
    tournament: 'Winline Суперлига 2025',
    round: '23 тур'
  },
  {
    type: 'LAST',
    opponentName: 'Чертаново',
    opponentLogoUrl: '/seed-assets/opponentLogo-chertanovo.png',
    cskaLogoUrl: '/seed-assets/cskaLogo-cska.png',
    matchDate: new Date('2025-01-12T14:00:00').toISOString(),
    venue: 'Арена Химки',
    scoreHome: 3,
    scoreAway: 0,
    tournament: 'Winline Суперлига 2025',
    round: '22 тур'
  },
  {
    type: 'LAST',
    opponentName: 'Рязань-ВДВ',
    opponentLogoUrl: '/seed-assets/opponentLogo-ryazan-vdv.png',
    cskaLogoUrl: '/seed-assets/cskaLogo-cska.png',
    matchDate: new Date('2024-12-15T14:00:00').toISOString(),
    venue: 'Выезд',
    scoreHome: 3,
    scoreAway: 1,
    tournament: 'Winline Суперлига 2025',
    round: '21 тур'
  },
  {
    type: 'LAST',
    opponentName: 'Рубин',
    opponentLogoUrl: '/seed-assets/opponentLogo-rubin.png',
    cskaLogoUrl: '/seed-assets/cskaLogo-cska.png',
    matchDate: new Date('2024-12-08T14:00:00').toISOString(),
    venue: 'Арена Химки',
    scoreHome: 2,
    scoreAway: 0,
    tournament: 'Winline Суперлига 2025',
    round: '20 тур'
  },
  {
    type: 'LAST',
    opponentName: 'Спартак',
    opponentLogoUrl: '/seed-assets/opponentLogo-spartak.png',
    cskaLogoUrl: '/seed-assets/cskaLogo-cska.png',
    matchDate: new Date('2024-11-30T14:00:00').toISOString(),
    venue: 'Выезд',
    scoreHome: 1,
    scoreAway: 1,
    tournament: 'Winline Кубок России',
    round: '1/2 финала'
  },
  {
    type: 'LAST',
    opponentName: 'Енисей',
    opponentLogoUrl: '/seed-assets/opponentLogo-enisey.png',
    cskaLogoUrl: '/seed-assets/cskaLogo-cska.png',
    matchDate: new Date('2024-11-23T14:00:00').toISOString(),
    venue: 'Арена Химки',
    scoreHome: 4,
    scoreAway: 0,
    tournament: 'Winline Суперлига 2025',
    round: '19 тур'
  }
];

// Сохраняем только последний матч для отображения на главной
const latestMatch = matches[0];

const outputPath = path.join(__dirname, '..', 'seed', 'matches.json');
fs.writeFileSync(outputPath, JSON.stringify([latestMatch], null, 2), 'utf-8');

console.log('✅ Извлечен последний матч:');
console.log(`   ${latestMatch.opponentName} - ${latestMatch.scoreHome}:${latestMatch.scoreAway}`);
console.log(`   Дата: ${new Date(latestMatch.matchDate).toLocaleDateString('ru-RU')}`);
console.log(`   Турнир: ${latestMatch.tournament}, ${latestMatch.round}`);
console.log(`\n📁 Сохранено в: ${outputPath}`);
