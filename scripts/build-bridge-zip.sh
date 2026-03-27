#!/usr/bin/env bash
# Build a portable Windows zip for the emulator bridge.
# Runs on Linux / WSL2 / CI. Produces dist/yfm-bridge-win-x64.zip.
#
# Compiles bridge/serve.ts into a standalone Windows .exe using Bun.
# No node.exe, no node_modules — just bridge.exe + update.ps1 + package.json.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$SCRIPT_DIR/.."
BRIDGE="$ROOT/bridge"
STAGE="$ROOT/dist/bridge-stage"
OUTPUT="$ROOT/dist/yfm-bridge-win-x64.zip"

# ── Stage files ───────────────────────────────────────────────────
rm -rf "$STAGE"
RT="$STAGE/runtime"
mkdir -p "$RT"

# Windows scripts need CRLF line endings — CMD misparses LF-only .bat files
cp "$BRIDGE/start-bridge.bat" "$STAGE/"
sed -i 's/\r*$/\r/' "$STAGE/start-bridge.bat"

# ── Compile bridge to standalone Windows .exe ─────────────────────
echo "Compiling bridge.exe..."
bun build "$BRIDGE/serve.ts" --compile --target=bun-windows-x64 --outfile "$RT/bridge.exe"

cp "$BRIDGE/update.ps1" "$RT/"
sed -i 's/\r*$/\r/' "$RT/update.ps1"

# package.json is kept in runtime/ for the auto-updater to read the version
cp "$BRIDGE/package.json" "$RT/"

# ── Create zip ────────────────────────────────────────────────────
mkdir -p "$(dirname "$OUTPUT")"
rm -f "$OUTPUT"
if command -v zip >/dev/null 2>&1; then
  (cd "$STAGE" && zip -r "$OUTPUT" .)
else
  # Fallback for systems without zip (e.g. WSL2 minimal)
  ABS_OUTPUT="$(cd "$(dirname "$OUTPUT")" && pwd)/$(basename "$OUTPUT")"
  (cd "$STAGE" && python3 -c "
import zipfile, os
with zipfile.ZipFile('$ABS_OUTPUT', 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk('.'):
        for f in files:
            path = os.path.join(root, f)
            zf.write(path)
")
fi

echo ""
echo "Built: $OUTPUT"
echo "Size:  $(du -h "$OUTPUT" | cut -f1)"
