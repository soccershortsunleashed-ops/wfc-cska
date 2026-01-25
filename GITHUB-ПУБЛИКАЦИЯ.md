# 📦 Подготовка проекта к публикации на GitHub

## ✅ Что уже сделано

### 📄 Документация
- ✅ README.md - обновлен с badges, структурой и полной документацией
- ✅ LICENSE - MIT лицензия
- ✅ CONTRIBUTING.md - руководство для контрибьюторов
- ✅ .env.example - пример переменных окружения

### 🔧 GitHub конфигурация
- ✅ .gitignore - обновлен для GitHub
- ✅ .gitattributes - настройки для Git
- ✅ .github/ISSUE_TEMPLATE/bug_report.md - шаблон для багов
- ✅ .github/ISSUE_TEMPLATE/feature_request.md - шаблон для фич
- ✅ .github/pull_request_template.md - шаблон для PR

### 🗂️ Структура проекта
- ✅ Удалены временные файлы
- ✅ Удалены бэкапы
- ✅ Очищены отчеты
- ✅ Оставлена только важная документация

## 📋 Чеклист перед публикацией

### 1. Проверка файлов

```bash
# Проверьте, что эти файлы существуют
ls -la wfc-cska/

# Должны быть:
# ✓ README.md
# ✓ LICENSE
# ✓ CONTRIBUTING.md
# ✓ .env.example
# ✓ .gitignore
# ✓ .gitattributes
# ✓ package.json
```

### 2. Проверка .env

```bash
# Убедитесь, что .env НЕ будет загружен
cat wfc-cska/.gitignore | grep ".env"

# Должно быть:
# .env
# .env*.local
# .env.production
```

### 3. Проверка базы данных

```bash
# Убедитесь, что dev.db НЕ будет загружен
cat wfc-cska/.gitignore | grep "*.db"

# Должно быть:
# *.db
# *.db-journal
# dev.db
```

### 4. Проверка node_modules

```bash
# Убедитесь, что node_modules НЕ будет загружен
cat wfc-cska/.gitignore | grep "node_modules"

# Должно быть:
# /node_modules
```

### 5. Тестирование проекта

```bash
cd wfc-cska

# Установка зависимостей
npm install

# Проверка линтера
npm run lint

# Проверка сборки
npm run build

# Запуск проекта
npm run dev
```

## 🚀 Публикация на GitHub

### Шаг 1: Создание репозитория

1. Перейдите на [GitHub](https://github.com)
2. Нажмите "New repository"
3. Заполните данные:
   - **Repository name:** `wfc-cska`
   - **Description:** `⚽ Официальный сайт ЖФК ЦСКА - Next.js 16, React 19, TypeScript, Tailwind CSS`
   - **Visibility:** Public или Private
   - **НЕ** инициализируйте с README, .gitignore или LICENSE (они уже есть)

### Шаг 2: Инициализация Git

```bash
cd wfc-cska

# Инициализация Git (если еще не сделано)
git init

# Добавление всех файлов
git add .

# Первый коммит
git commit -m "feat: initial commit - WFC CSKA website"

# Добавление remote
git remote add origin https://github.com/yourusername/wfc-cska.git

# Переименование ветки в main (если нужно)
git branch -M main

# Push на GitHub
git push -u origin main
```

### Шаг 3: Настройка репозитория на GitHub

1. **About section:**
   - Description: `⚽ Официальный сайт ЖФК ЦСКА`
   - Website: `https://wfccska.ru`
   - Topics: `nextjs`, `react`, `typescript`, `tailwindcss`, `prisma`, `football`, `cska`

2. **Settings → General:**
   - ✅ Issues
   - ✅ Projects
   - ✅ Wiki (опционально)
   - ✅ Discussions (опционально)

3. **Settings → Branches:**
   - Default branch: `main`
   - Branch protection rules (опционально):
     - Require pull request reviews
     - Require status checks to pass

### Шаг 4: Создание Release (опционально)

```bash
# Создание тега
git tag -a v1.0.0 -m "Release v1.0.0 - Initial release"

# Push тега
git push origin v1.0.0
```

Затем на GitHub:
1. Перейдите в "Releases"
2. "Create a new release"
3. Выберите тег `v1.0.0`
4. Заполните описание релиза

## 📝 Обновление README

Не забудьте обновить ссылки в README.md:

```markdown
# Замените yourusername на ваш GitHub username
https://github.com/yourusername/wfc-cska
```

## 🔒 Безопасность

### Что НЕ должно попасть в репозиторий:

- ❌ `.env` файлы с реальными данными
- ❌ `dev.db` - база данных
- ❌ `node_modules/` - зависимости
- ❌ API ключи и токены
- ❌ Пароли и credentials
- ❌ Личные данные

### Проверка перед push:

```bash
# Проверьте, что будет загружено
git status

# Проверьте содержимое коммита
git diff --cached

# Если что-то не так, удалите из staging
git reset HEAD <file>
```

## 🎯 После публикации

### 1. Настройка GitHub Pages (опционально)

Если хотите разместить документацию:
1. Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` / `docs`

### 2. Настройка GitHub Actions (опционально)

Создайте `.github/workflows/ci.yml` для автоматических проверок:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm ci
    - run: npm run lint
    - run: npm run build
```

### 3. Добавление badges в README

Обновите badges в README.md с реальными ссылками:

```markdown
![Build Status](https://github.com/yourusername/wfc-cska/workflows/CI/badge.svg)
![License](https://img.shields.io/github/license/yourusername/wfc-cska)
![Stars](https://img.shields.io/github/stars/yourusername/wfc-cska)
```

### 4. Создание CHANGELOG.md

Ведите историю изменений:

```markdown
# Changelog

## [1.0.0] - 2026-01-25

### Added
- Начальная версия сайта
- Главная страница
- Страница игроков
- API endpoints
- Документация
```

## 📞 Поддержка

Если возникли проблемы:

1. Проверьте [GitHub Docs](https://docs.github.com)
2. Проверьте `.gitignore`
3. Проверьте `git status`
4. Используйте `git log` для просмотра истории

## ✅ Финальная проверка

Перед публикацией убедитесь:

- [ ] README.md обновлен
- [ ] LICENSE добавлен
- [ ] .env.example создан
- [ ] .gitignore настроен
- [ ] Нет чувствительных данных
- [ ] Проект собирается без ошибок
- [ ] Документация актуальна
- [ ] Ссылки в README работают

---

**Готово! Проект готов к публикации на GitHub! 🎉**

После публикации не забудьте:
1. Добавить описание репозитория
2. Добавить topics (теги)
3. Настроить Issues и Projects
4. Пригласить контрибьюторов (если нужно)
