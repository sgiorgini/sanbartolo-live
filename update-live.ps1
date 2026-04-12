param(
  [int]$IntervalSeconds = 5,
  [string]$SourceUrl = "http://44.3.44.133/webcapture.jpg?command=snap&channel=1"
)

$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot
if (!(Test-Path "live")) {
  New-Item -ItemType Directory -Path "live" | Out-Null
}

Write-Host "Avvio aggiornamento snapshot ogni $IntervalSeconds secondi..."
Write-Host "Sorgente: $SourceUrl"

while ($true) {
  try {
    curl.exe -fsSL "$SourceUrl" -o "live/latest.jpg"
    Copy-Item "live/latest.jpg" "latest.jpg" -Force

    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $size = (Get-Item "latest.jpg").Length
    Write-Host "[$ts] OK - latest.jpg aggiornato ($size bytes)"
  }
  catch {
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Warning "[$ts] Errore aggiornamento: $($_.Exception.Message)"
  }

  Start-Sleep -Seconds $IntervalSeconds
}
