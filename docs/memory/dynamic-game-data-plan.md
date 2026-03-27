# Dynamic Game Data Plan

In auto-sync mode, replace the static CSV extraction pipeline with live reads through the DuckStation bridge. The app discovers game data from the running emulator, adapting automatically to any game version.

## Context

The optimizer needs three data tables:

| Buffer | Purpose | Size |
|---|---|---|
| `cardAtk[id]` | Base ATK per card | 722 entries |
| `fusionTable[a*723+b]` | Fusion result lookup | 722×722 matrix |
| `equipCompat[eq*723+m]` | Equip compatibility | sparse, ~8 KB raw |

Currently these come from static CSV files pre-extracted from the disc image via `scripts/extract/`. This plan adds a second path that reads the data dynamically.

## Two data source modes

### 1. Bridge mode (dynamic, primary)

Data comes from the running game via the DuckStation bridge. No disc image pre-processing or pre-extraction needed. Adapts to any game version automatically.

### 2. Manual mode (static, fallback)

Data comes from pre-extracted CSV files. Used when no emulator / bridge is available (e.g. mobile, offline planning). The existing CSV loading code and extraction pipeline stay in place.

## Data sources

### A. PS1 RAM (via shared memory)

Some game data lives in PS1 RAM and is readable at all times via the bridge's existing shared memory mapping:

| Data | RAM address | When available |
|---|---|---|
| Card stats (ATK/DEF/GS/type) | `0x1D4244`, 722×4 B packed | Always (EXE data section) |
| Level/attribute | `0x1D5333`, 722×1 B | Always |
| Card names | `~0x1D5FC9` (PAL) / `0x1D0000`+offsets (NTSC) | Always |
| Collection | `0x1D0250`, 722 B | Always |
| Deck definition | `0x1D0200`, 40×2 B | Always |
| **Fusion table** | Dynamic address, 64 KB | **Duel only** |
| **Equip table** | Dynamic address, ~8 KB | **Duel only** |

Fusion and equip tables are loaded from CD into RAM only during duels and freed on exit. When present, they are byte-identical to the disc data and discoverable by signature scanning.

### B. Disc binary (via filesystem)

The bridge runs on the same machine as DuckStation and can find the .bin file being played:

1. Read game serial from RAM (already done by bridge)
2. Parse DuckStation's `cache/gamelist.cache` — maps serial → .cue file path
3. Read .cue file → get .bin filename
4. Read .bin directly → extract fusion/equip/starchip tables using existing ISO 9660 + WA_MRG parsing

This gives immediate access to ALL game data on bridge start, no duel needed.

**DuckStation paths** (discovered from the running installation):
- Settings: `{DuckStation}/settings.ini` → `[GameList] RecursivePaths` tells us where games live
- Game cache: `{DuckStation}/cache/gamelist.cache` — binary format, magic `HLCE`, contains `(path, serial)` entries
- CUE files reference the .bin: `FILE "Yu-Gi-Oh! Forbidden Memories (France).bin" BINARY`

**Open question: identifying the exact bin when serial is ambiguous.** Two mods can share the same game serial (e.g. two SLUS-01411 variants). DuckStation lists both and the user can run either. The serial alone isn't enough — we need a way to identify exactly which bin is loaded. See "Game identity" section below.

## Game identity

### Problem

The game serial (e.g. `SLUS_014.11`) is read from RAM and used to match entries in gamelist.cache. But two mods based on the same region (e.g. vanilla NTSC-U and RP mod) share the same serial. We need a unique identifier for the running game.

### Resolving the .bin path: serial → gamelist → gameDataHash

The bridge resolves the .bin path through DuckStation's config files:

1. **Serial from RAM** → filter `gamelist.cache` entries by serial → usually 1 match → done.
2. **If multiple matches** (same serial, different mods) → compute gameDataHash from RAM, read card stats from each candidate .bin's EXE, compare SHA-256 → the match is the running game.
3. **If all candidates have identical card stats** (exact copies) → pick any, the game data is the same.

**DuckStation files used:**
- `{DS_DATA}/cache/gamelist.cache` — maps serial → .cue path (binary format, magic `HLCE`)
- .cue file → contains .bin filename → full path resolved

**What was tested and ruled out** for disambiguation when serial + data are identical:
- Window titles: identical when user hasn't renamed games
- Command lines: identical (GUI-launched, no game argument)
- File locks: DuckStation doesn't hold locks on .bin files
- Shared memory: extends to 9 MB but contains only PS1 RAM + BIOS, no host metadata
- custom_properties.ini: only populated when user manually renames a game

None of these provide a PID → path link for identical copies. But this doesn't matter: identical copies have identical game data, so the optimizer gets the same result from any of them.

### gameDataHash (cache key)

SHA-256 of the full card stats table (2888 bytes at `0x1D4244`). This is:
- Always available (card stats are in RAM as soon as the game is loaded)
- Content-addressed: different mods produce different hashes (verified: PAL FR and RP differ on 594/722 cards)
- Used as the disk cache key — if the hash matches, the cached fusion/equip data is valid

