# Agent Game Control via Bridge

**Status:** IN PROGRESS
**Goal:** Enable AI agents (LLMs) to control the PS1 game through the existing bridge, for automated testing, data collection, and gameplay analysis.

---

## Architecture

```
AI Agent (LLM tool use / script)
  → WebSocket command (e.g. {type:"input", button:"cross"})
  → Bridge Server (serve.ts)
  → user32.dll PostMessage (simulates keypress to HWND, no focus needed)
  → DuckStation (Qt event loop processes WM_KEYDOWN)
  → PS1 game (responds to controller input)
  → RAM state updates
  → Bridge reads RAM (50ms poll)
  → State broadcast back to agent via WebSocket
```

### Input Method: PostMessage to DuckStation HWND

**Primary:** `PostMessage(hwnd, WM_KEYDOWN/WM_KEYUP, vkCode, lParam)` via user32.dll FFI.
No window focus required — key messages are posted directly to DuckStation's message queue.

**Fallback:** `SendInput` via user32.dll (requires `SetForegroundWindow` first).
Used if PostMessage doesn't work with DuckStation's Qt input handling.

### Save State Loading: Hotkey Patching

Patch DuckStation's `settings.ini` to bind `LoadGameState1`–`LoadGameState8` to
specific virtual keys, then simulate those keys via PostMessage.

**Save state creation is strictly blocked** — no SaveGameState bindings, no F2 key.

---

## Modules

### 1. `bridge/input.ts` — Input Infrastructure

- FFI bindings: `PostMessageW`, `SendInput`, `SetForegroundWindow`, `MapVirtualKeyW`
- HWND lookup via PowerShell `(Get-Process -Id $pid).MainWindowHandle`
- PS1 button → VK code mapping (DuckStation default keyboard bindings)
- lParam construction for WM_KEYDOWN / WM_KEYUP
- `tapButton(hwnd, button, holdMs)`, `holdButton(hwnd, button, durationMs)`
- Blocked key validation (prevent save-related keys)

### 2. `bridge/settings.ts` — Extended Hotkey Patching

Add `[Hotkeys] LoadGameState1 = Keyboard/F5` through `LoadGameState8 = Keyboard/F12`
to settings.ini, alongside existing ExportSharedMemory patching.

### 3. `bridge/serve.ts` — WebSocket Command Handlers

New message types:
- `{type: "input", button: "cross", hold?: 100}` → tap/hold a PS1 button
- `{type: "loadState", slot: 1}` → load save state by slot
- `{type: "getState"}` → request current game state immediately

Safety: reject any message that would trigger save operations.

### 4. `bridge/agent-client.ts` — Agent Client Library

Standalone async client for AI agents:
- `connect(url)` / `disconnect()`
- `tap(button)` / `hold(button, ms)` — send controller input
- `loadState(slot)` — load save state
- `waitForPhase(phase, timeout)` — wait until duel phase changes
- `waitFor(predicate, timeout)` — wait until state matches condition
- `getState()` — get current snapshot

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
