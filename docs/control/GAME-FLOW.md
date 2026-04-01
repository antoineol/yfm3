# FM Remastered Duel Flow — Agent Learnings

> Discovered experimentally 2026-03-31 via ViGEm + bridge state + screenshots.

## Duel Phases (bridge `duelPhase` values)

| Phase | Name | Description |
|-------|------|-------------|
| 1-3 | INIT/CLEANUP/DRAW | Turn setup. Opponent turn plays automatically. |
| 4 | HAND_SELECT | Pick a card from hand to play. |
| 5 | FIELD | Field view. Select card for attack or inspect. |
| 7 | FUSION / GUARDIAN SELECT | Choose guardian star for placed monster. |
| 8 | FUSION_RESOLVE | Fusion/placement resolving. |
| 9 | BATTLE | Attack animation playing. |
| 10 | POST_BATTLE | After battle resolves. |
| 12-13 | DUEL_END/RESULTS | Duel over. |

## Turn Flow

```
Phase 4 (HAND_SELECT) — has 3 sub-states, all show phase=4 in RAM:
  Sub-state 1: HAND NAVIGATION — top-down field view, hand cards at bottom
    └─ left/right: navigate hand cursor (cursor ID at 0x09b338 tracks card)
    └─ cross: select card → enters sub-state 2
  Sub-state 2: ORIENTATION CHOICE — face-down card with L/R arrows
    └─ right: toggle to face-up. left: toggle to face-down.
    └─ cross: confirm orientation → enters sub-state 3
    └─ circle: cancel → back to sub-state 1
  Sub-state 3: SLOT SELECTION — field from above, cursor on empty slot
    └─ left/right: pick which field slot
    └─ cross: confirm slot → phase changes to 7 or 8

Phase 7/8 (GUARDIAN STAR / FUSION) — "SELECT A GUARDIAN" prompt
  └─ cross: confirm guardian → phase becomes 5

## Placement sequence (verified step by step)
For a MONSTER card, total inputs from hand to field:
1. Navigate hand with left/right (verify cursor via 0x09b338)
2. **Cross** → stays phase 4 (orientation screen)
3. **Right** → stays phase 4 (face-up)
4. **Cross** → stays phase 4 (slot selection)
5. **Cross** → phase 7 or 8 (guardian star)
6. **Cross** → phase 5 (card on field, field[slot+0x0b]=0x84)

That is 4× cross + 1× right. Check duelPhase after EACH cross (1s wait).
**STOP at phase 5** — next cross attacks.

## Fusion sequence (verified)
To fuse 2 hand cards into a stronger monster:
1. Navigate to **first material** in hand → press **up** (marks card, stays phase 4)
2. Navigate to **second material** → press **up** (marks card, stays phase 4)
3. Press **cross** → goes to slot selection (phase 4, field view with cursor on empty slot)
4. Press **cross** → phase 7 (fusion animation, white flash)
5. Wait ~2s → phase 8 (guardian star selection, fusion result shown with ATK)
6. Press **cross** → phase 5 (fusion result placed on field)

Key differences from single-card placement:
- No orientation (face-up/down) choice — fusion always places face-up
- Phase 7 shows fusion animation (not just guardian star)
- The fusion result is a NEW card (different card ID from either material)
- Original field cards are NOT consumed — only the hand copies are used

### Finding fusions: `bridge/debug/best-plays.cjs`
Reads hand + field from bridge state + fusionTable from gameData.
Run: `node bridge/debug/best-plays.cjs`

## Attack sequence (verified)
1. In phase 5, press **up** to ensure cursor is on top row (monster row)
2. **Left/right** to navigate to your face-up monster
3. **Cross** on your monster → view switches to opponent field (phase stays 5)
4. **Left/right** to navigate opponent's slots (cursor may start on an empty slot from previous attack)
5. **Cross** on occupied opponent slot → phase 9 (BATTLE)
6. **Circle** cancels attack target selection → back to player field view

### RAM verification for attack:
- Phase 5→9 confirms battle triggered.
- Field `+0x0b`: 0x84 → 0x04 if your card destroyed, stays 0x84 (or 0xc4) if survived.
- `0x09b338` is UNRELIABLE in phase 5 — do not use for targeting.
- No known RAM indicator for "attack target selection" vs "normal field view" sub-state. Both show phase 5.

## End turn
- Press **start** in phase 5 → ends turn (only works in normal field view, NOT during attack/equip target selection)
- If start doesn't work: press **circle** first to cancel target selection, then start

## Equip card handling
- Equips placed from hand go **face-down on bottom row**.
- After placement, cursor lands on the equip (bottom row). Press cross → enters equip target selection (cursor moves to your monsters).
- To attack after equip placement: press **up** first to reach the monster row.
- If hand has only equips and field is empty: placement goes through but there's nothing useful to do with the equip.

## Card status byte flags (observed values)
- `0x80`: present/active (base flag)
- `0x84`: face-up attack, player (confirmed — player field cards show this)
- `0x86`: face-up attack, opponent
- `0x94`: face-up attack, player (with extra bit 0x10 — meaning TBD)
- `0xbc`: face-down defense, opponent  
- `0xbe`: face-down defense, opponent (with extra bit 0x02)
- `0x00`: empty/destroyed slot
- Key bits: 0x80 = present, 0x04 = attack mode(?), 0x08+ = defense-related(?), 0x02 = ?
- **Defense position**: attacking destroys the card but does NOT reduce opponent LP.
- **Attack position (0x86)**: destroying deals ATK difference as LP damage to loser.

## Strategic notes
- Against strong opponents (e.g. Gilford 3800 ATK), don't attack with weaker monsters — you'll take LP damage and lose your monster.
- Equip cards boost field monsters: e.g. Black Pendant (+500 ATK), Axe of Despair (+1000 ATK). Use them to push a 2600 ATK monster above 3800.
- With only equips in hand and no field monster, you're stuck — can't place equips without a target. This is a losing situation. Prioritize placing monsters first.

## RAM reading cheat sheet

### Before any action, read:
- `0x09b23a` u8 = duelPhase (4=hand, 5=field, 7/8=guardian/fusion, 9=battle, 12/13=end)
- `0x09b1d5` u8 = turnIndicator (0=player, 1=opponent)

### During hand navigation (phase 4, sub-state 1):
- `0x09b338` u16 LE = card ID under cursor. **Reliable** — changes with each left/right.
- Verify target card before pressing cross.

### After placement (phase 5):
- `0x1a7b70 + slot*0x1c + 0x0b` u8 = field card status. 0x84 = active face-up.
- `0x0ea00a + slot` u8 = handSlots. 0xFF = card played from that hand slot.

### During field navigation (phase 5):
- `0x09b338` — **UNRELIABLE in phase 5.** Often stale. Sometimes works (when field is full), often doesn't (single card, after battles, after equip plays). Do NOT rely on it.
- **Use position counting instead**: go all-way-left (5× left), then count rights. Player field slots are first (in order), then opponent slots. Map positions to known field data from `0x1a7b70` and `0x1a7d14`.
- **To distinguish monster from equip**: read `status` byte at field slot. 0x84 = face-up monster (cross = attack). Face-down equip cards have different status (TBD, needs investigation).

### Opponent field:
- `0x1a7d14 + slot*0x1c + 0x0b` u8 = opponent field status. 0x82/0x86 = face-up attack. 0xbc/0xbe = defense.
- `0x1a7d14 + slot*0x1c` u16 = opponent card ID.

### Post-duel:
- `0x09b26c` u16 = sceneId. 1731=duel, 1734=opponent select.

## Timing / Animation Issues
- The game has **animation sub-states** not reflected in duelPhase. During these, button presses may be consumed silently (no phase change, no visible effect).
- Cross presses during animations are queued or ignored. A cross that "does nothing" may still advance an internal animation step.
- After transitioning to phase 5, there may be a brief animation period where cross appears to do nothing. Wait ~1-2 seconds before pressing cross for attack.
- **Key rule**: after ANY phase transition, wait 1000ms+ before the next input. Rapid-fire inputs during animations cause unpredictable behavior.

## Known issues  
- When all hand cards are equips and field is empty, agent gets stuck in phase 4. Need to find a way to skip/end turn from phase 4 directly, or handle equip-only hands.
- `0x09b338` cursor card ID is unreliable — sometimes shows stale values. Use screenshots as ground truth.
- Small DuckStation window produces unusable screenshots. Maximize window before starting.

Phase 5 (FIELD) — 2D grid: top row = face-up monsters, bottom row = face-down equips
  └─ **left/right**: navigate within current row
  └─ **up/down**: switch between top row (monsters) and bottom row (equips)
  └─ **cross on face-up MONSTER** (top row): enters ATTACK TARGET SELECTION sub-state
       - View switches to show opponent's field
       - left/right to navigate opponent's slots  
       - cross on occupied opponent slot → Phase 9 (BATTLE)
       - circle → cancel back to player field view
       - start does NOT work in this sub-state
  └─ **cross on face-down EQUIP** (bottom row): enters EQUIP TARGET SELECTION
  └─ **start**: END TURN (only in normal field view, not in target selection)
  └─ After placing a card: cursor starts where the card was placed (bottom row for equips)
```

