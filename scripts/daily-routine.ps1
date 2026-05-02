#Requires -Version 5.1
<#
.SYNOPSIS
  Daily data pull automation for the My_Data vault.

.DESCRIPTION
  Thin PowerShell wrapper around the canonical grouped routine command:
  node run.mjs routine daily. Use -IncludeWeekly to run the weekly cadence
  immediately after the daily cadence.

.PARAMETER DryRun
  Print the routine command list without running pullers.

.PARAMETER SkipSectorScan
  Skip the daily sector scan step.

.PARAMETER SkipAgentScan
  Skip agent-analyst thesis and strategy scans.

.PARAMETER IncludeWeekly
  Run the weekly cadence after the daily cadence.
#>
param(
  [switch]$DryRun,
  [switch]$SkipSectorScan,
  [switch]$SkipAgentScan,
  [switch]$IncludeWeekly
)

$ErrorActionPreference = 'Stop'
$scriptsDir = $PSScriptRoot

function Invoke-Routine {
  param([string]$Cadence)

  $args = @('run.mjs', 'routine', $Cadence)
  if ($DryRun) { $args += '--dry-run' }
  if ($SkipSectorScan) { $args += '--skip-sector-scan' }
  if ($SkipAgentScan) { $args += '--skip-agent-scan' }

  Write-Host ''
  Write-Host ("=== Routine: " + $Cadence + " ===") -ForegroundColor Cyan
  Write-Host ("node " + ($args -join ' ')) -ForegroundColor Gray
  & node @args

  if ($LASTEXITCODE -ne 0) {
    throw ("routine " + $Cadence + " failed with exit code " + $LASTEXITCODE)
  }
}

Set-Location $scriptsDir
Invoke-Routine 'daily'

if ($IncludeWeekly) {
  Invoke-Routine 'weekly'
}

Write-Host ''
Write-Host '[DONE] Routine wrapper completed.' -ForegroundColor Green
