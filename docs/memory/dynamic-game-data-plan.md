# Dynamic Game Data from RAM

In auto-sync mode, replace the static CSV extraction pipeline with live RAM reads through the DuckStation bridge. The app discovers game data from the running emulator, adapting automatically to any game version.

## Context

The optimizer needs three data tables:

| Buffer | Purpose | Size |
|---|---|---|
| `cardAtk[id]` | Base ATK per card | 722 entries |
| `fusionTable[a*723+b]` | Fusion result lookup | 722×722 matrix |
| `equipCompat[eq*723+m]` | Equip compatibility | sparse, ~8 KB raw |

Currently these come from static CSV files pre-extracted from the disc image via `scripts/extract/`. This plan adds a second path: the bridge reads the same data directly from PS1 RAM.

## Two data source modes

### 1. Bridge mode (dynamic, primary)

Data comes from the running game via the DuckStation bridge. No disc image or pre-extraction needed. Adapts to any game version automatically.

### 2. Manual mode (static, fallback)

Data comes from pre-extracted CSV files. Used when no emulator / bridge is available (e.g. mobile, offline planning). The existing CSV loading code and extraction pipeline stay in place.

## RAM data availability

| Data | RAM address | When available |
|---|---|---|
| Card stats (ATK/DEF/GS/type) | `0x1D4244`, 722×4 B packed | Always (EXE data section) |
| Level/attribute | `0x1D5333`, 722×1 B | Always |
| Card names | `~0x1D5FC9` (PAL) / `0x1D0000`+offsets (NTSC) | Always |
| **Fusion table** | Dynamic address, 64 KB | **Duel only** |
| **Equip table** | Dynamic address, ~8 KB | **Duel only** |

Card stats are at a fixed universal address. Fusion and equip tables are loaded from CD when a duel starts and freed when it ends. They must be found via byte-signature scanning.

## Flow

```
Bridge starts / game loads
  → Read card stats (722×4 B at 0x1D4244)
  → Compute gameDataHash = SHA-256(full card stats table)
  → Check disk cache: does hash match?
    YES → load fusionTable + equipTable from cache → ready
    NO  → discard cache, wait for duel

Duel starts (LP > 0), no cached tables yet
  → Scan RAM for fusion table signature → read 64 KB
  → Scan RAM for equip table signature → read ~8 KB
  → Write disk cache (hash + tables)
  → Send to webapp → ready

Game change detected (serial changes, game reloads)
  → Re-read card stats, recompute hash
  → If hash changed → discard cache, wait for duel
```

## Cache identity and invalidation

### Game data hash

SHA-256 of the full card stats table (2888 bytes). Content-addressed: if two game versions produce the same hash, their card stats are identical. Much more robust than the current 16-byte fingerprint (first 4 cards only).

### Invalidation

In DuckStation, switching mods means closing the current game and opening a new one. Save states can't cross mods. So the game data only changes on two occasions:

1. **Bridge starts** — cold start, reads card stats from RAM, checks hash against disk cache.
2. **Game change detected** — the bridge poll loop already detects serial changes and shared memory reconnects (DuckStation restart). Same mechanism triggers a card stats re-read and hash check.

When the webapp connects or reconnects, the bridge simply re-sends its current in-memory state. This is not an invalidation — the bridge already has the correct data because it tracks game changes continuously.

No multi-entry cache needed — just store the latest state. If the hash matches, the cache is valid. If not, discard it and wait for a duel.

### Disk cache

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

## Implementation steps

### Step 1: Bridge reads card stats on startup

Add to `memory.mjs`:
- `readCardStats(view)` → `Uint8Array(2888)` from `0x1D4244`
- `computeGameDataHash(cardStats)` → SHA-256 hex string

### Step 2: Bridge scans for fusion/equip during duel

Add to `memory.mjs`:
- `scanFusionTable(view)` → scans RAM for fusion header signature (ascending uint16 offset table), returns `Uint8Array(65536)` or null
- `scanEquipTable(view)` → scans RAM for equip entry pattern (equipId/count pairs with valid monster IDs), returns `Uint8Array` or null

Called once when bridge first detects LP > 0.

### Step 3: Disk cache

Simple read/write in `serve.mjs`:
- On bridge start: load cache, compare hash with live card stats
- On duel capture: overwrite cache with new data

### Step 4: WebSocket gameData message

Bridge sends `gameData` to webapp:
- On client connect (if data available)
- When fusion/equip first captured
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

### Step 5: Webapp consumes bridge game data

New data source path in worker initialization:
- Bridge provides `gameData` → decode into OptBuffers (same parsing as current CSV path)
- Bridge data unavailable → fall back to CSV loading (manual mode)

### Step 6: UI feedback

- If bridge connected but fusion data missing: "Enter a duel to capture game data"
- If cache hit on startup: ready immediately, no duel needed
