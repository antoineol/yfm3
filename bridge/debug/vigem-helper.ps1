##
## ViGEm input helper — reads button commands from stdin, sends via virtual controller.
##
## Commands (one per line):
##   press <button>       — press and hold a button
##   release <button>     — release a button
##   tap <button> [ms]    — press, wait, release (default 80ms)
##   wait <ms>            — sleep for N milliseconds
##   releaseall           — release all buttons
##   quit                 — disconnect and exit
##
## Buttons: a b x y start back up down left right lb rb lt rt
##

param(
    [switch]$Interactive
)

$ErrorActionPreference = "Stop"

# Load ViGEm .NET client
$dll = Join-Path $env:TEMP "ViGEmClient\lib\netstandard2.0\Nefarius.ViGEm.Client.dll"
if (-not (Test-Path $dll)) {
    Write-Error "ViGEm client DLL not found at $dll. Run setup-vigem.ps1 first."
    exit 1
}
Add-Type -Path $dll

$client = New-Object Nefarius.ViGEm.Client.ViGEmClient
$ctrl = $client.CreateXbox360Controller()
$ctrl.Connect()
[Console]::Error.WriteLine("vigem-helper: controller connected")

# Button name mapping
$btnType = [Nefarius.ViGEm.Client.Targets.Xbox360.Xbox360Button]
$buttons = @{
    "a" = $btnType::A; "b" = $btnType::B
    "x" = $btnType::X; "y" = $btnType::Y
    "start" = $btnType::Start; "back" = $btnType::Back
    "up" = $btnType::Up; "down" = $btnType::Down
    "left" = $btnType::Left; "right" = $btnType::Right
    "lb" = $btnType::LeftShoulder; "rb" = $btnType::RightShoulder
}

# PS1 button aliases
$ps1Aliases = @{
    "cross" = "a"; "circle" = "b"; "square" = "x"; "triangle" = "y"
    "select" = "back"; "l1" = "lb"; "r1" = "rb"
}

function ResolveButton($name) {
    $n = $name.ToLower()
    if ($ps1Aliases.ContainsKey($n)) { $n = $ps1Aliases[$n] }
    if ($buttons.ContainsKey($n)) { return $buttons[$n] }
    return $null
}

function ProcessCommand($line) {
    $parts = $line.Trim() -split '\s+'
    if ($parts.Length -eq 0 -or $parts[0] -eq '') { return $true }

    switch ($parts[0].ToLower()) {
        "press" {
            $btn = ResolveButton $parts[1]
            if ($btn) {
                $ctrl.SetButtonState($btn, $true)
                if ($parts[1] -eq "lt") { $ctrl.SetSliderValue([Nefarius.ViGEm.Client.Targets.Xbox360.Xbox360Slider]::LeftTrigger, 255) }
                if ($parts[1] -eq "rt") { $ctrl.SetSliderValue([Nefarius.ViGEm.Client.Targets.Xbox360.Xbox360Slider]::RightTrigger, 255) }
            }
        }
        "release" {
            $btn = ResolveButton $parts[1]
            if ($btn) {
                $ctrl.SetButtonState($btn, $false)
                if ($parts[1] -eq "lt") { $ctrl.SetSliderValue([Nefarius.ViGEm.Client.Targets.Xbox360.Xbox360Slider]::LeftTrigger, 0) }
                if ($parts[1] -eq "rt") { $ctrl.SetSliderValue([Nefarius.ViGEm.Client.Targets.Xbox360.Xbox360Slider]::RightTrigger, 0) }
            }
        }
        "tap" {
            $btn = ResolveButton $parts[1]
            $ms = if ($parts.Length -ge 3) { [int]$parts[2] } else { 80 }
            if ($btn) {
                $ctrl.SetButtonState($btn, $true)
                Start-Sleep -Milliseconds $ms
                $ctrl.SetButtonState($btn, $false)
            }
        }
        "wait" {
            $ms = [int]$parts[1]
            Start-Sleep -Milliseconds $ms
        }
        "releaseall" {
            $ctrl.ResetReport()
            $ctrl.SubmitReport()
        }
        "quit" {
            return $false
        }
        default {
            [Console]::Error.WriteLine("vigem-helper: unknown command: $($parts[0])")
        }
    }

    # Echo back for synchronization
    Write-Host "ok"
    return $true
}

# Main loop: read commands from stdin
try {
    if ($Interactive) {
        Write-Host "Interactive mode. Type commands:"
    }
    while ($true) {
        $line = [Console]::In.ReadLine()
        if ($null -eq $line) { break }
        $continue = ProcessCommand $line
        if (-not $continue) { break }
    }
} finally {
    $ctrl.Disconnect()
    $client.Dispose()
    [Console]::Error.WriteLine("vigem-helper: disconnected")
}
