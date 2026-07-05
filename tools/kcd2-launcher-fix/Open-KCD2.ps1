# Быстрый запуск KCD2 без прав администратора.
# Сначала пытается открыть игру сразу. Если не вышло — запускает полное исправление.

$ErrorActionPreference = 'SilentlyContinue'

function Find-Kcd2Exe {
    $paths = @(
        "$env:ProgramFiles\Epic Games\KingdomComeDeliverance2",
        "${env:ProgramFiles(x86)}\Steam\steamapps\common\KingdomComeDeliverance2",
        "$env:ProgramFiles\Steam\steamapps\common\KingdomComeDeliverance2"
    )

    $vdf = "${env:ProgramFiles(x86)}\Steam\steamapps\libraryfolders.vdf"
    if (Test-Path $vdf) {
        $raw = Get-Content -Raw $vdf
        foreach ($m in [regex]::Matches($raw, '"path"\s+"([^"]+)"')) {
            $paths += (Join-Path ($m.Groups[1].Value -replace '\\\\', '\') 'steamapps\common\KingdomComeDeliverance2')
        }
    }

    foreach ($root in ($paths | Select-Object -Unique)) {
        if (-not (Test-Path $root)) { continue }
        $exe = Get-ChildItem -Path $root -Recurse -Filter 'KingdomCome.exe' -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($exe) { return $exe.FullName }
    }
    return $null
}

function Start-SteamGame {
    $steam = "${env:ProgramFiles(x86)}\Steam\steam.exe"
    if (-not (Test-Path $steam)) { $steam = "$env:ProgramFiles\Steam\steam.exe" }
    if (-not (Test-Path $steam)) { return $false }

    if (-not (Get-Process -Name 'steam' -ErrorAction SilentlyContinue)) {
        Start-Process $steam
        Start-Sleep -Seconds 4
    }
    Start-Process $steam -ArgumentList 'steam://rungameid/1771300'
    return $true
}

function Start-EpicGame {
    $epic = "${env:ProgramFiles(x86)}\Epic Games\Launcher\Portal\Binaries\Win64\EpicGamesLauncher.exe"
    if (-not (Test-Path $epic)) { $epic = "$env:ProgramFiles\Epic Games\Launcher\Portal\Binaries\Win64\EpicGamesLauncher.exe" }
    if (-not (Test-Path $epic)) { return $false }

    Start-Process $epic -ArgumentList '-launch -silent'
    Start-Sleep -Seconds 5
    Start-Process 'com.epicgames.launcher://apps/KingdomComeDeliverance2?action=launch&silent=true'
    return $true
}

function Test-GameRunning {
    $names = @('KingdomCome', 'KingdomComeDeliverance2')
    foreach ($n in $names) {
        if (Get-Process -Name $n -ErrorAction SilentlyContinue) { return $true }
    }
    return $false
}

Write-Host ''
Write-Host '  Kingdom Come: Deliverance II' -ForegroundColor Cyan
Write-Host '  Открываю игру...' -ForegroundColor Cyan
Write-Host ''

$started = $false

if (Start-SteamGame) { $started = $true }
if (-not $started -and (Start-EpicGame)) { $started = $true }

$exe = Find-Kcd2Exe
if ($exe) {
    Start-Process -FilePath $exe -WorkingDirectory (Split-Path $exe -Parent)
    $started = $true
}

if (-not $started) {
    Write-Host '  Лаунчер не найден. Запускаю исправление...' -ForegroundColor Yellow
    $fixBat = Join-Path $PSScriptRoot 'Launch-KCD2-All.bat'
    if (Test-Path $fixBat) {
        Start-Process -FilePath $fixBat
    }
    exit 2
}

Write-Host '  Жду запуска (15 сек)...' -ForegroundColor Gray
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 1
    if (Test-GameRunning) {
        Write-Host '  Игра открылась!' -ForegroundColor Green
        exit 0
    }
}

Write-Host '  Игра не стартовала. Запускаю исправление...' -ForegroundColor Yellow
$fixBat = Join-Path $PSScriptRoot 'Launch-KCD2-All.bat'
if (Test-Path $fixBat) {
    Start-Process -FilePath $fixBat
}
exit 1