### gamelist.cache entry structure

Discovered empirically:

| Offset | Data | Example |
|---|---|---|
| +0 | Path length (uint32) | 96 |
| +4 | .cue path (null-terminated) | `C:\perso\yfm\...\Yu-Gi-Oh! Forbidden Memories (France).cue` |
| +N | Serial length (uint32) | 10 |
| +N+4 | Serial (padded) | `SLES-03948` |
| +N+16 | 8 bytes: unknown (possibly disc hash) | |
| +N+24 | **File size** (uint64 LE) | `0x20B05750` = 548,427,600 (verified ✓) |
| +N+32 | 8 bytes: unknown | |
| +N+40 | 8 bytes: timestamp | Unix epoch |
| +N+48 | 16 bytes: hash (unknown algorithm — not MD5 of .bin) | |

## Cache and invalidation

### Invalidation triggers

In DuckStation, switching mods means closing the current game and opening a new one. Save states can't cross mods. So the game data only changes on two occasions:

1. **Bridge starts** — reads card stats, computes gameDataHash, checks against cache.
2. **Game change detected** — the bridge poll loop already detects serial changes and shared memory reconnects (DuckStation restart). Same mechanism triggers a card stats re-read and hash recompute.

When the webapp connects or reconnects, the bridge re-sends its current in-memory state. No invalidation needed — the bridge tracks game changes continuously via its poll loop.

### Disk cache

Single-entry cache. If the hash matches, valid. If not, discard and re-acquire.

File: `bridge/game-data-cache.json`

```json
{
  "gameDataHash": "82a9bbf0b5482d2f...",
  "gameSerial": "SLES_039.48",
  "capturedAt": "2026-03-27T13:21:02Z",
  "cardStats": "<base64: 2888 bytes>",
  "fusionTable": "<base64: 65536 bytes>",
  "equipTable": "<base64: ~8218 bytes>"
}
```

## Preferred flow (with .bin reading)

```
Bridge starts, game loaded
  → Read card stats from RAM → compute gameDataHash
  → Check disk cache: hash match?
    YES → load tables from cache → ready immediately
    NO  →
      → Read serial from RAM
      → Look up serial in gamelist.cache → get candidate .bin path(s)
      → If ambiguous: hash each candidate's card stats, pick the match
      → Read .bin → extract fusion/equip tables via ISO 9660 + WA_MRG parsing
      → Write disk cache
      → Ready immediately

Game change detected
  → Re-read card stats, recompute hash → same flow as above
```

No duel needed in this flow. The .bin is always readable from the filesystem.

### Fallback flow (RAM-only, if .bin not found)

If the .bin path can't be resolved (gamelist.cache missing, ambiguous entries, file moved):

```
Bridge starts, game loaded
  → Read card stats from RAM → compute gameDataHash
  → Check disk cache: hash match?
    YES → load from cache → ready
    NO  → wait for duel

Duel starts (LP > 0)
  → Scan RAM for fusion/equip table signatures → read them
  → Write disk cache → ready
```

## Bridge runtime: migrate to Bun

### Why

The extraction modules (`scripts/extract/`) are TypeScript. The bridge currently runs on Windows node.exe with koffi (native C++ addon for FFI). Moving to Bun means:
- TypeScript natively — bridge imports extraction modules directly, no duplication or transpilation
- `bun:ffi` replaces koffi — fewer dependencies, no native addon to ship
- Built-in WebSocket — drop the `ws` npm package
- `bun build --compile` — single standalone .exe for distribution (no runtime install)
- Smaller zip (no node_modules/)

### Current bridge distribution

```
yfm-bridge-win-x64.zip
├── start-bridge.bat              ← user double-clicks
└── runtime/
    ├── node.exe                  ← embedded Node.js (~70 MB)
    ├── serve.mjs, memory.mjs, settings.mjs
    ├── update.ps1                ← checks GitHub, atomically swaps runtime/
    ├── package.json
    └── node_modules/             ← koffi (native addon) + ws
```

Startup: `bat → update.ps1 (download + swap if newer) → node.exe serve.mjs`

### Option A: Embed bun.exe (drop-in replacement)

```
runtime/
├── bun.exe                       ← replaces node.exe
├── serve.ts, memory.ts, ...      ← TypeScript directly
├── update.ps1                    ← unchanged
└── (no node_modules)
```

Auto-update works identically — update.ps1 swaps `runtime/`, bat calls `bun.exe serve.ts`.

### Option B: Standalone compiled .exe

```
runtime/
├── bridge.exe                    ← single binary via bun build --compile
└── update.ps1
```

Even simpler. update.ps1 replaces one file. Works because update runs BEFORE the bridge starts (bat → update.ps1 → bridge.exe), so the .exe isn't locked during replacement.

### Risks — all validated ✓

**1. bun:ffi with kernel32.dll — WORKS ✓**

Tested: opened DuckStation shared memory, read card stats, serial, collection. Full replacement for koffi with zero issues. `toArrayBuffer(ptr, 0, size)` gives a direct `DataView` over the mapped memory — actually cleaner than koffi's per-call `decode()`.

