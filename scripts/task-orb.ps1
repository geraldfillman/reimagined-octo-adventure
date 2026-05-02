#Requires -Version 5.1
# task-orb.ps1 -- Windows Task Scheduler wrapper
# Runs daily at 09:35 AM ET (Mon-Fri) via Task Scheduler
# Reads today's rel-vol screen, refreshes entropy, then writes the ORB+Entropy trade sheet.

Set-Location $PSScriptRoot
$ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
Write-Host "[$ts] ORB Entropy Trade Sheet starting..."

# --- Step 1: resolve symbol list from latest FMP_RelVol_Screen ---------------
$marketDir  = Join-Path $PSScriptRoot '..\05_Data_Pulls\Market'
$screenFile = Get-ChildItem $marketDir -Filter '*FMP_RelVol_Screen*.md' -ErrorAction SilentlyContinue |
              Sort-Object Name -Descending |
              Select-Object -First 1

if (-not $screenFile) {
    Write-Host "[$ts] ERROR: No FMP_RelVol_Screen file found in $marketDir -- did the 9:00 AM task run?"
    exit 1
}

Write-Host "[$ts] Screen file: $($screenFile.Name)"

# Extract [[TICKER]] wiki-links from table rows (skip header/separator lines)
$symbols = (Get-Content $screenFile.FullName) |
           Where-Object { $_ -match '^\|' -and $_ -notmatch '^\|[\s\-|]+\|$' } |
           Select-Object -Skip 1 |
           ForEach-Object {
               if ($_ -match '\[\[(\w+)\]\]') { $Matches[1] }
           } |
           Where-Object { $_ }

if ($symbols.Count -eq 0) {
    Write-Host "[$ts] ERROR: Could not parse any symbols from $($screenFile.Name)"
    exit 1
}

$symbolList = $symbols -join ','
Write-Host "[$ts] Symbols ($($symbols.Count)): $symbolList"

# --- Step 2: refresh entropy for today's candidates -------------------------
Write-Host "[$ts] Running entropy-monitor..."
node run.mjs entropy-monitor --symbols $symbolList
if ($LASTEXITCODE -ne 0) {
    Write-Host "[$ts] WARNING: entropy-monitor exited with code $LASTEXITCODE -- continuing to ORB screen"
}

# --- Step 3: build ORB + Entropy trade sheet ---------------------------------
Write-Host "[$ts] Running orb-entropy..."
node run.mjs pull orb-entropy
if ($LASTEXITCODE -ne 0) {
    Write-Host "[$ts] ERROR: orb-entropy exited with code $LASTEXITCODE"
    exit $LASTEXITCODE
}

$ts2 = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
Write-Host "[$ts2] Done."
