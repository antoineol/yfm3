##
## Autonomous duel player — finishes an ongoing duel via ViGEm + bridge state.
##
## Usage: powershell -ExecutionPolicy Bypass -File bridge\debug\play-duel.ps1
##

$ErrorActionPreference = "Stop"

# ── Load ViGEm ───────────────────────────────────────────────────
$dll = Join-Path $env:TEMP "ViGEmClient\lib\netstandard2.0\Nefarius.ViGEm.Client.dll"
Add-Type -Path $dll
$client = New-Object Nefarius.ViGEm.Client.ViGEmClient
$ctrl = $client.CreateXbox360Controller()
$ctrl.Connect()
Write-Host "[vigem] Controller connected. Waiting for DuckStation to detect it..."
Start-Sleep -Seconds 3

# ── Button helper ────────────────────────────────────────────────
$btnType = [Nefarius.ViGEm.Client.Targets.Xbox360.Xbox360Button]
$btnMap = @{
    "cross" = $btnType::A; "circle" = $btnType::B
    "square" = $btnType::X; "triangle" = $btnType::Y
    "up" = $btnType::Up; "down" = $btnType::Down
    "left" = $btnType::Left; "right" = $btnType::Right
    "start" = $btnType::Start; "select" = $btnType::Back
    "l1" = $btnType::LeftShoulder; "r1" = $btnType::RightShoulder
}

function Tap($button, $holdMs = 80) {
    $btn = $btnMap[$button]
    if (-not $btn) { Write-Host "[ERROR] Unknown button: $button"; return }
    $ctrl.SetButtonState($btn, $true)
    Start-Sleep -Milliseconds $holdMs
    $ctrl.SetButtonState($btn, $false)
    Start-Sleep -Milliseconds 150
}

# ── Bridge state reader ──────────────────────────────────────────
Add-Type -TypeDefinition @"
using System;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

public class BridgeReader {
    private ClientWebSocket ws;
    private string lastState;

    public async Task Connect(string url) {
        ws = new ClientWebSocket();
        await ws.ConnectAsync(new Uri(url), CancellationToken.None);
    }

    public async Task<string> ReadState() {
        var buf = new byte[65536];
        while (true) {
            var result = await ws.ReceiveAsync(new ArraySegment<byte>(buf), CancellationToken.None);
            var msg = Encoding.UTF8.GetString(buf, 0, result.Count);
            if (!msg.Contains("gameData") && msg.Contains("duelPhase")) {
                lastState = msg;
                return msg;
            }
        }
    }

    public string LastState { get { return lastState; } }

    public async Task Close() {
        if (ws != null && ws.State == WebSocketState.Open)
            await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "", CancellationToken.None);
    }
}
"@

Add-Type -AssemblyName System.Runtime.Serialization

$bridge = New-Object BridgeReader
$bridge.Connect("ws://localhost:3333").GetAwaiter().GetResult()
Write-Host "[bridge] Connected"

function GetState {
    $json = $bridge.ReadState().GetAwaiter().GetResult()
    $ser = New-Object System.Web.Script.Serialization.JavaScriptSerializer
    return $ser.DeserializeObject($json)
}
Add-Type -AssemblyName System.Web.Extensions

# ── Main loop ────────────────────────────────────────────────────
$turnCount = 0
$duelOver = $false
$stuckCount = 0
$lastPhase = -1

Write-Host "[bot] Starting duel bot..."

while (-not $duelOver) {
    $state = GetState
    $phase = $state["duelPhase"]
    $turn = $state["turnIndicator"]
    $lp = $state["lp"]
    $lpStr = if ($lp) { "[LP $($lp[0]) vs $($lp[1])]" } else { "" }

    # Track stuck state
    if ($phase -eq $lastPhase) { $stuckCount++ } else { $stuckCount = 0; $lastPhase = $phase }

    # Duel ended
    if ($phase -eq 12 -or $phase -eq 13) {
        $result = if ($lp -and $lp[0] -gt $lp[1]) { "WON" } elseif ($lp -and $lp[0] -lt $lp[1]) { "LOST" } else { "DRAW" }
        Write-Host "`n=== DUEL $result! $lpStr ==="
        for ($i = 0; $i -lt 15; $i++) {
            Tap "cross"
            Start-Sleep -Milliseconds 400
        }
        $duelOver = $true
        break
    }

    # Opponent's turn — wait
    if ($turn -eq 1) {
        Start-Sleep -Milliseconds 200
        continue
    }

    # Player's turn
    switch ($phase) {
        { $_ -in 1, 2, 3 } {
            # INIT/CLEANUP/DRAW
            Tap "cross"
        }
        4 {
            # HAND_SELECT
            $turnCount++
            Write-Host "Turn $turnCount`: Hand select $lpStr"
            Tap "cross"
        }
        5 {
            # FIELD
            Write-Host "  Field: placing card"
            Tap "cross"
        }
        { $_ -in 7, 8 } {
            # FUSION
            Write-Host "  Fusion phase"
            Tap "cross"
        }
        9 {
            # BATTLE
            Write-Host "  Battle: attacking!"
            Tap "cross"
        }
        10 {
            # POST_BATTLE
            Write-Host "  Post-battle"
            Tap "cross"
        }
        default {
            Tap "cross"
        }
    }

    # If stuck for too long, try circle
    if ($stuckCount -gt 15) {
        Write-Host "  [stuck in phase $phase, trying circle]"
        Tap "circle"
        $stuckCount = 0
    }

    Start-Sleep -Milliseconds 100
}

# Cleanup
$bridge.Close().GetAwaiter().GetResult()
$ctrl.Disconnect()
$client.Dispose()
Write-Host "[bot] Done."
