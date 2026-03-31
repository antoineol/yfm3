# Agent Game Control — Handoff Document

> Context dump for continuing this work on another machine. Written 2026-03-31.

## Objective

Enable AI agents (LLMs) to control the PS1 game (Yu-Gi-Oh! Forbidden Memories, RomStation mod) through the bridge, for automated testing/data collection. Agents can do all normal gameplay except saving.

## What Was Built

### New Files
- **`bridge/input.ts`** — PS1 button→VK code mapping, `keybd_event` + stealth focus approach (works but causes flicker). Reads key bindings from DuckStation's `settings.ini` at runtime. Exports `tapButton`, `holdButton`, `loadState`, `findMainWindowHandle`.
- **`bridge/vigem.ts`** — Direct ViGEmBus driver communication via `DeviceIoControl` FFI. Creates virtual Xbox 360 controller. **NOT WORKING** — the IOCTL codes don't match this driver version (error 50 = NOT_SUPPORTED).
- **`bridge/agent-client.ts`** — WebSocket client for agents: `tap()`, `hold()`, `loadState()`, `waitForPhase()`, `waitFor()`, `onStateChange()`. Tested with mock WebSocket (13 tests pass).
- **`bridge/debug/vigem-helper.ps1`** — PowerShell script that uses the .NET `Nefarius.ViGEm.Client` NuGet package to create a virtual Xbox 360 controller. Reads commands from stdin (`tap a`, `press up`, `release up`, `wait 500`, `quit`). **THIS WORKS** — the .NET library handles driver version differences.
- **`bridge/debug/game-interact.ps1`** — Single-shot interaction tool: send button(s), capture state + screenshot. Has screenshot issues (see below).
- **`bridge/debug/play-duel.ts`** — Duel bot attempt (bun.exe script). Spawns vigem-helper as subprocess. Not fully working.
- **`bridge/debug/play-duel.ps1`** — PowerShell duel bot. Blocks on WebSocket reads.
- **`bridge/debug/setup-vigem.ps1`** — One-command ViGEmBus installer + DuckStation XInput binding patcher.
- **`tests/bridge/settings-hotkeys.test.ts`** — 8 tests for `patchLoadStateHotkeys`.
- **`tests/bridge/agent-client.test.ts`** — 13 tests for agent client.
- **`docs/steps/agent-game-control.md`** — Architecture doc (partially outdated now).

### Modified Files
- **`bridge/settings.ts`** — Added `patchLoadStateHotkeys()` and `ensureLoadStateHotkeys()` for binding F5–F12 → LoadGameState1–8.
- **`bridge/serve.ts`** — Added `input` and `loadState` WebSocket message handlers. Imports from `input.ts`, tracks `dsHwnd`, calls `loadBindings()` on connect. Resets `dsHwnd` on disconnect.
- **`docs/PLAN.md`** — Added Agent Game Control entry.

## What Works

### ViGEm Virtual Controller (via .NET)
- ViGEmBus driver v1.22.0 is **installed and running** (`sc query ViGEmBus` → RUNNING).
- The .NET library (`Nefarius.ViGEm.Client` NuGet, cached at `%TEMP%\ViGEmClient\lib\netstandard2.0\Nefarius.ViGEm.Client.dll`) **successfully creates virtual controllers**.
- `vigem-helper.ps1` connects, sends button presses, and DuckStation receives them.
- **Confirmed working**: sent Cross (A button) via ViGEm → game phase changed from 4 (HAND_SELECT) to 8 (FUSION_RESOLVE).

### DuckStation XInput Configuration
- `[InputSources] XInput = true` is enabled.
- Pad1 bindings use dual format: `Cross = Keyboard/X & XInput-0/A` (both keyboard and XInput work simultaneously).
- User's keyboard controls still work alongside ViGEm.

### Bridge State Reading
- Bridge WebSocket at `ws://localhost:3333` provides full duel state: phase, LP, hand, field, opponent field, deck, rank counters, etc.
- Accessible from WSL2 via `bun.exe` (Windows Bun at `/mnt/c/Users/archi/.bun/bin/bun.exe`).
- All 897 tests pass (`bun typecheck`, `bun lint`, `bun run test` all green).

