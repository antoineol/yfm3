# Bridge Gold Card Stats

**Status:** DONE
**Goal:** Make auto-sync card metadata match the currently running Gold mod even when the executable contains stale duplicate card-stat tables.

## Findings

- The live hand slots read from RAM were correct for Gold:
  - Fire Reaper `700/500`
  - Zarigun `600/700`
  - Griggle `350/300`
  - Pot the Trick `400/400`
  - Wood Remains `1000/900`
- The displayed UI metadata came from `bridge.gameData.cards`, which was extracted from the first plausible executable card-stat table.
- The full RAM card stats table at `0x1D4244` matched the in-game Gold values and is already captured during bridge `gameData` acquisition.
- A fresh extraction from the Gold BIN still read the wrong EXE stats table, so the root issue was not only stale JSON cache. Gold keeps stale/decoy executable card-stats copies before the active copy.
- The stale table corrupts the whole packed stat record, not only ATK/DEF: card type and guardian stars also come from that same row.
- The existing cache key separated sibling disc paths but did not invalidate when the same BIN path changed outside bridge-managed writes.

## Current Step

- Autosync/runtime EXE layout detection now requires the live RAM card-stat snapshot/hash and selects the matching executable table. If no table matches RAM, extraction fails instead of guessing.
- Disc-only layout detection remains available only for offline scripts/debug tools where no emulator RAM exists.
- Type and guardian-star name tables are detected by their own known string runs instead of by fixed deltas from the selected card-stat table.
- The ordered raw card type and guardian-star lists are shared from `src/engine/data/rp-types.ts`; compact/display card-type conversion lives in `src/engine/data/card-type-names.ts`, so bridge extraction, reference loading, field-bonus indexing, card detail display, and description icon parsing no longer carry separate copies.
- Disc extraction remains responsible for all card metadata, fusions, equips, duelists, rank data, and artwork. In autosync mode, every runtime refresh, including post-ISO-edit duelist refresh, uses the active RAM-selected layout. There is no post-extraction ATK/DEF overlay.
- Card frame colors are extracted from Gold's packed 4-bit EXE color-category table plus the extracted card type. The table is authoritative for special monster frames; non-monster frames are type-based: Magic/Equip green, Ritual blue, Trap pink. The `{F8 0A XX}` card-name prefix is exported separately as `labelColor` because Mod 15 uses it for label text instead of card backgrounds; prefix byte `0x03` renders purple/magenta in-game. Full-card replicas keep their normal readable text; label colors are represented as detail metadata and contrast-safe accents on dark-background card names, including result headings, lookup rows, autocomplete options, and relationship tables. Existing conflated or code-3-green color caches are invalidated by game-data cache version 16.
- Game-data cache files now record the source disc size and mtime. If the BIN changes at the same path, the bridge rejects the old cache and re-extracts WA_MRG-derived data.
- Game-data cache validation also rejects impossible card metadata before serving cached data: cards with ATK/DEF cannot be tagged as Magic/Trap/Ritual/Equip, and guardian-star fields must use known guardian-star names rather than card type labels or truncated text.

## Next Steps

- If another mod shows wrong freshly extracted card metadata, investigate layout detection first. Avoid field-level bridge/UI overlays unless the game genuinely computes that field only at runtime.
- If a future mod introduces more than the six known frame-color or label-color codes, add the raw byte-to-color mapping in `bridge/extract/extract-cards.ts` and a matching UI palette.
