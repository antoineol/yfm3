---
name: Emulator bridge architecture
description: DuckStation shared memory bridge for real-time hand detection — architecture, RAM offsets, card struct layout, and deployment details
type: project
---

Emulator bridge reads PS1 RAM from DuckStation via Windows shared memory and serves game state over WebSocket.

**Why:** The user plays FM in DuckStation on Windows while the webapp runs in WSL2. The bridge auto-detects the 5-card hand during duels and syncs it to the Hand Fusion Calculator.

**How to apply:**
- Bridge lives in `bridge/` (separate Node.js project with koffi + ws), runs on Windows
- User copies bridge to Windows game folder, runs `node serve.mjs`
- React hook `useEmulatorBridge()` connects to `ws://localhost:3333` (browser is on Windows)
- From WSL2, bridge is reachable at `ws://172.28.48.1:3333` (gateway IP)
- To restart bridge from WSL2: find PID via `cmd.exe /C "netstat -ano | findstr :3333 | findstr LISTENING"`, then `taskkill.exe /PID {pid} /F`, then `cd` to bridge folder and `cmd.exe /C "start /B node serve.mjs"`

**Key discoveries:**
- The base game's duel scene ID (0x2C3) doesn't match the Remastered Perfected mod (0x6C3). Duel detection now uses card presence instead of scene ID.
- Card struct (28 bytes at 0x1C stride): status byte at +0x0B has bit flags (0x80=present, 0x10=transitioning). Link pointer at +0x10 is non-zero when consumed as fusion material.
- The game does NOT clear linkPtr when drawing a new card into a reused slot. The bridge must track per-slot card ID history: only mark a card as consumed if it was previously seen with linkPtr=0 ("clean") and then linkPtr became non-zero while the card ID stayed the same. A changed card ID means a fresh draw with stale linkPtr.
- Three checks for "card is in hand": (1) validity bit 7 set, (2) validity bit 4 NOT set, (3) not consumed (tracked via stateful linkPtr transitions).
