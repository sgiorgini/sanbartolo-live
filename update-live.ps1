param(
  [int]$IntervalSeconds = 300,
  [string]$SourceUrl = "http://44.3.44.133/webcapture.jpg?command=snap&channel=1",
  [switch]$RunOnce
)

$scriptPath = Join-Path $PSScriptRoot "update-and-push.ps1"

if (-not (Test-Path $scriptPath)) {
  throw "Script non trovato: $scriptPath"
}

& $scriptPath -IntervalSeconds $IntervalSeconds -SourceUrl $SourceUrl -RunOnce:$RunOnce