@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File ".\update-and-push.ps1" -IntervalSeconds 300
