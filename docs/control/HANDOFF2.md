# Agent Game Control — Handoff #2

> Written 2026-03-31 end of session. Continue from here.

## Objective

Enable AI agents to autonomously play Yu-Gi-Oh! Forbidden Memories (Remastered Perfected mod) through the bridge — read state, send inputs, win duels.

## Current Duel State

- **Phase 5** (field view), **player's turn**
- **LP: 3000 / 4600** — player behind but field is much stronger
- **Player field (4 active + 1 face-down)**:
  - [0] Great Shogun Shien (5000/4900)
  - [1] Great Shogun Shien (5500/5400) — equipped
  - [2] The Executioner (4800/4700)
  - [3] Cosmo Queen (5400/4950)
  - [4] Axe of Despair — face-down on rightmost slot (just placed)
- **Opponent field (4)**: Gearfried (1800), #40 (1700), Arcana Knight Joker (3800), #257 (2000)
- **Player hand (5)**: Bright Castle (equip), Kazejin (2400), Sanga (2600), Axe of Despair (equip), #403 (3100)
- **Cursor is currently on the face-down Axe of Despair** on field slot 4
- The game is waiting for the player to choose what to do (attack, fuse, or end turn)

## What Works

### Input Method: ViGEm Virtual Controller
- **ViGEmBus driver v1.22.0** installed and running on this machine
- **.NET ViGEm client DLL** at `%TEMP%\ViGEmClient\lib\netstandard2.0\Nefarius.ViGEm.Client.dll`
- **DuckStation XInput bindings** patched in `settings.ini`: `Cross = Keyboard/X & XInput-0/A` etc.
- **`XInput = true`** in `[InputSources]` section
- **Keyboard input does NOT work** — tried `keybd_event`, `SendInput`, `SendKeys`, all fail silently. Only ViGEm XInput works.

### Persistent ViGEm Server
- **`bridge/debug/vigem-server.cjs`** running on **port 7777** (localhost)
- Keeps vigem-helper.ps1 alive — no plug/unplug per command, no 5s detection delay
- Send commands: `echo "tap cross" | nc 127.0.0.1 7777` → receives `ok`
- From node: `net.connect(7777)` → write `tap <button>\n` → read `ok\n`
- **Must be started manually**: `node bridge/debug/vigem-server.cjs`
- To stop: send `shutdown` command

### Bridge
- Started with `bun bridge` or directly via `.cache/bun-1.3.4-win-x64/bun.exe run bridge/serve.ts`
- From WSL2, connect to **`ws://172.28.48.1:3333`** (Windows host IP depends on the machine, NOT localhost)
- **`readMem` command added**: `{type:"readMem", offset: 0x09b338, length: 4}` → returns hex dump of PS1 RAM

### Screenshot Capture
- **`bridge/debug/take-screenshot.ps1`** — uses `PrintWindow` with `PW_RENDERFULLCONTENT=2`
- **Does NOT steal focus** — captures DuckStation behind other windows
- Fails if DuckStation is **minimized** (returns tiny/empty image)
- Run: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$(wslpath -w .../take-screenshot.ps1)"`
- Saves to `bridge/debug/screenshot.png`

## Duel Flow (Discovered)

```
Phase 4 (HAND_SELECT)
  - Top-down field overview, hand cards at bottom
  - left/right: navigate hand cursor
  - cross: select highlighted hand card → field placement
  - Field placement sub-screen:
    - left/right: toggle face-up / face-down
    - cross: confirm → places card (or goes to guardian star select for monsters)
    - circle: cancel back to hand
  - Phase 7: "SELECT A GUARDIAN" — choose guardian star, cross to confirm
  - Phase 8 → Phase 5: card placed on field

Phase 5 (FIELD VIEW)
  - Shows player's field with cursor
  - left/right: navigate field cards
  - cross on a field card: selects it → view switches to opponent's field
    - This is ATTACK TARGET selection (or equip target if card was equip)
    - left/right: navigate opponent's field slots
    - cross: attack/equip that target → Phase 9 (BATTLE)
  - start: END TURN (skips battle!)
  - Each monster CAN attack (not limited to one per turn) — but I haven't
    figured out how to initiate multiple attacks yet

Phase 9 (BATTLE)
  - Attack animation plays, damage calculated
  - Returns to Phase 5 after resolution

Phase 10 (POST_BATTLE) → opponent's turn → back to Phase 4
```

### Key Nuance: Equip Cards
When you play an equip card from hand, the game places it face-down on an empty field slot. Then in phase 5, the cursor lands on it and you press cross to select which monster to equip it to. This looks like the same "attack target selection" flow but applies the equip instead.

