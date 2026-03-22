#!/usr/bin/env bash
# Build a portable Windows zip for the emulator bridge.
# Runs on Linux / WSL2 / CI. Produces dist/yfm-bridge-win-x64.zip.
set -euo pipefail

NODE_VERSION="22.17.0"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$SCRIPT_DIR/.."
BRIDGE="$ROOT/bridge"
STAGE="$ROOT/dist/bridge-stage"
OUTPUT="$ROOT/dist/yfm-bridge-win-x64.zip"
CACHE="$ROOT/.cache"
NODE_EXE="$CACHE/node-v${NODE_VERSION}-win-x64.exe"

# ── Download node.exe (cached) ────────────────────────────────────
mkdir -p "$CACHE"
if [ ! -f "$NODE_EXE" ]; then
  echo "Downloading node.exe v${NODE_VERSION}..."
  curl -fSL "https://nodejs.org/dist/v${NODE_VERSION}/win-x64/node.exe" -o "$NODE_EXE"
else
  echo "Using cached node.exe v${NODE_VERSION}"
fi

# ── Install bridge dependencies ───────────────────────────────────
echo "Installing bridge dependencies..."
(cd "$BRIDGE" && npm install --ignore-scripts)

# ── Stage files ───────────────────────────────────────────────────
# Only start-bridge.bat at root; everything else in runtime/
rm -rf "$STAGE"
RT="$STAGE/runtime"
mkdir -p "$RT"

cp "$BRIDGE/start-bridge.bat" "$STAGE/"
cp "$NODE_EXE" "$RT/node.exe"
cp "$BRIDGE/serve.mjs" "$RT/"
cp "$BRIDGE/memory.mjs" "$RT/"
cp "$BRIDGE/package.json" "$RT/"

# ── Copy trimmed node_modules ─────────────────────────────────────
# ws: pure JS, copy everything
mkdir -p "$RT/node_modules/ws"
cp -r "$BRIDGE/node_modules/ws/"* "$RT/node_modules/ws/"

# koffi: only index.js, indirect.js, package.json, and win32_x64 native binary
KOFFI_SRC="$BRIDGE/node_modules/koffi"
KOFFI_DST="$RT/node_modules/koffi"
mkdir -p "$KOFFI_DST/build/koffi/win32_x64"
cp "$KOFFI_SRC/package.json" "$KOFFI_DST/"
cp "$KOFFI_SRC/index.js" "$KOFFI_DST/"

# koffi may have indirect.js in some versions
if [ -f "$KOFFI_SRC/indirect.js" ]; then
  cp "$KOFFI_SRC/indirect.js" "$KOFFI_DST/"
fi

# Copy the Windows x64 native binary
if [ -f "$KOFFI_SRC/build/koffi/win32_x64/koffi.node" ]; then
  cp "$KOFFI_SRC/build/koffi/win32_x64/koffi.node" "$KOFFI_DST/build/koffi/win32_x64/"
else
  echo "ERROR: koffi win32_x64 native binary not found."
  echo "       Run 'npm install' in bridge/ on a system that downloads all platform binaries."
  exit 1
fi

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
