# Bridge Gold Card Stats

**Status:** DONE
**Goal:** Make auto-sync card ATK/DEF match the currently running Gold mod even when extracted or cached disc metadata has stale stats.

## Findings

- The live hand slots read from RAM were correct for Gold:
  - Fire Reaper `700/500`
  - Zarigun `600/700`
  - Griggle `350/300`
  - Pot the Trick `400/400`
  - Wood Remains `1000/900`
- The displayed UI stats came from `bridge.gameData.cards`, which can be loaded from an older extraction cache.
- The full RAM card stats table at `0x1D4244` matched the in-game Gold values and is already captured during bridge `gameData` acquisition.
- A fresh extraction from the Gold BIN still reads the wrong EXE stats table, so the root issue is not only stale JSON cache. Gold keeps a stale/decoy executable card-stats copy; the running game uses the RAM table.
- The existing cache key separated sibling disc paths but did not invalidate when the same BIN path changed outside bridge-managed writes.

## Current Step

- Bridge `gameData` now overlays `cards[].atk` and `cards[].def` from the live RAM card stats snapshot before broadcasting, including cache hits.
- Disc extraction remains responsible for names, text, types, starchips, fusions, equips, duelists, rank data, and artwork.
- Game-data cache files now record the source disc size and mtime. If the BIN changes at the same path, the bridge rejects the old cache and re-extracts WA_MRG-derived data.

## Next Steps

- If another mod shows wrong non-stat metadata, investigate the corresponding disc extractor instead of adding UI fallbacks.
- Keep the RAM stats overlay in the bridge boundary so scoring, card display, and fusion result ATK all share one source of truth.
