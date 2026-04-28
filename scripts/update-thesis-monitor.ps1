$ErrorActionPreference = 'Stop'

$vaultRoot = Split-Path $PSScriptRoot -Parent
$thesesDir = Join-Path $vaultRoot '10_Theses'
$today = Get-Date -Format 'yyyy-MM-dd'

function Get-MonitorAction {
  param([string]$Priority)

  switch ($Priority) {
    'high' { return 'Review on every material pull update and escalate fast if disconfirming evidence appears.' }
    'medium' { return 'Review on catalyst changes and promote only when evidence chains strengthen.' }
    'watch' { return 'Keep small and review only when a catalyst or signal meaningfully changes.' }
    default { return 'Review when fresh evidence changes the thesis.' }
  }
}

foreach ($file in Get-ChildItem $thesesDir -File -Filter *.md) {
  $content = Get-Content $file.FullName -Raw
  $match = [regex]::Match($content, '(?s)^---\r?\n(.*?)\r?\n---\r?\n')
  if (-not $match.Success) { continue }

  $frontmatter = $match.Groups[1].Value
  $body = $content.Substring($match.Length)

  $priority = ''
  $priorityMatch = [regex]::Match($frontmatter, '(?m)^allocation_priority:\s*"?(.*?)"?\s*$')
  if ($priorityMatch.Success) {
    $priority = $priorityMatch.Groups[1].Value
  }

  if ($frontmatter -notmatch '(?m)^monitor_status:') {
    $action = Get-MonitorAction $priority
    $monitorFields = @(
      'monitor_status: "on-track"',
      ('monitor_last_review: "' + $today + '"'),
      'monitor_change: "Initial monitor baseline established."',
      'break_risk_status: "not-seen"',
      ('monitor_action: "' + $action + '"')
    ) -join "`r`n"

    $frontmatter = [regex]::Replace(
      $frontmatter,
      '(?m)^required_pull_families:\s*\[[^\r\n]*\]\s*$',
      "`$0`r`n$monitorFields",
      1
    )
  }

  if ($body -notmatch '(?m)^## Monitor Review') {
    $action = Get-MonitorAction $priority
    $monitorBlock = @(
      '## Monitor Review',
      '',
      ('- **Last review**: ' + $today),
      '- **Change this week**: Initial monitor baseline established.',
      '- **Break risk status**: not-seen',
      ('- **Action**: ' + $action),
      ''
    ) -join "`r`n"

    if ($body -match '(?m)^## Position Sizing & Risk') {
      $body = [regex]::Replace($body, '(?m)^## Position Sizing & Risk', "$monitorBlock`r`n## Position Sizing & Risk", 1)
    }
    else {
      $body = $body.TrimEnd() + "`r`n`r`n$monitorBlock"
    }
  }

  $updated = "---`r`n$frontmatter`r`n---`r`n$body"
  Set-Content $file.FullName $updated
}
