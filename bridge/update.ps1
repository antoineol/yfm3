# Auto-update script for YFM Bridge.
# Called by start-bridge.bat before launching the bridge.
# Usage: powershell -File update.ps1 "C:\path\to\bridge\"

param([string]$BridgeDir)

# Sanitize: %~dp0 adds a trailing backslash which, when quoted, becomes \"
# and PowerShell interprets it as an escaped quote embedded in the string.
$BridgeDir = $BridgeDir.TrimEnd('"').TrimEnd('\')

$ErrorActionPreference = 'Stop'
$tempDir = $null

try {
    $pkgPath = Join-Path $BridgeDir 'runtime\package.json'
    if (-not (Test-Path $pkgPath)) {
        Write-Host '  No runtime found, skipping update check.'
        exit 0
    }

    $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
    $localVer = $pkg.version

    # Query GitHub releases API (filter for bridge-v* tags)
    $headers = @{ 'User-Agent' = 'yfm-bridge-updater' }
    $releases = Invoke-RestMethod `
        -Uri 'https://api.github.com/repos/antoineol/yfm3/releases?per_page=10' `
        -Headers $headers `
        -TimeoutSec 5

    # Find the highest-version non-draft, non-prerelease bridge release
    $bridgeRelease = $null
    $remoteVer = $null
    foreach ($r in $releases) {
        if ($r.tag_name -match '^bridge-v(\d+\.\d+\.\d+)$' -and -not $r.draft -and -not $r.prerelease) {
            $candidateVer = $Matches[1]
            if (-not $remoteVer -or [System.Version]$candidateVer -gt [System.Version]$remoteVer) {
                $bridgeRelease = $r
                $remoteVer = $candidateVer
            }
        }
    }

    if (-not $bridgeRelease) {
        Write-Host '  No bridge release found on GitHub.'
        exit 0
    }

    # Compare versions
    if ([System.Version]$remoteVer -le [System.Version]$localVer) {
        Write-Host "  Up to date (v$localVer)."
        exit 0
    }

    Write-Host "  Updating v$localVer -> v$remoteVer..."

    # Find zip asset
    $asset = $bridgeRelease.assets | Where-Object { $_.name -eq 'yfm-bridge-win-x64.zip' }
    if (-not $asset) {
        Write-Host '  No zip asset found in release, skipping.'
        exit 0
    }

    # Download to temp directory
    $tempDir = Join-Path $env:TEMP "yfm-bridge-update-$PID"
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    $zipPath = Join-Path $tempDir 'update.zip'

    Invoke-WebRequest `
        -Uri $asset.browser_download_url `
        -OutFile $zipPath `
        -UseBasicParsing `
        -TimeoutSec 120

    # Validate: zip must be at least 1 MB
    if ((Get-Item $zipPath).Length -lt 1048576) {
        Write-Host '  Download appears corrupt (too small), skipping.'
        Remove-Item -Recurse -Force $tempDir
        exit 0
    }

    # Extract
    $extractDir = Join-Path $tempDir 'extracted'
    Expand-Archive -Path $zipPath -DestinationPath $extractDir -Force

    # Verify extracted structure
    $newRuntime = Join-Path $extractDir 'runtime'
    if (-not (Test-Path (Join-Path $newRuntime 'package.json'))) {
        Write-Host '  Invalid zip structure, skipping.'
        Remove-Item -Recurse -Force $tempDir
        exit 0
    }

    # Atomic replacement: rename old -> move new -> delete old
    $localRuntime = Join-Path $BridgeDir 'runtime'
    $backupRuntime = Join-Path $BridgeDir 'runtime.old'

    if (Test-Path $backupRuntime) { Remove-Item -Recurse -Force $backupRuntime }
    Rename-Item -Path $localRuntime -NewName 'runtime.old'
    Move-Item -Path $newRuntime -Destination $localRuntime
    Remove-Item -Recurse -Force $backupRuntime

    # Cleanup temp
    Remove-Item -Recurse -Force $tempDir

    Write-Host "  Updated to v$remoteVer!"
}
catch {
    Write-Host "  Update check failed: $($_.Exception.Message)"
    Write-Host '  Continuing with current version...'

    # Rollback: if runtime/ was moved away but new one wasn't placed, restore backup
    $localRuntime = Join-Path $BridgeDir 'runtime'
    $backupRuntime = Join-Path $BridgeDir 'runtime.old'
    if (-not (Test-Path $localRuntime) -and (Test-Path $backupRuntime)) {
        Rename-Item -Path $backupRuntime -NewName 'runtime'
        Write-Host '  Restored previous version.'
    }

    # Clean up temp dir
    if ($tempDir -and (Test-Path $tempDir)) {
        Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
    }
}
