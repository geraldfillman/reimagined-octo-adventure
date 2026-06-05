#Requires -Version 5.1
<#
.SYNOPSIS
  Register Windows Task Scheduler jobs that write approved World_Machine packets.

.DESCRIPTION
  Idempotently creates (or replaces) three daily scheduled tasks that call
  invoke-inbox-ingest.ps1 at 09:00, 12:00, and 17:00 every day of the week.

  The underlying command is:
    node run.mjs pull world-machine-flow --approved-only

.EXAMPLE
  .\install-inbox-ingest-tasks.ps1 -DryRun

.EXAMPLE
  .\install-inbox-ingest-tasks.ps1
#>
param(
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$scriptsDir  = $PSScriptRoot
$wrapperPath = Join-Path $scriptsDir 'invoke-inbox-ingest.ps1'
$powershell  = 'powershell.exe'
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name

if (-not (Test-Path $wrapperPath)) {
  throw "Missing World packet writer wrapper: $wrapperPath"
}

try {
  $nodePath = (Get-Command node.exe -ErrorAction Stop).Source
} catch {
  throw 'node.exe not found on PATH. Install Node.js or add it to PATH before registering scheduled tasks.'
}

$taskDefinitions = @(
  [pscustomobject]@{
    TaskName         = 'My_Data - World Packet Writer 0900'
    At               = '09:00'
    ExecutionMinutes = 20
    Description      = 'Write approved My_Data bridge packets into World_Machine/_Inbox (morning run).'
  },
  [pscustomobject]@{
    TaskName         = 'My_Data - World Packet Writer 1200'
    At               = '12:00'
    ExecutionMinutes = 20
    Description      = 'Write approved My_Data bridge packets into World_Machine/_Inbox (midday run).'
  },
  [pscustomobject]@{
    TaskName         = 'My_Data - World Packet Writer 1700'
    At               = '17:00'
    ExecutionMinutes = 20
    Description      = 'Write approved My_Data bridge packets into World_Machine/_Inbox (afternoon run).'
  }
)

$legacyTaskNames = @(
  'My_Data - Inbox Ingest 0900',
  'My_Data - Inbox Ingest 1200',
  'My_Data - Inbox Ingest 1700',
  'My_Data - Inbox Ingest 09:00',
  'My_Data - Inbox Ingest 12:00',
  'My_Data - Inbox Ingest 17:00'
)

function Get-TriggerAt {
  param([string]$TimeText)
  $parts = $TimeText.Split(':')
  if ($parts.Count -ne 2) { throw "Invalid task time: $TimeText" }
  return (Get-Date).Date.AddHours([int]$parts[0]).AddMinutes([int]$parts[1])
}

function Get-ActionArgument {
  param($Definition)
  return @(
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy', 'Bypass',
    '-File', ('"{0}"' -f $wrapperPath),
    '-NodePath', ('"{0}"' -f $nodePath)
  ) -join ' '
}

function Register-InboxIngestTask {
  param($Definition)

  $actionArg = Get-ActionArgument -Definition $Definition
  $triggerAt = Get-TriggerAt -TimeText $Definition.At

  if ($DryRun) {
    [pscustomobject]@{
      TaskName = $Definition.TaskName
      At       = $Definition.At
      Days     = 'Daily'
      Command  = ('{0} {1}' -f $powershell, $actionArg)
    }
    return
  }

  $action = New-ScheduledTaskAction `
    -Execute $powershell `
    -Argument $actionArg `
    -WorkingDirectory $scriptsDir

  $trigger = New-ScheduledTaskTrigger `
    -Daily `
    -At $triggerAt

  $settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Minutes $Definition.ExecutionMinutes) `
    -StartWhenAvailable `
    -MultipleInstances IgnoreNew

  $existing = Get-ScheduledTask -TaskName $Definition.TaskName -ErrorAction SilentlyContinue

  try {
    Register-ScheduledTask `
      -TaskName    $Definition.TaskName `
      -Action      $action `
      -Trigger     $trigger `
      -Settings    $settings `
      -RunLevel    Limited `
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
  Write-Host ("{0}: {1} at {2} (daily)" -f $verb, $Definition.TaskName, $Definition.At)
}

function Unregister-LegacyInboxTask {
  param([string]$TaskName)

  if ($DryRun) {
    return
  }

  $existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
  if ($existing) {
    try {
      Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction Stop
      Write-Host ("Removed legacy inbox task: {0}" -f $TaskName)
    } catch {
      if ($_.Exception.Message -match 'Access is denied') {
        Write-Warning ("Could not remove protected legacy inbox task: {0}. Remove it from an elevated/admin shell." -f $TaskName)
        return
      }
      throw
    }
  }
}

Write-Host ''
Write-Host 'My_Data World packet writer Task Scheduler installer'
Write-Host ("Scripts directory: {0}" -f $scriptsDir)
Write-Host ("Node path:         {0}" -f $nodePath)
Write-Host ("Windows user:      {0}" -f $currentUser)
Write-Host ''

if ($DryRun) {
  Write-Host '[dry-run] Would register or replace these tasks:'
  $taskDefinitions | ForEach-Object { Register-InboxIngestTask -Definition $_ } | Format-Table -AutoSize -Wrap
  exit 0
}

foreach ($definition in $taskDefinitions) {
  Register-InboxIngestTask -Definition $definition
}

foreach ($taskName in $legacyTaskNames) {
  Unregister-LegacyInboxTask -TaskName $taskName
}

Write-Host ''
Write-Host 'Verification:'
$verification = foreach ($definition in $taskDefinitions) {
  $task = Get-ScheduledTask -TaskName $definition.TaskName -ErrorAction Stop
  $info = Get-ScheduledTaskInfo -TaskName $definition.TaskName -ErrorAction Stop
  [pscustomobject]@{
    TaskName        = $task.TaskName
    State           = $task.State
    NextRunTime     = $info.NextRunTime
    LastTaskResult  = $info.LastTaskResult
  }
}

$verification | Format-Table -AutoSize

Write-Host ''
Write-Host 'Logs will be written under:'
Write-Host ("  {0}" -f (Join-Path (Split-Path -Parent $scriptsDir) 'logs\world-packet-writer'))
Write-Host ''
Write-Host 'Manual smoke test:'
Write-Host "  .\invoke-inbox-ingest.ps1 -DryRun"
