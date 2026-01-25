import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Актуальные новости с официального сайта wfccska.ru
const news = [
  {
    slug: 'zhfk-cska-provedyet-mezhdunarodnyy-tovarishcheskiy-turnir',
    title: 'ЖФК ЦСКА проведёт международный товарищеский турнир «БРИДЖ ЦСКА» в Сочи',
    excerpt: 'Женский футбольный клуб ЦСКА проведёт международный товарищеский турнир в Сочи.',
    coverImageUrl: 'https://wfccska.ru/upload/optimized/iblock/891/qn5fk4bg9u3x1vl8qihw9d7h8npf6583/930kh405-sai_t.png',
    publishedAt: new Date('2026-01-20T12:00:00').toISOString()
  },
  {
    slug: 'cska-i-zhenskiy-futbolnyy-klub-cska-rasshiryayut-sotrudnichestvo',
    title: 'ЦСКА И ЖЕНСКИЙ ФУТБОЛЬНЫЙ КЛУБ ЦСКА РАСШИРЯЮТ СОТРУДНИЧЕСТВО',
    excerpt: 'ПФК ЦСКА и ЖФК ЦСКА расширяют сотрудничество для развития женского футбола.',
    coverImageUrl: 'https://wfccska.ru/upload/optimized/iblock/892/hizd0x0zkm8d7rrhyaa2sr3jdjpw3nfb/photo_5278374688230935869_y-_3_.jpg',
    publishedAt: new Date('2026-01-19T12:00:00').toISOString()
  },
  {
    slug: 'final-sezona-pobeda-nad-zenitom',
    title: 'ФИНАЛ СЕЗОНА',
    excerpt: 'Завершаем сезон победой над «Зенитом».',
    coverImageUrl: 'https://wfccska.ru/upload/optimized/iblock/cd2/tjqq33qmzmq1qryv0j813mgucnkp6i9a/AU6I3633-_3_-_1_.jpg',
    publishedAt: new Date('2025-12-15T14:00:00').toISOString()
  },
  {
    slug: 'cska-delit-ochki-so-spartakom',
    title: 'ЦСКА делит очки со «Спартаком»',
    excerpt: 'Ничья в матче с московским «Спартаком».',
    coverImageUrl: 'https://wfccska.ru/upload/optimized/iblock/c87/h2r5ntw0g5km3zs698w36i5s8kuqw4ov/RN1A0795-_1_-_1_.jpg',
    publishedAt: new Date('2025-12-10T14:00:00').toISOString()
  },
  {
    slug: 'obygryvaem-dinamo-doma',
    title: 'Обыгрываем «Динамо» дома',
    excerpt: 'Победа над московским «Динамо» в домашнем матче.',
    coverImageUrl: 'https://wfccska.ru/upload/optimized/iblock/ce2/re4o6ih2nnmcft8rd9m0y5udz2nlwwhg/RN1A8394-_1_-_1_.jpg',
    publishedAt: new Date('2025-01-18T14:00:00').toISOString()
  },
  {
    slug: 'cska-obladatel-kubka-rossii-2025',
    title: 'ЖФК ЦСКА - ОБЛАДАТЕЛЬ КУБКА РОССИИ 2025!!!',
    excerpt: 'Женский футбольный клуб ЦСКА стал обладателем Кубка России 2025!',
    coverImageUrl: 'https://wfccska.ru/upload/optimized/iblock/9b2/kbk5cvac231s8q37crq2mpxzbmlnqri8/SD_cR_CSKA_Zenit_0053898-_1_-_1_.jpg',
    publishedAt: new Date('2025-01-15T14:00:00').toISOString()
  },
  {
    slug: '23-tur-winline-superligi-2025',
    title: '23 тур Winline Суперлиги 2025',
    excerpt: 'Матч 23 тура Winline Суперлиги против «Краснодара».',
    coverImageUrl: 'https://wfccska.ru/upload/optimized/iblock/6b7/vv3ap3du7v00roq5bv7sbl5xpptsg2sn/RN1A8614-_1_-_1_.jpg',
    publishedAt: new Date('2025-01-18T14:00:00').toISOString()
  },
  {
    slug: 'pobezhdaem-chertanovo-22-tur',
    title: 'Обыгрываем «Чертаново» в 22 туре',
    excerpt: 'Уверенная победа над «Чертаново» в 22 туре чемпионата.',
    coverImageUrl: 'https://wfccska.ru/upload/optimized/iblock/9f5/qsr43fkm1o6aunmg0z4xclvynwnb2hi5/RN1A3294-_1_-_1_.jpg',
    publishedAt: new Date('2025-01-12T14:00:00').toISOString()
  },
  {
    slug: '21-tur-ryazan-vdv-1-3-cska',
    title: '21 тур «Рязань-ВДВ» 1-3 ЦСКА',
    excerpt: 'Выездная победа над «Рязань-ВДВ» со счетом 3:1.',
    coverImageUrl: 'https://wfccska.ru/upload/optimized/iblock/c42/s2jgph3m1jim0ca7102gk62ean0zazut/RN1A1014-_2_-_1_.jpg',
    publishedAt: new Date('2024-12-15T14:00:00').toISOString()
  },
  {
    slug: 'cska-v-finale-kubka-rossii',
    title: 'ЦСКА в финале Кубка России!!!',
    excerpt: 'Волевая победа над «Спартаком» и выход в финал Кубка России.',
    coverImageUrl: 'https://wfccska.ru/upload/optimized/iblock/8e2/kdmwr7f2jig1ywzxalxtpj09n5z2rmeg/RN1A5777-_1_-_1_.jpg',
    publishedAt: new Date('2024-12-08T14:00:00').toISOString()
  },
  {
    slug: 'pobeda-nad-rubinom-doma',
    title: 'Победа над «Рубином» у себя дома!',
    excerpt: 'Домашняя победа над казанским «Рубином» в 20 туре.',
    coverImageUrl: 'https://wfccska.ru/upload/optimized/iblock/c4f/2r78jlinw2brvoye3jhcduwgwnx91ntd/RN1A0023-_1_-_1_.jpg',
    publishedAt: new Date('2024-12-08T14:00:00').toISOString()
  },
  {
    slug: 'kubok-rossii-spartak-0-1-cska',
    title: 'Winline Кубок России «Спартак» 0-1 ЦСКА',
    excerpt: 'Победа над «Спартаком» в полуфинале Кубка России.',
    coverImageUrl: 'https://wfccska.ru/upload/optimized/iblock/421/k0oi5k0nnlcsbf33x60acw947vohpxau/AU6I2462-_1_-_1_.jpg',
    publishedAt: new Date('2024-11-30T14:00:00').toISOString()
  }
];

const outputPath = path.join(__dirname, '..', 'seed', 'news.json');
fs.writeFileSync(outputPath, JSON.stringify(news, null, 2), 'utf-8');

console.log(`✅ Извлечено ${news.length} новостей с изображениями`);
console.log(`📁 Сохранено в: ${outputPath}`);
console.log('\nПоследние новости:');
news.slice(0, 5).forEach((item, index) => {
  console.log(`${index + 1}. ${item.title}`);
});