## RAM Addresses (NTSC-U)

### Known (from bridge/memory.ts)
- `0x09b23a` — duelPhase (uint8)
- `0x09b1d5` — turnIndicator (uint8, 0=player, 1=opponent)
- `0x1a7ae4` — player hand base (5 slots × 0x1c bytes)
- `0x1a7b70` — player field base (5 slots × 0x1c bytes)
- `0x1a7c88` — opponent hand base
- `0x0e9f..` — LP area

### Discovered
- `0x09b338` (uint16 LE) — card ID under cursor. Reliable in hand navigation (phase 4 sub-state 1). Shows last card hovered when cursor is on an empty field slot (stale). Useful for verifying you're targeting the right hand card before pressing cross.
- `0x0ea00a` (u8[5]) — **handSlots**: tracks which hand slots still have cards. Value = deal index (0,1,2...) if card is in hand, **0xFF** if card was played. Use this to distinguish available hand cards from played ones, since the hand card structs (0x1a7ae4) keep status=0x80 even after playing.

## Card struct layout (0x1c = 28 bytes per slot)
```
+0x00  u16  cardId
+0x02  u16  base ATK
+0x04  u16  base DEF
+0x06  u16  equip boost (added to both ATK and DEF by bridge)
+0x0b  u8   status byte
```
Bases: HAND=0x1a7ae4, FIELD=0x1a7b70, OPP_HAND=0x1a7c88, OPP_FIELD=0x1a7d14. Stride=0x1c.

