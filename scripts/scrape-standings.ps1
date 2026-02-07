# Script for scraping standings tables from WFC CSKA official website
# Usage: .\scrape-standings.ps1

$baseUrl = "https://wfccska.ru/matches/tables/"
$outputFile = "standings-scraped.json"

Write-Host "Loading standings page..." -ForegroundColor Cyan

try {
    # Load main standings page
    $response = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing
    $html = $response.Content
    
    Write-Host "Page loaded successfully" -ForegroundColor Green
    Write-Host "Size: $($html.Length) bytes" -ForegroundColor Gray
    
    # Save HTML for analysis
    $html | Out-File "standings-page.html" -Encoding UTF8
    Write-Host "HTML saved to standings-page.html" -ForegroundColor Green
    
    # Look for season/tournament selectors
    if ($html -match '<select[^>]*season[^>]*>') {
        Write-Host "Found season selector" -ForegroundColor Yellow
    }
    
    # Find tables
    $tableMatches = [regex]::Matches($html, '<table[^>]*>(.*?)</table>')
    Write-Host "Tables found: $($tableMatches.Count)" -ForegroundColor Yellow
    
    # Find year mentions
    $yearMatches = [regex]::Matches($html, '20\d{2}')
    $uniqueYears = $yearMatches.Value | Select-Object -Unique | Sort-Object -Descending
    Write-Host "Years found: $($uniqueYears -join ', ')" -ForegroundColor Yellow
    
} catch {
    Write-Host "Error loading page: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`nAnalysis complete. Check standings-page.html for structure details." -ForegroundColor Cyan
