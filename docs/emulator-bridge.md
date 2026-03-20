# Emulator Bridge: Real-Time Hand Detection

Read the player's 5-card hand from DuckStation during a duel, and feed it to the webapp.

## Context

- **Emulator**: DuckStation, running on **Windows**
- **Game**: Yu-Gi-Oh! Forbidden Memories — Remastered Perfected mod (NTSC-U base: SLUS-01411)
- **Dev environment**: WSL2 (Vite dev server, Bun)
- **Browser**: Windows (connects to both the webapp and the bridge)

---

## Knowledge Base

### PS1 RAM Layout During a Duel

The PS1 has 2 MB of RAM (physical: `0x000000`–`0x1FFFFF`). PS1 addresses use KSEG0 mapping (`0x80XXXXXX`), so address `0x801A7AE4` corresponds to RAM offset `0x1A7AE4`.

#### Hand Card Addresses

Source: [Yu-Gi-Oh-Follow-Memories](https://github.com/luispaulomr/Yu-Gi-Oh-Follow-Memories) (`CModGame.h` / `CModGame.cpp`)

Each card slot is a **28-byte (0x1C) struct**. The card ID is a **2-byte uint16 LE** at the start of each struct.

| Slot | PS1 Address    | RAM Offset   |
|------|---------------|-------------|
| Hand Card 1 | `0x801A7AE4` | `0x1A7AE4` |
| Hand Card 2 | `0x801A7B00` | `0x1A7B00` |
| Hand Card 3 | `0x801A7B1C` | `0x1A7B1C` |
| Hand Card 4 | `0x801A7B38` | `0x1A7B38` |
| Hand Card 5 | `0x801A7B54` | `0x1A7B54` |

Card IDs are **1-indexed** — they directly match this project's card IDs (1..722). Value `0` likely means empty slot.

#### Card Struct Layout (28 bytes) — reverse-engineered via live analysis

| Offset | Size | Description |
|--------|------|-------------|
| +0x00 | 2 bytes | Card ID (uint16 LE, 1-indexed, matches project's card DB) |
| +0x02 | 2 bytes | ATK value |
| +0x04 | 2 bytes | DEF value |
| +0x06 | 5 bytes | Unknown (always 0 in observed data) |
| +0x0B | 1 byte | Status flags (see below) |
| +0x0C | 1 byte | Slot index |
| +0x0D | 3 bytes | Padding / unknown |
| +0x10 | 4 bytes | Link pointer — non-zero when card consumed as fusion material |
| +0x14 | 4 bytes | UI/visual data pointer |
| +0x18 | 4 bytes | Unknown |

**Status flags byte (+0x0B):**
- `0x80` (bit 7): card is present in zone
- `0x10` (bit 4): card is transitioning (being played from hand to field)
- `0x04` (bit 2): face-up on field

**A card is "in hand" when all three are true:**
1. `(status & 0x80) !== 0` — present
2. `(status & 0x10) === 0` — not transitioning to field
3. Not consumed as fusion material (see below)

**linkPtr caveat — stale data on slot reuse:**
The game does NOT clear linkPtr when drawing a new card into a reused slot. A freshly drawn card can inherit a non-zero linkPtr from the previous occupant. The bridge uses **stateful per-slot tracking** to distinguish genuine consumption from stale data:
- Track whether each slot's card was ever seen with `linkPtr === 0` ("clean").
- Only mark consumed if the card was previously clean and linkPtr became non-zero while the card ID stayed the same.
- If the card ID changed (new card drawn), reset tracking — the linkPtr is stale.

#### Field Cards (Monsters on Table)

Base: `0x801A7B70` (RAM offset `0x1A7B70`), same 0x1C stride. 5 slots.

| Slot | PS1 Address    | RAM Offset   |
|------|---------------|-------------|
| Field Card 1 | `0x801A7B70` | `0x1A7B70` |
| Field Card 2 | `0x801A7B8C` | `0x1A7B8C` |
| Field Card 3 | `0x801A7BA8` | `0x1A7BA8` |
| Field Card 4 | `0x801A7BC4` | `0x1A7BC4` |
| Field Card 5 | `0x801A7BE0` | `0x1A7BE0` |

#### Other Useful Addresses

| RAM Offset | Size | Description |
|-----------|------|-------------|
| `0x0EA004` | 2 bytes | Player 1 Life Points (actual) |
| `0x0EA024` | 2 bytes | Player 2 Life Points (actual) |
| `0x09B361` | 1 byte | Opponent/Duelist ID |
| `0x09B364` | 1 byte | Terrain type (0=Normal..6=Dark) |
| `0x09B26C` | ? | Scene ID (0x2C3 = Duel) |
| `0x177FE8` | 80 bytes | Player's shuffled deck (40 × 2-byte card IDs) |
| `0x178038` | 80 bytes | CPU's shuffled deck (40 × 2-byte card IDs) |
| `0x1D0200` | 80 bytes | Player's deck definition (40 × 2-byte card IDs) |
| `0x1D0250` | 722 bytes | Cards in chest (collection) |
| `0x0FE6F8` | 4 bytes | PRNG seed |
| `0x0EA118` | 2 bytes | Result of a fusion |

### Remastered Perfected Mod

The mod patches data tables (fusions, card stats, drop lists) in ROM, not the engine's duel state management in RAM. The hand/field card addresses should be unchanged. **This needs verification** — if the addresses don't work, we'll scan for them manually with DuckStation's memory scanner.

### DuckStation Shared Memory Feature

Setting: `ExportSharedMemory = true` under `[Hacks]` in DuckStation's `settings.ini`.

On **Windows**, this creates a named file mapping: `duckstation_{pid}`.

Layout of the shared memory region:
- Offset `0x000000`: PS1 RAM (2 MB for standard, 8 MB if extended RAM enabled)
- Offset `0x800000`: BIOS (512 KB)

To read hand card 1, read uint16 LE at shared memory offset `0x1A7AE4`.

Source: [DuckStation bus.cpp](https://github.com/stenzek/duckstation/blob/master/src/core/bus.cpp), [memmap.cpp](https://github.com/stenzek/duckstation/blob/master/src/common/memmap.cpp), [bus.h](https://github.com/stenzek/duckstation/blob/master/src/core/bus.h).

---

## Suggested Solution

### Architecture

```
DuckStation (Windows)
    │ shared memory (named file mapping: duckstation_{pid})
    ▼
Bridge process (Windows, Node.js)
    │ reads RAM via Windows API (OpenFileMappingW + MapViewOfFile)
    │ polls every ~200ms
    │ serves WebSocket on localhost:3333
    ▼
Browser (Windows)
    │ connects to bridge WS at ws://localhost:3333
    │ connects to webapp at http://localhost:5173 (Vite in WSL2)
    ▼
React app
    │ receives hand card IDs via WebSocket
    │ displays cards, runs fusion analysis
```

### Bridge Process (Windows)

A small Node.js script that:
1. Finds DuckStation's PID (via `tasklist` or user-provided)
2. Opens the named shared memory `duckstation_{pid}` using Windows API
3. Reads the 5 hand card uint16 values every ~200ms
4. Broadcasts changes over WebSocket to connected clients

**Tech choice**: Node.js with `koffi` (zero-compilation FFI for Node.js) to call `OpenFileMappingW` and `MapViewOfFile`. No native addons to compile. Alternatively, use `node-ffi-napi`.

The bridge runs on Windows because it needs access to the Windows shared memory. It can be launched from WSL2 via `node.exe bridge/serve.mjs` (WSL2 can invoke Windows executables).

### React Integration

A custom hook `useEmulatorBridge()` that:
- Connects to `ws://localhost:3333`
- Receives hand card IDs as JSON
- Returns `{ hand: CardId[], connected: boolean, inDuel: boolean }`

---

## Alternatives & Fallbacks

### If shared memory doesn't work

**Alternative A: ReadProcessMemory**
Instead of shared memory, use Windows `ReadProcessMemory` API to read DuckStation's process memory directly. This doesn't require any DuckStation setting, but:
- Need to find the base address of PS1 RAM within DuckStation's address space
- The base address changes each launch (ASLR)
- Would need to scan for a known pattern to find the RAM base

**Alternative B: DuckStation's GDB stub**
DuckStation has a GDB-compatible debug interface. Could connect via GDB protocol to read memory. Heavyweight but doesn't require shared memory.

### If the RAM addresses are wrong (Remastered Perfected mod)

1. **Use DuckStation's memory scanner**: Start a duel, look at your hand, search for known card IDs in RAM. The scanner is built into DuckStation (Debug > Memory Scanner).
2. **Known card test**: Put a card with a unique ID in your deck, start a duel, search for that ID in RAM.
3. **Compare with base game**: Test addresses with the unmodded game first, then verify with the mod.

### If polling is too slow

- Reduce poll interval to 50–100ms
- Use `koffi` with a persistent mapped view (no repeated open/close)
- The mapped view stays live — just re-read the bytes

### If Node.js + koffi doesn't work on Windows

- **Python bridge**: `ctypes` + `websockets` — Python is often pre-installed or easy to get on Windows
- **Compiled bridge**: A small Rust/Go/C binary that reads shared memory and serves WebSocket. More setup but zero runtime dependencies.

---

## Sources & References

| Source | What it provides |
|--------|-----------------|
| [Yu-Gi-Oh-Follow-Memories (GitHub)](https://github.com/luispaulomr/Yu-Gi-Oh-Follow-Memories) | Hand card RAM offsets, card struct stride (0x1C), field card offsets |
| [Data Crystal — FM RAM map](https://datacrystal.tcrf.net/wiki/Yu-Gi-Oh!_Forbidden_Memories/RAM_map) | Life points, PRNG, deck, collection, duelist ID, terrain |
| [Data Crystal — FM ROM map](https://datacrystal.tcrf.net/wiki/Yu-Gi-Oh!_Forbidden_Memories/ROM_map) | Function addresses, asset layout |
| [Data Crystal — FM Notes](https://datacrystal.tcrf.net/wiki/Yu-Gi-Oh!_Forbidden_Memories/Notes) | Terrain types, card types, menu IDs |
| [FM-Online (GitHub)](https://github.com/mateusfavarin/FM-Online) | Scene IDs, turn indicator, additional duel addresses |
| [FM-Lockout (GitHub)](https://github.com/Raikaru13/Forbidden-Memories-Lockout) | Spoils/reward addresses, rank value |
| [DuckStation source — bus.cpp](https://github.com/stenzek/duckstation/blob/master/src/core/bus.cpp) | Shared memory creation, RAM layout |
| [DuckStation source — memmap.cpp](https://github.com/stenzek/duckstation/blob/master/src/common/memmap.cpp) | Platform-specific shared memory (shm_open / CreateFileMappingW) |
| [DuckStation source — bus.h](https://github.com/stenzek/duckstation/blob/master/src/core/bus.h) | RAM size constants (2MB/8MB) |
| [DuckStation commit 843e111](https://github.com/stenzek/duckstation/commit/843e111) | Fixed shm_unlink timing for external access on Linux |
| [koffi (npm)](https://koffi.dev/) | Zero-compilation FFI for Node.js — call Windows APIs from JS |
| [Brazilian PEC Codes](https://yugiohforbiddenmemoriesdicascheats.blogspot.com/2016/06/codigos-pec.html) | Field card ATK at +0x02, opponent suppression addresses |

---

## Implementation Steps

### Step 1: Bridge process (Windows-side)
- Node.js script using `koffi` to read DuckStation shared memory
- WebSocket server on localhost:3333
- Broadcasts `{ hand: number[], field: number[], lp: [number, number], inDuel: boolean }` on change

### Step 2: React hook
- `useEmulatorBridge()` hook connecting to the bridge WebSocket
- Reconnection logic, connection status

### Step 3: UI integration
- Show detected hand cards in the Hand Fusion Calculator tab
- Auto-populate the 5-card hand input
- Show connection status indicator

### Step 4: Verification & tuning
- Test with actual game running
- Verify addresses work with Remastered Perfected mod
- Adjust poll rate if needed
