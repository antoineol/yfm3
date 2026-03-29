# Unlocked Duelists from Game RAM

## Goal

Read which duelists are unlocked for free duel from PS1 RAM so the farm recommender only suggests duelists the player can actually fight.

## Known address

Data Crystal documents:

| PS1 addr   | RAM offset | Size | Description                      |
|------------|-----------|------|----------------------------------|
| 801D06F4   | 0x1D06F4  | 4    | Free duel duelist unlock status  |

This sits between the deck definition (0x1D0200) and collection (0x1D0250) — same universal data section, no version-dependent offset needed.

## Encoding — confirmed

4 bytes at `0x1D06F4`, read as a bitfield with **MSB-first** bit ordering within each byte. Bit position maps directly to duelist ID (1-indexed):

```
position N = duelist ID N
byteIndex  = floor(N / 8)
bitIndex   = 7 - (N % 8)        ← MSB-first
isUnlocked = (byte & (1 << bitIndex)) !== 0
```

Verified on a save with Simon Muran(1) through Kaiba(17) unlocked, Teana(2) locked: raw bytes `5f ff c0 00` decoded correctly to exactly that set.

**Duel Master K (ID 39)** is always available in free duel — not tracked in the bitfield. Treat as always unlocked.

## Implementation steps

### Step 1 — Done: read raw bytes

`readDuelistUnlock()` added to `bridge/memory.ts`, included in `GameState`, broadcast via WebSocket.

### Step 2 — Decode in the UI

- Add `unlockedDuelists: number[] | null` to the bridge WebSocket message.
- In the UI, store in a Convex table alongside the collection.
- Pass to `discoverFarmableFusions` as an optional filter: skip duelists not in the set.

### Step 4 — Filter in the farm engine

Add an optional `unlockedDuelists?: ReadonlySet<number>` parameter to `discoverFarmableFusions`. In `buildLookups`, skip `RefDuelistCard` rows whose `duelistId` is not in the set. Everything downstream (droppable pool, fusion discovery, ranking) automatically narrows to unlocked duelists only.

### Step 5 — UI affordance

When unlocked duelist data is unavailable (no bridge connected, or manual mode), show all duelists with a hint: "Connect to the emulator to filter by unlocked duelists." No manual toggle needed — the bridge provides the data or it doesn't.

## Risks

- The RP mod has the same 39 duelists and same offset — confirmed by live probe.
- Duel Master K (ID 39) is always available — hardcode as unlocked.
- Reading 8 bytes instead of 4 provides headroom for mods that might add duelists beyond ID 32.
