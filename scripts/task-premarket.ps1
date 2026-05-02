#Requires -Version 5.1
# task-premarket.ps1 -- Windows Task Scheduler wrapper
# Runs daily at 09:00 AM ET (Mon-Fri) via Task Scheduler
#
# Schedule:
#   ~08:45 AM  Macro event flag check (CPI, FOMC, jobs, GDP, oil)
#   ~09:00 AM  Relative volume screen (ORB candidates)
#   ~09:05 AM  Batch quotes for ETF/index watchlist (premarket AVWAP context)

Set-Location $PSScriptRoot
$ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
Write-Host "[$ts] Pre-Market sequence starting..."

# Step 1: Macro event calendar check — flag if major release is scheduled today
Write-Host "[$ts] Step 1: Macro event calendar check"
node run.mjs pull fmp --macro-calendar
# Non-fatal: continue even if this fails

# Step 2: Relative volume screen (existing ORB candidates)
Write-Host "[$ts] Step 2: ORB relative-volume screen"
node run.mjs pull fmp --rel-vol-screen

$exitCode = $LASTEXITCODE

# Step 3: Batch quotes for ETF/index watchlist (SPY, QQQ, IWM, TLT, HYG, GLD, USO)
# Gives premarket price context for anchored VWAP and auction state at open
Write-Host "[$ts] Step 3: ETF watchlist premarket quotes"
node run.mjs pull fmp --quote SPY,QQQ,IWM,TLT,HYG,GLD,USO
# Non-fatal: continue even if this fails

# Patch the three date-stamped file nodes in the strategy dashboard canvas
$today      = Get-Date -Format 'yyyy-MM-dd'
$canvasPath = Resolve-Path (Join-Path $PSScriptRoot '..\00_Dashboard\ORB + Entropy Strategy Dashboard.canvas')
$canvas     = [System.IO.File]::ReadAllText($canvasPath)
foreach ($stem in @('FMP_RelVol_Screen', 'ORB_Entropy_Screen', 'Entropy_Compression_Scan')) {
    $canvas = $canvas -replace "\d{4}-\d{2}-\d{2}_${stem}", "${today}_${stem}"
}
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($canvasPath, $canvas, $utf8NoBom)
Write-Host ("[$ts] Dashboard canvas file nodes updated to $today")

Write-Host ("[$ts] Pre-Market sequence complete (exit $exitCode).")
Write-Host ("[$ts] Next: check 00_Dashboard/Signal Board for auction context, then watch opening range 9:30-9:45.")
exit $exitCode
