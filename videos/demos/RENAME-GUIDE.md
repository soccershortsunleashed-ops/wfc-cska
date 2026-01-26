# 📝 Руководство по переименованию видео

## Порядок записи видео

Видео были записаны в следующем порядке:

1. **01-header-navigation.webm** - Header и навигация
2. **02-floating-dock-social.webm** - Floating Dock с соцсетями
3. **03-match-cards-hover.webm** - Карточки матчей с hover
4. **04-players-carousel.webm** - Карусель игроков
5. **05-player-filters.webm** - Фильтрация игроков (частично)
6. **06-player-search.webm** - Поиск игроков
7. **07-player-cards-hover.webm** - Карточки игроков с hover
8. **08-player-profile.webm** - Профиль игрока

## 🔄 Команды для переименования (PowerShell)

Выполните в папке `videos/demos/`:

```powershell
# Получите список файлов с временем создания
Get-ChildItem *.webm | Sort-Object CreationTime | Select-Object Name, CreationTime

# Переименуйте файлы в порядке создания
$files = Get-ChildItem *.webm | Sort-Object CreationTime
$names = @(
    "01-header-navigation.webm",
    "02-floating-dock-social.webm",
    "03-match-cards-hover.webm",
    "04-players-carousel.webm",
    "05-player-filters.webm",
    "06-player-search.webm",
    "07-player-cards-hover.webm",
    "08-player-profile.webm"
)

for ($i = 0; $i -lt $files.Count; $i++) {
    if ($i -lt $names.Count) {
        Rename-Item $files[$i].FullName -NewName $names[$i]
        Write-Host "✅ Переименовано: $($files[$i].Name) -> $($names[$i])"
    }
}
```

## 🔄 Альтернатива: Ручное переименование

1. Откройте папку `videos/demos/`
2. Отсортируйте файлы по дате создания (самый старый = первый)
3. Переименуйте файлы в порядке:
   - Первый файл → `01-header-navigation.webm`
   - Второй файл → `02-floating-dock-social.webm`
   - И так далее...

## ✅ Проверка

После переименования у вас должны быть файлы:
- ✅ `01-header-navigation.webm`
- ✅ `02-floating-dock-social.webm`
- ✅ `03-match-cards-hover.webm`
- ✅ `04-players-carousel.webm`
- ⚠️ `05-player-filters.webm` (может быть неполным)
- ✅ `06-player-search.webm`
- ✅ `07-player-cards-hover.webm`
- ✅ `08-player-profile.webm`

## 🎬 Перезапись видео

Если нужно перезаписать конкретное видео:

```bash
# Из корня проекта
node scripts/record-short-demos.mjs
```

Скрипт запишет все видео заново.
