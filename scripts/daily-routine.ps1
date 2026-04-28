#Requires -Version 5.1
<#
.SYNOPSIS
  Daily data pull automation for the My_Data vault.

.DESCRIPTION
  Runs daily pullers (macro, market, government, sector-scan, company-risk),
  then cleanup and validate. Weekly pullers (research, clinical, patent, news)
  run only when -IncludeWeekly is passed.

.PARAMETER DryRun
  Print phase headers and run status + validate only. Skip all API calls and cleanup.

.PARAMETER SkipSectorScan
  Skip the post-pull sector scan step.

.PARAMETER IncludeWeekly
  Include weekly-cadence pullers (clinical trials, USPTO, arXiv, PubMed, FDA, FEMA, USASpending, NewsAPI).

.EXAMPLE
  powershell scripts/daily-routine.ps1
  powershell scripts/daily-routine.ps1 -DryRun
  powershell scripts/daily-routine.ps1 -IncludeWeekly
  powershell scripts/daily-routine.ps1 -SkipSectorScan
#>
param(
  [switch]$DryRun,
  [switch]$SkipSectorScan,
  [switch]$IncludeWeekly
)

$ErrorActionPreference = 'Continue'
$scriptsDir  = $PSScriptRoot
$succeeded   = 0
$failed      = 0
$errors      = [System.Collections.Generic.List[string]]::new()

function Write-Phase {
  param([string]$Label)
  $ts = Get-Date -Format 'HH:mm:ss'
  Write-Host ''
  Write-Host (('[' + $ts + '] === ' + $Label + ' ===')) -ForegroundColor Cyan
}

function Invoke-Puller {
  param([string]$Command, [string]$Label)

  if ($DryRun) {
    Write-Host ('  [dry-run] would run: node run.mjs ' + $Command) -ForegroundColor DarkGray
    return
  }

  Write-Host ('  -> node run.mjs ' + $Command) -ForegroundColor Gray
  try {
    $output = & node run.mjs $Command.Split(' ') 2>&1
    if ($LASTEXITCODE -ne 0) {
      throw ('exit code ' + $LASTEXITCODE)
    }
    $script:succeeded++
  }
  catch {
    $msg = ('FAILED [' + $Label + ']: ' + $_)
    $script:errors.Add($msg)
    $script:failed++
    Write-Host ('  ' + $msg) -ForegroundColor Yellow
  }
}

# Pre-flight
Write-Phase 'Pre-flight'
Set-Location $scriptsDir

Write-Host '  -> node run.mjs status' -ForegroundColor Gray
$statusOut = & node run.mjs status 2>&1
Write-Host $statusOut

if ($LASTEXITCODE -ne 0 -and -not $DryRun) {
  Write-Host '[ABORT] API key check failed. Fix missing keys before running pulls.' -ForegroundColor Red
  exit 1
}

if ($DryRun) {
  Write-Host '  [dry-run mode] Pull, sector scan, and cleanup phases will be skipped.' -ForegroundColor DarkGray
}

# ═══════════════════════════════════════════════════════════════════════════════
# DAILY PULLERS — run every day
# ═══════════════════════════════════════════════════════════════════════════════

# Phase 1: Macro and Market (daily)
Write-Phase 'Macro and Market (daily)'
Invoke-Puller 'fred --group rates'       'FRED rates'
Invoke-Puller 'fred --group housing'     'FRED housing'
Invoke-Puller 'fred --group labor'       'FRED labor'
Invoke-Puller 'fmp --quote SPY'         'FMP SPY'
Invoke-Puller 'treasury --yields'        'Treasury yields'

# Phase 2: Government Core (daily)
Write-Phase 'Government Core (daily)'
Invoke-Puller 'sec --thesis'           'SEC 8-K thesis'

# Phase 3: FMP Thesis Watchlists (daily)
# Concurrency capped at 2 to stay within 750 calls/min FMP limit.
# The fetcher also applies a proactive token-bucket limiter (700 calls/min default).
# Override the rate with: $env:FMP_CALLS_PER_MINUTE = '600'
Write-Phase 'FMP Thesis Watchlists (daily)'
Invoke-Puller 'fmp --thesis-watchlists --concurrency 2 --fundamentals-concurrency 2'  'FMP thesis watchlists'

# Phase 4: Sector Scan (daily)
Write-Phase 'Sector Scan (daily)'
if ($SkipSectorScan) {
  Write-Host '  [skipped] sector-scan disabled for this run.' -ForegroundColor DarkGray
} elseif ($DryRun) {
  Write-Host '  [dry-run] would run: node run.mjs sector-scan' -ForegroundColor DarkGray
} else {
  Write-Host '  -> node run.mjs sector-scan' -ForegroundColor Gray
  & node run.mjs sector-scan 2>&1 | ForEach-Object { Write-Host $_ }
}

