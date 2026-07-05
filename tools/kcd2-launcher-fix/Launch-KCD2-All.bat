@echo off
setlocal EnableDelayedExpansion
title KCD2 - Починить и запустить

:: Один клик: исправления + запуск Steam/Epic + запуск игры
:: Запрашивает права администратора автоматически.

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  ========================================
    echo   KCD2: запрос прав администратора...
    echo  ========================================
    echo.
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"

echo.
echo  ========================================
echo   Kingdom Come: Deliverance II
echo   Автоисправление + запуск лаунчера
echo  ========================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Fix-KCD2Launcher.ps1" -LaunchAfterFix -SkipSystemRepair

echo.
echo  Если игра не открылась:
echo    1. Перезагрузите ПК
echo    2. Запустите этот файл снова
echo    3. Или откройте Steam/Epic вручную и нажмите Играть
echo.
pause