**2. Cross-compilation — WORKS ✓**

`bun build --compile --target=bun-windows-x64` from Linux produces a working Windows .exe that successfully calls kernel32.dll via bun:ffi. CI pipeline can build the bridge from Linux.

**3. Binary sizes — comparable**

| Distribution | Size |
|---|---|
| Current: node.exe + node_modules (koffi + ws) | ~97 MB |
| Option A: embed bun.exe + .ts files | ~111 MB |
| Option B: standalone compiled .exe | ~109 MB |

Marginal difference. Option B is preferred — simpler distribution (one file), no runtime dependencies.

### Recommendation

Migrate the bridge to Bun + TypeScript using **Option B (standalone .exe)**. All risks cleared. Benefits:
- TypeScript natively — shared codebase with extraction modules
- `bun:ffi` replaces koffi — no native addon
- Built-in WebSocket — drop `ws` package
- Single .exe — simpler distribution and auto-update
- Cross-compilation works — no Windows CI needed

### koffi → bun:ffi migration surface

The bridge uses exactly 3 koffi patterns:
```js
koffi.load("kernel32.dll")            // → dlopen()
kernel32.func("void* __stdcall ...")  // → dlopen symbol definitions
koffi.decode(view, offset, "uint8")   // → new DataView(toArrayBuffer(ptr)).getUint8(offset)
```

Small surface. 5 Windows API functions total (OpenFileMappingW, MapViewOfFile, UnmapViewOfFile, CloseHandle, GetLastError).

## Implementation steps

### Step 0: Migrate bridge to Bun + TypeScript (prerequisite) ✅

- ✅ Replace koffi with `bun:ffi` in memory module (`memory.ts`)
- ✅ Convert .mjs → .ts (all bridge files)
- ✅ Drop `ws` npm package — use `Bun.serve()` built-in WebSocket server (`serve.ts`)
- ✅ Update `build-bridge-zip.sh` — uses `bun build --compile --target=bun-windows-x64` → single `bridge.exe`
- ✅ Update GitHub Actions CI — installs Bun via `oven-sh/setup-bun@v2`
- ✅ Update `start-bridge.bat` — runs `bridge.exe` instead of `node.exe serve.mjs`
- ✅ Auto-update preserved — `update.ps1` + atomic swap still work (runtime/ now contains `bridge.exe` + `package.json` + `update.ps1`)
- ✅ Version bumped to 2.0.0 (major: runtime changed from Node to Bun)
- ✅ Zero dependencies — no `node_modules/`, no `koffi`, no `ws`

### Step 1: gameDataHash

Add to memory module:
- `readCardStats(view)` → `Uint8Array(2888)` from `0x1D4244`
- `computeGameDataHash(cardStats)` → SHA-256 hex string

### Step 2: .bin path resolution

Add to bridge:
- `findGamelistCache()` → locate `{DS_DATA}/cache/gamelist.cache`
- `parseGamelistCache(cacheBuffer, serial)` → extract .cue path(s) for a serial
- `resolveBinPath(cuePath)` → parse .cue, return absolute .bin path
- Disambiguate via gameDataHash when multiple candidates share a serial

### Step 3: .bin extraction

Import extraction modules directly (TypeScript, shared codebase):
- `scripts/extract/iso9660.ts` → read disc image
- `scripts/extract/detect-wamrg.ts` → find table offsets
- `scripts/extract/extract-fusions.ts` → parse fusion table
- `scripts/extract/extract-equips.ts` → parse equip table

### Step 4: RAM fusion/equip scanning (fallback)

Add to memory module:
- `scanFusionTable(view)` → scan RAM for fusion header signature, return `Uint8Array(65536)` or null
- `scanEquipTable(view)` → scan for equip entry pattern, return `Uint8Array` or null

Called once when bridge first detects LP > 0, only if .bin reading failed.

### Step 5: Disk cache

Simple read/write in serve module:
- On bridge start: load cache, compare gameDataHash
- On .bin extraction or RAM capture: overwrite cache

### Step 6: WebSocket gameData message

Bridge sends `gameData` to webapp:
- On client connect (if data available)
- When data first acquired (.bin extraction or duel capture)
- After game change + re-acquisition

```json
{
  "type": "gameData",
  "gameDataHash": "82a9bbf0...",
  "cardStats": [/* 2888 bytes */],
  "fusionTable": [/* 65536 bytes or null */],
  "equipTable": [/* ~8218 bytes or null */]
}
```

### Step 7: Webapp consumes bridge game data

New data source path in worker initialization:
- Bridge provides `gameData` → decode into OptBuffers (same parsing as current CSV path)
- Bridge data unavailable → fall back to CSV loading (manual mode)

### Step 8: UI feedback

- Bridge connected + data ready: optimizer fully operational
- Bridge connected + no fusion data: "Enter a duel to capture game data" (only if .bin reading failed)
- No bridge: manual mode with CSV files
