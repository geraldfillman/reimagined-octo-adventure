#Requires -Version 5.1
# task-orb-strategy.ps1 -- Windows Task Scheduler wrapper
# Runs daily at 09:40 AM ET (Mon-Fri) via Task Scheduler
#
# Reads today's ORB_Entropy_Screen note (written by task-orb.ps1 at 09:35),
# runs agent-analyst --score-and-alert for each ORB candidate, then appends
# a ranked Strategy Overlay table to the screen note with auction state,
# crowding score, and conflict flags.
#
# Schedule: ~09:40 AM ET -- after task-orb.ps1 completes at 09:35

Set-Location $PSScriptRoot
$ts    = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$today = Get-Date -Format 'yyyy-MM-dd'
Write-Host "[$ts] ORB Strategy Overlay starting..."

# -- Step 1: find today's ORB_Entropy_Screen note --------------------------------
$marketDir  = Join-Path $PSScriptRoot '..\05_Data_Pulls\Market'
$screenFile = Get-ChildItem $marketDir -Filter "${today}_ORB_Entropy_Screen*.md" `
              -ErrorAction SilentlyContinue |
              Sort-Object Name -Descending |
              Select-Object -First 1

if (-not $screenFile) {
    Write-Host "[$ts] ERROR: No ORB_Entropy_Screen file found for $today -- did the 09:35 task run?"
    exit 1
}
Write-Host "[$ts] Screen file: $($screenFile.Name)"

# -- Step 2: extract [[SYMBOL]] + Direction pairs from Trade Sheet section -------
# Only the "## Trade Sheet" block is parsed to avoid double-counting symbols
# that also appear in the Prime Setups and Entropy-Confirmed sub-tables.
$noteContent = Get-Content $screenFile.FullName -Raw

$tradeSheetSection = ''
if ($noteContent -match '(?s)## Trade Sheet\r?\n(.*?)(?:\r?\n## |\z)') {
    $tradeSheetSection = $Matches[1]
} else {
    Write-Host "[$ts] ERROR: Could not locate '## Trade Sheet' section in $($screenFile.Name)"
    exit 1
}

# ordered hashtable: symbol -> direction (first occurrence wins for dedup)
$symbolDirMap = [ordered]@{}
($tradeSheetSection -split '\r?\n') |
    Where-Object { $_ -match '^\|' -and $_ -notmatch '^\|[\s\-|]+\|$' } |
    Select-Object -Skip 1 |
    ForEach-Object {
        # Split on | and trim; cols: [empty] # Ticker Direction ...
        $cols = ($_ -split '\|') | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
        # cols[0]=# cols[1]=Ticker cols[2]=Direction
        if ($cols.Count -ge 3 -and $cols[1] -match '\[\[(\w+)\]\]') {
            $sym = $Matches[1]
            $dir = $cols[2].ToUpper()
            if (-not $symbolDirMap.Contains($sym)) {
                $symbolDirMap[$sym] = $dir
            }
        }
    }

if ($symbolDirMap.Count -eq 0) {
    Write-Host "[$ts] ERROR: Could not parse any symbols from Trade Sheet"
    exit 1
}

Write-Host "[$ts] Symbols ($($symbolDirMap.Count)): $($symbolDirMap.Keys -join ', ')"

# -- Step 3: run agent-analyst --score-and-alert for each symbol -----------------
# Sequential to stay within FMP rate limits.
$succeeded = 0
$failed    = 0

foreach ($sym in $symbolDirMap.Keys) {
    $ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    Write-Host "[$ts]   Scoring $sym ..."
    & node run.mjs agent-analyst --symbol $sym --score-and-alert 2>&1 |
        ForEach-Object { Write-Host "      $_" }
    if ($LASTEXITCODE -eq 0) {
        $succeeded++
    } else {
        Write-Host "[$ts]   WARNING: agent-analyst exited $LASTEXITCODE for $sym -- no alert note written"
        $failed++
    }
}

$ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
Write-Host "[$ts] Scoring complete: $succeeded ok, $failed failed."
Write-Host ""

# -- Step 4: read alert notes, extract key fields, build result rows -------------
$alertsDir = Join-Path $PSScriptRoot '..\05_Data_Pulls\Alerts'

function Get-FrontmatterField ([string]$text, [string]$field) {
    if ($text -match "(?m)^${field}:\s*[`"']?([^`"'\r\n]+)[`"']?") {
        return $Matches[1].Trim()
    }
    return ''
}

# Auction states that conflict with a given ORB direction
$bearishAuction = @('bearish_acceptance', 'failed_upside',  'value_migration_lower')
$bullishAuction = @('bullish_acceptance', 'failed_downside', 'value_migration_higher')

