# RAM Data Investigation

Investigation into reading game data directly from PS1 RAM (via DuckStation shared memory) instead of extracting from disc images.

## Goal

Replace the complex disc extraction pipeline (`scripts/extract/`) with live RAM reads through the bridge. This would simplify the app and potentially support any game version automatically.

## PS1 Memory Layout

The PS-X EXE (both NTSC-U and PAL) loads at virtual `0x80010000` = physical `0x010000`.
Text size: `0x1D0000` (1,900,544 bytes = 1856 KB). Ends at physical `0x1E0000`.
Free RAM after EXE: only 128 KB (stack, heap, CD-loaded data).

Both NTSC-U/RP and PAL French have **identical** EXE sizes and load addresses.
The card stats table lands at the same RAM offset (`0x1D4244`) in all known versions — confirmed by the mod fingerprint mechanism.

## Confirmed: Data Always in RAM

These are part of the EXE's data section, loaded at startup and always resident:

| Data | RAM Address | Size | Notes |
|------|-------------|------|-------|
| Card stats | `0x1D4244` | 722 × 4 B = 2888 B | Packed uint32: ATK(9) DEF(9) GS2(4) GS1(4) type(5) zero(1) |
| Level/attribute | `0x1D5333` | 722 × 1 B | Low nibble = level (0-12), high nibble = attribute (0-7) |
| Collection | `0x1D0250` | 722 × 1 B | Count owned per card ID (0-3) |
| Deck definition | `0x1D0200` | 40 × 2 B = 80 B | Card IDs as uint16 LE |
| Shuffled deck | `0x177FE8` | 40 × 2 B = 80 B | During duels only |

All addresses above are **universal** (same across NTSC-U, PAL, RP mod).

### Card Stats Decoding

```
raw = readU32LE(0x1D4244 + cardIndex * 4)
atk = (raw & 0x1FF) * 10        // bits 0-8
def = ((raw >> 9) & 0x1FF) * 10  // bits 9-17
gs2 = (raw >> 18) & 0xF          // bits 18-21 (guardian star 2)
gs1 = (raw >> 22) & 0xF          // bits 22-25 (guardian star 1)
type = (raw >> 26) & 0x1F        // bits 26-30 (card type 0-23)
```

### Level/Attribute Decoding

```
b = readU8(0x1D5333 + cardIndex)
level = b & 0xF           // 0 for non-monsters
attribute = (b >> 4) & 0xF
```

## Confirmed: PAL Text Data in RAM (Menu State)

The PAL version loads WA_MRG text blocks into RAM even at menu screens:

| Data | RAM Address | Encoding |
|------|-------------|----------|
| Card descriptions (FR) | `~0x1B260A` | PAL TBL, 0xFF-terminated, with 0xFE newlines |
| Card names (FR) | `~0x1D5FC9` | PAL TBL, 0xFF-terminated, 719+ strings |

Verified by decoding with PAL_CHAR_TABLE:
- Card 1: "D. Blanc aux Yeux Bleus" (Blue-Eyes White Dragon)
- Card 4: "Bébé D." (Baby Dragon)
- Descriptions: "Dragon doué d'un pouvoir inexploité."

For NTSC-U/RP, card names are in the EXE text pool at RAM `0x1D0000` with an offset table at `0x1D5802`.

## Confirmed: Fusion & Equip Tables in RAM (Duel State)

These WA_MRG tables are loaded from CD into RAM **only during duels** (LP > 0). They are NOT in RAM at menu screens.

| Data | RAM Address (PAL FR) | Size | Verified |
|------|---------------------|------|----------|
| Equip table | `0x17A1D8` | 8,218 B (34 entries) | 100% match with disc |
| Fusion table | `0x17C2D8` | 65,536 B (64 KB) | 100% match with disc |

**Key findings:**
- Both tables are byte-for-byte identical to the WA_MRG data on disc
- The fusion table produces the same 25,131 fusion rules when parsed from RAM
- The equip table immediately precedes the fusion table in memory (gap of ~0xE6 bytes)
- Addresses are NOT fixed — they are in a dynamically loaded region (~0x17A000–0x18C000)
- Tables must be located via **signature scanning** (first 16 bytes of each table are unique)

### Discovery Strategy

The bridge can discover these tables at runtime by searching RAM for their header signatures:

