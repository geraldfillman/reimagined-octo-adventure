#Requires -Version 5.1
<#
.SYNOPSIS
  Scheduled-task wrapper for My_Data cadence and maintenance commands.

.DESCRIPTION
  Runs from the My_Data scripts directory, writes a timestamped transcript under
  logs/scheduled-cadences, and exits nonzero when the underlying node command
  fails. Intended to be called by Windows Task Scheduler.
#>
param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('cadence', 'routine', 'system')]
  [string]$CommandType,

  [Parameter(Mandatory = $true)]
  [string]$Name,

  [string]$TaskLabel = '',

  [string]$NodePath = 'node',

  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

if ($CommandType -eq 'routine') {
  Write-Host '[retired] Scheduled routine commands are retired after harness scheduler cutover.'
  Write-Host '[retired] Broad routine refreshes are manual-only and will not run from this legacy scheduled wrapper.'
  exit 0
}

$scriptsDir = $PSScriptRoot
$vaultRoot = Split-Path -Parent $scriptsDir
$logDir = Join-Path $vaultRoot 'logs\scheduled-cadences'

if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir | Out-Null
}

function Get-SafeName {
  param([string]$Value)

  $safe = ($Value -replace '[^A-Za-z0-9_.-]+', '-').Trim('-')
  if ([string]::IsNullOrWhiteSpace($safe)) {
    return 'scheduled-cadence'
  }
  return $safe
}

function Get-NodeArgs {
  param(
    [string]$Type,
    [string]$CommandName
  )

  switch ($Type) {
    'cadence' { return @('run.mjs', 'cadence', 'run', $CommandName) }
    'routine' { throw 'Scheduled routine commands are manual-only because they run broad raw source pulls. Use cadence review/analysis tasks for scheduled My_Data report output.' }
    'system' { return @('run.mjs', 'system', $CommandName) }
    default { throw "Unsupported scheduled command type: $Type" }
  }
}

$label = if ([string]::IsNullOrWhiteSpace($TaskLabel)) { "$CommandType-$Name" } else { $TaskLabel }
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$logPath = Join-Path $logDir ("{0}-{1}.log" -f $stamp, (Get-SafeName $label))
$nodeArgs = Get-NodeArgs -Type $CommandType -CommandName $Name
$commandLine = ('"{0}" {1}' -f $NodePath, ($nodeArgs -join ' '))

if ($DryRun) {
  Write-Host '[dry-run] Scheduled cadence wrapper'
  Write-Host ("  Working directory: {0}" -f $scriptsDir)
  Write-Host ("  Log path: {0}" -f $logPath)
  Write-Host ("  Command: node {0}" -f ($nodeArgs -join ' '))
  Write-Host ("  Node path: {0}" -f $NodePath)
  exit 0
}

$transcriptStarted = $false

try {
  Set-Location $scriptsDir
  Start-Transcript -Path $logPath -Append | Out-Null
  $transcriptStarted = $true

  Write-Host ("[scheduled] {0}" -f $label)
  Write-Host ("[started] {0}" -f (Get-Date -Format o))
  Write-Host ("[cwd] {0}" -f $scriptsDir)
  Write-Host ("[command] {0}" -f $commandLine)
  Write-Host ''

  & $NodePath @nodeArgs
  $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }

  Write-Host ''
  Write-Host ("[finished] {0}" -f (Get-Date -Format o))
  Write-Host ("[exit-code] {0}" -f $exitCode)

  if ($exitCode -ne 0) {
    throw "Scheduled command failed with exit code $exitCode"
  }
} catch {
  Write-Error $_
  exit 1
} finally {
  if ($transcriptStarted) {
    try {
      Stop-Transcript | Out-Null
    } catch {
      Write-Warning ("Could not stop transcript cleanly: {0}" -f $_.Exception.Message)
    }
  }
}
