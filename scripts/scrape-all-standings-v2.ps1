# Script to scrape all standings tables from WFC CSKA official website
# Version 2: Improved parsing with better regex

$baseUrl = "https://wfccska.ru/matches/tables/"
$outputFile = "../seed/standings-real.json"

# Season IDs from the website
# Note: Official website uses single year format (2026, 2025, 2024, etc.)
$seasons = @(
    @{ id = "200088"; name = "2026" },
    @{ id = "196849"; name = "2025" },
    @{ id = "191750"; name = "2024" },
    @{ id = "184183"; name = "2023" },
    @{ id = "175801"; name = "2022" },
    @{ id = "170504"; name = "2021" },
    @{ id = "167900"; name = "2020" },
    @{ id = "170436"; name = "2019" },
    @{ id = "170437"; name = "2018" },
    @{ id = "170438"; name = "2017" },
    @{ id = "170439"; name = "2016" }
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
        
        # Remove extra whitespace and newlines for easier parsing
        $html = $html -replace '\s+', ' '
        
        # Parse table rows - simplified pattern without cyrillic in character class
        # Match: <tr> <td>position</td> <td>...teamName...</td> <td>played</td> ... <td>points</td> </tr>
        $rowPattern = '<tr>\s*<td[^>]*>(\d+)</td>\s*<td[^>]*>.*?>([^<]+)</td>\s*<td>(\d+)</td>\s*<td>(\d+)</td>\s*<td>(\d+)</td>\s*<td>(\d+)</td>\s*<td>(\d+)</td>\s*<td>(\d+)</td>\s*<td>(\d+)</td>'
        
        $matches = [regex]::Matches($html, $rowPattern)
        
        if ($matches.Count -eq 0) {
            Write-Host "  No data found for this season (might be empty)" -ForegroundColor Yellow
            continue
        }
        
        Write-Host "  Found $($matches.Count) teams" -ForegroundColor Gray
        
        $teams = @()
        foreach ($match in $matches) {
            $teamName = $match.Groups[2].Value.Trim()
            # Clean up team name
            $teamName = $teamName -replace '\s+', ' '
            
            $team = @{
                position = [int]$match.Groups[1].Value
                teamName = $teamName
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
# Save with UTF-8 encoding without BOM
[System.IO.File]::WriteAllText($outputFile, $jsonOutput, [System.Text.UTF8Encoding]::new($false))

Write-Host "Data saved to: $outputFile" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
foreach ($standing in $allStandings) {
    Write-Host "  $($standing.seasonName): $($standing.teams.Count) teams" -ForegroundColor Gray
}
