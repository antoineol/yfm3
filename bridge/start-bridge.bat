@echo off
chcp 65001 >nul 2>&1
title YFM Copilot - Emulator Bridge

echo.
echo  +----------------------------------------------+
echo  ^|         YFM Copilot - Emulator Bridge        ^|
echo  +----------------------------------------------+
echo  ^|                                              ^|
echo  ^|  1. Open DuckStation                         ^|
echo  ^|  2. Settings ^> Advanced ^>                    ^|
echo  ^|     Enable "Export Shared Memory"            ^|
echo  ^|  3. Load the FM Remastered Perfected ROM     ^|
echo  ^|  4. Open the web app in your browser         ^|
echo  ^|  5. Turn on "Sync" in the top-right corner   ^|
echo  ^|                                              ^|
echo  +----------------------------------------------+
echo.
:: ── Auto-update check ──────────────────────────────────────────
echo  Checking for updates...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0runtime\update.ps1" "%~dp0"
echo.
echo  Starting bridge...
echo.

"%~dp0runtime\node.exe" "%~dp0runtime\serve.mjs"

if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Bridge stopped unexpectedly.
    echo.
    echo  Common fixes:
    echo  - Make sure DuckStation is running
    echo  - Enable "Export Shared Memory" in
    echo    DuckStation ^> Settings ^> Advanced
    echo  - Try running as Administrator
    echo.
)

pause
