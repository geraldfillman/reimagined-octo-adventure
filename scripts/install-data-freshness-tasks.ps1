#Requires -Version 5.1
<#
.SYNOPSIS
  Register Windows Task Scheduler jobs for My_Data report/review cadences.

.DESCRIPTION
  Idempotently replaces the My_Data scheduled tasks that generate
  My_Data report output from existing local evidence.
  Raw source pullers stay manual.

.EXAMPLE
  .\install-data-freshness-tasks.ps1 -DryRun

.EXAMPLE
  .\install-data-freshness-tasks.ps1
#>
param(
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$scriptsDir = $PSScriptRoot
$wrapperPath = Join-Path $scriptsDir 'invoke-scheduled-cadence.ps1'
$powershell = 'powershell.exe'
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name

if (-not (Test-Path $wrapperPath)) {
  throw "Missing scheduled cadence wrapper: $wrapperPath"
}

try {
  $nodePath = (Get-Command node.exe -ErrorAction Stop).Source
} catch {
  throw 'node.exe was not found on PATH. Install Node.js or add it to PATH before registering scheduled tasks.'
}

$marketDays = @('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')

$taskDefinitions = @(
  [pscustomobject]@{
    TaskName = 'My_Data - Premarket Cadence'
    CommandType = 'cadence'
    Name = 'premarket'
    At = '07:00'
    Days = $marketDays
    ExecutionMinutes = 60
    Description = 'Run review/analysis-only premarket My_Data monitoring from existing evidence.'
  },
  [pscustomobject]@{
    TaskName = 'My_Data - Daily Cadence'
    CommandType = 'cadence'
    Name = 'daily'
    At = '09:45'
    Days = $marketDays
    ExecutionMinutes = 120
    Description = 'Run review/analysis-only daily My_Data briefings, monitoring, and queues from existing evidence.'
  },
  [pscustomobject]@{
    TaskName = 'My_Data - Midday Cadence'
    CommandType = 'cadence'
    Name = 'midday'
    At = '12:30'
    Days = $marketDays
    ExecutionMinutes = 60
    Description = 'Run review/analysis-only midday My_Data monitoring from existing evidence.'
  },
  [pscustomobject]@{
    TaskName = 'My_Data - Preclose Cadence'
    CommandType = 'cadence'
    Name = 'preclose'
    At = '15:30'
    Days = $marketDays
    ExecutionMinutes = 60
    Description = 'Run review/analysis-only preclose My_Data monitoring from existing evidence.'
  },
  [pscustomobject]@{
    TaskName = 'My_Data - EOD Cadence'
    CommandType = 'cadence'
    Name = 'eod'
    At = '16:30'
    Days = $marketDays
    ExecutionMinutes = 120
    Description = 'Run review/analysis-only EOD My_Data monitoring and briefing output from existing evidence.'
  },
  [pscustomobject]@{
    TaskName = 'My_Data - Post-Close Validate'
    CommandType = 'system'
    Name = 'validate'
    At = '16:55'
    Days = $marketDays
    ExecutionMinutes = 45
    Description = 'Run schema validation after the close-side review/analysis pass.'
  }
)

$retiredTaskNames = @(
  'My_Data - Weekly Deep Refresh'
)

function Get-TriggerAt {
  param([string]$TimeText)

  $parts = $TimeText.Split(':')
  if ($parts.Count -ne 2) {
    throw "Invalid task time: $TimeText"
  }

  return (Get-Date).Date.AddHours([int]$parts[0]).AddMinutes([int]$parts[1])
}

function Get-ActionArgument {
  param($Definition)

  return @(
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy', 'Bypass',
    '-File', ('"{0}"' -f $wrapperPath),
    '-CommandType', $Definition.CommandType,
    '-Name', $Definition.Name,
    '-TaskLabel', ('"{0}"' -f $Definition.TaskName),
    '-NodePath', ('"{0}"' -f $nodePath)
  ) -join ' '
}

function Register-DataFreshnessTask {
  param($Definition)

  $actionArg = Get-ActionArgument -Definition $Definition
  $days = @($Definition.Days | ForEach-Object { [System.DayOfWeek]$_ })
  $triggerAt = Get-TriggerAt -TimeText $Definition.At

  if ($DryRun) {
    [pscustomobject]@{
      TaskName = $Definition.TaskName
      At = $Definition.At
      Days = ($Definition.Days -join ',')
      Command = ('{0} {1}' -f $powershell, $actionArg)
    }
    return
  }

  $action = New-ScheduledTaskAction `
    -Execute $powershell `
    -Argument $actionArg `
    -WorkingDirectory $scriptsDir

  $trigger = New-ScheduledTaskTrigger `
    -Weekly `
    -DaysOfWeek $days `
    -At $triggerAt

  $settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Minutes $Definition.ExecutionMinutes) `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -MultipleInstances IgnoreNew

  $principal = New-ScheduledTaskPrincipal `
    -UserId $currentUser `
    -LogonType Interactive `
    -RunLevel Limited

  $existing = Get-ScheduledTask -TaskName $Definition.TaskName -ErrorAction SilentlyContinue

  try {
    Register-ScheduledTask `
      -TaskName $Definition.TaskName `
      -Action $action `
      -Trigger $trigger `
      -Settings $settings `
      -Principal $principal `
      -Description $Definition.Description `
      -Force `
      -ErrorAction Stop | Out-Null
  } catch {
    if ($existing -and $_.Exception.Message -match 'Access is denied') {
      Write-Warning ("Could not replace protected existing task: {0}. Leaving current definition in place." -f $Definition.TaskName)
      return
    }
    throw
  }

  $verb = if ($existing) { 'Registered/replaced' } else { 'Registered' }
  Write-Host ("{0}: {1} at {2} ({3})" -f $verb, $Definition.TaskName, $Definition.At, ($Definition.Days -join ', '))
}

