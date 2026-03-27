# Step: Bridge Extended State Extraction (exploratory)

Status: **IDEA** — discovered during PAL address investigation, not yet prioritized.

## Context

While hex-dumping memory during the PAL investigation, several data fields were observed in RAM that the bridge does NOT currently extract. These apply to both NTSC-U and PAL.

## Discovered data

### 1. Hand slot tracking (CONFIRMED)

Observed at PAL lpP1 (0x0EB28A), likely same structure at NTSC-U lpP1 (0x0EA004):

| Offset from lpP1 | Size | Observed value | Interpretation |
|-------------------|------|---------------|----------------|
| -0x0B (PAL) / -0x0C (NTSC-U) | u8 | 0→1→2 | Fusion counter (already mapped) |
| -0x0A (PAL) | u8 | 0→1→2 | Fusion counter duplicate |
| +0x00 | u16 | 8000 | LP (already mapped) |
| +0x02 | u16 | 8000 | LP copy (animation target?) |
| +0x04 | u16 | 8000 | LP copy (animation source?) |
| **+0x06** | **u8** | **5→6→...** | **Total cards dealt counter (increments on draw)** |
| **+0x08..+0x0C** | **u8[5]** | **see below** | **Hand slot indices; 0xFF = card left hand** |

Same layout expected at lpP2 (+0x20) for opponent data.

**Verified behavior (session 2, 2026-03-27):**

| Action | size (lpP1+6) | slots (lpP1+8..C) | Notes |
|--------|---------------|-------------------|-------|
| Deal 5 cards | 5 | [0,1,2,3,4] | Initial state |
| Play 3rd card to field | 5 | [0,1,**FF**,3,4] | Slot → FF on confirm (not during selection UI) |
| Compact (auto) | 5 | [0,1,3,4,**FF**] | FF shifts to end, remaining shift left |
| Draw card (new turn) | **6** | [0,1,3,4,**5**] | New index replaces FF, size increments |
| Fuse 2nd & 5th card | 6 | [0,**FF**,3,4,**FF**] | Both sources → FF, result goes directly to field |

**Key properties:**
- **FF = card left hand** — works for both play-to-field and fusion
- **No false positives** during card selection, side choice, or position choice — only updates on final confirm
- **size = total cards dealt**, not current hand count. Current hand count = number of non-FF slots.
- **Fusion result goes to field**, never occupies a hand slot
- **Compact happens automatically** between play and draw — FF slots shift to end

**Why this is better than status-byte detection:**
The current bridge detects hand changes by watching the `status` byte (0x0B) in each CardSlot structure. This is unreliable during animations because the status byte flickers between states. The slot index array at lpP1+8 provides a **clean, deterministic signal**: a slot is either an index (card present) or 0xFF (card gone). No intermediate states observed.

**Potential uses:**
- Reliable detection of which cards left the hand and when
- Direct "cards in hand" count (count non-FF slots)
- Opponent hand tracking at lpP2+0x06..+0x0C

### 2. Card slot unexplored bytes

Each card slot is 0x1C (28) bytes, but only 12 bytes (0x00-0x0B) are read:
- 0x00: cardId (u16)
- 0x02: base ATK (u16)
- 0x04: base DEF (u16)
- 0x06: equip boost (u16)
- 0x0B: status (u8)
- 0x08-0x0A, 0x0C-0x1B: **unknown** (~17 bytes per slot)

**Potential contents** (speculative, needs investigation):
- Guardian star values
- Face-up/face-down flag (beyond what status byte encodes)
- Position (attack/defense)
- Equip card ID
- Card type flags

### 3. Shuffled deck (already readable, not sent)

`readShuffledDeck()` exists in `memory.ts` and is called in `serve.ts` for logging, but the data is NOT sent to the webapp via WebSocket.

**Potential uses:**
- Show remaining deck contents (full deck tracking)
- Calculate draw probabilities for upcoming turns
- Display "cards left in deck" count

### 4. Duelist attribute bytes (+0x184/+0x18C from phase)

These bytes change per duelist but are NOT terrain (all tested duels had neutral field):
- Simon Muran: 1
- K: 4
- Teana: 0

Could be AI type, difficulty level, duelist category, or some other per-opponent attribute. Worth investigating if we ever need more duelist metadata.

## Priority assessment

| Data | Effort | Value | Priority |
|------|--------|-------|----------|
| Hand slot tracking (lpP1+6..C) | Low — read 6 bytes | **High** — reliable hand change detection, replaces chaotic status-byte method | **Do first** |
| Shuffled deck to webapp | Low — already read, just send it | High — enables deck tracking | Worth doing |
| Card slot extra bytes | Medium — needs RAM investigation | Medium — richer card state | Later |
| Opponent hand size | Low — read lpP2+6 | Low — cosmetic | Later |

## Implementation sketch (hand slot tracking)

1. **In `memory.ts`**: add `readHandSlots(view, lpOffset)` that reads lpP1+0x08..+0x0C (5 bytes) and returns `number[]` (indices or 0xFF)
2. **In `GameState`**: add `handSlots: number[]` field
3. **In `serve.ts`**: include in state broadcast
4. **In webapp**: use `handSlots` to detect card consumption instead of (or alongside) status byte flickering. A slot going from index → FF means that card was played/fused.
5. **Need to verify on NTSC-U**: the lpP1+8 layout was observed on PAL. Verify same offsets work for NTSC-U before shipping.

## Approach

For any of these, the investigation method is the same as the PAL address work:
1. Hex dump the region during known game state
2. Change state (play card, fuse, draw, etc.)
3. Diff to identify which bytes changed and correlate with expected values

The diagnostic probe in `bridge/debug/` can be adapted for these investigations.

## Related files

- `bridge/memory.ts` — `readGameState`, `readCardSlot`, card slot offsets
- `bridge/serve.ts` — WebSocket message construction, `readShuffledDeck` usage
- `src/ui/lib/use-emulator-bridge.ts` — webapp state consumption
- `docs/memory/pal-remaining-addresses.md` — investigation methodology reference
