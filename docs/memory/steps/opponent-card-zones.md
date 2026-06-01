# Step: Opponent Card Zone Discovery

Status: **VERIFIED** (2026-03-28) — opponent hand and field addresses confirmed via diagnostic probe.

## Context

The cheat mode feature needs real-time access to the opponent's hand and field cards from RAM. Player hand/field addresses were already known (universal across versions), but opponent addresses had never been mapped.

## Discovery Method

Used `bridge/debug/opponent-probe.ts` to scan 20 card-sized (0x1C stride) slots starting after the player field end (0x1A7BFC). Cross-referenced with:
- Visual game state (cards visible on screen)
- P2 hand slot tracking at lpP2+offset
- CPU shuffled deck at 0x178038

## Verified Layout

Each player occupies **15 slot positions** (not 10 as initially hypothesized). There is a 5-slot gap of unknown purpose between each player's field and the next player's hand.

| Zone | Base Address | Slots | Stride | Notes |
|------|-------------|-------|--------|-------|
| Player hand | `0x1A7AE4` | 5 | 0x1C | Already known |
| Player field | `0x1A7B70` | 5 | 0x1C | Already known |
| Unknown zone | `0x1A7BFC` | 5 | 0x1C | Always empty in testing — graveyard? equip? |
| **Opponent hand** | **`0x1A7C88`** | 5 | 0x1C | Verified — same card struct as player |
| **Opponent field** | **`0x1A7D14`** | 5 | 0x1C | Verified — Dark Sage matched game screen |

Offset from player hand to opponent hand: `0x1A7C88 - 0x1A7AE4 = 0x1A4 = 420 bytes = 15 × 0x1C`.

### Card struct (same for all zones)

| Offset | Size | Field |
|--------|------|-------|
| +0x00 | u16 | Card ID (1-722, 0 = empty) |
| +0x02 | u16 | Base ATK |
| +0x04 | u16 | Base DEF |
| +0x06 | u16 | Equip boost (added to both ATK/DEF) |
| +0x0B | u8 | Status flags |

### Opponent hand slot tracking

Same structure as player, at lpP2+offset (verified for NTSC-U):

| Version | lpP2 | cardsDealt | handSlots (u8[5]) |
|---------|------|-----------|-------------------|
| NTSC-U | 0x0EA024 | lpP2+0x04 | lpP2+0x06 |
| PAL | 0x0EB2AA | lpP2+0x06 | lpP2+0x08 |

Hand slot values: sequential deal index = card in hand, `0xFF` = card left hand.

**Note:** P2 deal indices are NOT zero-based like P1. Observed values: 0x2A (42), 0x2C (44), 0x2D (45), etc. The indexing scheme differs from P1 but the FF/non-FF distinction works the same.

### CPU shuffled deck

Already documented at `0x178038` (40 × uint16 LE). Now read by the bridge as `cpuShuffledDeck` in GameState.

## Initial hypothesis failure

First attempt placed opponent hand at `0x1A7BFC` (immediately after player field) and opponent field at `0x1A7C88`. This was wrong — the 5-slot unknown zone sits between player field and opponent hand, shifting everything by 5 slots (0x8C bytes).

## CPU AI Extended Hand

During investigation, observed the CPU AI **replacing cards in-hand** without drawing:

```
dealt: 6 → 8  (only 2 cards drawn into slots 3,4)
slot 2 handSlot: stayed at 45 (NOT re-dealt)
slot 2 cardId:   67 → 68(0/0 ATK/DEF) → 14(1900/1700)
```

The decompiled Alpha `SLUS` code confirms this is an extended-hand mechanic,
not arbitrary card generation.

### Duel card table

At duel setup, `FUN_800243f4` builds two shuffled 40-card decks:

| RAM | Contents |
| --- | --- |
| `0x80177fe8` | Player shuffled deck, 40 x u16 |
| `0x80178038` | CPU shuffled deck, 40 x u16 |
| `0x80177f94` | Player shuffled deck-entry indices |
| `0x80177fbc` | CPU shuffled deck-entry indices |

`FUN_80024824` then builds an 80-entry duel-card table at `0x801a7e20`.
Each entry is 6 bytes:

| Entry range | Source |
| --- | --- |
| `0..39` | Player shuffled deck |
| `40..79` | CPU shuffled deck |

The visible card-zone structs at `0x801a7ae4` point back into this table.
`FUN_800249e0(slot, deckEntry)` reloads a visible slot from a duel-card-table
entry. For opponent slots (`slot > 14`), deck entries under `40` are remapped
to the CPU half of the table.

### AI-visible hand

`FUN_80027df8` builds the AI snapshot used by the script engine:

| Action IDs | Meaning |
| --- | --- |
| `0x01..0x05` | Field cards |
| `0x06..0x0a` | Unknown/equip zone |
| `0x0b..0x0f` | Five visible hand slots |
| `0x10+` | Reserve cards from the undealt part of the shuffled deck |

The script range for "hand" actions ends at `0x0a + handSize`, where:

```
handSize = *(int8_t *)(0x800917f0 + duelistId * 9)
```

This first per-duelist AI byte ranges from 5 to 20 in Alpha. `handSize` is the
total AI-visible hand size, so `20` means 5 visible cards plus 15 reserve cards.

Known Alpha values:

| handSize | Duelists |
| --- | --- |
| 5 | Simon, Teana, Jono, villagers, first Seto |
| 8 | Insector, Mai |
| 10 | Heishin, Bandit Keith, second Teana, Ocean Mage |
| 12 | Shadi, Yami Bakura |
| 14 | Pegasus, several high mages |
| 16 | Isis, Kaiba, Mage Soldier, several high mages, Seto 2 |
| 18 | Sebek |
| 20 | Neku, Heishin 2, Seto 3, DarkNite, Nightmare, Nitemare |

### Why the visible hand morphs

When the AI chooses a hand action above `0x0f`, `FUN_8001baf0` materializes that
reserve card into one of the five visible hand slots before executing the play:

1. It reads the current visible hand slot record IDs from the active player's
   hand-slot array (`0x800ea00a` for player, `0x800ea02a` for CPU in NTSC).
2. It selects a visible hand slot not already reserved by the planned action
   sequence.
3. It swaps the 6-byte `0x801a7e20` table entry for that visible slot with the
   selected reserve entry.
4. It calls `FUN_800249e0` to reload the visible card-zone struct.
5. It writes the new record ID back into the active hand-slot array.

The bridge sees this as a card ID changing in-place while the hand slot remains
non-`0xff`. That is expected game behavior for reserve-card plays.

The intermediate 0/0 card observed live is the slot being refreshed while the
card ID and derived stats are being written.

## Files changed

- `bridge/memory.ts` — added `OPPONENT_HAND_BASE`, `OPPONENT_FIELD_BASE`, `CPU_SHUFFLED_DECK_OFFSET`, opponent fields in `GameState`
- `bridge/serve.ts` — opponent data in WebSocket messages, diagnostic logging
- `bridge/debug/opponent-probe.ts` — diagnostic probe (disable after verification)
- `src/ui/lib/use-emulator-bridge.ts` — opponent data in `BridgeState`, filtering logic
- `src/ui/features/hand/OpponentPanel.tsx` — wired to real bridge data (removed mock)
