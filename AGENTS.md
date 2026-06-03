# AGENTS.md

Keep only repo-specific guidance that should be useful in every agent task.

YFM3 is a Yu-Gi-Oh! Forbidden Memories companion app. Durable product and architecture
rules live in `docs/SPEC.md`.

## Rules

- Run `bun typecheck`, `bun lint`, and `bun run test` before completing changes. `bun lint`
  can modify files; inspect the resulting diff.
- `bun run test` excludes `*.integration.test.ts`; run `bun test:integration` when
  changing behavior covered by integration tests.
- Behavior changes need tests near the changed behavior.
- Update `docs/SPEC.md` when durable behavior, architecture, supported discs, offsets,
  patch semantics, or workflows change.
- `docs/TODO.md` is a curated active backlog, not an ideas file. Do not add items unless
  explicitly asked or when completing/updating existing active work.
- For production scoring or fusion changes, use the reference scorer as ground truth.
  Regenerate `src/test/reference-fixtures.gen.ts` with `bun run gen:ref` after changing
  fixture definitions, game data, or reference scoring logic.
- Write functions in reading order: callers before helpers.
- Implement the smallest business change; do not add speculative capability.
