# Phase Init: Tech Stack Bootstrap

**Goal:** A building, testing, serving project with the `src/engine/` ↔ `src/ui/` boundary proven — but zero engine logic.

**Outputs consumed by Phase 0:** A working repo where `bun test` and `bun run dev` both work, and any file placed under `src/engine/` is automatically available to both Vitest and the Vite/React app.

---

## Scaffold

Run `bun create vite yfm3 --template react-ts` then adapt:

1. **Move the generated React files** into `src/ui/` (keep `main.tsx`, `App.tsx`, `App.css`). Update `index.html` entry point to `src/ui/main.tsx`.
2. **Create `src/engine/`** directory with a single `index.ts` exporting `export function ping(): string { return "engine-ok"; }`.
3. **Add path alias** `@engine` → `src/engine` in both `tsconfig.json` (`paths`) and `vite.config.ts` (`resolve.alias`).
4. **Add Vitest**: `bun add -d vitest`. Create `vitest.config.ts` extending the Vite config (reuses aliases). No separate tsconfig for tests — the shared one works.
5. **Wire scripts** in `package.json`:
   ```
   "dev": "vite",
   "build": "vite build",
   "test": "vitest run",
   "test:watch": "vitest",
   "bench": "vitest bench"
   ```
6. **Tighten tsconfig**: ensure `strict: true`, `target: ES2022`, `moduleResolution: bundler`, `noUnusedLocals: true`.

---

## Boundary Rule

| Directory | May import | Must NOT import |
|-----------|-----------|----------------|
| `src/engine/` | Nothing outside itself. Pure TS only. | `react`, DOM APIs, `bun:*`, `node:*` |
| `src/ui/` | `@engine`, `react`, DOM | — |
| `tests/` | `@engine`, `vitest` | `react`, DOM |

This rule is **enforced by convention** in this phase. (A lint rule can be added later.)

---

## Smoke Proof

Two minimal proofs that the boundary works:

1. **`tests/smoke.test.ts`** — Vitest imports `ping()` from `@engine`, asserts `=== "engine-ok"`.
2. **`src/ui/App.tsx`** — Imports `ping()` from `@engine`, renders the return value in the page.

---

## Success Criteria

| Check | Command |
|-------|---------|
| Dependencies install | `bun install` exits 0 |
| Types check | `bun run tsc --noEmit` exits 0 |
| Unit tests pass | `bun test` — smoke test green |
| Dev server works | `bun run dev` — page loads, shows "engine-ok" |
| Production build | `bun run build` — outputs to `dist/`, no errors |
| Bench scaffold works | `bun run bench` — runs (even with no bench files yet, exits 0 or "no bench files found") |

**After this phase, the repo is ready for Phase 0 to populate `src/engine/` with types, dummies, and benchmarks.**
