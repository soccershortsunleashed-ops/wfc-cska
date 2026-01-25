# 🔷 Bitrix24 Integration Guide - ЖФК ЦСКА

Подробное руководство по интеграции Next.js приложения с Bitrix24.

**Дата:** 21 января 2026  
**Версия:** 1.0.0

---

## 📋 Содержание

- [Введение](#введение)
- [Архитектурные варианты](#архитектурные-варианты)
- [Вариант 1: Next.js + Bitrix24 API](#вариант-1-nextjs--bitrix24-api)
- [Вариант 2: Гибридный подход](#вариант-2-гибридный-подход)
- [Вариант 3: Bitrix24 как Headless CMS](#вариант-3-bitrix24-как-headless-cms)
- [Настройка Bitrix24 REST API](#настройка-bitrix24-rest-api)
- [Интеграция с Next.js](#интеграция-с-nextjs)
- [Синхронизация данных](#синхронизация-данных)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Введение

### Что такое Bitrix24?

**Bitrix24** - это комплексная CRM и CMS система на PHP, которая включает:
- Управление контентом (CMS)
- CRM систему
- Инфоблоки для хранения данных
- Административную панель
- Встроенные модули

### Что такое Next.js?

**Next.js** - это современный React framework, который предоставляет:
- Server-Side Rendering (SSR)
- Static Site Generation (SSG)
- API Routes
- Оптимизацию производительности
- Современный DX (Developer Experience)

### Зачем интегрировать?

**Преимущества интеграции:**
- ✅ Используете Bitrix24 для управления контентом
- ✅ Получаете современный быстрый фронтенд на Next.js
- ✅ Lighthouse Performance 95/100 (vs 40-60 на чистом Bitrix24)
- ✅ Лучший UX для пользователей
- ✅ Сохраняете инвестиции в Bitrix24

---

## 🏗️ Архитектурные варианты

### Сравнение вариантов

| Критерий | Вариант 1 | Вариант 2 | Вариант 3 |
|----------|-----------|-----------|-----------|
| **Сложность** | Средняя | Низкая | Высокая |
| **Performance** | Отличный | Хороший | Отличный |
| **Стоимость** | Средняя | Низкая | Высокая |
| **Гибкость** | Высокая | Средняя | Очень высокая |
| **Время внедрения** | 2-3 недели | 1 неделя | 4-6 недель |

### Вариант 1: Next.js как фронтенд + Bitrix24 как backend

```
┌─────────────────┐
│   Next.js App   │  ← Пользователи видят это
│  (Frontend)     │
└────────┬────────┘
         │ REST API
         ↓
┌─────────────────┐
│   Bitrix24      │  ← Администраторы работают здесь
│  (Backend/CMS)  │
└─────────────────┘
```

**Когда использовать:**
- Нужна максимальная производительность
- Важен современный UX
- Есть ресурсы на разработку

### Вариант 2: Гибридный подход (рекомендуется)

```
wfccska.ru          → Bitrix24 (основной сайт)
players.wfccska.ru  → Next.js (страница игроков)
stats.wfccska.ru    → Next.js (статистика)
```

**Когда использовать:**
- Уже есть сайт на Bitrix24
- Нужно улучшить только некоторые разделы
- Ограниченный бюджет

### Вариант 3: Bitrix24 как Headless CMS

```
┌─────────────────┐
│   Next.js App   │  ← Весь фронтенд
│  (Full Stack)   │
└────────┬────────┘
         │ GraphQL/REST
         ↓
┌─────────────────┐
│   Bitrix24      │  ← Только для контента
│  (Headless CMS) │
└─────────────────┘
```

**Когда использовать:**
- Новый проект с нуля
- Максимальная гибкость
- Большой бюджет

---

## 🔧 Вариант 1: Next.js + Bitrix24 API

### Шаг 1: Настройка Bitrix24 REST API

#### 1.1. Создайте REST приложение

В админке Bitrix24:
1. Перейдите в **Настройки → Разработчикам → REST API**
2. Создайте новое приложение
3. Получите **Client ID** и **Client Secret**

#### 1.2. Создайте API endpoints

```php
<?php
// /local/rest/players/index.php
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");

use Bitrix\Main\Loader;
use Bitrix\Main\Application;

Loader::includeModule("iblock");

$request = Application::getInstance()->getContext()->getRequest();
$method = $request->getRequestMethod();

// CORS headers
header('Access-Control-Allow-Origin: https://players.wfccska.ru');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// GET /rest/players - Список игроков
if ($method === 'GET') {
    $players = [];
    
    $filter = ["IBLOCK_ID" => 1, "ACTIVE" => "Y"];
    
    // Фильтр по позиции
    if ($position = $request->get('position')) {
        $filter["PROPERTY_POSITION"] = $position;
    }
    
    // Фильтр по команде
    if ($team = $request->get('team')) {
        $filter["PROPERTY_TEAM"] = $team;
    }
    
    $res = CIBlockElement::GetList(
        ["PROPERTY_NUMBER" => "ASC"],
        $filter,
        false,
        false,
        [
            "ID", 
            "NAME", 
            "CODE",
            "DETAIL_PICTURE",
            "PROPERTY_NUMBER",
            "PROPERTY_POSITION",
            "PROPERTY_TEAM",
            "PROPERTY_BIRTH_DATE",
            "PROPERTY_HEIGHT",
            "PROPERTY_WEIGHT",
            "PROPERTY_NATIONALITY"
        ]
    );
    
    while ($player = $res->GetNext()) {
        $imageUrl = null;
        if ($player['DETAIL_PICTURE']) {
            $image = CFile::GetPath($player['DETAIL_PICTURE']);
            $imageUrl = 'https://wfccska.ru' . $image;
        }
        
        $players[] = [
            'id' => (int)$player['ID'],
            'slug' => $player['CODE'],
            'name' => $player['NAME'],
            'number' => (int)$player['PROPERTY_NUMBER_VALUE'],
            'position' => $player['PROPERTY_POSITION_VALUE'],
            'team' => $player['PROPERTY_TEAM_VALUE'],
            'birthDate' => $player['PROPERTY_BIRTH_DATE_VALUE'],
            'height' => (int)$player['PROPERTY_HEIGHT_VALUE'],
            'weight' => (int)$player['PROPERTY_WEIGHT_VALUE'],
            'nationality' => $player['PROPERTY_NATIONALITY_VALUE'],
            'imageUrl' => $imageUrl
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $players,
        'total' => count($players)
    ]);
    exit;
}

// GET /rest/players/{slug} - Детали игрока
if ($method === 'GET' && $slug = $request->get('slug')) {
    $res = CIBlockElement::GetList(
        [],
        ["IBLOCK_ID" => 1, "CODE" => $slug, "ACTIVE" => "Y"],
        false,
        false,
        ["*", "PROPERTY_*"]
    );
    
    if ($player = $res->GetNext()) {
        $imageUrl = null;
        if ($player['DETAIL_PICTURE']) {
            $image = CFile::GetPath($player['DETAIL_PICTURE']);
            $imageUrl = 'https://wfccska.ru' . $image;
        }
        
        // Получить статистику
        $statsRes = CIBlockElement::GetList(
            [],
            ["IBLOCK_ID" => 2, "PROPERTY_PLAYER_ID" => $player['ID']],
            false,
            false,
            ["*", "PROPERTY_*"]
        );
        
        $stats = null;
        if ($stat = $statsRes->GetNext()) {
            $stats = [
                'appearances' => (int)$stat['PROPERTY_APPEARANCES_VALUE'],
                'goals' => (int)$stat['PROPERTY_GOALS_VALUE'],
                'assists' => (int)$stat['PROPERTY_ASSISTS_VALUE'],
                'yellowCards' => (int)$stat['PROPERTY_YELLOW_CARDS_VALUE'],
                'redCards' => (int)$stat['PROPERTY_RED_CARDS_VALUE'],
                'minutesPlayed' => (int)$stat['PROPERTY_MINUTES_PLAYED_VALUE']
            ];
        }
        
        echo json_encode([
            'success' => true,
            'data' => [
                'id' => (int)$player['ID'],
                'slug' => $player['CODE'],
                'name' => $player['NAME'],
                'number' => (int)$player['PROPERTY_NUMBER_VALUE'],
                'position' => $player['PROPERTY_POSITION_VALUE'],
                'team' => $player['PROPERTY_TEAM_VALUE'],
                'birthDate' => $player['PROPERTY_BIRTH_DATE_VALUE'],
                'height' => (int)$player['PROPERTY_HEIGHT_VALUE'],
                'weight' => (int)$player['PROPERTY_WEIGHT_VALUE'],
                'nationality' => $player['PROPERTY_NATIONALITY_VALUE'],
                'imageUrl' => $imageUrl,
                'bio' => $player['DETAIL_TEXT'],
                'stats' => $stats
            ]
        ]);
        exit;
    }
    
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Player not found']);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
?>
```

#### 1.3. Создайте API для новостей

```php
<?php
// /local/rest/news/index.php
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");

use Bitrix\Main\Loader;
use Bitrix\Main\Application;

Loader::includeModule("iblock");

$request = Application::getInstance()->getContext()->getRequest();
header('Access-Control-Allow-Origin: https://wfccska.ru');
header('Content-Type: application/json; charset=utf-8');

$limit = (int)$request->get('limit') ?: 6;

$news = [];
$res = CIBlockElement::GetList(
    ["DATE_CREATE" => "DESC"],
    ["IBLOCK_ID" => 3, "ACTIVE" => "Y"],
    false,
    ["nTopCount" => $limit],
    ["ID", "NAME", "CODE", "PREVIEW_TEXT", "PREVIEW_PICTURE", "DATE_CREATE"]
);

while ($item = $res->GetNext()) {
    $imageUrl = null;
    if ($item['PREVIEW_PICTURE']) {
        $image = CFile::GetPath($item['PREVIEW_PICTURE']);
        $imageUrl = 'https://wfccska.ru' . $image;
    }
    
    $news[] = [
        'id' => (int)$item['ID'],
        'slug' => $item['CODE'],
        'title' => $item['NAME'],
        'excerpt' => $item['PREVIEW_TEXT'],
        'imageUrl' => $imageUrl,
        'publishedAt' => $item['DATE_CREATE']
    ];
}

echo json_encode(['success' => true, 'data' => $news]);
?>
```

### Шаг 2: Интеграция с Next.js

#### 2.1. Создайте Bitrix API сервис

```typescript
// lib/services/bitrix-api.service.ts
const BITRIX_API_URL = process.env.BITRIX_API_URL || 'https://wfccska.ru/rest';
const BITRIX_API_KEY = process.env.BITRIX_API_KEY;

interface BitrixResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  error?: string;
}

export async function fetchFromBitrix<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BITRIX_API_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(BITRIX_API_KEY && { 'Authorization': `Bearer ${BITRIX_API_KEY}` }),
    ...options?.headers,
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      next: { revalidate: 60 }, // Кэш на 60 секунд
    });
    
    if (!response.ok) {
      throw new Error(`Bitrix API error: ${response.status} ${response.statusText}`);
    }
    
    const result: BitrixResponse<T> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Unknown Bitrix API error');
    }
    
    return result.data;
  } catch (error) {
    console.error('Bitrix API fetch error:', error);
    throw error;
  }
}

export async function fetchFromBitrixWithCache<T>(
  endpoint: string,
  cacheTime: number = 300 // 5 минут по умолчанию
): Promise<T> {
  return fetchFromBitrix<T>(endpoint, {
    next: { revalidate: cacheTime }
  });
}
```

#### 2.2. Обновите Players Service

```typescript
// lib/services/players.service.ts
import { fetchFromBitrix } from './bitrix-api.service';
import type { Player, PlayerFilters } from '@/lib/schemas/player.schema';

export async function getPlayers(filters?: PlayerFilters): Promise<Player[]> {
  const params = new URLSearchParams();
  
  if (filters?.position) {
    params.append('position', filters.position);
  }
  
  if (filters?.team) {
    params.append('team', filters.team);
  }
  
  const endpoint = `/players${params.toString() ? `?${params}` : ''}`;
  const players = await fetchFromBitrix<Player[]>(endpoint);
  
  // Применить дополнительные фильтры на клиенте
  let result = players;
  
  if (filters?.q) {
    const query = filters.q.toLowerCase();
    result = result.filter(p => 
      p.name.toLowerCase().includes(query)
    );
  }
  
  if (filters?.sort === 'name') {
    result.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  } else {
    result.sort((a, b) => a.number - b.number);
  }
  
  return result;
}

export async function getPlayerBySlug(slug: string): Promise<Player | null> {
  try {
    const player = await fetchFromBitrix<Player>(`/players?slug=${slug}`);
    return player;
  } catch (error) {
    console.error('Error fetching player:', error);
    return null;
  }
}

export async function getTopPlayers(limit: number = 4): Promise<Player[]> {
  const players = await getPlayers({ team: 'MAIN' });
  return players.slice(0, limit);
}
```

#### 2.3. Обновите News Service

```typescript
// lib/services/news.service.ts
import { fetchFromBitrix } from './bitrix-api.service';
import type { News } from '@/lib/schemas/news.schema';

export async function getNews(limit: number = 6): Promise<News[]> {
  return fetchFromBitrix<News[]>(`/news?limit=${limit}`);
}

export async function getNewsBySlug(slug: string): Promise<News | null> {
  try {
    return await fetchFromBitrix<News>(`/news/${slug}`);
  } catch (error) {
    return null;
  }
}
```

#### 2.4. Настройте Environment Variables

```env
# .env.production
BITRIX_API_URL="https://wfccska.ru/rest"
BITRIX_API_KEY="your_api_key_if_needed"
NEXT_PUBLIC_BASE_URL="https://players.wfccska.ru"
```

### Шаг 3: Тестирование интеграции

```bash
# Запустите dev сервер
npm run dev

# Проверьте API endpoints
curl http://localhost:3000/api/players
curl http://localhost:3000/api/news

# Откройте в браузере
open http://localhost:3000
```

---

## 🔀 Вариант 2: Гибридный подход

### Архитектура

```
wfccska.ru (Bitrix24)
├── / (главная)
├── /news (новости)
├── /contacts (контакты)
└── → players.wfccska.ru (Next.js)
    ├── /players
    └── /players/[slug]
```

### Настройка

#### 1. Разверните Next.js на поддомене

```bash
# На сервере с Bitrix24
cd /var/www
git clone https://github.com/your-repo/wfc-cska.git
cd wfc-cska

npm ci --production
npm run build

pm2 start npm --name "wfc-cska-players" -- start
```

#### 2. Настройте Nginx

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 3. Добавьте ссылку в Bitrix24

В шаблоне Bitrix24 добавьте ссылку на Next.js:

```php
<!-- В header.php -->
<nav>
    <a href="/">Главная</a>
    <a href="/news">Новости</a>
    <a href="https://players.wfccska.ru">Игроки</a>
    <a href="/contacts">Контакты</a>
</nav>
```

---

## 🎨 Вариант 3: Bitrix24 как Headless CMS

### Полная интеграция

#### 1. Настройте Bitrix24 REST API (как в Варианте 1)

#### 2. Используйте Next.js для всего фронтенда

```typescript
// app/page.tsx - Главная страница
import { getNews } from '@/lib/services/news.service';
import { getTopPlayers } from '@/lib/services/players.service';
import { getMatches } from '@/lib/services/matches.service';

export default async function HomePage() {
  const [news, players, matches] = await Promise.all([
    getNews(6),
    getTopPlayers(4),
    getMatches()
  ]);
  
  return (
    <>
      <HeroSection />
      <MatchCard matches={matches} />
      <NewsSection news={news} />
      <TeamTeaser players={players} />
      <SponsorsSection />
    </>
  );
}
```

#### 3. Разверните на Vercel

```bash
vercel --prod
```

---

## 🔄 Синхронизация данных

### Стратегия 1: ISR (Incremental Static Regeneration)

```typescript
// app/players/page.tsx
export const revalidate = 300; // Обновлять каждые 5 минут

export default async function PlayersPage() {
  const players = await getPlayers();
  return <PlayersList players={players} />;
}
```

**Преимущества:**
- ✅ Быстрая загрузка (статические страницы)
- ✅ Автоматическое обновление
- ✅ Меньше нагрузки на Bitrix24

**Недостатки:**
- ⚠️ Данные обновляются с задержкой (до 5 минут)

### Стратегия 2: On-Demand Revalidation

```typescript
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  
  // Проверка секретного ключа
  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: 'Invalid secret' }, { status: 401 });
  }
  
  const path = request.nextUrl.searchParams.get('path');
  
  if (path) {
    revalidatePath(path);
    return Response.json({ revalidated: true, path });
  }
  
  return Response.json({ error: 'Missing path' }, { status: 400 });
}
```

В Bitrix24 добавьте webhook:

```php
// При обновлении игрока
$playerId = $player['ID'];
$slug = $player['CODE'];

// Вызвать Next.js revalidation
file_get_contents(
    "https://players.wfccska.ru/api/revalidate?secret=YOUR_SECRET&path=/players/{$slug}"
);
```

### Стратегия 3: Real-time через Server-Sent Events

```typescript
// app/api/players/stream/route.ts
export async function GET() {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Подписка на изменения в Bitrix24
      const interval = setInterval(async () => {
        const players = await getPlayers();
        const data = `data: ${JSON.stringify(players)}\n\n`;
        controller.enqueue(encoder.encode(data));
      }, 5000);
      
      // Cleanup
      return () => clearInterval(interval);
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

---

## 🚀 Deployment

### На том же сервере с Bitrix24

```bash
# 1. Установите Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 2. Клонируйте проект
cd /var/www
git clone https://github.com/your-repo/wfc-cska.git
cd wfc-cska

# 3. Установите зависимости
npm ci --production

# 4. Настройте .env
cp .env.example .env
nano .env
# BITRIX_API_URL="https://wfccska.ru/rest"

# 5. Соберите проект
npm run build

# 6. Запустите с PM2
pm2 start npm --name "wfc-cska" -- start
pm2 save
pm2 startup

# 7. Настройте Nginx (см. выше)
```

### На отдельном сервере (Vercel)

```bash
# 1. Установите Vercel CLI
npm i -g vercel

# 2. Deploy
cd wfc-cska
vercel --prod

# 3. Настройте Environment Variables в Vercel Dashboard
# BITRIX_API_URL=https://wfccska.ru/rest
```

---

## 🐛 Troubleshooting

### CORS ошибки

**Проблема:** `Access-Control-Allow-Origin` ошибка

**Решение:**
```php
// В Bitrix24 API файлах
header('Access-Control-Allow-Origin: https://players.wfccska.ru');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

### Медленная загрузка

**Проблема:** Страницы загружаются медленно

**Решение:**
1. Включите ISR кэширование
2. Используйте CDN для изображений
3. Оптимизируйте Bitrix24 запросы

### Данные не обновляются

**Проблема:** Изменения в Bitrix24 не отображаются

**Решение:**
1. Проверьте revalidate время
2. Используйте On-Demand Revalidation
3. Очистите кэш: `rm -rf .next/cache`

### 404 ошибки на API

**Проблема:** API endpoints возвращают 404

**Решение:**
1. Проверьте пути к файлам в Bitrix24
2. Проверьте права доступа к файлам
3. Проверьте .htaccess конфигурацию

---

## 📚 Дополнительные ресурсы

- [Bitrix24 REST API Documentation](https://dev.1c-bitrix.ru/rest_help/)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Последнее обновление:** 21 января 2026  
**Версия:** 1.0.0
