# Script to scrape all standings tables from WFC CSKA official website
# Parses data for all seasons from 2016 to 2026

$baseUrl = "https://wfccska.ru/matches/tables/"
$outputFile = "../seed/standings-real.json"

# Season IDs from the website
$seasons = @(
    @{ id = "200088"; year = "2026"; name = "2025/2026" },
    @{ id = "196849"; year = "2025"; name = "2024/2025" },
    @{ id = "191750"; year = "2024"; name = "2023/2024" },
    @{ id = "184183"; year = "2023"; name = "2022/2023" },
    @{ id = "175801"; year = "2022"; name = "2021/2022" },
    @{ id = "170504"; year = "2021"; name = "2020/2021" },
    @{ id = "167900"; year = "2020"; name = "2019/2020" },
    @{ id = "170436"; year = "2019"; name = "2018/2019" },
    @{ id = "170437"; year = "2018"; name = "2017/2018" },
    @{ id = "170438"; year = "2017"; name = "2016/2017" },
    @{ id = "170439"; year = "2016"; name = "2015/2016" }
)

$allStandings = @()

Write-Host "Starting to scrape standings for all seasons..." -ForegroundColor Cyan
Write-Host "Total seasons to process: $($seasons.Count)" -ForegroundColor Yellow
Write-Host ""

foreach ($season in $seasons) {
    Write-Host "Processing season $($season.name) (ID: $($season.id))..." -ForegroundColor Green
    
    try {
        # Build URL with season parameter
        $url = "${baseUrl}?season=$($season.id)&tournament=191751"
        
        # Fetch page
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing
        $html = $response.Content
        
        # Parse table data using regex
        # Looking for table rows with team data
        # Pattern: <tr><td>position</td><td><img/>teamName</td><td>played</td>...<td>points</td></tr>
        $rowPattern = '<tr>\s*<td[^>]*>(\d+)</td>\s*<td[^>]*>(?:<img[^>]*/>)?\s*([^<]+?)\s*</td>\s*<td>(\d+)</td>\s*<td>(\d+)</td>\s*<td>(\d+)</td>\s*<td>(\d+)</td>\s*<td>(\d+)</td>\s*<td>(\d+)</td>\s*<td>(\d+)</td>'
        
        $matches = [regex]::Matches($html, $rowPattern)
        
        if ($matches.Count -eq 0) {
            Write-Host "  No data found for this season (might be empty)" -ForegroundColor Yellow
            continue
        }
        
        Write-Host "  Found $($matches.Count) teams" -ForegroundColor Gray
        
        $teams = @()
        foreach ($match in $matches) {
            $team = @{
                position = [int]$match.Groups[1].Value
                teamName = $match.Groups[2].Value.Trim()
                played = [int]$match.Groups[3].Value
                won = [int]$match.Groups[4].Value
                drawn = [int]$match.Groups[5].Value
                lost = [int]$match.Groups[6].Value
                goalsFor = [int]$match.Groups[7].Value
                goalsAgainst = [int]$match.Groups[8].Value
                points = [int]$match.Groups[9].Value
            }
            $teams += $team
        }
        
        $standingsData = @{
            seasonId = $season.id
            seasonName = $season.name
            year = $season.year
            tournament = "Суперлига"
            tournamentId = "191751"
            teams = $teams
        }
        
        $allStandings += $standingsData
        
        Write-Host "  Successfully parsed $($teams.Count) teams" -ForegroundColor Green
        
        # Small delay to avoid overwhelming the server
        Start-Sleep -Milliseconds 500
        
    } catch {
        Write-Host "  Error processing season $($season.name): $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Scraping complete!" -ForegroundColor Cyan
Write-Host "Total seasons processed: $($allStandings.Count)" -ForegroundColor Yellow

# Save to JSON
$jsonOutput = $allStandings | ConvertTo-Json -Depth 10
$jsonOutput | Out-File $outputFile -Encoding UTF8

Write-Host "Data saved to: $outputFile" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
foreach ($standing in $allStandings) {
    Write-Host "  $($standing.seasonName): $($standing.teams.Count) teams" -ForegroundColor Gray
}
