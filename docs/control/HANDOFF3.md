# Agent Game Control — Handoff #3

> Written 2026-04-01. Continue from here.

## What Was Accomplished This Session

### 1. Proven RAM-Reading Mastery for Core Primitives
Every action verified with RAM reads, not just screenshots.

**Hand navigation (phase 4):**
- `0x09b338` u16 LE reliably tracks cursor card ID during hand selection
- Left/right move cursor, verified with back-and-forth reversibility tests
- `0x0ea00a` u8[5] = handSlots: 0xFF means card was played, other values = card in hand

**Monster placement (phase 4 → 8 → 5):**
- Phase 4 has 3 sub-states (hand select, orientation, slot select) — all show phase=4
- Full sequence: cross (select) → right (face-up) → cross (orientation confirm) → cross (slot confirm) → phase 7/8 (guardian star) → cross → phase 5
- Verify: `field[slot*0x1c + 0x0b]` becomes 0x84 = active face-up monster

**Fusion (phase 4 → 7 → 8 → 5):**
- Mark materials with **up** on each card in hand, then **cross** to confirm
- Goes directly to slot selection (no orientation choice)
- Phase 7 = fusion animation (white flash), phase 8 = guardian star, cross → phase 5
- Successfully fused Zoa + Zanki → Great Shogun Shien (4000 ATK)

**Attack (phase 5 → 9 → 5):**
- Field is a **2D grid**: top row = face-up monsters, bottom row = face-down equips
- **up/down** switches rows, **left/right** navigates within row
- Cross on face-up monster (top row) → enters attack target selection (view switches to opponent field)
- Left/right to navigate opponent slots → cross on monster → phase 9 (battle)
- Circle cancels attack target selection back to player field view
- Start only works in normal field view (not during target selection)

**End turn:** Start in phase 5 (normal field view) → phase changes, turn indicator flips

### 2. Infrastructure
- **Bridge** on port 3333 (default restored after ghost TCP cleared)
- **vigem-server.cjs** on port 7777: persistent ViGEm controller, must be started manually
- **take-screenshot.ps1**: PrintWindow capture, works without focus steal. Maximize DuckStation first.
- **best-plays.cjs**: reads bridge gameData, finds available fusions + equips for current hand/field
- **readMem** WebSocket command in bridge: `{type:"readMem", offset, length}` → returns hex

### 3. Current Duel State
- Phase 5 or opponent's turn (just pressed start to end turn)
- LP: ~9900/9900
- Player field: King Of Yamimakai (3000), Sanga (2600), **Great Shogun Shien (4000, fusion result)**
- Opponent field: 1-2 cards remaining (weak, ~1400 ATK in defense)
- Player hand: 3 equip cards remaining
- **Winning position** — 4000 ATK fusion monster vs weak opponent

## RAM Cheat Sheet

```
PHASE & TURN:
  0x09b23a  u8   duelPhase (4=hand, 5=field, 7=fusion, 8=resolve, 9=battle, 12/13=end)
  0x09b1d5  u8   turnIndicator (0=player, 1=opponent)
  0x09b26c  u16  sceneId (1731=duel, 1734=opponent select, 1735=deck validation, 1736=main menu)

CURSOR:
  0x09b338  u16  cursor card ID — RELIABLE in phase 4 hand select, UNRELIABLE in phase 5 field

HAND:
  0x0ea00a  u8[5]  handSlots — 0xFF=played, other=card available
  0x1a7ae4 + i*0x1c  card struct (hand slot i)

PLAYER FIELD:
  0x1a7b70 + i*0x1c  card struct (field slot i), i=0..4

OPPONENT FIELD:
  0x1a7d14 + i*0x1c  card struct (opponent field slot i), i=0..4

CARD STRUCT (0x1c = 28 bytes):
  +0x00  u16  cardId
  +0x02  u16  base ATK
  +0x04  u16  base DEF
  +0x06  u16  equip boost (added to ATK and DEF)
  +0x0b  u8   status (0x84=face-up active, 0x04=destroyed, 0x00=empty, 0xc4=attacked this turn?)

STATUS BYTE VALUES:
  0x00  empty/destroyed
  0x04  destroyed in battle (data remains)
  0x80  present in hand (always, even after playing — use handSlots to check availability)
  0x84  face-up attack, player, active
  0x86  face-up attack, opponent, active
  0xbc  face-down defense, opponent
  0xbe  face-down defense, opponent (variant)
  0xc4  player monster that already attacked this turn (needs confirmation)
```

