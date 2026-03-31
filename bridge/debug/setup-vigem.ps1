##
## One-command setup for ViGEmBus + DuckStation XInput bindings.
##
## Run from an ELEVATED (admin) PowerShell:
##   powershell -ExecutionPolicy Bypass -File bridge\debug\setup-vigem.ps1
##

$ErrorActionPreference = "Stop"

Write-Host "`n=== ViGEmBus Setup ===" -ForegroundColor Cyan

# ── 1. Check if ViGEmBus is already installed ──────────────────

$vigemDevice = Get-PnpDevice -FriendlyName "*ViGEm*" -ErrorAction SilentlyContinue
if ($vigemDevice) {
    Write-Host "[OK] ViGEmBus driver already installed." -ForegroundColor Green
} else {
    Write-Host "[INFO] ViGEmBus driver not found. Downloading installer..." -ForegroundColor Yellow

    $installerUrl = "https://github.com/nefarius/ViGEmBus/releases/download/v1.22.0/ViGEmBus_1.22.0_x64_x86_arm64.exe"
    $installerPath = Join-Path $env:TEMP "ViGEmBus_Setup.exe"

    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath -UseBasicParsing
        Write-Host "[OK] Downloaded installer to $installerPath" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Failed to download ViGEmBus installer: $_" -ForegroundColor Red
        Write-Host "Download manually from: $installerUrl" -ForegroundColor Yellow
        exit 1
    }

    Write-Host "[INFO] Launching installer..." -ForegroundColor Yellow
    Start-Process -FilePath $installerPath -Wait

    # Verify installation
    $vigemDevice = Get-PnpDevice -FriendlyName "*ViGEm*" -ErrorAction SilentlyContinue
    if ($vigemDevice) {
        Write-Host "[OK] ViGEmBus driver installed successfully." -ForegroundColor Green
    } else {
        Write-Host "[WARN] ViGEmBus device not detected yet. A reboot may be required." -ForegroundColor Yellow
    }
}

# ── 2. Patch DuckStation settings.ini with XInput bindings ─────

Write-Host "`n=== DuckStation XInput Configuration ===" -ForegroundColor Cyan

# Find DuckStation settings.ini
$settingsPath = $null
$candidates = @()

# Check portable mode first (RomStation)
$dsProc = Get-Process duckstation* -ErrorAction SilentlyContinue | Select-Object -First 1
if ($dsProc) {
    $exeDir = Split-Path $dsProc.Path -Parent
    $portableCheck = Join-Path $exeDir "portable.txt"
    if (Test-Path $portableCheck) {
        $candidates += Join-Path $exeDir "settings.ini"
    }
}

# Standard locations
$docs = [Environment]::GetFolderPath("MyDocuments")
if ($docs) { $candidates += Join-Path $docs "DuckStation\settings.ini" }
if ($env:LOCALAPPDATA) { $candidates += Join-Path $env:LOCALAPPDATA "DuckStation\settings.ini" }

foreach ($p in $candidates) {
    if (Test-Path $p) {
        $settingsPath = $p
        break
    }
}

if (-not $settingsPath) {
    Write-Host "[WARN] DuckStation settings.ini not found. Skipping XInput patching." -ForegroundColor Yellow
    Write-Host "       Start DuckStation at least once, then re-run this script." -ForegroundColor Yellow
    exit 0
}

Write-Host "[OK] Found settings.ini at: $settingsPath" -ForegroundColor Green

# XInput bindings to add (appended with & if keyboard binding exists)
$xinputBindings = @{
    "Up"       = "XInput-0/DPadUp"
    "Down"     = "XInput-0/DPadDown"
    "Left"     = "XInput-0/DPadLeft"
    "Right"    = "XInput-0/DPadRight"
    "Cross"    = "XInput-0/A"
    "Circle"   = "XInput-0/B"
    "Square"   = "XInput-0/X"
    "Triangle" = "XInput-0/Y"
    "L1"       = "XInput-0/LeftShoulder"
    "R1"       = "XInput-0/RightShoulder"
    "L2"       = "XInput-0/+LeftTrigger"
    "R2"       = "XInput-0/+RightTrigger"
    "Start"    = "XInput-0/Start"
    "Select"   = "XInput-0/Back"
}

$content = Get-Content $settingsPath -Raw
$eol = if ($content -match "`r`n") { "`r`n" } else { "`n" }
$lines = $content -split "`r?`n"

$inPad1 = $false
$pad1Start = -1
$pad1End = $lines.Length
$changed = $false

for ($i = 0; $i -lt $lines.Length; $i++) {
    $trimmed = $lines[$i].Trim()
    if ($trimmed -eq "[Pad1]") {
        $inPad1 = $true
        $pad1Start = $i
        continue
    }
    if ($inPad1 -and $trimmed -match "^\[" -and $trimmed -match "\]$") {
        $pad1End = $i
        break
    }
    if ($inPad1 -and $trimmed -match "^(\w+)\s*=\s*(.+)$") {
        $key = $Matches[1]
        $value = $Matches[2].Trim()
        $xinput = $xinputBindings[$key]
        if ($xinput -and $value -notmatch "XInput") {
            $lines[$i] = "$key = $value & $xinput"
            $changed = $true
            Write-Host "  Patched: $key = $value & $xinput"
        }
    }
}

# Add missing XInput-only bindings
if ($pad1Start -ge 0) {
    $missing = @()
    foreach ($key in $xinputBindings.Keys) {
        $found = $false
        for ($i = $pad1Start; $i -lt $pad1End; $i++) {
            if ($lines[$i] -match "^$key\s*=") { $found = $true; break }
        }
        if (-not $found) {
            $missing += "$key = $($xinputBindings[$key])"
        }
    }
    if ($missing.Count -gt 0) {
        $insertAt = $pad1End
        $linesList = [System.Collections.ArrayList]::new($lines)
        foreach ($line in $missing) {
            $linesList.Insert($insertAt, $line)
            $insertAt++
            $changed = $true
            Write-Host "  Added: $line"
        }
        $lines = $linesList.ToArray()
    }
}

if ($changed) {
    $lines -join $eol | Set-Content $settingsPath -NoNewline
    Write-Host "[OK] DuckStation settings.ini patched with XInput bindings." -ForegroundColor Green
    Write-Host "[INFO] Restart DuckStation for changes to take effect." -ForegroundColor Yellow
} else {
    Write-Host "[OK] XInput bindings already present." -ForegroundColor Green
}

Write-Host "`n=== Setup Complete ===" -ForegroundColor Cyan
Write-Host "1. Restart DuckStation if it was running."
Write-Host "2. The virtual controller will be created automatically by the bridge."
Write-Host ""
