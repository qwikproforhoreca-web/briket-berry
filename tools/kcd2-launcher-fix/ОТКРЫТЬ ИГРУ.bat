@echo off
title KCD2
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0Open-KCD2.ps1"
if errorlevel 1 timeout /t 3 >nul
