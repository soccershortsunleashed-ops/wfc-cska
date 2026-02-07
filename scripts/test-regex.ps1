# Test regex pattern on saved HTML

$html = Get-Content "standings-page.html" -Raw -Encoding UTF8

Write-Host "Testing regex patterns..." -ForegroundColor Cyan

# Test pattern 1: Simple row
$pattern1 = '<tr>\s*<td[^>]*>(\d+)</td>'
$matches1 = [regex]::Matches($html, $pattern1)
Write-Host "Pattern 1 (simple td): $($matches1.Count) matches" -ForegroundColor Yellow

# Test pattern 2: With team name
$pattern2 = '<td[^>]*>\s*(?:<img[^>]*/>)?\s*([А-Яа-яA-Za-z\s\-0-9]+)\s*</td>'
$matches2 = [regex]::Matches($html, $pattern2)
Write-Host "Pattern 2 (team names): $($matches2.Count) matches" -ForegroundColor Yellow
if ($matches2.Count -gt 0) {
    Write-Host "First 5 team names:" -ForegroundColor Gray
    for ($i = 0; $i -lt [Math]::Min(5, $matches2.Count); $i++) {
        Write-Host "  - $($matches2[$i].Groups[1].Value.Trim())" -ForegroundColor Gray
    }
}

# Test pattern 3: Full row
$pattern3 = '<tr>\s*<td[^>]*>(\d+)</td>\s*<td[^>]*>(?:<img[^>]*/>)?\s*([^<]+?)\s*</td>\s*<td>(\d+)</td>\s*<td>(\d+)</td>\s*<td>(\d+)</td>\s*<td>(\d+)</td>\s*<td>(\d+)</td>\s*<td>(\d+)</td>\s*<td>(\d+)</td>'
$matches3 = [regex]::Matches($html, $pattern3)
Write-Host "Pattern 3 (full row): $($matches3.Count) matches" -ForegroundColor Yellow

# Extract one sample row manually
$sampleRow = ($html -split '<tr>')[2]
Write-Host "`nSample row HTML:" -ForegroundColor Cyan
Write-Host $sampleRow.Substring(0, [Math]::Min(500, $sampleRow.Length)) -ForegroundColor Gray
