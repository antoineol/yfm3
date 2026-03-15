# YFM3 - FM Deck Optimizer

Deck optimizer for Yu-Gi-Oh! Forbidden Memories (Remastered Perfected mod). Generates an optimal 40-card monster deck that maximizes expected ATK from a random 5-card opening hand, considering fusion chains.

## Scripts

| Command | What it does |
|---------|-------------|
| `bun run test` | Run unit tests (fast, no real game data) |
| `bun run test:integration` | Run integration tests (real game data, full pipeline) |
| `bun run test:all` | Run all tests (unit + integration) |
| `bun run gen:ref` | Generate reference-scored fixtures. Reads definitions from `src/test/reference-fixture-defs.ts`, scores them via the reference scorer, writes `src/test/reference-fixtures.gen.ts`. Takes ~1-10s (deck scoring is slow). |
| `bun lint` | Lint and auto-fix with Biome |
| `bun run typecheck` | Run TypeScript type checker |
| `bun run dev` | Start Vite dev server |
| `bun run build` | Production build |
| `bun run bench` | Run benchmarks |

## Auth Setup

Authentication uses Clerk with Google sign-in and Convex-backed data access.

Local `.env.local`:

```bash
VITE_CONVEX_URL=https://<deployment>.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_...
```

Use [`.env.example`](/home/ubuntu/perso/yfm3/.env.example) as the local template.

Do not add `CLERK_FRONTEND_API_URL` to the Vite app config unless you have a separate reason to keep it locally. The frontend does not use it.

Convex deployment env only:

```bash
CLERK_FRONTEND_API_URL=https://<your-instance>.clerk.accounts.dev
```

Clerk dashboard requirements:

1. Create a React app
2. Enable Google auth
3. Create a JWT template named exactly `convex`

If the `convex` JWT template is missing, Clerk sign-in may succeed while the app still loops on the sign-in screen because Convex stays unauthenticated.

## Reference fixture workflow

The reference scorer is the ground truth for evaluating all production components.

1. **Define** fixture inputs (hands/decks) in `src/test/reference-fixture-defs.ts`
2. **Generate** scored fixtures: `bun run gen:ref` (writes `src/test/reference-fixtures.gen.ts`)
3. **Test** production code against generated fixtures: `bun run test`

Regenerate after changing game data, reference scorer logic, or fixture definitions.
