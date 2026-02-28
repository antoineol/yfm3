# Phase Init: Tech Stack Bootstrap

**Goal:** Scaffold the project so the core engine is environment-agnostic — runs identically under Bun (CLI/test) and the browser (Vite/React webapp). No optimizer code yet — just the skeleton that proves both entry points build and execute.

---

## Stack

| Concern | Tool |
|---------|------|
| Runtime (dev/test) | Bun |
| Test runner | Vitest |
| Bundler / dev server | Vite |
| UI | React (minimal — one page shell) |
| Language | TypeScript, strict mode |

## Rules

1. **The `src/engine/` directory is the boundary.** Everything inside it is pure TypeScript — no DOM, no React, no `import from "react"`, no Node/Bun-specific APIs. Only TypedArrays, plain functions, and Web Worker `postMessage`. This is the code that must run on both targets.
2. **The `src/ui/` directory is React/browser-only.** It imports from `src/engine/` but never the reverse.
3. **Vitest runs the engine directly via Bun** — no bundler in the loop. Tests import from `src/engine/` and exercise it as a library.
4. **Vite builds the webapp** — bundles `src/ui/` + `src/engine/` for the browser, with Web Worker support via `new Worker(new URL(...), { type: 'module' })`.

## Deliverables

1. `package.json` — Bun project. Scripts: `dev` (Vite), `build` (Vite), `test` (Vitest), `bench` (Vitest bench).
2. `tsconfig.json` — `strict: true`, `target: ES2022`, `module: ESNext`, `moduleResolution: bundler`. Paths alias `@engine` → `src/engine`.
3. `vite.config.ts` — React plugin, resolve alias for `@engine`, worker config.
4. `vitest.config.ts` — Reuses Vite config, adds `src/engine/` test glob.
5. `index.html` + `src/ui/main.tsx` + `src/ui/App.tsx` — Bare-bones React shell that renders "YFM3" and a placeholder "Optimize" button.
6. `src/engine/index.ts` — Exports a single `ping(): string` function returning `"engine-ok"`.
7. `src/ui/App.tsx` — Imports `ping()` from `@engine` and renders its return value, proving the import path works at runtime.
8. `tests/smoke.test.ts` — Imports `ping()` from `@engine`, asserts it returns `"engine-ok"`. Proves Vitest can consume the engine directly.

## Success Criteria

- `bun install` succeeds.
- `bun test` runs the smoke test and passes.
- `bun run dev` starts Vite, the React page loads, and displays "engine-ok" from the engine import.
- `bun run build` produces a working production bundle.
- `src/engine/` contains zero browser or framework imports.
