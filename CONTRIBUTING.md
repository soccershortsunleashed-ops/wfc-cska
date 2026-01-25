# 🤝 Руководство по внесению вклада

Спасибо за интерес к проекту ЖФК ЦСКА! Мы рады любому вкладу в развитие сайта.

## 📋 Содержание

- [Кодекс поведения](#кодекс-поведения)
- [Как внести вклад](#как-внести-вклад)
- [Процесс разработки](#процесс-разработки)
- [Стандарты кода](#стандарты-кода)
- [Коммиты](#коммиты)
- [Pull Requests](#pull-requests)

## 📜 Кодекс поведения

Участвуя в этом проекте, вы соглашаетесь соблюдать наш кодекс поведения:

- Будьте уважительны к другим участникам
- Конструктивная критика приветствуется
- Фокусируйтесь на том, что лучше для проекта
- Проявляйте эмпатию к другим участникам сообщества

## 🚀 Как внести вклад

### Сообщение об ошибках

Если вы нашли ошибку:

1. Проверьте, не была ли она уже сообщена в [Issues](https://github.com/yourusername/wfc-cska/issues)
2. Если нет, создайте новый Issue с подробным описанием:
   - Шаги для воспроизведения
   - Ожидаемое поведение
   - Фактическое поведение
   - Скриншоты (если применимо)
   - Версия браузера и ОС

### Предложение новых функций

1. Создайте Issue с меткой `enhancement`
2. Опишите предлагаемую функцию
3. Объясните, почему она будет полезна
4. Дождитесь обсуждения перед началом работы

### Исправление ошибок или добавление функций

1. Fork репозитория
2. Создайте ветку для вашей работы
3. Внесите изменения
4. Создайте Pull Request

## 🔧 Процесс разработки

### 1. Настройка окружения

```bash
# Fork и клонирование
git clone https://github.com/your-username/wfc-cska.git
cd wfc-cska

# Установка зависимостей
npm install

# Настройка БД
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Запуск dev сервера
npm run dev
```

### 2. Создание ветки

```bash
# Создайте ветку от main
git checkout -b feature/your-feature-name
# или
git checkout -b fix/bug-description
```

Именование веток:
- `feature/` - новые функции
- `fix/` - исправления ошибок
- `docs/` - изменения в документации
- `refactor/` - рефакторинг кода
- `test/` - добавление тестов

### 3. Внесение изменений

- Следуйте стандартам кода (см. ниже)
- Пишите понятные комментарии
- Обновляйте документацию при необходимости
- Тестируйте изменения локально

### 4. Коммит изменений

```bash
git add .
git commit -m "feat: add player statistics page"
```

### 5. Push и Pull Request

```bash
git push origin feature/your-feature-name
```

Затем создайте Pull Request на GitHub.

## 📝 Стандарты кода

### TypeScript

- Используйте строгий режим TypeScript
- Избегайте `any`, используйте конкретные типы
- Используйте интерфейсы для объектов
- Документируйте сложные типы

```typescript
// ✅ Хорошо
interface Player {
  id: string;
  name: string;
  position: Position;
}

// ❌ Плохо
const player: any = { ... };
```

### React компоненты

- Используйте функциональные компоненты
- Server Components по умолчанию
- `'use client'` только когда необходимо
- Именуйте компоненты в PascalCase

```tsx
// ✅ Хорошо
export default function PlayerCard({ player }: PlayerCardProps) {
  return <div>...</div>;
}

// ❌ Плохо
export default function playerCard(props: any) {
  return <div>...</div>;
}
```

### Стили

- Используйте Tailwind CSS классы
- Избегайте inline стилей
- Используйте `cn()` для условных классов
- Следуйте цветовой схеме ЦСКА

```tsx
// ✅ Хорошо
<div className={cn(
  "bg-[#0033A0] text-white",
  isActive && "bg-[#E4002B]"
)}>

// ❌ Плохо
<div style={{ backgroundColor: '#0033A0' }}>
```

### Файловая структура

```
components/
├── ui/              # Базовые UI компоненты
├── layout/          # Layout компоненты
├── sections/        # Секции страниц
└── [feature]/       # Компоненты по функциям
```

### Именование файлов

- Компоненты: `PascalCase.tsx`
- Утилиты: `kebab-case.ts`
- Страницы: `page.tsx`, `layout.tsx`
- API: `route.ts`

## 💬 Коммиты

Используйте [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Типы коммитов

- `feat:` - новая функция
- `fix:` - исправление ошибки
- `docs:` - изменения в документации
- `style:` - форматирование, отсутствующие точки с запятой и т.д.
- `refactor:` - рефакторинг кода
- `test:` - добавление тестов
- `chore:` - обновление зависимостей, конфигурации и т.д.

### Примеры

```bash
feat(players): add player statistics page
fix(api): correct match date formatting
docs(readme): update installation instructions
style(header): improve mobile navigation layout
refactor(utils): simplify date formatting function
```

## 🔍 Pull Requests

### Чеклист перед созданием PR

- [ ] Код следует стандартам проекта
- [ ] Все изменения протестированы локально
- [ ] Документация обновлена (если необходимо)
- [ ] Коммиты следуют Conventional Commits
- [ ] Нет конфликтов с main веткой
- [ ] ESLint проверка пройдена (`npm run lint`)
- [ ] Build успешен (`npm run build`)

### Описание PR

Используйте шаблон:

```markdown
## Описание
Краткое описание изменений

## Тип изменений
- [ ] Исправление ошибки
- [ ] Новая функция
- [ ] Критическое изменение
- [ ] Обновление документации

## Как протестировать
1. Шаг 1
2. Шаг 2
3. ...

## Скриншоты (если применимо)
Добавьте скриншоты для визуальных изменений

## Связанные Issues
Closes #123
```

### Процесс ревью

1. Создайте PR
2. Дождитесь автоматических проверок
3. Запросите ревью у мейнтейнеров
4. Внесите правки по комментариям
5. После одобрения PR будет смержен

## 🧪 Тестирование

### Локальное тестирование

```bash
# Запуск dev сервера
npm run dev

# Проверка сборки
npm run build
npm run start

# ESLint
npm run lint
```

### Проверка в браузере

- Тестируйте на разных размерах экрана (mobile, tablet, desktop)
- Проверьте в Chrome DevTools
- Убедитесь, что нет ошибок в консоли
- Проверьте Lighthouse Score

## 📚 Ресурсы

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

## ❓ Вопросы

Если у вас есть вопросы:

1. Проверьте [документацию](./README.md)
2. Поищите в [Issues](https://github.com/yourusername/wfc-cska/issues)
3. Создайте новый Issue с меткой `question`

## 🙏 Благодарности

Спасибо всем, кто вносит вклад в развитие проекта!

---

**Удачи в разработке! ⚽**
