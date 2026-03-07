# YFM3 - FM Deck Optimizer

Deck optimizer for Yu-Gi-Oh! Forbidden Memories (Remastered Perfected mod). Generates an optimal 40-card monster deck that maximizes expected ATK from a random 5-card opening hand, considering fusion chains.

## Scripts

| Command | What it does |
|---------|-------------|
| `bun test` | Run all unit tests (~200ms, no expensive scoring) |
| `bun run gen:ref` | Generate reference-scored fixtures. Reads definitions from `src/test/reference-fixture-defs.ts`, scores them via the reference scorer, writes `src/test/reference-fixtures.gen.ts`. Takes ~1-10s (deck scoring is slow). |
| `bun lint` | Lint and auto-fix with Biome |
| `bun run typecheck` | Run TypeScript type checker |
| `bun run dev` | Start Vite dev server |
| `bun run build` | Production build |
| `bun run bench` | Run benchmarks |

## Reference fixture workflow

The reference scorer is the ground truth for evaluating all production components.

1. **Define** fixture inputs (hands/decks) in `src/test/reference-fixture-defs.ts`
2. **Generate** scored fixtures: `bun run gen:ref` (writes `src/test/reference-fixtures.gen.ts`)
3. **Test** production code against generated fixtures: `bun test`

Regenerate after changing game data, reference scorer logic, or fixture definitions.
