# Agent Game Control via Bridge

**Status:** IN PROGRESS
**Goal:** Enable AI agents (LLMs) to control the PS1 game through the existing bridge, for automated testing, data collection, and gameplay analysis.

---

## Architecture

```
AI Agent (LLM tool use / script)
  → WebSocket command (e.g. {type:"input", button:"cross"})
  → Bridge Server (serve.ts)
  → vigem-subprocess.ts → vigem-helper.ps1 (persistent subprocess)
  → .NET ViGEmClient → ViGEmBus driver → virtual Xbox 360 controller
  → DuckStation (XInput polling, fully focus-free)
  → PS1 game (responds to controller input)
  → RAM state updates
  → Bridge reads RAM (50ms poll)
  → State broadcast back to agent via WebSocket
```

### Input Method: ViGEm Virtual Controller (Focus-Free)

**Primary:** Virtual Xbox 360 controller via ViGEmBus driver + .NET ViGEmClient.
Fully focus-free — DuckStation reads XInput regardless of which window is focused.
The `vigem-helper.ps1` subprocess is spawned lazily on first input and kept alive
to avoid the ~3s controller detection delay.

**Fallback:** `keybd_event` via user32.dll (stealth focus approach) remains in
`input.ts` but is no longer used by `serve.ts` for game inputs.

### Save State Loading: Hotkey Patching

Patch DuckStation's `settings.ini` to bind `LoadGameState1`–`LoadGameState8` to
specific virtual keys, then simulate those keys via keybd_event (stealth focus).

**Save state creation is strictly blocked** — no SaveGameState bindings, no F2 key.

---

## Modules

### 1. `bridge/vigem-subprocess.ts` — Persistent Virtual Controller

- Spawns `bridge/debug/vigem-helper.ps1` as a long-lived subprocess
- Communicates via stdin/stdout ("tap cross\n" → "ok\n")
- Lazy spawn on first input command; auto-restarts on crash
- 4s detection delay on fresh spawn (DuckStation needs time to detect controller)
- `tap(button, holdMs?)`, `press(button)`, `release(button)`, `releaseAll()`

### 2. `bridge/input.ts` — Keyboard Input (Save State Loading Only)

- FFI bindings: `keybd_event`, `SetForegroundWindow` via user32.dll
- HWND lookup via PowerShell `(Get-Process -Id $pid).MainWindowHandle`
- PS1 button → VK code mapping (reads DuckStation settings.ini)
- Used only for `loadState(hwnd, slot)` via hotkey simulation
- Blocked key validation (F2 = save state explicitly blocked)

### 3. `bridge/settings.ts` — Extended Hotkey Patching

Add `[Hotkeys] LoadGameState1 = Keyboard/F5` through `LoadGameState8 = Keyboard/F12`
to settings.ini, alongside existing ExportSharedMemory patching.

### 4. `bridge/serve.ts` — WebSocket Command Handlers

Message types:
- `{type: "input", button: "cross", hold?: 100}` → tap/hold via ViGEm (focus-free)
- `{type: "loadState", slot: 1}` → load save state via keyboard hotkey

Safety: reject any message that would trigger save operations.

### 5. `bridge/agent-client.ts` — Agent Client Library

Standalone async client for AI agents:
- `connect(url)` / `disconnect()`
- `tap(button)` / `hold(button, ms)` — send controller input
- `interact(button, timeout)` — tap + wait for state change (core feedback loop)
- `loadState(slot)` — load save state
- `waitForPhase(phase, timeout)` — wait until duel phase changes
- `waitFor(predicate, timeout)` — wait until state matches condition

---

## PS1 Button Mapping

| PS1 Button | DuckStation Default Key | VK Code |
|------------|----------------------|---------|
| D-Pad Up | W | 0x57 |
| D-Pad Down | S | 0x53 |
| D-Pad Left | A | 0x41 |
| D-Pad Right | D | 0x44 |
| Cross (X) | Numpad 2 | 0x62 |
| Circle | Numpad 6 | 0x66 |
| Square | Numpad 4 | 0x64 |
| Triangle | Numpad 8 | 0x68 |
| L1 | Q | 0x51 |
| R1 | E | 0x45 |
| L2 | 1 | 0x31 |
| R2 | 3 | 0x33 |
| Start | Enter | 0x0D |
| Select | Backspace | 0x08 |

## Safety

- **No save state creation** — SaveGameState hotkeys are never bound
- **No in-game save** — no high-level "save" command is provided
- **Blocked VK codes** — F2 (default save state key) is explicitly blocked
- **Command validation** — unknown message types are rejected
