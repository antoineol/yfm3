##
## Single-shot game interaction: send button(s), return state + screenshot.
##
## Usage:
##   powershell -File game-interact.ps1 -Buttons "cross"
##   powershell -File game-interact.ps1 -Buttons "cross,cross,cross"
##   powershell -File game-interact.ps1 -Buttons "none"            # observe only
##   powershell -File game-interact.ps1 -Buttons "cross" -NoScreenshot
##
## Outputs state summary to stderr, screenshot path to stderr.
## Outputs raw bridge JSON to stdout.
##

param(
    [string]$Buttons = "none",
    [string]$ScreenshotPath = "\\wsl.localhost\Ubuntu\tmp\ds_screenshot.png",
    [switch]$NoScreenshot
)

$ErrorActionPreference = "Stop"

# ── ViGEm ────────────────────────────────────────────────────────
$dll = Join-Path $env:TEMP "ViGEmClient\lib\netstandard2.0\Nefarius.ViGEm.Client.dll"
Add-Type -Path $dll -ErrorAction SilentlyContinue

$client = New-Object Nefarius.ViGEm.Client.ViGEmClient
$ctrl = $client.CreateXbox360Controller()
$ctrl.Connect()
Start-Sleep -Seconds 3

$btnType = [Nefarius.ViGEm.Client.Targets.Xbox360.Xbox360Button]
$btnMap = @{
    "cross"=$btnType::A; "circle"=$btnType::B; "square"=$btnType::X; "triangle"=$btnType::Y
    "up"=$btnType::Up; "down"=$btnType::Down; "left"=$btnType::Left; "right"=$btnType::Right
    "start"=$btnType::Start; "select"=$btnType::Back
    "l1"=$btnType::LeftShoulder; "r1"=$btnType::RightShoulder
}

# ── Send inputs ──────────────────────────────────────────────────
if ($Buttons -ne "none") {
    foreach ($b in ($Buttons -split ',')) {
        $b = $b.Trim().ToLower()
        $btn = $btnMap[$b]
        if ($btn) {
            $ctrl.SetButtonState($btn, $true)
            Start-Sleep -Milliseconds 80
            $ctrl.SetButtonState($btn, $false)
            Start-Sleep -Milliseconds 250
            [Console]::Error.WriteLine("Pressed: $b")
        }
    }
    Start-Sleep -Milliseconds 300
}

# ── Screenshot ───────────────────────────────────────────────────
if (-not $NoScreenshot) {
    Add-Type -AssemblyName System.Drawing
    if (-not ([System.Management.Automation.PSTypeName]"WinCapture2").Type) {
        Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System; using System.Runtime.InteropServices; using System.Drawing;
public class WinCapture2 {
    [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L,T,R,B; }
    [DllImport("user32.dll")] public static extern bool GetClientRect(IntPtr h, out RECT r);
    [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr hdc, uint flags);

    public static Bitmap Capture(IntPtr hwnd) {
        RECT r; GetClientRect(hwnd, out r);
        int w = r.R - r.L, h = r.B - r.T;
        if (w <= 0 || h <= 0) return null;
        var bmp = new Bitmap(w, h);
        using (var g = Graphics.FromImage(bmp)) {
            IntPtr hdc = g.GetHdc();
            PrintWindow(hwnd, hdc, 2);
            g.ReleaseHdc(hdc);
        }
        return bmp;
    }
}
"@
    }

    $p = Get-Process duckstation* -EA SilentlyContinue | Select-Object -First 1
    if ($p -and $p.MainWindowHandle -ne [IntPtr]::Zero) {
        $bmp = [WinCapture2]::Capture($p.MainWindowHandle)
        if ($bmp) {
            $bmp.Save($ScreenshotPath, [System.Drawing.Imaging.ImageFormat]::Png)
            $bmp.Dispose()
            [Console]::Error.WriteLine("screenshot=$ScreenshotPath")
        }
    }
}

# ── Bridge state ─────────────────────────────────────────────────
Add-Type -TypeDefinition @"
using System; using System.Net.WebSockets; using System.Text; using System.Threading;
public class QB {
    public static string Read(string url, int ms) {
        var ws = new ClientWebSocket();
        ws.ConnectAsync(new Uri(url), CancellationToken.None).GetAwaiter().GetResult();
        var buf = new byte[65536];
        var cts = new CancellationTokenSource(ms);
        try {
            while (!cts.IsCancellationRequested) {
                var r = ws.ReceiveAsync(new ArraySegment<byte>(buf), cts.Token).GetAwaiter().GetResult();
                var m = Encoding.UTF8.GetString(buf, 0, r.Count);
                if (m.Contains("duelPhase") && !m.Contains("\"type\"")) {
                    try { ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "", CancellationToken.None).Wait(1000); } catch {}
                    return m;
                }
            }
        } catch {}
        return "{}";
    }
}
"@ -ErrorAction SilentlyContinue

$json = [QB]::Read("ws://localhost:3333", 3000)
Add-Type -AssemblyName System.Web.Extensions -ErrorAction SilentlyContinue
$ser = New-Object System.Web.Script.Serialization.JavaScriptSerializer
$s = $ser.DeserializeObject($json)

if ($s -and $s["duelPhase"] -ne $null) {
    $turn = if ($s["turnIndicator"] -eq 1) {"OPP"} else {"PLR"}
    $lp = $s["lp"]
    $hand = ($s["hand"] | Where-Object { $_["cardId"] -gt 0 } | ForEach-Object { "id=$($_['cardId'])_atk=$($_['atk'])" }) -join " "
    $field = ($s["field"] | Where-Object { $_["cardId"] -gt 0 } | ForEach-Object { "id=$($_['cardId'])_atk=$($_['atk'])" }) -join " "
    $opp = ($s["opponentField"] | Where-Object { $_["cardId"] -gt 0 } | ForEach-Object { "id=$($_['cardId'])_atk=$($_['atk'])" }) -join " "
    [Console]::Error.WriteLine("phase=$($s['duelPhase']) turn=$turn LP=$($lp[0])/$($lp[1])")
    [Console]::Error.WriteLine("hand: $hand")
    [Console]::Error.WriteLine("field: $field")
    [Console]::Error.WriteLine("oppField: $opp")
}

# ── Cleanup ──────────────────────────────────────────────────────
$ctrl.Disconnect()
$client.Dispose()
