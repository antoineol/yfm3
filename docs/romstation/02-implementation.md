# Romstation Support — Step 2: Implementation

## Prerequisites

- **Step 1 completed:** [01-investigation.md](01-investigation.md) must have all findings filled in.
- Read the findings before starting — every section below has conditional logic based on them.

## Background

The existing bridge connects to DuckStation via Windows shared memory. Romstation is a launcher that spawns DuckStation as a child process. Step 1 investigated how Romstation's DuckStation differs from a standalone install. This step implements the necessary changes.

### Reference: DuckStation-specific touchpoints

| # | Area | File(s) | Current behavior |
|---|------|---------|-----------------|
| 1 | Process discovery | `bridge/memory.ts:478–494` | `tasklist /FI "IMAGENAME eq duckstation*"` |
| 2 | Shared memory name | `bridge/memory.ts:496–513` | Opens `duckstation_{pid}` |
| 3 | settings.ini location | `bridge/settings.ts:83–111` | Checks `Documents\DuckStation` and `%LOCALAPPDATA%\DuckStation` |
| 4 | Game directory scan | `bridge/game-data.ts:151–170` | Reads `[GameList] RecursivePaths` from settings.ini |
| 5 | Restart emulator | `bridge/serve.ts:552–614` | Kills DuckStation PID and relaunches exe |
| 6 | UI setup guide | `src/ui/features/bridge/BridgeSetupGuide.tsx` | DuckStation-only instructions |
| 7 | UI constants | `src/ui/features/bridge/bridge-constants.ts` | `DUCKSTATION_URL` only |
| 8 | Status messages | `bridge/serve.ts:487–527` | "DuckStation not found" etc. |
| 9 | start-bridge.bat | `bridge/start-bridge.bat` | Mentions "Open DuckStation" |

## Implementation tasks

### A. Bridge: process discovery

**If finding 1 shows process name matches `duckstation*`:** no change needed.

**If it doesn't match:**
- In `bridge/memory.ts`, update `findDuckStationPids()` to also search for the Romstation process name.
- Consider renaming to `findEmulatorPids()` for clarity.
- The `tasklist` filter can be extended: run two queries or use a broader filter.

### B. Bridge: settings.ini path

**If finding 3 shows settings.ini is at a new path:**
- In `bridge/settings.ts`, add the Romstation path to `findDuckStationDataDir()`.
- If portable mode (`portable.txt` present): resolve the DuckStation exe location from the running process PID (via `Get-Process -Id $pid | Select Path`), then look for `settings.ini` next to it.
- Search order: standalone paths first (most common), then Romstation/portable paths.

**If finding 3 shows settings.ini is in the same location as standalone:** no change needed.

### C. Bridge: game data / disc image discovery

**If finding 4 shows ROM is passed via CLI arg:**
- The bridge could read the command line of the DuckStation process to extract the ROM path directly.
- This would be more reliable than scanning `[GameList] RecursivePaths` anyway.
- Implementation: `wmic process where "ProcessId=<pid>" get CommandLine` or PowerShell equivalent.
- Fall back to existing gamelist scan if CLI arg is not found.

**If finding 4 shows gamelist is configured:** no change needed.

**If finding 4 shows neither works:**
- Consider prompting the user for the ROM path via the UI.

### D. Bridge: restart behavior

**If finding 5 shows restart works fine:** no change needed.

**If Romstation interferes with restart:**
- Option A: Detect Romstation is the parent process and disable the restart button.
- Option B: Send a warning message to the UI: "Restart may not work when launched from Romstation."
- Detection: check if the DuckStation process has a parent named `RomStation.exe` (via `wmic process where "ProcessId=<pid>" get ParentProcessId`, then resolve parent name).

### E. Bridge: status messages

Make user-facing messages emulator-agnostic:
- "DuckStation not found" → "Emulator not found" (or "DuckStation / Romstation not found")
- "restart DuckStation" → "restart the emulator"
- Only change messages that users see via WebSocket status. Internal logs can stay DuckStation-specific.

### F. UI: setup guide

In `src/ui/features/bridge/BridgeSetupGuide.tsx` and `src/ui/features/bridge/setup-steps.tsx`:
- Add a toggle or auto-detection for "I use Romstation" vs "I use DuckStation directly."
- Romstation variant:
  - Skip "Download DuckStation" step (Romstation manages it).
  - Replace "Open DuckStation" with "Launch the game from Romstation."
  - Shared memory step stays the same (may need manual enable in DuckStation settings accessed via Romstation).
  - Skip or adapt "Load the game in DuckStation" step.
- DuckStation variant: unchanged from today.

### G. UI: constants

In `src/ui/features/bridge/bridge-constants.ts`:
- Add `ROMSTATION_URL = "https://www.romstation.fr"` if we link to it from the setup guide.

### H. start-bridge.bat

- Add a line mentioning Romstation as an alternative: "Make sure DuckStation or Romstation is running."

### I. Tests

- Update `tests/bridge/settings.test.ts` if settings path logic changed.
- Update `src/ui/features/bridge/BridgeSetupGuide.test.tsx` if setup guide gained Romstation variant.
- Manual end-to-end test: Romstation → game running → bridge connects → hand detection → collection sync.

## Task order

1. **A + B** (process discovery + settings path) — these are the critical path; do them first.
2. **C** (game data) — only if finding 4 requires it.
3. **D** (restart) — only if finding 5 requires it.
4. **E + H** (status messages + bat file) — quick text changes.
5. **F + G** (UI setup guide) — most visible change, do last so bridge works first.
6. **I** (tests) — alongside each change above.