## What Doesn't Work / Blockers

### 1. ViGEm Controller Detection Delay
DuckStation needs **~3 seconds** after the ViGEm controller connects before it starts polling it. Each `vigem-helper.ps1` invocation creates a new controller → 3s startup tax every time. **Solution needed**: keep the controller alive persistently (long-running process, or integrate into the bridge).

### 2. DuckStation Must Not Be Minimized
XInput polling stops when DuckStation is minimized. It works fine when behind other windows — just not minimized to taskbar.

### 3. Screenshots
- `PrintWindow` returns black for GPU-rendered DuckStation content.
- `CopyFromScreen` captures whatever is at the screen coordinates (wrong if DS is behind other windows).
- **Best approach**: use DuckStation's built-in screenshot hotkey (F10 → saves to `screenshots/` folder), or read VRAM from shared memory.
- For duels, screenshots aren't strictly needed — bridge state gives full visibility.

### 4. `bridge/vigem.ts` (Direct IOCTL) Doesn't Work
The installed ViGEmBus driver uses GUID `{96e42b22-f5e9-42f8-b043-ed0f932f014f}` (different from the documented `{96E42B22-...-7DE2}`). My IOCTL codes return ERROR_NOT_SUPPORTED (50). The .NET library works because it handles version differences internally. **Recommendation**: abandon the direct IOCTL approach, use the .NET library via a persistent PowerShell/C# helper process.

### 5. Bridge Input Commands Use Old Approach
`bridge/serve.ts` calls `input.ts` which uses `keybd_event` + stealth focus. This works but causes focus flicker. Should be replaced with ViGEm. The bridge needs a persistent ViGEm controller subprocess.

## Architecture Recommendation

```
AI Agent (Claude)
  ↓ calls game-interact tool
  ↓
Bridge WebSocket ← reads state (phase, LP, hand, field...)
  +
ViGEm Helper (persistent subprocess)
  ↓ stdin commands: "tap cross", "wait 300"
  ↓
.NET ViGEmClient → ViGEmBus driver → virtual Xbox 360 controller
  ↓
DuckStation (XInput polling) → PS1 game
```

The ViGEm helper should be a **long-running process** to avoid the 3s detection delay. Options:
1. Integrate into bridge (spawn `vigem-helper.ps1` as child process, keep alive)
2. Standalone daemon that the interact tool connects to
3. Rewrite in C# as a compiled helper with named pipe or TCP

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

1. **Make ViGEm helper persistent** — integrate `vigem-helper.ps1` into the bridge as a long-lived subprocess. Bridge spawns it on first `input` command, keeps it alive, pipes commands via stdin. This eliminates the 3s delay per input.

2. **Build the interactive feedback loop** — a tool/script that: (a) sends one button press via the persistent helper, (b) waits ~300ms, (c) reads bridge state, (d) returns structured data to the agent. The agent decides what to do next.

3. **Test by finishing a duel** — use the feedback loop interactively (agent judgment, not a script) to verify everything works end-to-end.

4. **Clean up** — remove dead code paths (direct IOCTL in vigem.ts, keybd_event in input.ts), update architecture doc, ensure tests pass.

## Approaches Tried and Failed

| Approach | Result |
|----------|--------|
| PostMessage WM_KEYDOWN to main HWND | No effect — Qt doesn't process posted key events without focus |
| PostMessage to child windows | No effect — same reason |
| SendInput / keybd_event without focus | Requires focused window, input goes to wrong app |
| keybd_event + stealth focus (Alt trick) | **Works** but causes visible focus flicker on every input |
| Direct IOCTL to ViGEmBus | ERROR_NOT_SUPPORTED — driver GUID/protocol differs from docs |
| RAM pad buffer write | Couldn't find pad buffer — PS1 pad is I/O-mapped, not in 2MB RAM |
| ViGEm via .NET NuGet | **Works** — the recommended approach |