function Unregister-RetiredTask {
  param([string]$TaskName)

  if ($DryRun) {
    return
  }

  $existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
  if ($existing) {
    try {
      Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction Stop
      Write-Host 'Removed retired source-refresh task.'
    } catch {
      if ($_.Exception.Message -match 'Access is denied') {
        Write-Warning ("Could not remove protected retired task: {0}. Remove it from an elevated/admin shell." -f $TaskName)
        return
      }
      throw
    }
  }
}

Write-Host ''
Write-Host 'My_Data report/review Task Scheduler installer'
Write-Host ("Scripts directory: {0}" -f $scriptsDir)
Write-Host ("Node path: {0}" -f $nodePath)
Write-Host ("Windows user: {0}" -f $currentUser)
Write-Host ''

if ($DryRun) {
  Write-Host '[dry-run] Would register or replace these tasks:'
  $taskDefinitions | ForEach-Object { Register-DataFreshnessTask -Definition $_ } | Format-Table -AutoSize -Wrap
  exit 0
}

foreach ($definition in $taskDefinitions) {
  Register-DataFreshnessTask -Definition $definition
}

foreach ($taskName in $retiredTaskNames) {
  Unregister-RetiredTask -TaskName $taskName
}

Write-Host ''
Write-Host 'Verification:'
$verification = foreach ($definition in $taskDefinitions) {
  $task = Get-ScheduledTask -TaskName $definition.TaskName -ErrorAction Stop
  $info = Get-ScheduledTaskInfo -TaskName $definition.TaskName -ErrorAction Stop
  [pscustomobject]@{
    TaskName = $task.TaskName
    State = $task.State
    NextRunTime = $info.NextRunTime
    LastTaskResult = $info.LastTaskResult
  }
}

$verification | Format-Table -AutoSize

Write-Host ''
Write-Host 'Logs will be written under:'
Write-Host ("  {0}" -f (Join-Path (Split-Path -Parent $scriptsDir) 'logs\scheduled-cadences'))
Write-Host ''
Write-Host 'Manual smoke test command:'
Write-Host "  .\invoke-scheduled-cadence.ps1 -CommandType cadence -Name eod -DryRun"
