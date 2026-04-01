# Claude.md

The role of this file is to describe common mistakes and confusion points that agents might encounter as they work in this project. If you ever encounter something in the project that surprises you, please alert the developer working with you and indicate that this is the case in the AgentMD file to help prevent future agents from having the same issue.

## Purpose

This project is a deck optimizer for "Yu-Gi-Oh! Forbidden Memories" game, "Remastered Perfected" mod. Given a player's card collection, it generates an optimal 40-card monster deck that maximizes the **expected value of the highest attack** achievable from a random 5-card opening hand, considering both direct card plays and fusion chains.

## Other files

- README.md: scripts and usage instructions.
- docs/PLAN.md: the high-level plan to implement this app.
- docs/steps/*: the plan's implementation steps.
- src/engine/data/*: imported from another project, provides a bunch of utils that will be useful.

## How to work

**Use your judgment.** The principles and rules below exist because specific failure modes were observed. They are not rituals. Understand *why* each rule exists (rationale in `docs/refact/principles-rationale.md`), then apply the spirit — not just the letter. If a rule would produce worse code in a specific situation, say so and explain why. A clear 45-line function is better than two confused 25-line halves. Never split, rename, or restructure code just to hit a number.

**Think before acting.** Before writing or modifying code, ask yourself: what is the ONE thing this unit does? If you can't answer clearly, stop and decompose first. This is where most mistakes happen — not in the implementation, but in the scoping.

## Coding Principles

All code — new and modified — must follow `docs/refact/principles.md`. Key rules:

- **Single responsibility:** A function either COMPUTES or ORCHESTRATES, never both. A component either RENDERS or MANAGES STATE, never both. If describing what a unit does requires "and", split it.
- **Size limits:** Functions: ~40 lines. Files: ~150 lines of logic. Args: 3. Props: 5. Nesting: 2 levels. These are targets that signal "check if this unit does too much" — not mechanical cut points.
- **Refactor on touch:** When modifying a file for feature work, bring **touched functions** to principle compliance. Not the whole file — just what you touch. Refactor in a separate commit before the behavior change.

Full principles: `docs/refact/principles.md`. Rationale and examples: `docs/refact/principles-rationale.md`.

## Rules

You must always do below for all changes:

- `bun typecheck`, `bun lint` and `bun run test` before completing tasks.
- Write functions in reading order. If A calls B, write A then B.
- Cover all behavior changes by specs.
- Adapt the plan, and current and next steps.
- Never run `npx convex import --replace-all` — it wipes the entire deployment.
