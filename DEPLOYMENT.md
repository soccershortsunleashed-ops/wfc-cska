# 🚀 Deployment Guide - ЖФК ЦСКА

Руководство по развертыванию сайта ЖФК ЦСКА в production окружении.

## 📋 Содержание

- [Требования](#требования)
- [Подготовка к развертыванию](#подготовка-к-развертыванию)
- [Bitrix24 Integration](#bitrix24-integration) ⭐ **НОВОЕ**
- [Vercel Deployment](#vercel-deployment)
- [Netlify Deployment](#netlify-deployment)
- [Собственный сервер](#собственный-сервер)
- [База данных](#база-данных)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)

---

## 🔧 Требования

### Минимальные требования

- **Node.js:** 18.17 или выше
- **npm:** 9.0 или выше
- **База данных:** SQLite (dev) / PostgreSQL (prod)
- **Память:** Минимум 512MB RAM
- **Диск:** Минимум 1GB свободного места

### Рекомендуемые требования

- **Node.js:** 20.x LTS
- **npm:** 10.x
- **База данных:** PostgreSQL 14+
- **Память:** 1GB+ RAM
- **Диск:** 2GB+ свободного места

---

## 📦 Подготовка к развертыванию

### 1. Проверка кода

```bash
# Проверка TypeScript
npm run build

# Проверка ESLint
npm run lint

# Убедитесь, что нет ошибок
```

### 2. Оптимизация базы данных

```bash
# Применить все миграции
npx prisma migrate deploy

# Сгенерировать Prisma Client
npx prisma generate

# Заполнить базу данными (если нужно)
npx prisma db seed
```

### 3. Проверка переменных окружения

Создайте `.env.production` файл на основе `.env.example`:

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
NEXT_PUBLIC_BASE_URL="https://wfccska.ru"
```

---

## 🔷 Bitrix24 Integration

### Важно понять

**Bitrix24 и Next.js - это разные подходы:**

1. **Bitrix24** - это CMS/CRM система на PHP с собственной архитектурой
2. **Next.js** - это современный React framework для создания веб-приложений

### Варианты интеграции

#### Вариант 1: Next.js как отдельный фронтенд + Bitrix24 как backend API

**Архитектура:**
```
Next.js (Frontend)  →  API  →  Bitrix24 (Backend/CMS)
     ↓
  PostgreSQL (для кэша/сессий)
```

**Преимущества:**
- ✅ Современный быстрый фронтенд (Next.js)
- ✅ Используете Bitrix24 для управления контентом
- ✅ Лучшая производительность
- ✅ Lighthouse 95/100

**Недостатки:**
- ⚠️ Требует настройки REST API в Bitrix24
- ⚠️ Дополнительная сложность интеграции

**Как реализовать:**

1. **Настройте Bitrix24 REST API**
```php
// В Bitrix24 создайте REST API endpoints
// Например: /api/players, /api/news, /api/matches
```

2. **Обновите Next.js сервисы для работы с Bitrix24 API**
```typescript
// lib/services/players.service.ts
export async function getPlayers() {
  // Вместо Prisma используйте fetch к Bitrix24 API
  const response = await fetch('https://your-bitrix24.ru/rest/players');
  return response.json();
}
```

3. **Разверните Next.js отдельно**
   - Vercel / Netlify / Собственный сервер
   - Настройте CORS для Bitrix24 API

#### Вариант 2: Встроить Next.js в Bitrix24 (не рекомендуется)

**Проблемы:**
- ❌ Bitrix24 не поддерживает Node.js нативно
- ❌ Потеряете преимущества Next.js (SSR, ISR)
- ❌ Сложная настройка
- ❌ Плохая производительность

**Альтернатива:** Используйте стандартные компоненты Bitrix24

#### Вариант 3: Гибридный подход (рекомендуется для Bitrix24)

**Архитектура:**
```
Bitrix24 (Основной сайт)
    ↓
Next.js (Поддомен для игроков)
players.wfccska.ru → Next.js приложение
wfccska.ru → Bitrix24 сайт
```

**Преимущества:**
- ✅ Используете Bitrix24 для основного сайта
- ✅ Next.js для интерактивных секций (игроки)
- ✅ Простая интеграция
- ✅ Лучшая производительность для критичных страниц

**Как реализовать:**

1. **Основной сайт на Bitrix24**
   - Главная страница
   - Новости
   - Контакты
   - Административная часть

2. **Next.js на поддомене**
   - `players.wfccska.ru` - страница игроков
   - `stats.wfccska.ru` - статистика
   - Используйте текущее Next.js приложение

3. **Интеграция данных**
```typescript
// Получайте данные из Bitrix24 API
const BITRIX_API = 'https://wfccska.ru/rest';

export async function getPlayers() {
  const response = await fetch(`${BITRIX_API}/players`);
  return response.json();
}
```

### Настройка Bitrix24 REST API

#### 1. Создайте REST приложение в Bitrix24

```php
// /local/rest/players/index.php
<?php
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");

use Bitrix\Main\Loader;
use Bitrix\Iblock\Elements;

Loader::includeModule("iblock");

// Получить игроков из инфоблока
$players = [];
$res = CIBlockElement::GetList(
    ["SORT" => "ASC"],
    ["IBLOCK_ID" => 1, "ACTIVE" => "Y"],
    false,
    false,
    ["ID", "NAME", "PROPERTY_*"]
);

while ($player = $res->GetNext()) {
    $players[] = [
        'id' => $player['ID'],
        'name' => $player['NAME'],
        'number' => $player['PROPERTY_NUMBER_VALUE'],
        'position' => $player['PROPERTY_POSITION_VALUE'],
        // ... другие поля
    ];
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://players.wfccska.ru');
echo json_encode($players);
?>
```

#### 2. Обновите Next.js для работы с Bitrix24

```typescript
// lib/services/bitrix.service.ts
const BITRIX_API_URL = process.env.BITRIX_API_URL || 'https://wfccska.ru/rest';

export async function fetchFromBitrix(endpoint: string) {
  const response = await fetch(`${BITRIX_API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 60 } // Кэш на 60 секунд
  });
  
  if (!response.ok) {
    throw new Error(`Bitrix API error: ${response.statusText}`);
  }
  
  return response.json();
}

// lib/services/players.service.ts
import { fetchFromBitrix } from './bitrix.service';

export async function getPlayers(filters?: PlayerFilters) {
  const players = await fetchFromBitrix('/players');
  
  // Применить фильтры
  if (filters?.position) {
    return players.filter(p => p.position === filters.position);
  }
  
  return players;
}
```

#### 3. Настройте Environment Variables

```env
# .env.production
BITRIX_API_URL="https://wfccska.ru/rest"
BITRIX_API_KEY="your_api_key_if_needed"
NEXT_PUBLIC_BASE_URL="https://players.wfccska.ru"
```

### Deployment с Bitrix24

#### Если Bitrix24 на собственном сервере

1. **Разверните Next.js на том же сервере**
```bash
# Установите Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Клонируйте проект
cd /var/www
git clone https://github.com/your-repo/wfc-cska.git
cd wfc-cska

# Установите зависимости
npm ci --production

# Соберите проект
npm run build

# Запустите с PM2
pm2 start npm --name "wfc-cska-players" -- start
```

2. **Настройте Nginx для поддомена**
```nginx
# /etc/nginx/sites-available/players.wfccska
server {
    listen 80;
    server_name players.wfccska.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **Активируйте конфигурацию**
```bash
sudo ln -s /etc/nginx/sites-available/players.wfccska /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Если Bitrix24 в облаке (Bitrix24.ru)

1. **Разверните Next.js на Vercel/Netlify**
   - Следуйте инструкциям для Vercel выше
   - Настройте поддомен `players.wfccska.ru`

2. **Настройте CORS в Bitrix24**
   - Разрешите запросы с вашего Next.js домена
   - Настройте в админке Bitrix24

3. **Используйте Bitrix24 REST API**
   - Получите API ключ в настройках
   - Используйте официальный REST API

### Синхронизация данных

#### Вариант 1: Real-time через API

```typescript
// Каждый запрос идет в Bitrix24
export async function getPlayers() {
  return fetchFromBitrix('/players');
}
```

**Преимущества:** Всегда актуальные данные  
**Недостатки:** Медленнее, нагрузка на Bitrix24

#### Вариант 2: Кэширование с ISR (рекомендуется)

```typescript
// app/players/page.tsx
export const revalidate = 300; // Обновлять каждые 5 минут

export async function generateStaticParams() {
  const players = await getPlayers();
  return players.map(p => ({ slug: p.slug }));
}
```

**Преимущества:** Быстро, меньше нагрузки  
**Недостатки:** Данные обновляются с задержкой

#### Вариант 3: Webhook от Bitrix24

```typescript
// app/api/webhook/bitrix/route.ts
export async function POST(request: Request) {
  const data = await request.json();
  
  // Обновить кэш при изменении в Bitrix24
  if (data.event === 'player.update') {
    revalidatePath('/players');
  }
  
  return Response.json({ success: true });
}
```

### Миграция данных из Bitrix24

Если у вас уже есть данные в Bitrix24:

```typescript
// scripts/import-from-bitrix.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BITRIX_API = 'https://wfccska.ru/rest';

async function importPlayers() {
  const response = await fetch(`${BITRIX_API}/players`);
  const players = await response.json();
  
  for (const player of players) {
    await prisma.player.create({
      data: {
        name: player.name,
        number: player.number,
        position: player.position,
        // ... другие поля
      }
    });
  }
}

importPlayers();
```

### Рекомендации

**Для небольшого проекта:**
- ✅ Используйте Bitrix24 для всего сайта
- ✅ Добавьте интерактивные компоненты через JavaScript

**Для среднего проекта:**
- ✅ Bitrix24 для основного сайта
- ✅ Next.js на поддомене для игроков/статистики
- ✅ Интеграция через REST API

**Для крупного проекта:**
- ✅ Next.js как основной фронтенд
- ✅ Bitrix24 как headless CMS
- ✅ Полная интеграция через API

### Поддержка

**Документация:**
- [Bitrix24 REST API](https://dev.1c-bitrix.ru/rest_help/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [CORS Configuration](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

## ☁️ Vercel Deployment

### Автоматическое развертывание (рекомендуется)

1. **Подключите репозиторий к Vercel**
   - Зайдите на [vercel.com](https://vercel.com)
   - Нажмите "New Project"
   - Импортируйте Git репозиторий

2. **Настройте проект**
   - Framework Preset: **Next.js**
   - Root Directory: `wfc-cska`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Настройте Environment Variables**
   ```
   DATABASE_URL=postgresql://...
   NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
   ```

4. **Deploy**
   - Нажмите "Deploy"
   - Vercel автоматически соберет и развернет проект

### Ручное развертывание

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите в аккаунт
vercel login

# Разверните проект
cd wfc-cska
vercel --prod
```

### Настройка базы данных на Vercel

**Вариант 1: Vercel Postgres**
```bash
# Создайте Postgres базу в Vercel Dashboard
# Vercel автоматически добавит DATABASE_URL
```

**Вариант 2: Внешняя база данных**
- Используйте Supabase, Railway, или Neon
- Добавьте DATABASE_URL в Environment Variables

---

## 🌐 Netlify Deployment

### Автоматическое развертывание

1. **Подключите репозиторий к Netlify**
   - Зайдите на [netlify.com](https://netlify.com)
   - Нажмите "Add new site" → "Import an existing project"
   - Выберите Git репозиторий

2. **Настройте Build Settings**
   ```
   Base directory: wfc-cska
   Build command: npm run build
   Publish directory: wfc-cska/.next
   ```

3. **Установите Next.js Runtime**
   - Добавьте `netlify.toml` в корень проекта:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"
   
   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

4. **Настройте Environment Variables**
   - Site settings → Environment variables
   - Добавьте `DATABASE_URL` и другие переменные

5. **Deploy**
   - Netlify автоматически соберет и развернет проект

### Ручное развертывание

```bash
# Установите Netlify CLI
npm i -g netlify-cli

# Войдите в аккаунт
netlify login

# Разверните проект
cd wfc-cska
netlify deploy --prod
```

---

## 🖥️ Собственный сервер

### Требования к серверу

- **OS:** Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **Node.js:** 20.x LTS
- **PostgreSQL:** 14+
- **Nginx:** 1.18+ (для reverse proxy)
- **PM2:** Для управления процессами

### Установка зависимостей

```bash
# Обновите систему
sudo apt update && sudo apt upgrade -y

# Установите Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Установите PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Установите PM2
sudo npm install -g pm2

# Установите Nginx
sudo apt install -y nginx
```

### Настройка PostgreSQL

```bash
# Войдите в PostgreSQL
sudo -u postgres psql

# Создайте базу данных и пользователя
CREATE DATABASE wfc_cska;
CREATE USER wfc_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE wfc_cska TO wfc_user;
\q
```

### Развертывание приложения

```bash
# Клонируйте репозиторий
git clone https://github.com/your-repo/wfc-cska.git
cd wfc-cska

# Установите зависимости
npm ci --production

# Настройте .env
cp .env.example .env
nano .env
# Укажите DATABASE_URL для PostgreSQL

# Примените миграции
npx prisma migrate deploy

# Соберите проект
npm run build

# Запустите с PM2
pm2 start npm --name "wfc-cska" -- start
pm2 save
pm2 startup
```

### Настройка Nginx

Создайте конфигурацию Nginx:

```bash
sudo nano /etc/nginx/sites-available/wfccska
```

Добавьте конфигурацию:

```nginx
server {
    listen 80;
    server_name wfccska.ru www.wfccska.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Кэширование статических файлов
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }

    # Кэширование изображений
    location /_next/image {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
```

Активируйте конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/wfccska /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL сертификат (Let's Encrypt)

```bash
# Установите Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получите SSL сертификат
sudo certbot --nginx -d wfccska.ru -d www.wfccska.ru

# Автоматическое обновление
sudo certbot renew --dry-run
```

### Мониторинг и логи

```bash
# Просмотр логов PM2
pm2 logs wfc-cska

# Мониторинг процессов
pm2 monit

# Перезапуск приложения
pm2 restart wfc-cska

# Остановка приложения
pm2 stop wfc-cska
```

---

## 🗄️ База данных

### SQLite (Development)

```env
DATABASE_URL="file:./dev.db"
```

**Преимущества:**
- Простая настройка
- Не требует отдельного сервера
- Идеально для разработки

**Недостатки:**
- Не подходит для production
- Ограниченная производительность
- Нет concurrent writes

### PostgreSQL (Production)

```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

**Преимущества:**
- Высокая производительность
- Поддержка concurrent connections
- Надежность и масштабируемость

**Рекомендуемые провайдеры:**
- [Supabase](https://supabase.com) - Бесплатный tier
- [Railway](https://railway.app) - $5/месяц
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Vercel Postgres](https://vercel.com/storage/postgres) - Интеграция с Vercel

### Миграции

```bash
# Development
npx prisma migrate dev

# Production
npx prisma migrate deploy

# Откат миграции (осторожно!)
npx prisma migrate resolve --rolled-back migration_name
```

---

## 🔐 Environment Variables

### Обязательные переменные

```env
# База данных (обязательно)
DATABASE_URL="postgresql://..."

# Base URL для metadata (рекомендуется)
NEXT_PUBLIC_BASE_URL="https://wfccska.ru"
```

### Опциональные переменные

```env
# Google Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# Sentry Error Tracking
SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"

# Custom Image Domain
NEXT_PUBLIC_IMAGE_DOMAIN="cdn.wfccska.ru"

# Node Environment
NODE_ENV="production"
```

### Настройка на разных платформах

**Vercel:**
- Settings → Environment Variables
- Добавьте переменные для Production, Preview, Development

**Netlify:**
- Site settings → Environment variables
- Добавьте переменные и выберите scopes

**Собственный сервер:**
- Создайте `.env.production` файл
- Используйте `pm2 start ecosystem.config.js`

---

## ✅ Post-Deployment

### 1. Проверка работоспособности

```bash
# Проверьте главную страницу
curl -I https://wfccska.ru

# Проверьте API endpoints
curl https://wfccska.ru/api/players
curl https://wfccska.ru/api/news
curl https://wfccska.ru/api/matches
```

### 2. Lighthouse тест

- Откройте Chrome DevTools
- Перейдите на вкладку Lighthouse
- Запустите тест для Production URL
- Убедитесь: Performance > 90, Accessibility > 95

### 3. Мониторинг

**Рекомендуемые инструменты:**
- [Vercel Analytics](https://vercel.com/analytics) - Встроенная аналитика
- [Google Analytics](https://analytics.google.com) - Веб-аналитика
- [Sentry](https://sentry.io) - Error tracking
- [UptimeRobot](https://uptimerobot.com) - Uptime monitoring

### 4. Резервное копирование

```bash
# Backup PostgreSQL
pg_dump -U user -h host database > backup.sql

# Restore PostgreSQL
psql -U user -h host database < backup.sql

# Автоматический backup (cron)
0 2 * * * pg_dump -U user database > /backups/db_$(date +\%Y\%m\%d).sql
```

### 5. Обновление приложения

**Vercel/Netlify:**
- Просто push в Git репозиторий
- Автоматический deploy

**Собственный сервер:**
```bash
cd wfc-cska
git pull origin main
npm ci --production
npm run build
npx prisma migrate deploy
pm2 restart wfc-cska
```

---

## 🐛 Troubleshooting

### Build ошибки

```bash
# Очистите кэш
rm -rf .next node_modules
npm install
npm run build
```

### Database connection ошибки

```bash
# Проверьте DATABASE_URL
echo $DATABASE_URL

# Проверьте подключение к PostgreSQL
psql $DATABASE_URL

# Проверьте миграции
npx prisma migrate status
```

### Performance проблемы

- Проверьте размер bundle: `npm run build`
- Оптимизируйте изображения
- Включите кэширование в Nginx
- Используйте CDN для статических файлов

### SSL проблемы

```bash
# Проверьте сертификат
sudo certbot certificates

# Обновите сертификат
sudo certbot renew

# Проверьте Nginx конфигурацию
sudo nginx -t
```

---

## 📚 Дополнительные ресурсы

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)

---

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `pm2 logs` или Vercel/Netlify dashboard
2. Проверьте документацию выше
3. Создайте issue в репозитории

---

**Последнее обновление:** 21 января 2026
