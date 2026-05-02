#Requires -Version 5.1
<#
Runs the GDELT news monitor every 15 minutes by default.

Usage:
  powershell scripts\gdelt-news-loop.ps1
  powershell scripts\gdelt-news-loop.ps1 -Once
  powershell scripts\gdelt-news-loop.ps1 -Topics "markets,macro,defense" -IntervalMinutes 15
  powershell scripts\gdelt-news-loop.ps1 -DryRun -Once
#>

param(
  [int]$IntervalMinutes = 15,
  [int]$Limit = 75,
  [string]$Timespan = "15min",
  [string]$Topics = "",
  [switch]$Once,
  [switch]$DryRun
)

$ErrorActionPreference = "Continue"
$scriptsDir = $PSScriptRoot
$vaultRoot = Split-Path $scriptsDir -Parent
$logDir = Join-Path $vaultRoot "logs"
$logFile = Join-Path $logDir "gdelt-news-loop.log"

if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir | Out-Null
}

function Write-LoopLog {
  param([string]$Message)
  $line = "[{0}] {1}" -f (Get-Date).ToString("yyyy-MM-dd HH:mm:ss"), $Message
  Add-Content -Path $logFile -Value $line
  Write-Host $line
}

function Invoke-GdeltPull {
  $args = @("run.mjs", "pull", "gdelt", "--timespan", $Timespan, "--limit", [string]$Limit)
  if ($Topics.Trim().Length -gt 0) {
    $args += @("--topics", $Topics)
  } else {
    $args += "--all"
  }
  if ($DryRun) {
    $args += "--dry-run"
  }

  Write-LoopLog ("Starting: node " + ($args -join " "))
  Push-Location $scriptsDir
  try {
    $output = & node @args 2>&1
    foreach ($item in $output) {
      Write-LoopLog ([string]$item)
    }
    if ($LASTEXITCODE -ne 0) {
      Write-LoopLog "GDELT pull exited with code $LASTEXITCODE"
    } else {
      Write-LoopLog "GDELT pull completed"
    }
  } catch {
    Write-LoopLog ("GDELT pull failed: " + $_.Exception.Message)
  } finally {
    Pop-Location
  }
}

if ($IntervalMinutes -lt 15) {
  Write-LoopLog "IntervalMinutes below 15 is not supported by the GDELT DOC API timespan minimum; using 15."
  $IntervalMinutes = 15
}

$topicLabel = "all"
if ($Topics.Trim().Length -gt 0) {
  $topicLabel = $Topics
}
Write-LoopLog "GDELT news loop started. Interval=$IntervalMinutes minute(s), Timespan=$Timespan, Limit=$Limit, Topics=$topicLabel"

do {
  Invoke-GdeltPull
  if ($Once) { break }
  Write-LoopLog "Sleeping for $IntervalMinutes minute(s)"
  Start-Sleep -Seconds ($IntervalMinutes * 60)
} while ($true)

Write-LoopLog "GDELT news loop stopped"
