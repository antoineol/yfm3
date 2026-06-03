# Yu-Gi-Oh! Forbidden Memories copilot

Deck optimizer for Yu-Gi-Oh! Forbidden Memories (vanilla and mods). Generates an optimal 40-card monster deck that maximizes expected ATK from a random 5-card opening hand, considering fusion chains.

## Usage

- https://yfm-copilot.vercel.app
- Follow the onboarding steps. It covers:
  - Third party requirements (the game or mod, Duckstation or Romstation)
  - The bridge app to run on your computer, alongside the emulator, that links the copilot to the game

After the first onboarding, a typical usage is:

- Open the game (Duckstation / Romstation)
- Open the [copilot app](https://yfm-copilot.vercel.app)
- Open the bridge and keep it in background

## Development

### Setup

- Sign up to Clerk (required) and Convex (optional) for dev accounts
- Copy `.env.local.example` to `.env.local` and fill the missing keys
- `bun install`
- `bun dev` (webapp in dev mode)
- `bun bridge` (bridge in dev mode)

### Scripts

| Command | What it does |
|---------|-------------|
| `bun dev` | Start Vite dev server |
| `bun lint` | Lint and auto-fix with Biome |
| `bun typecheck` | Run TypeScript type checker |
| `bun run test` | Run unit tests (fast, no real game data) |
| `bun test:integration` | Run integration tests (real game data, full pipeline) |
| `bun test:all` | Run all tests (unit + integration) |
| `bun gen:ref` | Generate reference-scored fixtures. Reads definitions from `src/test/reference-fixture-defs.ts`, scores them via the reference scorer, writes `src/test/reference-fixtures.gen.ts`. Takes ~1-10s (deck scoring is slow). |
| `bun run build` | Production build |

### Auth Setup

(useful for manual mode only)

Authentication uses Clerk with Google sign-in and Convex-backed data access.

Clerk dashboard requirements:

1. Create a React app
2. Enable Google auth
3. Create a JWT template named exactly `convex`

If the `convex` JWT template is missing, Clerk sign-in may succeed while the app still loops on the sign-in screen because Convex stays unauthenticated.

Convex deployment env only:

```bash
CLERK_FRONTEND_API_URL=https://<your-instance>.clerk.accounts.dev
```

### Reference fixture workflow

(is this section stale?)

The reference scorer is the ground truth for evaluating all production components.

1. **Define** fixture inputs (hands/decks) in `src/test/reference-fixture-defs.ts`
2. **Generate** scored fixtures: `bun run gen:ref` (writes `src/test/reference-fixtures.gen.ts`)
3. **Test** production code against generated fixtures: `bun run test`

Regenerate after changing game data, reference scorer logic, or fixture definitions.
