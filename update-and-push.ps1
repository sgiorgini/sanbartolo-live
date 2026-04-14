param(
  [int]$IntervalSeconds = 300,
  [string]$SourceUrl = "http://44.3.44.133/webcapture.jpg?command=snap&channel=1",
  [switch]$RunOnce
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (!(Test-Path "live")) {
  New-Item -ItemType Directory -Path "live" | Out-Null
}

Write-Host "Avvio update+push ogni $IntervalSeconds secondi"
Write-Host "Repo: $PSScriptRoot"

$keepRunning = $true
while ($keepRunning) {
  try {
    $tmpFile = Join-Path $PSScriptRoot "live/latest.new.jpg"

    curl.exe -fsSL "$SourceUrl" -o "$tmpFile"

    $newHash = (Get-FileHash "$tmpFile" -Algorithm SHA256).Hash
    $oldHash = ""
    if (Test-Path "latest.jpg") {
      $oldHash = (Get-FileHash "latest.jpg" -Algorithm SHA256).Hash
    }

    if ($newHash -ne $oldHash) {
      Move-Item -Path "$tmpFile" -Destination "live/latest.jpg" -Force
      Copy-Item "live/latest.jpg" "latest.jpg" -Force

      $statusObject = @{
        latest = "latest.jpg"
        time   = (Get-Date).ToString("o")
      }
      $statusObject | ConvertTo-Json | Set-Content -Path "status.json" -Encoding UTF8

      git add live/latest.jpg latest.jpg status.json | Out-Null
      if (-not (git diff --cached --quiet)) {
        $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        git commit -m "Update live snapshot ($ts)" | Out-Null
        if ($LASTEXITCODE -ne 0) {
          throw "Commit git fallito"
        }

        git push origin main | Out-Null
        if ($LASTEXITCODE -ne 0) {
          throw "Push git fallito"
        }

        Write-Host "[$ts] PUSH OK - snapshot aggiornato"
      }
    }
    else {
      Remove-Item "$tmpFile" -Force
      $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
      Write-Host "[$ts] Nessuna variazione immagine"
    }
  }
  catch {
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Warning "[$ts] Errore update+push: $($_.Exception.Message)"
  }

  if ($RunOnce) {
    $keepRunning = $false
  }
  else {
    Start-Sleep -Seconds $IntervalSeconds
  }
}
