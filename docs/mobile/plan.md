# Mobile Auto-Sync: Bridge → Convex Direct Push

## Problem

Auto-sync requires a desktop browser open to relay data from the bridge (WebSocket on `localhost:3333`) to Convex. On mobile, `localhost` is unreachable — the phone can't connect to the bridge. Result: auto-sync is desktop-only.

## Goal

The bridge pushes all game state directly to Convex. Any browser (desktop or mobile) reads it via Convex subscriptions. No desktop browser required. Identical experience on all devices.

## Architecture

```
                    ┌─────────────────────────────┐
                    │   DuckStation (Windows)      │
                    └─────────┬───────────────────┘
                              │ shared memory
                    ┌─────────▼───────────────────┐
                    │   Bridge (Windows Node.js)   │
                    │                              │
                    │   RAM poll (50ms)            │
                    │     │                        │
                    │     └─► HTTP POST to Convex  │
                    │         (all game state)     │
                    │                              │
                    └──────────┬──────────────────┘
                               │ HTTPS
                        ┌──────▼──────────────┐
                        │      Convex          │
                        │                      │
                        │  ownedCards, deck,    │
                        │  duelState            │
                        └──────┬──────────────┘
                               │ subscriptions
                        ┌──────▼──────────────┐
                        │   Any Browser        │
                        │   (desktop / mobile) │
                        │                      │
                        │  collection, deck,   │
                        │  hand, field, phase, │
                        │  post-duel suggest.  │
                        └─────────────────────┘
```

**No WebSocket.** The bridge becomes a pure "poll RAM → POST to Convex" process. The `ws` dependency is removed. Desktop and mobile have identical data sources.

## What's synced

### → Convex (all devices, via bridge HTTP POST)

