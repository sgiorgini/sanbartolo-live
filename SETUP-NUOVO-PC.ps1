#!/usr/bin/env powershell
<#
.SYNOPSIS
  Setup iniziale per sanbartolo-live su nuovo PC.
.DESCRIPTION
  Configura identità git locale e avvia il loop di aggiornamento.
.PARAMETER UserName
  Nome utente git (default: sgiorgini)
.PARAMETER UserEmail
  Email utente git (default: sgiorgini@users.noreply.github.com)
.PARAMETER IntervalSeconds
  Intervallo aggiornamento in secondi (default: 15)
#>

param(
  [string]$UserName = "sgiorgini",
  [string]$UserEmail = "sgiorgini@users.noreply.github.com",
  [int]$IntervalSeconds = 15
)

$ErrorActionPreference = "Stop"

Write-Host "=== Setup sanbartolo-live ===" -ForegroundColor Cyan
Write-Host "Repository: $(Get-Location)"
Write-Host "Autore: $UserName <$UserEmail>"
Write-Host "Intervallo: $IntervalSeconds secondi"
Write-Host ""

try {
  Write-Host "[1/3] Configurazione identità git locale..." -ForegroundColor Yellow
  git config user.name $UserName
  git config user.email $UserEmail
  
  $configName = git config --get user.name
  $configEmail = git config --get user.email
  Write-Host "        ✓ Name: $configName"
  Write-Host "        ✓ Email: $configEmail"
  
  Write-Host ""
  Write-Host "[2/3] Verifica remoto..." -ForegroundColor Yellow
  $remoteUrl = git config --get remote.origin.url
  Write-Host "        ✓ Remote: $remoteUrl"
  
  Write-Host ""
  Write-Host "[3/3] Avvio loop aggiornamento..." -ForegroundColor Yellow
  Write-Host "        Intervallo: $IntervalSeconds secondi"
  Write-Host "        Per interrompere: Ctrl+C"
  Write-Host ""
  
  & ".\update-and-push.ps1" -IntervalSeconds $IntervalSeconds
}
catch {
  Write-Error "Errore setup: $($_.Exception.Message)"
  exit 1
}