## Status byte values (offset +0x0b)
- `0x00` — empty/destroyed/inactive
- `0x04` — destroyed in battle (card data remains but not active)
- `0x80` — present in hand (always 0x80 for hand cards, even after playing)
- `0x84` — face-up attack position, player field, active
- `0x86` — face-up attack position, opponent field, active
- `0x94` — face-up attack, player (with extra flag 0x10)
- `0xbc` — face-down defense, opponent
- `0xbe` — face-down defense, opponent (variant)
- Key: `& 0x80` = active/present on field. `& 0x04` = attack position(?). Defense = higher bits set.

## Open Questions
- **Multiple attacks per turn**: After one attack, the attacker gets st=0xc4 (0x40 bit set). Can other monsters still attack? Not yet confirmed.
- **Attack target sub-state detection from RAM**: Both normal field view and attack target selection show phase 5. No RAM indicator found yet to distinguish them.
- **Opponent field layout in attack mode**: Cursor seems to navigate both top and bottom rows of opponent field. Which row has the monsters to attack? Need more investigation.
- **Equip boost value from RAM**: equip cards show atk=0 in card DB. The boost amount (+500 for most, +1000 for Megamorph?) needs to be verified after equipping.

## Input Mapping (ViGEm → PS1)
- **cross (A)**: confirm/select
- **circle (B)**: cancel/back
- **left/right**: navigate cursor
- **start**: end turn / skip battle
- **square/triangle/up/down**: no observed effect during field phase

## Key Gotchas
- Hand cursor does NOT always start at slot 0 between turns. Must read `0x09b338` to know current position.
- Keyboard input (keybd_event, SendInput, SendKeys) does NOT work with this DuckStation build. Only ViGEm XInput works.
- ViGEmBus driver must be installed + .NET DLL + XInput=true in settings.ini + Pad1 XInput bindings.
- ViGEm helper must stay persistent (vigem-server.cjs on port 7777) to avoid plug/unplug sound and 5s detection delay.
- Bridge WebSocket on Windows side, accessible from WSL2 via host IP (172.28.48.1), NOT localhost.
- `readMem` WebSocket command added to bridge for RAM probing.
- Screenshots via `PrintWindow` with `PW_RENDERFULLCONTENT=2` — works without stealing focus, but returns nothing if DuckStation is minimized.

## Infrastructure
- **vigem-server.cjs** (port 7777): persistent ViGEm controller, send `tap <button>\n`, receive `ok\n`
- **bridge**: game state + `readMem` command
- **take-screenshot.ps1**: PrintWindow capture, no focus steal
- **interact.cjs**: one-shot button sender with bridge state readback
