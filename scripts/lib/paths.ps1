function Get-MyDataRoot {
  return (Split-Path $PSScriptRoot -Parent | Split-Path -Parent)
}

function Get-ResearchVaultRoot {
  $configuredRoot = $env:RESEARCH_VAULT_ROOT
  $myDataRoot = Get-MyDataRoot
  if (-not [string]::IsNullOrWhiteSpace($configuredRoot)) {
    $configuredFull = [System.IO.Path]::GetFullPath($configuredRoot).TrimEnd('\', '/')
    $myDataFull = [System.IO.Path]::GetFullPath($myDataRoot).TrimEnd('\', '/')
    if (-not $configuredFull.Equals($myDataFull, [System.StringComparison]::OrdinalIgnoreCase)) {
      return $configuredRoot
    }
  }

  return (Join-Path (Split-Path $myDataRoot -Parent) 'The Research Spine')
}
