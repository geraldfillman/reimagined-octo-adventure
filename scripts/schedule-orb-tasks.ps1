#Requires -Version 5.1
#Requires -RunAsAdministrator
# schedule-orb-tasks.ps1 -- Run ONCE to register all three trading system tasks in Windows Task Scheduler.
# Re-running this script is safe: existing tasks with the same names are replaced.
#
# Usage (elevated PowerShell):
#   cd "C:\Users\CaveUser\Documents\Obsidian Vault\My_Data\scripts"
#   .\schedule-orb-tasks.ps1

$scriptsDir  = $PSScriptRoot
$logDir      = Join-Path $scriptsDir '..\logs'
$powershell  = 'powershell.exe'
$psArgs      = '-NonInteractive -NoProfile -ExecutionPolicy Bypass -File'
$ErrorActionPreference = 'Stop'

# Ensure log directory exists
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

# --- Helper ------------------------------------------------------------------
function Register-OrbTask {
    param(
        [string]$TaskName,
        [string]$ScriptFile,
        [int]$Hour,
        [int]$Minute,
        [string]$LogFile
    )

    $scriptPath = Join-Path $scriptsDir $ScriptFile
    $triggerAt  = (Get-Date).Date.AddHours($Hour).AddMinutes($Minute)

    $action = New-ScheduledTaskAction `
        -Execute $powershell `
        -Argument "$psArgs `"$scriptPath`" >> `"$LogFile`" 2>&1" `
        -WorkingDirectory $scriptsDir

    $trigger = New-ScheduledTaskTrigger `
        -Weekly `
        -DaysOfWeek Monday,Tuesday,Wednesday,Thursday,Friday `
        -At $triggerAt

    $settings = New-ScheduledTaskSettingsSet `
        -ExecutionTimeLimit (New-TimeSpan -Minutes 15) `
        -StartWhenAvailable `
        -RunOnlyIfNetworkAvailable

    $principal = New-ScheduledTaskPrincipal `
        -UserId ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name) `
        -RunLevel Highest `
        -LogonType Interactive

    # Remove existing task (idempotent)
    if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction Stop
        Write-Host "  Replaced existing task: $TaskName"
    }

    Register-ScheduledTask `
        -TaskName    $TaskName `
        -Action      $action `
        -Trigger     $trigger `
        -Settings    $settings `
        -Principal   $principal `
        -Description "ORB trading system -- $ScriptFile" `
        -ErrorAction Stop | Out-Null

    Write-Host ("  Registered: {0}  ->  {1:D2}:{2:D2} ET (Mon-Fri)  Log: {3}" -f $TaskName, $Hour, $Minute, $LogFile)
}

# --- Register tasks -----------------------------------------------------------
Write-Host "`nRegistering trading system Task Scheduler jobs...`n"

$registeredTasks = @(
    'ORB Pre-Market Screen',
    'ORB Entropy Trade Sheet',
    'Entropy Compression Scan'
)

Register-OrbTask `
    -TaskName   'ORB Pre-Market Screen' `
    -ScriptFile 'task-premarket.ps1' `
    -Hour       9 `
    -Minute     0 `
    -LogFile    (Join-Path $logDir 'task-premarket.log')

Register-OrbTask `
    -TaskName   'ORB Entropy Trade Sheet' `
    -ScriptFile 'task-orb.ps1' `
    -Hour       9 `
    -Minute     35 `
    -LogFile    (Join-Path $logDir 'task-orb.log')

Register-OrbTask `
    -TaskName   'Entropy Compression Scan' `
    -ScriptFile 'task-compression-scan.ps1' `
    -Hour       16 `
    -Minute     30 `
    -LogFile    (Join-Path $logDir 'task-compression-scan.log')

# --- Summary -----------------------------------------------------------------
Write-Host "`nVerification:"
$verificationRows = foreach ($taskName in $registeredTasks) {
    $task = Get-ScheduledTask -TaskName $taskName -ErrorAction Stop
    $info = Get-ScheduledTaskInfo -TaskName $taskName -ErrorAction Stop
    [pscustomobject]@{
        TaskName       = $task.TaskName
        State          = $task.State
        NextRunTime    = $info.NextRunTime
        LastTaskResult = $info.LastTaskResult
    }
}
$verificationRows | Format-Table -AutoSize

Write-Host "`nDone. Verify in Task Scheduler (taskschd.msc) or run:"
Write-Host '  Get-ScheduledTask | Where-Object { $_.TaskName -like "ORB*" -or $_.TaskName -like "Entropy*" } | Select TaskName, State'
Write-Host ""
Write-Host "To run a task immediately for testing:"
Write-Host "  Start-ScheduledTask -TaskName 'ORB Pre-Market Screen'"
Write-Host "  Start-ScheduledTask -TaskName 'ORB Entropy Trade Sheet'"
Write-Host "  Start-ScheduledTask -TaskName 'Entropy Compression Scan'"
