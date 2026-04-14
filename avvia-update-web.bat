@echo off
cd /d "%~dp0"
for /f %%i in ('powershell -NoProfile -Command "(Get-CimInstance Win32_Process ^| Where-Object { $_.Name -eq ''powershell.exe'' -and $_.CommandLine -match [Regex]::Escape((Join-Path (Get-Location) ''update-and-push.ps1'')) }).Count"') do set RUNCOUNT=%%i
if not "%RUNCOUNT%"=="0" (
	echo Updater gia' attivo nella cartella corrente.
	exit /b 1
)
powershell -NoProfile -ExecutionPolicy Bypass -File ".\update-and-push.ps1" -IntervalSeconds 15
