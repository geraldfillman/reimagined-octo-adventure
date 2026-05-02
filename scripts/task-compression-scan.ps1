#Requires -Version 5.1
# task-compression-scan.ps1 -- Windows Task Scheduler wrapper for nightly entropy compression scan.
# Runs after market close (4:30 PM ET Mon-Fri).
# Scans top 200 earnings-calendar names + all thesis watchlist symbols.
# Output: 05_Data_Pulls/Market/YYYY-MM-DD_Entropy_Compression_Scan.md

$scriptsDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptsDir

Write-Host ("[{0}] Starting Entropy Compression Scan..." -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))

& node run.mjs pull entropy-compression-scan

$exitCode = $LASTEXITCODE
Write-Host ("[{0}] Compression scan finished (exit {1})" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $exitCode)
exit $exitCode
