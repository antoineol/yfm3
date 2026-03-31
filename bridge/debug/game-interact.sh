#!/bin/bash
## Quick game interaction: send one button, get state + screenshot.
## Usage: ./game-interact.sh [button]    (button = cross, circle, up, down, etc. or "none")
##
## Expects vigem-helper.ps1 running with a named pipe.
## If no vigem helper is running, starts one.

BUTTON="${1:-none}"
SCREENSHOT="/tmp/ds_screenshot.png"
VIGEM_FIFO="/tmp/vigem_input"
VIGEM_PID_FILE="/tmp/vigem_helper.pid"
HELPER_SCRIPT="$(dirname "$0")/vigem-helper.ps1"
WIN_HELPER=$(wslpath -w "$HELPER_SCRIPT")

# ── Ensure vigem-helper is running ─────────────────────────────
if [ ! -p "$VIGEM_FIFO" ] || ! kill -0 "$(cat "$VIGEM_PID_FILE" 2>/dev/null)" 2>/dev/null; then
    rm -f "$VIGEM_FIFO"
    mkfifo "$VIGEM_FIFO"
    # Start helper, reading from the fifo
    tail -f "$VIGEM_FIFO" | powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$WIN_HELPER" > /tmp/vigem_output 2>/tmp/vigem_err &
    echo $! > "$VIGEM_PID_FILE"
    echo "Started vigem-helper (PID $(cat $VIGEM_PID_FILE)). Waiting for controller detection..."
    sleep 5
fi

# ── Send input ─────────────────────────────────────────────────
if [ "$BUTTON" != "none" ]; then
    echo "tap $BUTTON" > "$VIGEM_FIFO"
    sleep 0.5
fi

# ── Read bridge state ──────────────────────────────────────────
bun.exe -e '
const ws = new WebSocket("ws://localhost:3333");
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.type === "gameData") return;
  if (msg.connected !== undefined) {
    const phase = msg.duelPhase;
    const turn = msg.turnIndicator === 1 ? "OPP" : "PLR";
    const lp = msg.lp || [0,0];
    const hand = msg.hand.filter(c => c.cardId > 0).map(c => `id=${c.cardId} atk=${c.atk}`).join(", ");
    const field = msg.field.filter(c => c.cardId > 0).map(c => `id=${c.cardId} atk=${c.atk}`).join(", ");
    const oppField = msg.opponentField.filter(c => c.cardId > 0).map(c => `id=${c.cardId} atk=${c.atk}`).join(", ");
    console.log(`phase=${phase} turn=${turn} LP=${lp[0]}/${lp[1]}`);
    console.log(`hand: ${hand || "(empty)"}`);
    console.log(`field: ${field || "(empty)"}`);
    console.log(`oppField: ${oppField || "(empty)"}`);
    ws.close();
    process.exit(0);
  }
};
setTimeout(() => process.exit(1), 3000);
'

# ── Capture screenshot ─────────────────────────────────────────
powershell.exe -NoProfile -Command "
Add-Type -AssemblyName System.Windows.Forms, System.Drawing
Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class WR { [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L,T,R,B; } [DllImport(\"user32.dll\")] public static extern bool GetWindowRect(IntPtr h, out RECT r); }'
\$p = Get-Process duckstation* -EA SilentlyContinue | Select -First 1
if (\$p) {
    \$r = New-Object WR+RECT
    [WR]::GetWindowRect(\$p.MainWindowHandle, [ref]\$r) | Out-Null
    \$w = \$r.R - \$r.L; \$h = \$r.B - \$r.T
    if (\$w -gt 0) {
        \$b = New-Object Drawing.Bitmap(\$w, \$h)
        \$g = [Drawing.Graphics]::FromImage(\$b)
        \$g.CopyFromScreen(\$r.L, \$r.T, 0, 0, (New-Object Drawing.Size(\$w, \$h)))
        \$g.Dispose()
        \$b.Save('\\\\wsl.localhost\\Ubuntu${SCREENSHOT}', [Drawing.Imaging.ImageFormat]::Png)
        \$b.Dispose()
    }
}" 2>/dev/null

echo "Screenshot: $SCREENSHOT"
