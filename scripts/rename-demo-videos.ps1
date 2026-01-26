# Скрипт для автоматического переименования демо-видео

$demosPath = Join-Path $PSScriptRoot "..\videos\demos"

Write-Host "🔄 Переименование демо-видео..." -ForegroundColor Cyan
Write-Host "📁 Папка: $demosPath`n" -ForegroundColor Gray

# Получаем все .webm файлы, отсортированные по времени создания
$files = Get-ChildItem -Path $demosPath -Filter "*.webm" | Sort-Object CreationTime

# Новые имена файлов
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

Write-Host "📋 Найдено файлов: $($files.Count)" -ForegroundColor Yellow
Write-Host ""

# Переименовываем файлы
for ($i = 0; $i -lt $files.Count; $i++) {
    if ($i -lt $names.Count) {
        $oldName = $files[$i].Name
        $newName = $names[$i]
        $newPath = Join-Path $demosPath $newName
        
        # Проверяем, не существует ли уже файл с таким именем
        if (Test-Path $newPath) {
            Write-Host "⚠️  Файл $newName уже существует, пропускаем..." -ForegroundColor Yellow
        } else {
            Rename-Item -Path $files[$i].FullName -NewName $newName
            Write-Host "✅ $oldName" -ForegroundColor Green
            Write-Host "   → $newName" -ForegroundColor Cyan
        }
    }
}

Write-Host "`n✨ Переименование завершено!" -ForegroundColor Green
Write-Host ""
Write-Host "Проверьте файлы в папке:" -ForegroundColor Gray
Write-Host "   $demosPath" -ForegroundColor White