$rows = @()
foreach ($sym in $symbolDirMap.Keys) {
    $dir       = $symbolDirMap[$sym]
    $alertFile = Get-ChildItem $alertsDir -Filter "${today}_${sym}_strategy_alert.md" `
                 -ErrorAction SilentlyContinue |
                 Select-Object -First 1

    if (-not $alertFile) {
        # Score below review_min (55) or agent failed -- record without detail
        $rows += [PSCustomObject]@{
            Symbol        = $sym
            Direction     = $dir
            Score         = -1
            SignalStatus  = 'below-threshold'
            AuctionState  = '-'
            CrowdingScore = -1.0
            CrowdingLabel = '-'
            EdgeTypes     = '-'
            Flags         = @()
        }
        continue
    }

    $alertText     = Get-Content $alertFile.FullName -Raw
    $score         = Get-FrontmatterField $alertText 'strategy_score'
    $signalStatus  = Get-FrontmatterField $alertText 'signal_status'
    $auctionState  = Get-FrontmatterField $alertText 'auction_state'
    $crowdingScore = Get-FrontmatterField $alertText 'crowding_score'
    $crowdingLabel = Get-FrontmatterField $alertText 'crowding_label'
    $edgeTypes     = Get-FrontmatterField $alertText 'edge_types'

    $scoreNum    = if ($score         -match '^\d') { [int][double]$score }         else { -1 }
    $crowdingNum = if ($crowdingScore -match '^\d') { [double]$crowdingScore }       else { -1.0 }

    $flags = @()
    if ($crowdingNum -ge 4.0) { $flags += 'HIGH_CROWD' }
    if ($dir -eq 'LONG'  -and $auctionState -in $bearishAuction) { $flags += 'AUCTION_CONFLICT' }
    if ($dir -eq 'SHORT' -and $auctionState -in $bullishAuction) { $flags += 'AUCTION_CONFLICT' }

    $rows += [PSCustomObject]@{
        Symbol        = $sym
        Direction     = $dir
        Score         = $scoreNum
        SignalStatus  = if ($signalStatus)  { $signalStatus }  else { '-' }
        AuctionState  = if ($auctionState)  { $auctionState }  else { '-' }
        CrowdingScore = $crowdingNum
        CrowdingLabel = if ($crowdingLabel) { $crowdingLabel } else { '-' }
        EdgeTypes     = if ($edgeTypes)     { $edgeTypes }     else { '-' }
        Flags         = $flags
    }
}

# Sort: clean rows first (no flags) by score descending, flagged rows after
$rows = $rows | Sort-Object `
    @{ Expression = { if ($_.Flags.Count -gt 0) { 1 } else { 0 } }; Ascending = $true  },
    @{ Expression = { $_.Score };                                     Ascending = $false }

# -- Step 5: build markdown overlay section --------------------------------------
$runTime      = Get-Date -Format 'HH:mm'
$overlayLines = [System.Collections.Generic.List[string]]::new()

$overlayLines.Add('')
$overlayLines.Add('## Strategy Overlay')
$overlayLines.Add('')
$overlayLines.Add("_Agent scoring run $runTime ET - alert notes in [[05_Data_Pulls/Alerts/]]_")
$overlayLines.Add('')
$overlayLines.Add('| # | Ticker | Dir | Score | Signal | Auction State | Crowding | Edge Types | Flags |')
$overlayLines.Add('| --- | --- | --- | --- | --- | --- | --- | --- | --- |')

$rank = 1
foreach ($row in $rows) {
    $scoreCell   = if ($row.Score -ge 0)          { "$($row.Score)" }                                  else { '-' }
    $crowdCell   = if ($row.CrowdingScore -ge 0)   { "$($row.CrowdingScore) ($($row.CrowdingLabel))" } else { '-' }
    $flagCell    = if ($row.Flags.Count -gt 0)     { '!! ' + ($row.Flags -join ' ') }                  else { '' }
    $auctionCell = $row.AuctionState -replace '_', ' '
    $overlayLines.Add("| $rank | [[$($row.Symbol)]] | $($row.Direction) | $scoreCell | $($row.SignalStatus) | $auctionCell | $crowdCell | $($row.EdgeTypes) | $flagCell |")
    $rank++
}

$overlayLines.Add('')
$overlayLines.Add('> **Flag key** - HIGH_CROWD: crowding score >= 4.0 (high/exit-door-risk, reduce or skip). AUCTION_CONFLICT: auction state contradicts ORB direction. Review flagged rows before sizing.')
$overlayLines.Add('')

# -- Step 6: append overlay to screen note (idempotent - removes prior run first)
$noteContent = Get-Content $screenFile.FullName -Raw
$noteContent = $noteContent -replace '(?s)\r?\n## Strategy Overlay.*', ''
$noteContent = $noteContent.TrimEnd()

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText(
    $screenFile.FullName,
    ($noteContent + "`n" + ($overlayLines -join "`n") + "`n"),
    $utf8NoBom
)

$ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
Write-Host "[$ts] Strategy overlay appended to $($screenFile.Name)"

$flaggedCount = ($rows | Where-Object { $_.Flags.Count -gt 0 }).Count
if ($flaggedCount -gt 0) {
    Write-Host "[$ts] $flaggedCount flagged setup(s) - review before sizing."
}

Write-Host "[$ts] Done. Open $($screenFile.Name) and scroll to ## Strategy Overlay."
exit 0
