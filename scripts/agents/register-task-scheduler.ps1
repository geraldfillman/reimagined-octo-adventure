# Register the 6 daily slot triggers in Windows Task Scheduler.
#
# Usage (from elevated PowerShell):
#   .\register-task-scheduler.ps1                 # registers all 6
#   .\register-task-scheduler.ps1 -Unregister     # removes them
#   .\register-task-scheduler.ps1 -DryRun         # prints actions only
#
# Each task runs:
#   node <vault>\My_Data\scripts\agents\routine-runner.mjs --slot=S{n} --no-weekend
#
# Times are local clock. If the box's timezone is not ET, adjust below.

param(
    [switch]$Unregister,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$VaultRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$Runner    = Join-Path $VaultRoot 'scripts\agents\routine-runner.mjs'
$NodeExe   = (Get-Command node -ErrorAction Stop).Source
$TaskPath  = '\WorldMachine\'

$Slots = @(
    @{ Slot = 'S1'; Time = '06:30'; Label = 'Pre-open' },
    @{ Slot = 'S2'; Time = '10:00'; Label = 'Open+30' },
    @{ Slot = 'S3'; Time = '12:30'; Label = 'Midday' },
    @{ Slot = 'S4'; Time = '15:30'; Label = 'Preclose' },
    @{ Slot = 'S5'; Time = '16:30'; Label = 'Postclose' },
    @{ Slot = 'S6'; Time = '18:00'; Label = 'EOD' }
)

if (-not (Test-Path $Runner)) {
    throw "Runner not found at: $Runner"
}

function Register-Slot($slot) {
    $taskName = "WM-Routine-$($slot.Slot)"
    $fullName = "$TaskPath$taskName"

    if ($DryRun) {
        Write-Host "[dry-run] would register: $fullName  $($slot.Time)  --slot=$($slot.Slot)"
        return
    }

    $action  = New-ScheduledTaskAction `
        -Execute $NodeExe `
        -Argument "`"$Runner`" --slot=$($slot.Slot) --no-weekend" `
        -WorkingDirectory $VaultRoot

    $trigger = New-ScheduledTaskTrigger -Daily -At $slot.Time -DaysInterval 1

    $settings = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries `
        -StartWhenAvailable `
        -ExecutionTimeLimit (New-TimeSpan -Minutes 25) `
        -RestartCount 1 `
        -RestartInterval (New-TimeSpan -Minutes 5)

    $description = "World Machine routine runner - slot $($slot.Slot) ($($slot.Label)) at $($slot.Time) local."

    if (Get-ScheduledTask -TaskName $taskName -TaskPath $TaskPath -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $taskName -TaskPath $TaskPath -Confirm:$false
    }

    Register-ScheduledTask `
        -TaskName $taskName `
        -TaskPath $TaskPath `
        -Action $action `
        -Trigger $trigger `
        -Settings $settings `
        -Description $description `
        -RunLevel Limited | Out-Null

    Write-Host "registered: $fullName at $($slot.Time)"
}

function Unregister-Slot($slot) {
    $taskName = "WM-Routine-$($slot.Slot)"
    if ($DryRun) {
        Write-Host "[dry-run] would unregister: $TaskPath$taskName"
        return
    }
    if (Get-ScheduledTask -TaskName $taskName -TaskPath $TaskPath -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $taskName -TaskPath $TaskPath -Confirm:$false
        Write-Host "unregistered: $TaskPath$taskName"
    } else {
        Write-Host "not present: $TaskPath$taskName"
    }
}

Write-Host "Vault root: $VaultRoot"
Write-Host "Runner:     $Runner"
Write-Host "Node:       $NodeExe"
Write-Host ''

foreach ($s in $Slots) {
    if ($Unregister) { Unregister-Slot $s } else { Register-Slot $s }
}

Write-Host ''
Write-Host "Done. View tasks with: Get-ScheduledTask -TaskPath '$TaskPath*'"