# Phase 5: Company Risk (daily)
Write-Phase 'Company Risk (daily)'
Invoke-Puller 'company-risk-scan --watchlist'  'Company risk watchlist'

# ═══════════════════════════════════════════════════════════════════════════════
# WEEKLY PULLERS — run only with -IncludeWeekly
# ═══════════════════════════════════════════════════════════════════════════════

if ($IncludeWeekly) {
  # Phase 6: Government Extended (weekly)
  Write-Phase 'Government Extended (weekly)'
  Invoke-Puller 'openfema --recent'      'OpenFEMA'
  Invoke-Puller 'usaspending --recent'   'USASpending'
  Invoke-Puller 'fda --recent-approvals' 'FDA approvals'

  # Phase 7: Clinical and Patent Intelligence (weekly)
  Write-Phase 'Clinical and Patent Intelligence (weekly)'
  Invoke-Puller 'clinicaltrials --oncology' 'ClinicalTrials oncology'
  Invoke-Puller 'clinicaltrials --amr'      'ClinicalTrials AMR'
  Invoke-Puller 'uspto --ptab'              'USPTO PTAB'

  # Phase 8: Research Sources (weekly)
  Write-Phase 'Research Sources (weekly)'
  Invoke-Puller 'arxiv --drones'        'arXiv drones'
  Invoke-Puller 'arxiv --amr'           'arXiv AMR'
  Invoke-Puller 'pubmed --amr'          'PubMed AMR'
  Invoke-Puller 'pubmed --psychedelics' 'PubMed psychedelics'

  # Phase 9: News (weekly)
  Write-Phase 'News (weekly)'
  Invoke-Puller 'newsapi --topic business' 'NewsAPI business'

  # Phase 10: FMP Watchlist Deep Scan (weekly)
  # Pulls insider trading, balance sheet, cash flow, analyst estimates,
  # short interest, analyst ratings, and company news for all watchlist symbols.
  # Concurrency capped at 2 to stay within FMP rate limits.
  Write-Phase 'FMP Watchlist Deep Scan (weekly)'
  Invoke-Puller 'pull fmp --watchlist-deep-scan --concurrency 2' 'FMP watchlist deep scan'

  # Phase 10b: Economic Calendar (weekly)
  Write-Phase 'FMP Economic Calendar (weekly)'
  Invoke-Puller 'pull fmp --macro-calendar' 'FMP macro calendar'

  # Phase 12: Company Risk Full Scan (weekly)
  Write-Phase 'Company Risk Full Scan (weekly)'
  Invoke-Puller 'company-risk-scan --watchlist --update-score'  'Company risk full scan'
} else {
  Write-Host ''
  Write-Host '  [info] Weekly pullers skipped. Run with -IncludeWeekly to include.' -ForegroundColor DarkGray
}

# ═══════════════════════════════════════════════════════════════════════════════
# POST-PULL — always run
# ═══════════════════════════════════════════════════════════════════════════════

# Phase 11: Cleanup
Write-Phase 'Cleanup'
if ($DryRun) {
  Write-Host '  [dry-run] would run: node run.mjs cleanup --market-history --signals' -ForegroundColor DarkGray
} else {
  Write-Host '  -> node run.mjs cleanup --market-history --signals' -ForegroundColor Gray
  & node run.mjs cleanup --market-history --signals 2>&1 | ForEach-Object { Write-Host $_ }
}

# Phase 12: Validate
Write-Phase 'Validate'
Write-Host '  -> node run.mjs system validate' -ForegroundColor Gray
$validateOut = & node run.mjs system validate 2>&1
Write-Host $validateOut

if ($LASTEXITCODE -ne 0) {
  Write-Host ''
  Write-Host '[ABORT] Vault validation failed. Fix schema errors before reviewing.' -ForegroundColor Red
  exit 1
}

# Summary
Write-Host ''
Write-Host '-----------------------------------------' -ForegroundColor DarkGray

if ($DryRun) {
  Write-Host '[DRY RUN COMPLETE] No API calls made. Validate passed.' -ForegroundColor Cyan
} else {
  $mode = if ($IncludeWeekly) { 'daily+weekly' } else { 'daily' }
  $color = if ($failed -eq 0) { 'Green' } else { 'Yellow' }
  Write-Host ('[DONE] ' + $mode + ' | ' + $succeeded + ' puller(s) succeeded, ' + $failed + ' failed. Cleanup applied. Validate passed.') -ForegroundColor $color

  if ($errors.Count -gt 0) {
    Write-Host ''
    Write-Host 'Failed pullers:' -ForegroundColor Yellow
    foreach ($e in $errors) {
      Write-Host ('  ' + $e) -ForegroundColor Yellow
    }
  }
}

Write-Host ''
Write-Host 'Next: open Signal Board in Obsidian and run Phase 2 review.' -ForegroundColor Cyan
