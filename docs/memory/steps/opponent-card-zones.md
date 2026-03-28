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

## CPU AI Card Swapping (Cheating)

During investigation, observed the CPU AI **replacing cards in-hand** without drawing:

```
dealt: 6 → 8  (only 2 cards drawn into slots 3,4)
slot 2 handSlot: stayed at 45 (NOT re-dealt)
slot 2 cardId:   67 → 68(0/0 ATK/DEF) → 14(1900/1700)
```

This is a **well-documented game cheat**: the CPU changes cards in its hand into different cards to get better plays. The intermediate card 68 with 0/0 stats is the game's internal write during the swap (card ID written before stats are populated).

Community sources confirm this behavior:
- VGFacts: "CPU opponents are programmed with an unfair advantage allowing them to change the cards drawn from their deck into entirely different cards"
- TV Tropes ("The Computer Is a Cheating Bastard"): the AI "turns the cards in its hand into other cards"
- Originally discovered via GameShark hand-reveal codes

### Extended hand (unverified — needs investigation)

Community reports (GameFAQs) suggest the CPU AI actually has a **larger hand size** than the visible 5 slots:

> "Almost every AI opponent has a larger hand size than the player, and when they play a card from beyond the first 5 cards in their extended hand it looks like the card is morphing. For the final 6 the hand size is 20, which is why Seto 3 can so consistently summon BEUD first turn despite being limited to 3 copies."

TV Tropes (datamined): "The computer may look like they have 5 cards in their hand, same as you, but when the game was datamined, it turned out that they have 20 at a time."

This could explain the "swap" behavior: the game may not be randomly replacing a card but rather picking from a hidden extended hand beyond the 5 visible slots. The "morphing" animation reported by the community matches what we observe in RAM (card ID changes in-place in an existing hand slot).

**Clues from our RAM data:**
- P2 hand slot deal indices start at 42 (0x2A), not 0 like P1. With a 40-card deck (indices 0-39), hand indices starting at 40+ could point to an extended hand buffer.
- `CPU deck pool` at `0x1781D8` (1444 bytes = 722 × 2) is on the Data Crystal RAM map — this is likely a per-card-ID probability/availability table, not the extended hand itself.
- The hand slot tracking at lpP2 only has 5 entries. The extended hand may be managed entirely outside the hand slot tracking system.

**Investigation plan:**
1. Probe memory around the known hand slots for more card-sized structures (extend the 20-slot scan further)
2. Look for a per-duelist "hand size" byte near the duelist ID or opponent config
3. Monitor the P2 hand slot indices across multiple draws — do they ever exceed expected ranges?
4. Compare behavior across different duelists (early game vs Seto 3) to see if the swap frequency changes
5. Dump the CPU deck pool (0x1781D8) during a duel to understand its structure

## Files changed

- `bridge/memory.ts` — added `OPPONENT_HAND_BASE`, `OPPONENT_FIELD_BASE`, `CPU_SHUFFLED_DECK_OFFSET`, opponent fields in `GameState`
- `bridge/serve.ts` — opponent data in WebSocket messages, diagnostic logging
- `bridge/debug/opponent-probe.ts` — diagnostic probe (disable after verification)
- `src/ui/lib/use-emulator-bridge.ts` — opponent data in `BridgeState`, filtering logic
- `src/ui/features/hand/OpponentPanel.tsx` — wired to real bridge data (removed mock)