## Game Flow Summary

```
Phase 4 (HAND SELECT) — 3 sub-states, all phase=4:
  Sub-state 1: Hand navigation (left/right, cursor at 0x09b338)
  Sub-state 2: Face-up/down choice (left/right toggle, cross confirm)
  Sub-state 3: Slot selection (field grid, cross confirm)
  → Phase 7/8 → cross → Phase 5

Phase 5 (FIELD) — 2D grid, multiple sub-states all showing phase=5:
  Normal view: up/down switch rows, left/right within row, start=end turn
  Attack target: cross on monster → opponent field → cross on target → Phase 9
  Equip target: cross on equip → cursor moves to your monsters
  
Phase 7 (FUSION) → Phase 8 (GUARDIAN STAR) → cross → Phase 5
Phase 9 (BATTLE) → resolves → Phase 5
Phase 12/13 (DUEL END) → cross → opponent select → cross → CHEST → circle → new duel

FUSION from hand: up (mark card 1) → navigate → up (mark card 2) → cross → slot → cross → guardian → cross → Phase 5
```

## What's NOT Working / Unknown

1. **Phase 5 sub-state detection**: No RAM indicator found to distinguish "normal field view" from "attack target selection" from "equip target selection". All show phase=5. Must track state transitions in code.

2. **Cursor tracking in phase 5**: `0x09b338` is unreliable during field navigation. Shows stale values on empty slots. Position counting from edges is the fallback but field is 2D (two rows), making it complex.

3. **Multiple attacks per turn**: After one attack, the card gets status 0xc4. Unknown if other cards can still attack. Not yet tested.

4. **Attack target navigation**: Opponent field also has two rows. The cursor in attack mode may land on empty slots or the wrong row. Need to navigate carefully and verify visually until a RAM solution is found.

5. **Equip boost values**: Cards in the DB show atk=0 for equips. The actual boost amount is applied at +0x06 in the field card struct after equipping. Not yet tested equip application end-to-end.

## Files

### Utilities
- `bridge/debug/best-plays.cjs` — finds fusions + equips from current hand/field via bridge gameData
- `bridge/debug/vigem-server.cjs` — persistent ViGEm TCP server (port 7777)
- `bridge/debug/take-screenshot.ps1` — PrintWindow screenshot
- `bridge/debug/interact.cjs` — one-shot button + bridge state (deprecated, use direct node commands)

### Documentation
- `docs/control/GAME-FLOW.md` — comprehensive game mechanics + RAM addresses (primary reference)
- `docs/control/HANDOFF.md` — original handoff (historical)
- `docs/control/HANDOFF2.md` — second handoff (historical)
- `docs/control/HANDOFF3.md` — this file

### Modified Production Files
- `bridge/serve.ts` — added `readMem` WebSocket command for RAM probing
- `bridge/vigem-subprocess.ts` — persistent subprocess manager (tested, 12 tests pass)
- `bridge/agent-client.ts` — added `interact()` method (tested, 15 tests pass)

## Approach Principles (Learned the Hard Way)

1. **One input at a time**: press one button → read RAM → verify → next button. No blind sequences.
2. **Learn to read from RAM first**: after every screenshot, ask "how should I have read this from RAM?"
3. **Don't compose until primitives are mastered**: chaining actions requires pre-checking game state at each step.
4. **Cursor position varies**: don't assume cursor starts at slot 0. Read it. In phase 5, don't trust `0x09b338`.
5. **The field is 2D**: top row (monsters) and bottom row (equips). Use up/down to switch rows.
6. **Animations consume inputs**: wait 1000ms+ after phase transitions before pressing buttons.
7. **Circle cancels**: attack target selection, equip target selection, face-up/down choice.
