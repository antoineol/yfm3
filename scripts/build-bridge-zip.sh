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
rm -rf "$STAGE"
mkdir -p "$STAGE"

cp "$NODE_EXE" "$STAGE/node.exe"
cp "$BRIDGE/serve.mjs" "$STAGE/"
cp "$BRIDGE/memory.mjs" "$STAGE/"
cp "$BRIDGE/package.json" "$STAGE/"
cp "$BRIDGE/start-bridge.bat" "$STAGE/"

# ── Copy trimmed node_modules ─────────────────────────────────────
# ws: pure JS, copy everything
mkdir -p "$STAGE/node_modules/ws"
cp -r "$BRIDGE/node_modules/ws/"* "$STAGE/node_modules/ws/"

# koffi: only index.js, indirect.js, package.json, and win32_x64 native binary
KOFFI_SRC="$BRIDGE/node_modules/koffi"
KOFFI_DST="$STAGE/node_modules/koffi"
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
(cd "$STAGE" && zip -r "$OUTPUT" .)

echo ""
echo "Built: $OUTPUT"
echo "Size:  $(du -h "$OUTPUT" | cut -f1)"