| Data | Bridge emits when | Target |
|------|-------------------|--------|
| Hand (card IDs) | Hand reaches 5 cards (see [hand rules](#hand-emission-rules)) | `duelState.hand` |
| Field (card IDs + ATK/DEF) | Field cards change | `duelState.field` |
| Phase | Phase byte changes | `duelState.phase` |
| In-duel flag | Phase enters/exits active range | `duelState.inDuel` |
| Collection (trunk + deck def) | `trunk` or `deckDefinition` bytes change | `ownedCards` + `deck` |

### Dropped (not synced at all)

| Data | Reason |
|------|--------|
| Life points | Not needed for deck optimizer or fusion calculator |
| Terrain (Forest/Dark/Water) | Not needed |
| Fusions count | Calculated in-app from the hand |
| Duelist ID | Not needed |

### Available on all devices

- Collection + deck optimizer
- Hand fusion calculator (with live field cards)
- Phase display (duel overlay)
- Post-duel deck suggestion (optimizer runs in-browser on any device via web worker)

---

## Schema changes

### Refactor: hand → single-record `duelState`

Currently, each hand card is a separate row in the `hand` table (5 rows = 5 docs). This means `batchMigrateHand` does delete-all + insert-5 = 6 mutations internally.

**New: single `duelState` document per user** that stores hand, field, phase, and duel state together.

```ts
duelState: defineTable({
  userId: v.string(),
  mod: v.optional(v.string()),
  inDuel: v.boolean(),              // currently in a duel
  phase: v.string(),                // "hand" | "draw" | "fusion" | "field" | "battle" | "opponent" | "ended" | "other"
  hand: v.array(v.number()),        // card IDs (0–5)
  field: v.array(v.object({         // field monsters with live ATK/DEF
    cardId: v.number(),
    atk: v.number(),
    def: v.number(),
  })),
})
  .index('by_user', ['userId'])
  .index('by_user_mod', ['userId', 'mod'])
```

**Benefits:**
- 1 mutation to update any combination of hand/field/phase/inDuel (vs 6+ today)
- Hand + field in one query = one subscription = simpler UI
- Manual mode uses the same document: `inDuel=false, phase="other", hand=[user-selected], field=[]`

**Impact on manual mode:**
- `addToHand(cardId)` → read doc, push to `hand` array, write back (1 mutation)
- `removeFromHand(index)` → read doc, splice from `hand` array, write back (1 mutation)
- `clearHand()` → set `hand: []` (1 mutation)
- React keys: `${index}-${cardId}` (no doc IDs needed)

### Existing tables (unchanged)

- `ownedCards` — collection (card ID → quantity)
- `deck` — deck definition (card ID + order)
- `userModSettings` — per-mod settings (deckSize, fusionDepth, postDuelSuggestion, etc.)
- `userSettings` — global settings (selectedMod, bridgeAutoSync, handSourceMode, **+ `bridgeToken`**)

### Auth: bridge token in `userSettings`

The bridge token is stored as a field on the existing `userSettings` document:

```ts
userSettings: defineTable({
  // ... existing fields ...
  bridgeToken: v.optional(v.string()),   // NEW: random 32-byte hex, set during pairing
})
```

No separate `bridgeSessions` table. The `duelState` document already tells us whether the bridge is active (`inDuel`, recently updated).

---

## Hand emission rules

The draw phase writes cards to RAM one at a time (1→2→3→4→5). Emitting each intermediate state would cause mutations with incomplete data.

**Rule: only emit when hand reaches 5 cards.** No decrease emissions (game signals are unreliable during card selection — status byte flicker causes false decreases).

```
let prevHandIds = []

on each poll where filtered hand card IDs changed:
  newCount = currentIds.length

  if newCount === 5 and currentIds ≠ prevHandIds:
    push to Convex: { hand: currentIds }
  // else: draw in progress (<5) or unreliable decrease → skip

  prevHandIds = currentIds
```

**Edge cases:**
- **Initialization / reconnection**: emit current state once regardless of count, to guarantee sync.
- **Outside duel**: emit `{ inDuel: false, hand: [], field: [] }` to clear stale state. This is the natural "idle" state — no special clear logic needed.

This matches the current webapp behavior exactly (only syncs during HAND_SELECT when hand is complete, skips decreases).

---

## Mutation budget

### Current (browser-mediated, per duel)

| Event | Internal mutations |
|-------|--------------------|
| Clear hand (duel start) | ~6 (delete 5 docs + confirm) |
| Hand sync (per player turn, ~5 turns) | ~30 (delete-all + insert-5 × 5 turns) |
| Collection + deck sync (post-duel) | 1 |
| Post-duel suggestion save | 1 |
| **Total** | **~38** |

### New (bridge → Convex, per duel)

| Event | HTTP actions | Mutations |
|-------|-------------|-----------|
| Duel start (inDuel → true, hand: [], field: []) | 1 | 1 (update duelState) |
| Phase changes (~5/turn × 5 turns) | ~25 | ~25 (update duelState) |
| Hand at 5 cards (per turn, ~5) | 0 (batched with phase) | 0 (same mutation) |
| Field changes (~2/turn × 5 turns) | 0 (batched with phase) | 0 (same mutation) |
| Duel end (inDuel → false) | 0 (batched) | 0 (same mutation) |
| Collection sync (post-duel) | 1 | 1 (syncCollection) |
| Post-duel suggestion save | 0 (browser) | 1 (updateModSettings) |
| **Total** | **~27** | **~27** |

**Key insight:** the bridge sends ONE POST per poll cycle when anything changed. Phase + hand + field changes in the same cycle are batched into a single `duelState` update. And with a single-record hand, the current ~38 internal mutations per duel drops to ~27.

**So mutation count actually decreases** despite syncing more data (phase, field).

---

## Bridge changes

### Removed

- **WebSocket server** (`ws` dependency removed, no more `:3333`)
- All WebSocket-related code: `broadcast()`, `wss`, client tracking, `scan` handler

### Added (~60 lines)

1. **`pushToConvex(payload)`** — single `fetch()` POST with auth header.
2. **Duel state tracking** — derive `inDuel` from phase byte range (`0x01..0x0a`). Derive `phase` string from phase byte + turn indicator (same `mapDuelPhase` logic as the current webapp, inlined as a small lookup).
3. **Hand filtering** — filter active slots (same `isActiveSlot` check as webapp: `cardId > 0 && cardId < 723 && status !== 0`). Only emit when count reaches 5.
4. **Field filtering** — filter active field slots, extract `{cardId, atk, def}`.
5. **Batched change detection** — per poll cycle, build a `duelState` snapshot `{inDuel, phase, hand, field}`. Compare with previous. If different → one POST.
6. **Collection/deck change detection** — already exists (`lastCollectionKey`, `lastDeckKey`). On change → separate POST.
7. **Auth token loading** — read `.bridge-auth` file on startup.
8. **Pairing flow** — on first run without token, start ephemeral HTTP server on localhost, open browser to webapp's `/bridge-pair` page, receive token via redirect callback.

### Still no business logic in bridge

The bridge does NOT know about fusion rules, deck optimization, card names, or post-duel suggestions. It:
- Reads raw bytes from RAM
- Applies mechanical filtering (active slot check, phase byte range)
- Posts snapshots to Convex when they change

The `mapDuelPhase` lookup and `isActiveSlot` check are copied from the webapp as small pure functions (~20 lines total). They're byte-level interpretation, not game logic.

### Bridge config

Stored in `.bridge-auth` (JSON), created during pairing:
```json
{
  "token": "brg_a1b2c3d4e5f6...",
  "siteUrl": "https://adamant-condor-151.convex.site"
}
```

---

## Convex changes

### New: `convex/http.ts` — HTTP endpoints

**`POST /bridge/sync`** — main sync endpoint.

```
Authorization: Bearer <bridge-token>
Content-Type: application/json
Body: { type: "duel_state", duelState: { inDuel, phase, hand, field } }
  OR: { type: "collection", ownedCards: [...], deck: [...] }
```

Handler:
1. Extract token from `Authorization` header.
2. Look up user: query `userSettings` where `bridgeToken === token` → get `userId`.
3. Dispatch by `type`:
   - `duel_state` → call `internal.duelState.updateFromBridge(userId, mod, duelState)`
   - `collection` → call `internal.importExport.syncCollectionFromBridge(userId, mod, data)`
4. Return `200 OK` or `401 Unauthorized`.

**`POST /bridge/pair/complete`** — bridge sends the token it received from the webapp redirect.

```
Body: { token: "brg_..." }
Response: { ok: true, siteUrl: "https://..." }
```

Validates that this token exists in a `userSettings.bridgeToken` field. Returns the Convex site URL for subsequent sync calls.

### Internal mutations (shared core logic)

Existing public mutations become thin wrappers around `internalMutation` variants:

```
# Duel state (new)
duelState.updateFromBridge(userId, mod, {inDuel, phase, hand, field})
duelState.updateHand(userId, mod, hand)         // for manual mode
duelState.clearHand(userId, mod)                 // for manual mode

# Collection (refactored)
importExport.internal_syncCollectionFromBridge(userId, mod, {ownedCards, deck})
```

Public mutations (called by webapp with Clerk auth):
```ts
// Example: existing mutation becomes a wrapper
export const syncCollectionFromBridge = mutation({
  args: { ownedCards: ..., deck: ..., mod: ... },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);  // Clerk JWT
    return await internal_syncCollectionFromBridge(ctx, userId, args.mod, args);
  },
});
```

The httpAction calls the same internal functions with `userId` resolved from the bridge token instead of Clerk JWT. **Same logic, two auth paths.**

### Convex mutation: `generateBridgeToken`

Called from the webapp (Clerk-authenticated) during the pairing flow:
1. Generate a random 32-byte hex bridge token.
2. Store it on the user's `userSettings.bridgeToken` (replaces any previous token).
3. Return the token to the webapp, which passes it to the bridge via localhost redirect.

---

## Auth: webapp-intermediary pairing

The bridge opens the user's browser to the webapp. The webapp handles Clerk login (existing), generates a bridge token, and redirects back to the bridge's ephemeral localhost server. The bridge never touches Clerk directly.

```
Bridge                           Webapp                          Convex
  │                                │                               │
  │  (first run, no .bridge-auth)  │                               │
  │                                │                               │
  │  1. Start ephemeral HTTP       │                               │
  │     server on 127.0.0.1:{port} │                               │
  │                                │                               │
  │  2. Open browser to:           │                               │
  │     https://app/bridge-pair    │                               │
  │     ?port={port}               │                               │
  │  ─────────────────────────────►│                               │
  │                                │                               │
  │                                │  3. User is signed in via     │
  │                                │     Clerk (or signs in now)   │
  │                                │                               │
  │                                │  4. Page shows:               │
  │                                │     "Pair your bridge?"       │
  │                                │     [Confirm]                 │
  │                                │                               │
  │                                │  5. On confirm:               │
  │                                │     generateBridgeToken()     │
  │                                │  ──────────────────────────► │
  │                                │                    generates  │
  │                                │  ◄────────────────  token     │
  │                                │     returns token             │
  │                                │                               │
  │  6. Redirect to:               │                               │
  │     http://127.0.0.1:{port}    │                               │
  │     /callback?token=brg_...    │                               │
  │  ◄─────────────────────────────│                               │
  │                                │                               │
  │  7. Bridge receives token      │                               │
  │     Saves to .bridge-auth      │                               │
  │     Stops ephemeral server     │                               │
  │     Shows: "Paired! Syncing."  │                               │
  │                                │                               │
  │     Browser shows:             │                               │
  │     "Done! You can close       │                               │
  │      this tab."                │                               │
```

**User experience:**
1. User runs bridge: `npm start`
2. Browser opens automatically to webapp
3. If already signed in → sees "Pair your bridge?" → clicks Confirm
4. Browser shows "Done, close this tab." Bridge shows "Paired! Syncing."
5. Total: **one click** (Confirm). Zero if we auto-confirm (skip step 4).

**Bridge code** (~20 lines):
```js
import { createServer } from 'http';
import { exec } from 'child_process';

function startPairing(appUrl) {
  const port = 49152 + Math.floor(Math.random() * 1000);
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url, `http://127.0.0.1:${port}`);
      const token = url.searchParams.get('token');
      if (token) {
        res.end('Paired! You can close this tab.');
        server.close();
        resolve({ token });
      }
    });
    server.listen(port, '127.0.0.1', () => {
      const pairUrl = `${appUrl}/bridge-pair?port=${port}`;
      exec(`start ${pairUrl}`);  // Windows: opens default browser
      console.log(`Open ${pairUrl} to pair.`);
    });
  });
}
```

**Security:**
- Bridge token is 32-byte hex, generated server-side in Convex.
- The localhost redirect keeps the token on the local machine (never transmitted over the network — the redirect is browser→localhost).
- One token per user (re-pairing replaces the old one).
- User can revoke from webapp (clears `userSettings.bridgeToken`).
- Bridge gets 401 on next push → shows "Token revoked, re-pair required."
- Ephemeral server only listens on `127.0.0.1` (not `0.0.0.0`), shuts down after receiving the token.

---

## Frontend changes

### Removed

- **`useEmulatorBridge` hook** — WebSocket client, no longer needed.
- **`useAutoSyncCollection`** — browser-mediated sync, replaced by bridge → Convex direct.
- **`useAutoSyncHand`** — same.
- All WebSocket-related types, connection management, reconnection logic.

### Refactored: `usePostDuelSuggestion`

Currently watches `bridge.inDuel` and `bridge.collection` from WebSocket. New version watches Convex subscriptions:

```ts
const duelState = useQuery(api.duelState.get);     // { inDuel, phase, hand, field }
const ownedCardTotals = useOwnedCardTotals();       // existing Convex subscription

