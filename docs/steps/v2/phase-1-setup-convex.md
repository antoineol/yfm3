# Phase 1-UI: Setup Convex + Minimalist UI (DONE)

## Context

The deck optimizer engine (phases 1-5) is complete and works in Node/Bun. An existing Convex database (yfm2 project, deployment `dev:adamant-condor-151`) stores player card collections. We built a minimalist browser UI to:
1. Display a player's collection from Convex
2. Run `optimizeDeck` client-side
3. Display the optimized deck result

Purpose: manual end-to-end testing of the optimizer.

## What was built

### Engine changes
- Extracted `loadGameDataFromStrings(buf, cardsCsv, fusionsCsv)` from `loadGameData` for browser compatibility
- Created `src/engine/initialize-buffers-browser.ts` using Vite `?raw` CSV imports
- Created `src/engine/index-browser.ts` -- browser-compatible `optimizeDeck` (15s default)

### UI (Tailwind + Convex React)
- `src/ui/lib/convex-client.ts` -- ConvexReactClient
- `src/ui/lib/use-user-id.ts` -- localStorage-persisted userId hook
- `src/ui/lib/card-db-context.tsx` -- CardDb context from parsed CSV
- `src/ui/components/CollectionPanel.tsx` -- collection table + optimize button
- `src/ui/components/ResultPanel.tsx` -- optimized deck + stats display
- `src/ui/App.tsx` -- main layout
- `src/ui/main.tsx` -- ConvexProvider + CardDbProvider wrappers

### Configuration
- Added `convex/` directory (copied from yfm2 for type-safe API)
- Added Tailwind via `@tailwindcss/vite`
- `.env.local` with `VITE_CONVEX_URL`

## Usage

```bash
bun run dev
```

Open browser, enter a userId that has data in the yfm2 Convex DB, see collection, click Optimize, see deck + stats.
