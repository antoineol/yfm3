# Agent Game Control — Handoff Document

> Updated 2026-03-31.

## Objective

Enable AI agents (LLMs) to control the PS1 game (Yu-Gi-Oh! Forbidden Memories, RomStation mod) through the bridge, for automated testing/data collection. Agents can do all normal gameplay except saving.

## What Was Built

### New Files
- **`bridge/vigem-subprocess.ts`** — Persistent ViGEm helper subprocess manager. Spawns `vigem-helper.ps1` lazily on first input, keeps it alive to avoid 3s detection delay. Communicates via stdin/stdout. Auto-restarts on crash. 12 tests.
- **`bridge/input.ts`** — PS1 button→VK code mapping, `keybd_event` + stealth focus. Reads key bindings from DuckStation's `settings.ini`. Now used only for `loadState()` (save state loading via hotkeys).
- **`bridge/agent-client.ts`** — WebSocket client for agents: `tap()`, `hold()`, `interact()` (tap + wait for state change), `loadState()`, `waitForPhase()`, `waitFor()`, `onStateChange()`. 15 tests.
- **`bridge/debug/vigem-helper.ps1`** — PowerShell script using .NET `Nefarius.ViGEm.Client` to create a virtual Xbox 360 controller. Reads commands from stdin. **Working.**
- **`bridge/debug/game-interact.ps1`** — Single-shot interaction tool.
- **`bridge/debug/play-duel.ts`** — Duel bot demo using vigem-helper subprocess.
- **`bridge/debug/setup-vigem.ps1`** — One-command ViGEmBus installer + DuckStation XInput binding patcher.
- **`tests/bridge/vigem-subprocess.test.ts`** — 12 tests for subprocess manager.
- **`tests/bridge/settings-hotkeys.test.ts`** — 8 tests for `patchLoadStateHotkeys`.
- **`tests/bridge/agent-client.test.ts`** — 15 tests for agent client (including `interact`).
- **`docs/steps/agent-game-control.md`** — Architecture doc (updated).

### Modified Files
- **`bridge/settings.ts`** — Added `patchLoadStateHotkeys()` and `ensureLoadStateHotkeys()`.
- **`bridge/serve.ts`** — Input commands use ViGEm subprocess (focus-free). LoadState still uses keyboard hotkeys. Destroys vigem subprocess on shutdown.
- **`docs/PLAN.md`** — Added Agent Game Control entry.

### Removed Files
- **`bridge/vigem.ts`** — Dead code. Direct ViGEmBus IOCTL approach didn't work (ERROR_NOT_SUPPORTED). Replaced by vigem-subprocess.ts + vigem-helper.ps1.

## What Works

### ViGEm Virtual Controller (Integrated)
- ViGEmBus driver v1.22.0 is **installed and running**.
- `bridge/serve.ts` now uses `vigem-subprocess.ts` which manages a **persistent** `vigem-helper.ps1` child process.
- Subprocess is spawned lazily on first `{type: "input"}` WebSocket message.
- 4s detection delay on first spawn only; subsequent inputs are immediate.
- **Fully focus-free** — no window flicker, no keyboard stealing.
- **Confirmed working**: sent Cross via ViGEm → game phase changed.

### Agent Feedback Loop
- `agent-client.ts` provides `interact(button)` — taps a button and waits for the game state to change, returning the new state. This is the core agent interaction pattern.

### DuckStation XInput Configuration
- `[InputSources] XInput = true` is enabled.
- Pad1 bindings use dual format: `Cross = Keyboard/X & XInput-0/A`.
- User's keyboard controls still work alongside ViGEm.

### Bridge State Reading
- Bridge WebSocket at `ws://localhost:3333` provides full duel state.
- Accessible from WSL2 via `bun.exe`.

## Known Limitations

### 1. DuckStation Must Not Be Minimized
XInput polling stops when DuckStation is minimized. Works fine when behind other windows.

### 2. Screenshots
- For duels, screenshots aren't needed — bridge state gives full visibility.
- If needed: use DuckStation's F10 hotkey or read VRAM from shared memory.

