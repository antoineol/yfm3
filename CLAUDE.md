# Claude.md

## Purpose

Deck optimizer for "Yu-Gi-Oh! Forbidden Memories" (Remastered Perfected mod). Given a player's card collection, generates an optimal 40-card monster deck that maximizes the **expected value of the highest attack** from a random 5-card opening hand, considering direct plays and fusion chains.

## Key files

- `docs/PLAN.md`: implementation plan and current status.
- `docs/steps/*`: detailed implementation steps.
- `src/engine/data/*`: game data utilities (card DB, fusion tables, CSV loaders).

## How to work

**Use your judgment.** The principles and rules below exist because specific failure modes were observed. They are not rituals. Understand *why* each rule exists, then apply the spirit — not just the letter. If a rule would produce worse code in a specific situation, say so and explain why. A clear 45-line function is better than two confused 25-line halves. Never split, rename, or restructure code just to hit a number.

**Think before acting.** Before writing or modifying code, ask yourself: what is the ONE thing this unit does? If you can't answer clearly, stop and decompose first. This is where most mistakes happen — not in the implementation, but in the scoping.

## Coding Principles

All code — new and modified — must follow `docs/refact/principles.md`. Key rules:

- **Single responsibility:** A function either COMPUTES or ORCHESTRATES, never both. A component either RENDERS or MANAGES STATE, never both. If describing what a unit does requires "and", split it.
- **Size limits:** Functions: ~40 lines. Files: ~150 lines of logic. Args: 3. Props: 5. Nesting: 2 levels. These are targets that signal "check if this unit does too much" — not mechanical cut points.
- **Refactor on touch:** When modifying a file for feature work, bring **touched functions** to principle compliance. Not the whole file — just what you touch. Refactor in a separate commit before the behavior change.

Full principles: `docs/refact/principles.md` (self-sufficient — no other file needed for coding work).

## Maintaining the principles

To update or iterate on the principles, consult `docs/refact/principles-rationale.md` — it is the source document with detailed rationale, enforcement heuristics, examples, and edge cases. `principles.md` is derived from it.

## Rules

- `bun typecheck`, `bun lint` and `bun run test` before completing tasks.
- Cover all behavior changes by specs.
- Never run `npx convex import --replace-all` — it wipes the entire deployment.
