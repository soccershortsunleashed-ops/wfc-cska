import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Coaching staff data extracted from official website
const coachingStaff = [
  {
    name: 'Лаврентьев Сергей Николаевич',
    firstName: 'Сергей',
    lastName: 'Лаврентьев',
    middleName: 'Николаевич',
    birthDate: '1972-04-09',
    position: 'Главный тренер',
    photoUrl: 'https://wfccska.ru/upload/iblock/afc/okwxqam626iwzixgu224tk97ptpyou8q/01.png',
    photoFilename: 'lavrentiev-sergey.png'
  },
  {
    name: 'Кренделев Вячеслав Николаевич',
    firstName: 'Вячеслав',
    lastName: 'Кренделев',
    middleName: 'Николаевич',
    birthDate: '1982-07-24',
    position: 'Тренер по физической подготовке',
    photoUrl: 'https://wfccska.ru/upload/iblock/2d8/wzcggmdr4x64ghwi77ecrk89qiqwqj53/06.png',
    photoFilename: 'krendelev-vyacheslav.png'
  },
  {
    name: 'Хомич Дмитрий Николаевич',
    firstName: 'Дмитрий',
    lastName: 'Хомич',
    middleName: 'Николаевич',
    birthDate: '1984-10-09',
    position: 'Тренер вратарей',
    photoUrl: 'https://wfccska.ru/upload/iblock/44e/leo1onjgp24s968bt7u9743jtai7uzbq/07.png',
    photoFilename: 'khomich-dmitry.png'
  },
  {
    name: 'Нечаев Дмитрий Александрович',
    firstName: 'Дмитрий',
    lastName: 'Нечаев',
    middleName: 'Александрович',
    birthDate: '1994-10-05',
    position: 'Тренер',
    photoUrl: 'https://wfccska.ru/upload/iblock/a97/o5i2pl8vrwj5xrc5g0y5n0a2vk3woyx4/02.png',
    photoFilename: 'nechaev-dmitry.png'
  },
  {
    name: 'Русецкий Сергей Владимирович',
    firstName: 'Сергей',
    lastName: 'Русецкий',
    middleName: 'Владимирович',
    birthDate: '1989-03-08',
    position: 'Тренер',
    photoUrl: 'https://wfccska.ru/upload/iblock/445/an0zjrqtqy9jlitjkk9s2c6w22lwloqv/04.png',
    photoFilename: 'rusetsky-sergey.png'
  },
  {
    name: 'Елеференко Илья Александрович',
    firstName: 'Илья',
    lastName: 'Елеференко',
    middleName: 'Александрович',
    birthDate: '1984-03-05',
    position: 'Начальник команды',
    photoUrl: 'https://wfccska.ru/upload/iblock/274/rfhoymjf72i6463n0n8v0y1p4nw1rol6/05.png',
    photoFilename: 'eleferenko-ilya.png'
  }
];

// Save to JSON file
const outputPath = path.join(__dirname, '..', 'seed', 'coaching-staff.json');
fs.writeFileSync(outputPath, JSON.stringify(coachingStaff, null, 2), 'utf-8');

console.log(`✅ Extracted ${coachingStaff.length} coaching staff members`);
console.log(`📄 Saved to: ${outputPath}`);
console.log('\nCoaching staff:');
coachingStaff.forEach((coach, index) => {
  console.log(`${index + 1}. ${coach.name} - ${coach.position}`);
});
