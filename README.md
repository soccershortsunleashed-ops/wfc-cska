# ЖФК ЦСКА — официальный сайт

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma)

Современный сайт женского футбольного клуба ЦСКА на Next.js (App Router) с TypeScript, Tailwind CSS и shadcn/ui.

[Сайт](https://wfccska.ru) · [Документация](#-документация) · [Установка](#-установка)

</div>

---

## ✨ Ключевые возможности

- Современный дизайн в клубных цветах
- Высокая производительность и SEO
- Адаптивная верстка (mobile-first)
- Анимации и микроинтеракции (Framer Motion)
- Оптимизация изображений (Next.js Image)
- API-слой для динамических данных

## 📊 Источники данных

- **Статистика матчей и игроков берется с сервиса Rustat** (см. интеграцию в `lib/services/rustat-*.ts` и скрипты синхронизации в `scripts/`).
- Дополнительные данные (новости, составы, логотипы, медиа) — через локальные сиды и утилиты проекта.

## 🚀 Установка

### Требования

- Node.js 18+
- npm или yarn

### Запуск

```bash
# Клонировать репозиторий
git clone https://github.com/soccershortsunleashed-ops/wfc-cska.git
cd wfc-cska

# Установить зависимости
npm install

# Настроить переменные окружения
cp .env.example .env

# Подготовить базу данных
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Запуск dev сервера
npm run dev
```

Откройте `http://localhost:3000` в браузере.

## 🧭 Архитектура

Подробное описание в `ARCHITECTURE.md`.

## 🧱 Структура проекта (кратко)

```
wfc-cska/
├── app/                 # Next.js App Router (страницы и API)
├── components/          # UI-компоненты и секции
├── lib/                 # Сервисы, утилиты, типы
├── prisma/              # Схема БД и миграции
├── public/              # Статические файлы
├── scripts/             # Скрипты импорта/синхронизации
└── seed/                # Сиды и исходные данные
```

## 🧪 Скрипты (основные)

```bash
npm run dev
npm run build
npm run start
npm run lint

# Prisma
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Примеры утилит
npm run extract-seed
npm run setup-from-site
```

## 🔐 Переменные окружения

Пример: `.env.example`

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_BASE_URL="https://wfccska.ru"
```

## 📚 Документация

- `ARCHITECTURE.md`
- `DEPLOYMENT.md`
- `README-DATABASE.md`
- `RUSTAT-SYNC-GUIDE.md`
- `GET-RUSTAT-TOKEN.md`
- `GET-RUSTAT-TOKEN-QUICK.md`

## 📝 Changelog

См. `CHANGELOG.md`.

## 📄 Лицензия

© 2026 ЖФК ЦСКА. Все права защищены.