const isInDuel = duelState?.inDuel ?? false;
// Same state machine: idle → duel_active → optimizing → result
// Optimization runs in-browser via web worker (works on desktop AND mobile)
```

**Timing**: bridge pushes collection change before `inDuel=false` (loot cards are written to RAM while still on results screen, before phase transitions to DUEL_END). The state machine sees collection change while in `duel_active` → triggers optimization. Same order as today.

### Refactored: hand display

Components that currently use `useHand()` (multi-row query) switch to:

```ts
const duelState = useQuery(api.duelState.get);
const hand = duelState?.hand ?? [];   // number[]
const field = duelState?.field ?? []; // FieldCard[]
```

In manual mode (bridge not running): user adds cards via UI, which calls `duelState.updateHand(hand)`.

### Refactored: duel overlay

Components that currently read `bridge.phase`, `bridge.lp`, `bridge.field`, `bridge.stats` switch to reading `duelState`:

```ts
const duelState = useQuery(api.duelState.get);
// phase, hand, field all available
// LP, terrain, fusions, duelistId: removed from UI
```

The duel overlay shows phase + hand + field on all devices.

### New: pairing UI

- `/bridge-pair` route (opened by bridge during pairing flow)
  - Reads `port` from URL query params
  - Shows "Pair your bridge?" with Confirm button (user must be Clerk-authenticated)
  - On confirm: calls `generateBridgeToken` mutation → redirects to `http://127.0.0.1:{port}/callback?token={token}`
  - Shows "Done! You can close this tab." after redirect
