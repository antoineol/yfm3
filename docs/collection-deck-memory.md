# Collection & Deck: Memory Layout and Sync

How the player's card collection (trunk) and deck are stored in PS1 RAM, verified through live data collection on 2026-03-21.

## RAM Addresses

| Data | RAM Offset | Size | Format |
|------|-----------|------|--------|
| Deck definition | `0x1D0200` | 80 bytes | 40 × uint16 LE (card IDs, 1-indexed) |
| Trunk (spare cards) | `0x1D0250` | 722 bytes | 1 byte per card ID (index 0 = card 1, index 721 = card 722), value = copy count |
| Shuffled deck (duel) | `0x177FE8` | 80 bytes | 40 × uint16 LE (card IDs, shuffled order) |
| CPU shuffled deck | `0x178038` | 80 bytes | 40 × uint16 LE |

Note: deck definition ends at `0x1D0200 + 0x50 = 0x1D0250`, exactly where the trunk begins. They are contiguous.

## Trunk vs Deck: The "Total Owned" Model

The game separates a player's cards into two pools:

- **Trunk** (`0x1D0250`): spare copies NOT currently in the active deck.
- **Deck** (`0x1D0200`): the 40 cards in the active deck.

**Total copies owned** of a given card = `trunk[cardId - 1] + countInDeck(cardId)`.

### Verified examples

| Card | Trunk count | Deck copies | Total owned |
|------|------------|-------------|-------------|
| #008 | 0 | 3 | 3 (all in deck) |
| #003 | 1 | 3 | 4 (1 spare) |
| #012 | 4 | 3 | 7 (4 spare) |
| #229 | 0 | 1 | 1 (in deck, none spare) |

## When Data Updates

### Deck edits

- The deck edit screen (`0x06C7`) uses a **separate working buffer** in RAM, NOT the addresses above.
- The deck definition (`0x1D0200`) and trunk (`0x1D0250`) are written **only when the player saves and exits** the deck edit screen.
- Edits are atomic: cards removed from deck appear in trunk and vice versa, total owned stays constant.

### Duel rewards

- Winning a duel awards cards (count depends on rank: S-Rank gave 15 cards in testing).
- The trunk updates **when the player leaves the results screen**, NOT while the results screen is displayed.
- Deck definition does not change from duel rewards — new cards go directly to trunk.

### Persistence across screens

Both trunk and deck data **persist in RAM across all screens**. They are always readable, regardless of which game screen the player is on (menu, duel select, duel, deck edit, etc.).

## Scene IDs

| Scene ID | Screen |
|----------|--------|
| `0x06C3` | Duel (in-game) |
| `0x06C6` | Free Duel duelist selection |
| `0x06C7` | Deck edit |
| `0x0607` | Transition (menu → deck edit) |
| `0x0603` | Transition (free duel → duel) |
| `0x0686` | Transition (duel/deck edit → free duel select) |

## Shuffled Deck Caveats

During a duel, the shuffled deck at `0x177FE8` is valid at duel start. As cards are drawn, the game overwrites drawn slots with invalid values (e.g., 896, which exceeds the 722 card ID range). The shuffled deck data is **not reliable** after the duel ends — it retains stale/overwritten values.

## Bridge Implementation

The bridge reads collection/deck data in `memory.mjs`:

- `readCollection(view)` → 722-element uint8 array (trunk counts)
- `readDeckDefinition(view)` → 40-element uint16 array (deck card IDs)
- `readShuffledDeck(view)` → 40-element uint16 array

Logging goes to `bridge/collection.log` (dedicated) and `bridge/bridge.log` (tagged `[collection]`). Changes are logged as diffs (e.g., `card75: 15→16`).
