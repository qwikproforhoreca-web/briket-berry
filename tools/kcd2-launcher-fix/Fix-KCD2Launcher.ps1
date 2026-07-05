#Requires -Version 5.1
<#
.SYNOPSIS
    Автоматическое исправление проблем запуска Kingdom Come: Deliverance II.

.DESCRIPTION
    Скрипт выполняет типичные исправления:
    - останавливает конфликтующие процессы;
    - очищает кэш шейдеров;
    - добавляет папку игры в исключения Windows Defender;
    - переустанавливает Microsoft Visual C++ Redistributable;
    - проверяет наличие WHGame.dll;
    - запускает проверку целостности через Steam/Epic (если найдены);
    - опционально восстанавливает системные файлы Windows.

.NOTES
    Запускайте от имени администратора.
#>

[CmdletBinding()]
param(
    [switch]$SkipVcRedist,
    [switch]$SkipSystemRepair,
    [switch]$LaunchAfterFix
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Step([string]$Message) {
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Write-Ok([string]$Message) {
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warn([string]$Message) {
    Write-Host "[!] $Message" -ForegroundColor Yellow
}

function Write-Err([string]$Message) {
    Write-Host "[X] $Message" -ForegroundColor Red
}

function Test-IsAdmin {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Stop-ConflictingProcesses {
    Write-Step "Остановка конфликтующих процессов"
    $processNames = @(
        'RiotClientServices',
        'Riot Vanguard',
        'vgc',
        'vgtray',
        'Discord',
        'NVIDIA Overlay',
        'nvsphelper64',
        'RTSS',
        'MSIAfterburner'
    )

    foreach ($name in $processNames) {
        $procs = Get-Process -Name $name -ErrorAction SilentlyContinue
        if ($procs) {
            $procs | Stop-Process -Force -ErrorAction SilentlyContinue
            Write-Warn "Остановлен процесс: $name"
        }
    }

    Write-Ok "Конфликтующие процессы обработаны"
}

function Get-Kcd2Installations {
    $candidates = @(
        "$env:ProgramFiles\Epic Games\KingdomComeDeliverance2",
        "$env:ProgramFiles(x86)\Steam\steamapps\common\KingdomComeDeliverance2",
        "$env:ProgramFiles\Steam\steamapps\common\KingdomComeDeliverance2"
    )

    $steamLibraries = @()
    $steamVdf = "$env:ProgramFiles(x86)\Steam\steamapps\libraryfolders.vdf"
    if (Test-Path $steamVdf) {
        $content = Get-Content -Raw -Path $steamVdf
        $matches = [regex]::Matches($content, '"path"\s+"([^"]+)"')
        foreach ($match in $matches) {
            $lib = $match.Groups[1].Value -replace '\\\\', '\'
            $steamLibraries += Join-Path $lib 'steamapps\common\KingdomComeDeliverance2'
        }
    }

    $allPaths = ($candidates + $steamLibraries) | Select-Object -Unique
    $found = @()
    foreach ($path in $allPaths) {
        if (Test-Path $path) {
            $found += [pscustomobject]@{
                Path = $path
                Platform = if ($path -like '*Epic Games*') { 'Epic' } else { 'Steam' }
            }
        }
    }
    return $found
}

function Clear-Kcd2ShaderCache {
    Write-Step "Очистка кэша шейдеров"
    $shaderPath = Join-Path $env:USERPROFILE 'Saved Games\kingdomcome2\shaders'
    if (Test-Path $shaderPath) {
        Remove-Item -LiteralPath $shaderPath -Recurse -Force
        Write-Ok "Удалён кэш: $shaderPath"
    }
    else {
        Write-Ok "Кэш шейдеров не найден (это нормально)"
    }
}

function Add-DefenderExclusion([string]$Path) {
    if (-not (Test-Path $Path)) { return }
    try {
        Add-MpPreference -ExclusionPath $Path -ErrorAction Stop | Out-Null
        Write-Ok "Добавлено исключение Defender: $Path"
    }
    catch {
        Write-Warn "Не удалось добавить исключение Defender: $($_.Exception.Message)"
    }
}

function Install-VcRedistributables {
    Write-Step "Установка Microsoft Visual C++ Redistributable (x64 и x86)"
    $temp = Join-Path $env:TEMP 'kcd2-vcredist'
    New-Item -ItemType Directory -Path $temp -Force | Out-Null

    $packages = @(
        @{
            Name = 'VC++ 2015-2022 x64'
            Url  = 'https://aka.ms/vs/17/release/vc_redist.x64.exe'
            File = Join-Path $temp 'vc_redist.x64.exe'
        },
        @{
            Name = 'VC++ 2015-2022 x86'
            Url  = 'https://aka.ms/vs/17/release/vc_redist.x86.exe'
            File = Join-Path $temp 'vc_redist.x86.exe'
        }
    )

    foreach ($pkg in $packages) {
        Write-Host "  Скачивание $($pkg.Name)..."
        Invoke-WebRequest -Uri $pkg.Url -OutFile $pkg.File -UseBasicParsing
        Write-Host "  Установка $($pkg.Name)..."
        $proc = Start-Process -FilePath $pkg.File -ArgumentList '/install', '/quiet', '/norestart' -PassThru -Wait
        if ($proc.ExitCode -eq 0 -or $proc.ExitCode -eq 1638 -or $proc.ExitCode -eq 3010) {
            Write-Ok "$($pkg.Name) установлен (код $($proc.ExitCode))"
        }
        else {
            Write-Warn "$($pkg.Name): код выхода $($proc.ExitCode)"
        }
    }
}

function Test-GameFiles([string]$GamePath) {
    Write-Step "Проверка файлов игры: $GamePath"
    $dllPath = Join-Path $GamePath 'Bin\Win64MasterMasterEpicPGO\WHGame.dll'
    $altDllPaths = @(
        Join-Path $GamePath 'Bin\Win64MasterMasterSteamPGO\WHGame.dll',
        Join-Path $GamePath 'WHGame.dll'
    )

    $dllFound = Test-Path $dllPath
    if (-not $dllFound) {
        foreach ($alt in $altDllPaths) {
            if (Test-Path $alt) {
                $dllFound = $true
                $dllPath = $alt
                break
            }
        }
    }

    if ($dllFound) {
        Write-Ok "WHGame.dll найден: $dllPath"
    }
    else {
        Write-Err "WHGame.dll не найден. Нужна проверка целостности или переустановка игры."
    }

    $exeCandidates = Get-ChildItem -Path $GamePath -Recurse -Filter 'KingdomCome.exe' -ErrorAction SilentlyContinue
    if ($exeCandidates) {
        Write-Ok "Исполняемый файл найден: $($exeCandidates[0].FullName)"
        return [pscustomobject]@{
            GamePath = $GamePath
            ExePath  = $exeCandidates[0].FullName
            DllOk    = $dllFound
        }
    }

    Write-Err "KingdomCome.exe не найден в $GamePath"
    return $null
}

function Invoke-SteamVerify {
    param([string]$GamePath)
    $steamExe = "${env:ProgramFiles(x86)}\Steam\steam.exe"
    if (-not (Test-Path $steamExe)) {
        Write-Warn "Steam не найден, пропускаем verify"
        return
    }

    Write-Step "Запуск проверки целостности файлов Steam (AppID 1771300)"
    Start-Process -FilePath $steamExe -ArgumentList 'steam://validate/1771300'
    Write-Ok "Открыта проверка Steam. Дождитесь завершения и запустите игру снова."
}

function Invoke-EpicVerifyHint {
    Write-Warn "Для Epic Games: Библиотека -> KCD2 -> ... -> Управление -> Проверить файлы"
}

function Repair-WindowsSystemFiles {
    Write-Step "Восстановление системных файлов Windows (может занять 10-20 минут)"
    Write-Host "  SFC /scannow..."
    $sfc = Start-Process -FilePath 'sfc.exe' -ArgumentList '/scannow' -Wait -PassThru -NoNewWindow
    Write-Ok "SFC завершён с кодом $($sfc.ExitCode)"

    Write-Host "  DISM /RestoreHealth..."
    $dism = Start-Process -FilePath 'dism.exe' -ArgumentList '/Online', '/Cleanup-Image', '/RestoreHealth' -Wait -PassThru -NoNewWindow
    Write-Ok "DISM завершён с кодом $($dism.ExitCode)"
}

function Clear-SteamLaunchOptionsHint {
    Write-Warn "Проверьте параметры запуска Steam: Свойства игры -> Общие -> Параметры запуска (очистите поле)."
}

function Start-SteamLauncher {
    $steamExe = "${env:ProgramFiles(x86)}\Steam\steam.exe"
    if (-not (Test-Path $steamExe)) {
        $steamExe = "$env:ProgramFiles\Steam\steam.exe"
    }
    if (Test-Path $steamExe) {
        Write-Step "Запуск Steam"
        Start-Process -FilePath $steamExe
        Start-Sleep -Seconds 5
        Start-Process $steamExe -ArgumentList 'steam://rungameid/1771300'
        Write-Ok "Steam запущен, отправлена команда на старт KCD2 (AppID 1771300)"
        return $true
    }
    return $false
}

function Start-EpicLauncher {
    $epicExe = "$env:ProgramFiles(x86)\Epic Games\Launcher\Portal\Binaries\Win64\EpicGamesLauncher.exe"
    if (-not (Test-Path $epicExe)) {
        $epicExe = "$env:ProgramFiles\Epic Games\Launcher\Portal\Binaries\Win64\EpicGamesLauncher.exe"
    }
    if (Test-Path $epicExe) {
        Write-Step "Запуск Epic Games Launcher"
        Start-Process -FilePath $epicExe -ArgumentList '-launch -silent'
        Start-Sleep -Seconds 8
        Start-Process "com.epicgames.launcher://apps/KingdomComeDeliverance2?action=launch&silent=true"
        Write-Ok "Epic Games Launcher запущен, отправлена команда на старт KCD2"
        return $true
    }
    return $false
}

function Start-Game([string]$ExePath) {
    if (-not (Test-Path $ExePath)) {
        Write-Err "Не удалось запустить: $ExePath"
        return
    }
    Write-Step "Запуск игры"
    Start-Process -FilePath $ExePath -WorkingDirectory (Split-Path $ExePath -Parent)
    Write-Ok "Игра запущена"
}

function Start-AllLaunchers {
    param(
        $LaunchTarget,
        [string]$PreferredPlatform = 'Auto'
    )

    $steamStarted = $false
    $epicStarted = $false

    if ($PreferredPlatform -eq 'Steam' -or $PreferredPlatform -eq 'Auto') {
        $steamStarted = Start-SteamLauncher
    }
    if ($PreferredPlatform -eq 'Epic' -or ($PreferredPlatform -eq 'Auto' -and -not $steamStarted)) {
        $epicStarted = Start-EpicLauncher
    }

    if ($LaunchTarget -and $LaunchTarget.ExePath) {
        Start-Sleep -Seconds 3
        Start-Game -ExePath $LaunchTarget.ExePath
        return
    }

    if (-not $steamStarted -and -not $epicStarted) {
        Write-Err "Не найден Steam или Epic Games Launcher. Установите лаунчер и игру."
    }
}

# --- main ---
Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host " KCD2 Launcher Fix" -ForegroundColor Magenta
Write-Host " Kingdom Come: Deliverance II" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

if (-not (Test-IsAdmin)) {
    Write-Err "Запустите скрипт от имени администратора."
    exit 1
}

Stop-ConflictingProcesses
Clear-Kcd2ShaderCache

if (-not $SkipVcRedist) {
    Install-VcRedistributables
}
else {
    Write-Warn "Пропущена установка VC++ (--SkipVcRedist)"
}

$installations = Get-Kcd2Installations
if (-not $installations) {
    Write-Err "Папка игры не найдена. Установите KCD2 через Steam или Epic Games."
    Write-Warn "Типичные пути:"
    Write-Host "  - Steam: ...\steamapps\common\KingdomComeDeliverance2"
    Write-Host "  - Epic:  C:\Program Files\Epic Games\KingdomComeDeliverance2"
    exit 2
}

$launchTarget = $null
foreach ($install in $installations) {
    Write-Ok "Найдена установка ($($install.Platform)): $($install.Path)"
    Add-DefenderExclusion -Path $install.Path
    $info = Test-GameFiles -GamePath $install.Path
    if ($info) { $launchTarget = $info }

    if ($install.Platform -eq 'Steam') {
        Invoke-SteamVerify -GamePath $install.Path
    }
    else {
        Invoke-EpicVerifyHint
    }
}

Clear-SteamLaunchOptionsHint

if (-not $SkipSystemRepair) {
    Repair-WindowsSystemFiles
}
else {
    Write-Warn "Пропущено восстановление Windows (--SkipSystemRepair)"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host " Готово" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Дальше:"
Write-Host "  1. Перезагрузите компьютер."
Write-Host "  2. Запустите Steam/Epic от имени администратора."
Write-Host "  3. Дождитесь окончания проверки файлов (если открылась)."
Write-Host "  4. Запустите игру. При первом запуске используйте оконный режим и средние настройки."
Write-Host ""

if ($LaunchAfterFix -and $launchTarget) {
    Start-AllLaunchers -LaunchTarget $launchTarget
}
elseif ($LaunchAfterFix) {
    Start-AllLaunchers -LaunchTarget $null
}

exit 0
