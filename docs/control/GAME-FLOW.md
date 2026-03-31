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
Phase 4 (HAND_SELECT) — top-down field overview, hand cards at bottom
  └─ left/right: navigate hand cursor
  └─ cross: select card → goes to field placement sub-screen
  └─ Field placement sub-screen:
       └─ left/right: toggle face-up / face-down
       └─ cross: confirm placement
       └─ circle: cancel, return to hand
  └─ Phase 7 (GUARDIAN SELECT) — "SELECT A GUARDIAN" prompt
       └─ cross: pick highlighted guardian star (Moon/Uranus etc.)
  └─ Phase 8 → Phase 5 (card placed on field)

Phase 5 (FIELD) — field view with cursor on player's field cards
  └─ left/right: navigate across field cards
  └─ cross on a field card: select it for attack → shows opponent's field
       └─ Opponent field target selection:
            └─ left/right: navigate opponent's cards
            └─ cross: attack that card → Phase 9 (BATTLE)
  └─ start: END TURN (skips battle entirely!)
  └─ Each monster CAN attack per turn (not one-per-turn). Multiple attacks not yet demonstrated by agent.
  └─ For equip cards: game places them face-down on an empty field slot, then in phase 5 the cursor lands on the equip. Pressing cross enters target selection to choose which monster to equip.
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
- `0x09b338` (uint16 LE) — **card ID of currently cursor-highlighted card**. Confirmed working in field view (phase 5) — values match field card IDs exactly when navigating left/right. In hand select (phase 4), the values sometimes show cards not in the current hand — possibly stale or from a different internal list. Needs more investigation. Use screenshots as fallback when RAM value doesn't match expected cards.

## Open Questions
- How to initiate attack with each field monster? Each monster can attack per turn. Need to experiment: after one attack resolves (back to phase 5), select another monster and press cross.
- Hand cursor navigation in phase 4: cursor card ID at 0x09b338 sometimes shows unexpected IDs. Need to understand the internal card addressing.
- Where is a simple cursor slot index (0-4) stored? Searched full 2MB RAM but couldn't find a clean incrementing byte that tracks cursor position.

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
