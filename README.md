# ⚽ ЖФК ЦСКА - Официальный сайт

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma)

Современный сайт женского футбольного клуба ЦСКА, построенный на Next.js с использованием App Router, TypeScript, Tailwind CSS и shadcn/ui.

[Демо](https://wfccska.ru) · [Документация](#-документация) · [Установка](#-установка)

</div>

---

## ✨ Особенности

- 🎨 **Современный дизайн** с фирменными цветами ЦСКА (#0033A0, #E4002B)
- 🌈 **Эффектные градиенты** вдохновленные дизайном ФК "Локомотив"
- ⚡ **Высокая производительность** - Lighthouse Score > 90
- 📱 **Адаптивный дизайн** - Mobile First подход
- 🔍 **SEO оптимизация** - Meta tags, Open Graph, Schema.org
- ♿ **Доступность** - WCAG 2.1 AA стандарты
- 🎭 **Плавные анимации** - Framer Motion
- 🖼️ **Оптимизация изображений** - Next.js Image
- 🔄 **Real-time данные** - API Routes с кэшированием
- 🎯 **TypeScript** - Полная типизация
- 🎨 **Tailwind CSS v4** - Современные стили

## 🚀 Быстрый старт

### Требования

- Node.js 18+ 
- npm или yarn

### Установка

```bash
# Клонировать репозиторий
git clone https://github.com/soccershortsunleashed-ops/wfc-cska.git
cd wfc-cska

# Установить зависимости
npm install

# Настроить переменные окружения
cp .env.example .env

# Настроить базу данных
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Запустить dev сервер
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 📁 Структура проекта

```
wfc-cska/
├── app/                     # Next.js App Router
│   ├── (site)/             # Основные страницы
│   │   ├── page.tsx        # Главная
│   │   └── players/        # Страницы игроков
│   ├── api/                # API Route Handlers
│   ├── layout.tsx          # Root Layout
│   └── globals.css         # Глобальные стили
├── components/
│   ├── ui/                 # shadcn/ui компоненты
│   ├── layout/             # Header, Footer, Navigation
│   ├── sections/           # Секции страниц
│   └── players/            # Компоненты игроков
├── lib/
│   ├── db/                 # Prisma Client
│   ├── services/           # Бизнес-логика
│   ├── schemas/            # Zod схемы валидации
│   └── utils.ts            # Утилиты
├── prisma/
│   ├── schema.prisma       # Модель данных
│   ├── seed.ts             # Seed скрипт
│   └── migrations/         # Миграции БД
├── public/
│   └── seed-assets/        # Статические изображения
└── scripts/                # Утилиты и скрипты
```

## 🛠️ Технологический стек

### Frontend
- **Framework:** [Next.js 16](https://nextjs.org/) - React фреймворк с App Router
- **UI Library:** [React 19](https://react.dev/) - Библиотека для UI
- **Language:** [TypeScript 5](https://www.typescriptlang.org/) - Типизированный JavaScript
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS
- **Components:** [shadcn/ui](https://ui.shadcn.com/) - Компоненты на Radix UI
- **Icons:** [Lucide React](https://lucide.dev/), [Tabler Icons](https://tabler.io/icons), [React Icons](https://react-icons.github.io/react-icons/)
- **Animation:** [Framer Motion](https://www.framer.com/motion/) - Анимации
- **Carousel:** [Embla Carousel](https://www.embla-carousel.com/) - Карусель

### Backend
- **Database:** [SQLite](https://www.sqlite.org/) (dev) / [PostgreSQL](https://www.postgresql.org/) (prod)
- **ORM:** [Prisma 7](https://www.prisma.io/) - Type-safe ORM
- **Validation:** [Zod](https://zod.dev/) - Schema validation

### DevOps
- **Deployment:** [Vercel](https://vercel.com/) (рекомендуется)
- **Version Control:** Git + GitHub

## 📊 База данных

### Модели

```prisma
model Player {
  id          String   @id @default(cuid())
  name        String
  position    String
  number      Int
  photoUrl    String?
  team        String   // "main" | "youth"
  // ... другие поля
}

model News {
  id            String   @id @default(cuid())
  title         String
  excerpt       String
  coverImageUrl String?
  publishedAt   DateTime
  // ... другие поля
}

model Match {
  id          String   @id @default(cuid())
  opponent    String
  date        DateTime
  location    String
  isHome      Boolean
  // ... другие поля
}
```

### Команды Prisma

```bash
# Генерация клиента
npx prisma generate

# Создание миграции
npx prisma migrate dev --name migration_name

# Применение миграций (production)
npx prisma migrate deploy

# Заполнение базы данными
npx prisma db seed

# Prisma Studio (GUI для БД)
npx prisma studio
```

## 🎨 Дизайн система

### Цвета ЦСКА

```css
/* Основные цвета */
--cska-blue: #0033A0;    /* Синий ЦСКА */
--cska-red: #E4002B;     /* Красный ЦСКА */
--cska-white: #FFFFFF;   /* Белый */
```

### Градиенты

Проект использует эффектные градиенты, вдохновленные дизайном ФК "Локомотив":

```tsx
// Hero градиент (Синий → Красный)
<div className="gradient-hero">

// Градиентный текст
<h1 className="gradient-text">ЖФК ЦСКА</h1>

// Кнопка с градиентом
<button className="gradient-button">Купить билет</button>
```

Подробнее: [COLOR-SCHEME-ENHANCED.md](./COLOR-SCHEME-ENHANCED.md), [GRADIENTS-QUICK-GUIDE.md](./GRADIENTS-QUICK-GUIDE.md)

### Типографика

- **Заголовки:** `font-bold` (700)
- **Подзаголовки:** `font-semibold` (600)
- **Основной текст:** `font-normal` (400)

Подробнее: [TYPOGRAPHY.md](./TYPOGRAPHY.md), [TYPOGRAPHY-QUICK-GUIDE.md](./TYPOGRAPHY-QUICK-GUIDE.md)

## 🔌 API Endpoints

### Players
```
GET /api/players
  Query params: 
    - position: string (goalkeeper, defender, midfielder, forward)
    - q: string (search query)
    - sort: string (name, number)
    - team: string (main, youth)

GET /api/players/[slug]
  Returns: Player details
```

### News
```
GET /api/news
  Query params:
    - limit: number (default: 6)
  Returns: Latest news
```

### Matches
```
GET /api/matches
  Returns: Upcoming and recent matches
```

## 📱 Страницы

- `/` - Главная страница
  - Hero секция
  - Ближайший матч
  - Последние новости
  - Карусель игроков
  - Спонсоры
  
- `/players` - Список игроков
  - Фильтры по позиции и команде
  - Поиск по имени
  - Модальные окна с деталями
  
- `/players/[slug]` - Профиль игрока
  - Фото и информация
  - Статистика
  - История матчей

## ⚡ Производительность

Проект оптимизирован для максимальной производительности:

- ✅ Server Components по умолчанию
- ✅ Минимальное использование `'use client'`
- ✅ Оптимизация изображений через `next/image`
- ✅ Кэширование API запросов
- ✅ Code splitting и lazy loading
- ✅ Lighthouse Score > 90

### Результаты Lighthouse

- **Performance:** 90+
- **Accessibility:** 95+
- **Best Practices:** 100
- **SEO:** 100

## 📦 Скрипты

```bash
# Разработка
npm run dev              # Запуск dev сервера (localhost:3000)
npm run build            # Production сборка
npm run start            # Запуск production сервера
npm run lint             # ESLint проверка

# База данных
npx prisma generate      # Генерация Prisma Client
npx prisma migrate dev   # Создание и применение миграций
npx prisma db seed       # Заполнение БД данными
npx prisma studio        # Открыть Prisma Studio

# Извлечение данных с сайта
npm run extract-seed              # Извлечь все данные
npm run extract-matches           # Извлечь матчи
npm run copy-assets              # Скопировать изображения
npm run setup-from-site          # Полная настройка из сайта

# Утилиты
npm run update-featured-news     # Обновить главную новость
```

## 🔐 Переменные окружения

Создайте `.env` файл:

```env
# База данных
DATABASE_URL="file:./dev.db"  # SQLite для разработки
# DATABASE_URL="postgresql://user:password@host:5432/db"  # PostgreSQL для production

# Опциональные
NEXT_PUBLIC_BASE_URL="https://wfccska.ru"
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

Пример: [.env.example](./.env.example)

## 🚀 Деплой

### Vercel (рекомендуется)

1. Подключите GitHub репозиторий к Vercel
2. Настройте переменные окружения
3. Деплой происходит автоматически при push

### Другие платформы

Проект совместим с любой платформой, поддерживающей Node.js:
- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify
- Netlify

Подробная инструкция: [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📚 Документация

### Основная документация
- 🎨 [COLOR-SCHEME.md](./COLOR-SCHEME.md) - Цветовая схема
- 📝 [TYPOGRAPHY.md](./TYPOGRAPHY.md) - Типографика
- 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md) - Инструкции по деплою
- 🔗 [FLOATING-DOCK-GUIDE.md](./FLOATING-DOCK-GUIDE.md) - Руководство по FloatingDock
- 🔌 [BITRIX24-INTEGRATION.md](./BITRIX24-INTEGRATION.md) - Интеграция с Bitrix24

### Быстрые справочники
- 🎨 [QUICK-COLOR-GUIDE.md](./QUICK-COLOR-GUIDE.md) - Цвета
- 🌈 [GRADIENTS-QUICK-GUIDE.md](./GRADIENTS-QUICK-GUIDE.md) - Градиенты
- 📝 [TYPOGRAPHY-QUICK-GUIDE.md](./TYPOGRAPHY-QUICK-GUIDE.md) - Типографика
- 🖼️ [QUICK-SETUP-FEATURED-IMAGE.md](./QUICK-SETUP-FEATURED-IMAGE.md) - Изображения

## 🤝 Разработка

### Стандарты кода

- TypeScript строгий режим
- ESLint + Prettier
- Conventional Commits
- Semantic Versioning

### Добавление UI компонентов

```bash
# Добавить компонент из shadcn/ui
npx shadcn@latest add [component-name]
```

### Тестирование

- Chrome DevTools для проверки responsive design
- Lighthouse для проверки производительности
- Prisma Studio для проверки данных

## 🐛 Известные проблемы

Нет известных критических проблем. Для сообщения об ошибках используйте [Issues](https://github.com/soccershortsunleashed-ops/wfc-cska/issues).

## 📝 Changelog

См. [CHANGELOG.md](./CHANGELOG.md) для истории изменений.

## 📄 Лицензия

© 2026 ЖФК ЦСКА. Все права защищены.

---

<div align="center">

Сделано с ❤️ для ЖФК ЦСКА

[Сайт](https://wfccska.ru) · [VK](https://vk.com/wfccska) · [Twitter](https://twitter.com/wfccska) · [YouTube](https://youtube.com/@wfccska)

</div>
