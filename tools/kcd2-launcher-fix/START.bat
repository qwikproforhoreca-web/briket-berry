@echo off
:: Скрытый запуск с авто-повышением прав при необходимости
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Open-KCD2.ps1"