- Settings page: "Unpair" button (clears `userSettings.bridgeToken`)
- Bridge status indicator based on `duelState` freshness

---

## Implementation steps

### Step 1: Schema + internal mutations

- Add `duelState` table to schema
- Add `bridgeToken` field to `userSettings`
- Extract `internalMutation` variants of existing hand/collection mutations (shared by browser and bridge auth paths)
- Create `duelState` mutations: `updateFromBridge`, `updateHand`, `clearHand`, `get` query

### Step 2: Convex HTTP endpoints + auth

- Create `convex/http.ts` with `POST /bridge/sync` and `POST /bridge/pair/complete`
- Create `generateBridgeToken` mutation (Clerk-authenticated, called from webapp pairing page)
- Bridge token lookup in httpAction → resolves to userId → calls internal mutations

### Step 3: Frontend migration

- Migrate hand display from `useHand()` (multi-row) to `useQuery(api.duelState.get)` (single record)
- Migrate manual hand mutations (`addToHand`, `removeFromHand`) to array operations on `duelState`
- Refactor `usePostDuelSuggestion` to watch `duelState.inDuel` + `ownedCardTotals` from Convex
- Refactor duel overlay to read phase/field from `duelState`
- Remove `useEmulatorBridge`, `useAutoSyncCollection`, `useAutoSyncHand`
- Add `/bridge-pair` route (pairing page with Confirm button)
- Add "Unpair" button to settings

### Step 4: Bridge rewrite

- Remove WebSocket server + `ws` dependency
- Add HTTP POST to Convex (`fetch()`)
- Add duel state tracking (phase, hand, field, inDuel) with batched change detection
- Add collection/deck change detection (reuse existing)
- Add pairing flow (ephemeral localhost server + browser open)
- Add `.bridge-auth` token loading

### Step 5: Cleanup

- Drop old `hand` table (after confirming no reads)
- Remove WebSocket-related types and test code
- Remove old hand mutations (`batchMigrateHand` multi-row variants)