## Architecture

```
AI Agent (Claude)
  → WebSocket command: {type:"input", button:"cross"}
  → Bridge Server (serve.ts)
  → vigem-subprocess.ts (manages persistent child process)
  → vigem-helper.ps1 stdin: "tap cross\n" → stdout: "ok\n"
  → .NET ViGEmClient → ViGEmBus driver → virtual Xbox 360 controller
  → DuckStation (XInput polling) → PS1 game
  → RAM state updates → Bridge reads RAM (50ms poll)
  → State broadcast back to agent via WebSocket
```

## Key Technical Details

### DuckStation Setup (RomStation / Portable Mode)
- Exe: `C:\RomStation\app\emulators\downloads\DuckStation\files\DuckStation 0.1-8675 (x64)\duckstation-qt-x64-ReleaseLTCG.exe`
- Settings: `<exe_dir>\settings.ini` (portable mode, detected by `portable.txt`)
- Controller: `Type = AnalogController` in `[Pad1]`
- Window structure: RomStation manages DS. `MainWindowHandle` is a tiny 158x26 window. The actual game window is a child (1280x745) found via `EnumWindows` by PID.

### Keyboard Bindings (User's Custom)
```
Cross=X, Circle=D, Square=Q, Triangle=Z
Up/Down/Left/Right = Arrow keys
Start=S, Select=F, L1=A, R1=E, L2=W, R2=C
```

### XInput Bindings (Added for ViGEm)
```
Cross=XInput-0/A, Circle=XInput-0/B, Square=XInput-0/X, Triangle=XInput-0/Y
D-pad=XInput-0/DPadUp|Down|Left|Right
Start=XInput-0/Start, Select=XInput-0/Back
L1/R1=XInput-0/LeftShoulder|RightShoulder
L2/R2=XInput-0/+LeftTrigger|+RightTrigger
```

### Bridge State Fields (During Duel)
```
duelPhase: 1=INIT, 2=CLEANUP, 3=DRAW, 4=HAND_SELECT, 5=FIELD, 7=FUSION, 8=FUSION_RESOLVE, 9=BATTLE, 10=POST_BATTLE, 12=DUEL_END, 13=RESULTS
turnIndicator: 0=player, 1=opponent
lp: [playerLP, opponentLP]
hand[]: {cardId, atk, def, status}  (status 0x80=present)
field[]: same
opponentHand[]/opponentField[]: same
```

### Running Windows Commands from WSL2
```bash
bun.exe -e '...'                    # Run JS on Windows Bun
powershell.exe -NoProfile -Command '...'  # Run PowerShell
wslpath -w /path                    # Convert WSL→Windows path
```

## Immediate Next Steps

1. **Test on Windows** — Start DuckStation + bridge, verify that ViGEm input works end-to-end through the bridge. The subprocess should spawn on first input command and stay alive. Try: `wscat -c ws://localhost:3333` then send `{"type":"input","button":"cross"}`.

2. **Play a duel via agent** — Use `agent-client.ts` `interact()` loop to play through a duel interactively, verifying the full feedback loop works.

3. **Build an MCP tool or CLI** — Expose `interact` as a tool that an AI agent can call, returning structured game state (phase, hand, field, LP) for decision-making.

## Approaches Tried and Failed

| Approach | Result |
|----------|--------|
| PostMessage WM_KEYDOWN to main HWND | No effect — Qt doesn't process posted key events without focus |
| PostMessage to child windows | No effect — same reason |
| SendInput / keybd_event without focus | Requires focused window, input goes to wrong app |
| keybd_event + stealth focus (Alt trick) | **Works** but causes visible focus flicker on every input |
| Direct IOCTL to ViGEmBus (`vigem.ts`) | ERROR_NOT_SUPPORTED — driver GUID/protocol differs from docs. **Deleted.** |
| RAM pad buffer write | Couldn't find pad buffer — PS1 pad is I/O-mapped, not in 2MB RAM |
| ViGEm via .NET NuGet | **Works** — **now integrated into bridge** via persistent subprocess |