## RAM Addresses

### Bridge Already Reads
- `0x09b23a` — duelPhase (uint8)
- `0x09b1d5` — turnIndicator (0=player, 1=opponent)
- `0x1a7ae4` — player hand base (5 × 0x1c bytes)
- `0x1a7b70` — player field base (5 × 0x1c bytes)
- `0x0e9f..` — LP, fusion counter, etc.

### Discovered
- `0x09b338` (uint16 LE) — card ID under cursor. **Confirmed working in phase 5 field view** (navigating left/right shows matching field card IDs). In phase 4 hand select, values sometimes don't match the hand — possibly reads from a different internal card list. Needs more investigation.

### Not Yet Found
- **Cursor slot index** (0-4) — searched full 2MB RAM with diff technique (snapshot → press → snapshot → find changes). Found 61 candidates with diff=1 reversal pattern, but none cleanly tracked slot position across multiple presses. The cursor position might be stored as screen coordinates or a pointer, not a simple index.
- **Sub-phase / UI state** — no address found to distinguish "equip target selection" from "attack target selection" within phase 5.

## Files Created/Modified

### New Debug Tools
- `bridge/debug/vigem-server.cjs` — persistent ViGEm TCP server
- `bridge/debug/take-screenshot.ps1` — PrintWindow screenshot (no focus steal)
- `bridge/debug/interact.cjs` — one-shot button sender with bridge state
- `bridge/debug/play.cjs` — autonomous player attempt (NOT working well, too blind)

### Modified
- `bridge/serve.ts` — added `readMem` WebSocket command
- `bridge/vigem-subprocess.ts` — new module (persistent subprocess manager, tested, 12 tests pass)
- `bridge/agent-client.ts` — added `interact()` method (tested, 15 tests pass)

### New Docs
- `docs/control/GAME-FLOW.md` — detailed game flow learnings
- `docs/control/HANDOFF2.md` — this file

### Removed
- `bridge/vigem.ts` — dead code (direct IOCTL approach, never worked)

### Note on serve.ts
- The `input` handler was **reverted to keyboard approach** (tapButton/holdButton from input.ts) because ViGEm wasn't installed when the vigem-subprocess integration was first attempted. The keyboard approach returns `success:true` but **doesn't actually work** with this DuckStation. The vigem-subprocess.ts module exists and is tested but is NOT wired into serve.ts — input goes through the standalone vigem-server.cjs instead.
- To use the bridge's `input` command with ViGEm: wire vigem-subprocess back into serve.ts's `handleInputMessage` (but only after verifying ViGEm works on the target machine).

## Immediate Next Steps

1. **Learn the attack flow properly** — In phase 5, pressing cross on a field card enters target selection on opponent's side. But I haven't successfully initiated multiple attacks in one turn. Each monster should be able to attack. Experiment one primitive at a time: select monster → cross → navigate opponent → cross → observe.

2. **Fix cursor tracking** — The `0x09b338` card ID readback works for field navigation but not reliably for hand select. Either find the actual cursor index address, or use `0x09b338` only in phase 5 and fall back to counting from edge in phase 4.

3. **Win the duel** — With 5000+ ATK monsters vs opponent's 3800 max, winning should be straightforward once multiple attacks work. Destroy all opponent monsters, then direct attacks reduce LP to 0.

4. **Revert port to 3333** — After rebooting (clears ghost TCP), change `serve.ts` line 76 back to `3333`.

## Approaches That Don't Work

| Approach | Result |
|----------|--------|
| keybd_event to DuckStation | Returns success but game doesn't respond |
| SendInput to DuckStation | Same — DuckStation ignores synthetic keyboard |
| SendKeys to DuckStation | Same |
| Direct IOCTL to ViGEmBus (vigem.ts) | ERROR_NOT_SUPPORTED, deleted |
| Blind button-spamming scripts | Miss equip targets, can't navigate reliably |
| Assuming cursor starts at slot 0 | It doesn't — cursor position persists between phases |

## Environment Notes

- WSL2 Ubuntu, DuckStation runs on Windows side
- Bridge runs via Windows bun.exe (`.cache/bun-1.3.4-win-x64/bun.exe`)
- Watch script: `bun bridge` (starts watcher that spawns Windows bun.exe)
- Windows host IP from WSL2: `172.28.48.1` (from `ip route show default`)
- DuckStation settings: `C:\Users\archi\OneDrive\Documents\DuckStation\settings.ini`
- DuckStation exe: `C:\jeux\ps1\duckstation\duckstation-qt-x64-ReleaseLTCG.exe`
- No portable.txt — standard Documents-based config
