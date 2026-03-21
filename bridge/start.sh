#!/usr/bin/env bash
# Start the bridge via Windows node.exe with proper Ctrl+C handling.
# WSL2 doesn't propagate SIGINT to Windows processes, so we trap it
# and use taskkill.exe to stop node.exe.

set -e
cd "$(dirname "$0")"

PORT="${BRIDGE_PORT:-3333}"

# Kill ghost bridge process on the port, or fail if port is taken by something else
GHOST_PID=$(netstat.exe -ano 2>/dev/null \
  | grep "LISTENING" \
  | grep ":${PORT} " \
  | awk '{print $NF}' \
  | head -1 \
  | tr -d '\r')
if [ -n "$GHOST_PID" ] && [ "$GHOST_PID" != "0" ]; then
  GHOST_NAME=$(tasklist.exe /FI "PID eq $GHOST_PID" /FO CSV /NH 2>/dev/null \
    | head -1 | tr -d '\r' | cut -d'"' -f2)
  if [ "$GHOST_NAME" = "node.exe" ]; then
    echo "Port $PORT held by ghost node.exe (PID $GHOST_PID) — killing..."
    if taskkill.exe /F /T /PID "$GHOST_PID" > /dev/null 2>&1; then
      echo "Killed ghost node.exe (PID $GHOST_PID)"
    else
      echo "Warning: failed to kill ghost node.exe (PID $GHOST_PID)" >&2
    fi
    sleep 1
  else
    echo "Error: port $PORT already in use by $GHOST_NAME (PID $GHOST_PID)" >&2
    exit 1
  fi
else
  echo "Port $PORT is free"
fi

# Install deps via Windows npm (needs pushd for UNC path)
cmd.exe /c "pushd $(wslpath -w .) && npm install --prefer-offline 2>nul && popd"

# ── Watch & restart ────────────────────────────────────────────────
# node.exe --watch uses Windows fs.watch which can't see changes on
# the WSL2 filesystem.  Instead we watch from the Linux side with
# inotifywait (instant) or a polling fallback, and restart node.exe.

NODE_PID=""

start_bridge() {
  node.exe serve.mjs &
  NODE_PID=$!
}

stop_bridge() {
  # Find the Windows PID of node.exe listening on our port.
  # $NODE_PID ($!) is a WSL-side PID — taskkill.exe needs the Windows PID.
  local win_pid
  win_pid=$(netstat.exe -ano 2>/dev/null \
    | grep "LISTENING" \
    | grep ":${PORT} " \
    | awk '{print $NF}' \
    | head -1 \
    | tr -d '\r')
  if [ -n "$win_pid" ] && [ "$win_pid" != "0" ]; then
    if taskkill.exe /F /T /PID "$win_pid" > /dev/null 2>&1; then
      echo "Killed node.exe on port $PORT (Windows PID $win_pid)"
    else
      echo "Warning: taskkill failed for Windows PID $win_pid on port $PORT" >&2
    fi
    sleep 1
  else
    echo "Warning: no process found listening on port $PORT — nothing to kill" >&2
  fi
  # Clean up WSL-side interop process
  if [ -n "$NODE_PID" ]; then
    kill "$NODE_PID" 2>/dev/null || true
    wait "$NODE_PID" 2>/dev/null || true
    NODE_PID=""
  fi
}

cleanup() { stop_bridge; }
trap cleanup INT TERM HUP EXIT

start_bridge

if command -v inotifywait > /dev/null 2>&1; then
  # Fast path: inotify (instant reload)
  while inotifywait -qq -e modify,create,moved_to --include '\.mjs$' .; do
    echo "File changed — restarting bridge..."
    stop_bridge
    start_bridge
  done
else
  # Fallback: poll modification times every 2s
  last_hash=$(stat -c '%Y' ./*.mjs 2>/dev/null | md5sum)
  while true; do
    sleep 2
    curr_hash=$(stat -c '%Y' ./*.mjs 2>/dev/null | md5sum)
    if [ "$curr_hash" != "$last_hash" ]; then
      echo "File changed — restarting bridge..."
      last_hash="$curr_hash"
      stop_bridge
      start_bridge
    fi
  done
fi
