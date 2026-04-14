param(
  [int]$IntervalSeconds = 300,
  [string]$SourceUrl = "http://44.3.44.133/webcapture.jpg?command=snap&channel=1",
  [switch]$RunOnce
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$escapedScriptPath = [Regex]::Escape((Join-Path $PSScriptRoot "update-and-push.ps1"))
$otherProcesses = Get-CimInstance Win32_Process | Where-Object {
  $_.Name -eq "powershell.exe" -and
  $_.ProcessId -ne $PID -and
  $_.CommandLine -match $escapedScriptPath
}

if ($otherProcesses -and -not $RunOnce) {
  $otherProcessIds = ($otherProcesses | Select-Object -ExpandProperty ProcessId) -join ", "
  Write-Warning "Updater gia' attivo. PID: $otherProcessIds"
  exit 1
}

if (!(Test-Path "live")) {
  New-Item -ItemType Directory -Path "live" | Out-Null
}

Write-Host "Avvio update+push ogni $IntervalSeconds secondi"
Write-Host "Repo: $PSScriptRoot"

$keepRunning = $true
while ($keepRunning) {
  try {
    $tmpFile = Join-Path $PSScriptRoot ("live/latest.{0}.new.jpg" -f $PID)

    if (Test-Path $tmpFile) {
      Remove-Item $tmpFile -Force -ErrorAction SilentlyContinue
    }

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