```
Fusion: scan for [00 00 00 00 XX XX XX XX XX XX ...] where subsequent uint16 offsets
        are ascending and in range [headerSize, 0x10000)
Equip:  scan for first (equipId:u16, count:u16) pair where equipId ∈ [1,722]
        and count ∈ [1,722], then validate subsequent entries
```

The game loads these tables when entering a duel and frees them when returning to menus. A "read-once-and-cache" strategy works: capture during the first duel, cache for all future optimizer runs.

## Not Found in RAM (Either State)

- **Starchip table** (~5.8 KB) — not needed during duels
- **Full duelist table** (39 × 6 KB = 234 KB) — only 2-3 duelists loaded at a time
- **Card images** — stored in VRAM, not main RAM

## Conclusion

**All data needed by the deck optimizer CAN be read from RAM**, eliminating the disc extraction pipeline:

| Data | Source | When Available |
|------|--------|---------------|
| Card stats (ATK/DEF/GS/type) | EXE data section | Always (game loaded) |
| Level/attribute | EXE data section | Always |
| Card names | EXE text pool (NTSC) or WA_MRG text block (PAL) | Always |
| Collection | Runtime game state | Always |
| Deck definition | Runtime game state | Always |
| Fusion table | WA_MRG loaded to RAM | During duels only |
| Equip table | WA_MRG loaded to RAM | During duels only |

### Dynamic Data Acquisition via Bridge

The bridge can provide all optimizer data dynamically — no disc extraction or CSV files needed:

```
Game loaded             → Card stats (ATK/DEF/GS/type) always at 0x1D4244
                        → Level/attribute always at 0x1D5333
                        → Card names always available (EXE text pool or WA_MRG text)

First duel (LP > 0)     → Scan RAM for fusion table signature → read 64 KB
                        → Scan RAM for equip table signature → read ~8 KB
                        → Cache both to disk keyed by mod fingerprint

Subsequent launches     → Load from disk cache if fingerprint matches
                        → Immediate data, no duel needed

Mod/version change      → Fingerprint mismatch → cache invalidated
                        → Recapture on next duel
```

**What the optimizer needs vs where it comes from:**

| Optimizer Buffer | Current Source | RAM Source | Availability |
|---|---|---|---|
| `cardAtk[id]` | cards.csv → fetch | `0x1D4244` packed uint32 | Always |
| `fusionTable[a*723+b]` | fusions.csv → fetch | Signature scan during duel | Duel or cache |
| `equipCompat[eq*723+m]` | equips.csv → fetch | Signature scan during duel | Duel or cache |

**Bridge cache file** (`bridge/game-data-cache.json`):
```json
{
  "modFingerprint": "0205f52c...",
  "gameSerial": "SLES_039.48",
  "capturedAt": "2026-03-27T...",
  "cardStats": "<base64: 722×4 bytes>",
  "fusionTable": "<base64: 64 KB>",
  "equipTable": "<base64: ~8 KB>"
}
```

**Bridge → Webapp flow:**
1. Bridge sends `{ type: "gameData", cardStats, fusionTable, equipTable }` over WebSocket
2. Webapp workers populate typed arrays from bridge data instead of fetching CSV files
3. Card stats decoded: `atk = (raw & 0x1FF) * 10`, same packed format as EXE
4. Fusion/equip tables parsed with the same logic as `extractFusions()` / `extractEquips()`

**Key benefits:**
- No disc extraction pipeline needed
- No static CSV files to deploy
- Adapts to any game version (NTSC-U, PAL, RP mod, future mods) automatically
- Data comes from the actual game the user is running

## Methodology

- Extracted PS1 RAM from DuckStation save state (DUCCS format: header + XZ-compressed sections)
- RAM is stream 1 (3.8 MB decompressed), PS1 RAM starts at byte offset `0x1A62`
- Searched for byte signatures extracted from the disc image's WA_MRG tables
- Validated card stats and names against extracted CSV data
- Used `scripts/probe-ram-layout.ts` to compute EXE offset → RAM address mapping

## EXE → RAM Address Formula

```
physicalRamAddress = (exeLoadAddr & 0x1FFFFF) + (fileOffset - 0x800)
                   = 0x10000 + (fileOffset - 0x800)
```

Where `exeLoadAddr = 0x80010000` and `0x800` is the PS-X EXE header size.
