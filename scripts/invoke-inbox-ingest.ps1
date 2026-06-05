#Requires -Version 5.1
<#
.SYNOPSIS
  Wrapper script executed by Windows Task Scheduler for the World_Machine approved packet writer.

.DESCRIPTION
  Runs "node run.mjs pull world-machine-flow --approved-only" and writes a timestamped
  log to logs\world-packet-writer\. This is the World_Machine approved packet writer,
  not the manual archive-style inbox processing command.

.PARAMETER DryRun
  Pass --dry-run to the underlying node command. The wrapper still writes its scheduler log.

.PARAMETER NodePath
  Full path to node.exe. Inferred from PATH if omitted.
#>
param(
  [switch]$DryRun,
  [string]$NodePath = ''
)

$ErrorActionPreference = 'Stop'

$retiredHarnessWrapper = 'C:\Users\CaveUser\harness\run-world-packet.ps1'
if (Test-Path $retiredHarnessWrapper) {
  Write-Host '[retired] My_Data\scripts\invoke-inbox-ingest.ps1 is retired after harness cutover.'
  Write-Host ("[retired] Scheduled World Packet Writer tasks now use: {0}" -f $retiredHarnessWrapper)
  Write-Host '[retired] Exiting without writing packets to avoid duplicate scheduled runs.'
  exit 0
}

$scriptsDir  = $PSScriptRoot
$vaultRoot   = Split-Path -Parent $scriptsDir
$logDir      = Join-Path $vaultRoot 'logs\world-packet-writer'
$timestamp   = (Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')
$logFile     = Join-Path $logDir "$timestamp.log"

if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

if (-not $NodePath -or -not (Test-Path $NodePath)) {
  try {
    $NodePath = (Get-Command node.exe -ErrorAction Stop).Source
  } catch {
    throw 'node.exe not found on PATH. Install Node.js or pass -NodePath.'
  }
}

$runMjs  = Join-Path $scriptsDir 'run.mjs'
$cmdArgs = @('run.mjs', 'pull', 'world-machine-flow', '--approved-only')
if ($DryRun) { $cmdArgs += '--dry-run' }

$startMsg = "[world-packet-writer] Starting at $timestamp"
Write-Host $startMsg
Add-Content -Path $logFile -Value $startMsg

try {
  Push-Location $scriptsDir
  try {
    $output = & $NodePath @cmdArgs 2>&1 | Out-String
    $exitCode = $LASTEXITCODE
  } finally {
    Pop-Location
  }

  if ($output) { Add-Content -Path $logFile -Value $output.TrimEnd() }
  if ($null -eq $exitCode) { $exitCode = 0 }

  $doneMsg  = "[world-packet-writer] Finished with exit code $exitCode at $(Get-Date -Format 'HH:mm:ss')"
  Write-Host $doneMsg
  Add-Content -Path $logFile -Value $doneMsg

  exit $exitCode
} catch {
  $errMsg = "[world-packet-writer] ERROR: $($_.Exception.Message)"
  Write-Error $errMsg
  Add-Content -Path $logFile -Value $errMsg
  exit 1
}
