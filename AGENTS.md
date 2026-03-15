# AGENTS.md

The role of this file is to describe common mistakes and confusion points that agents might encounter as they work in this project. If you ever encounter something in the project that surprises you, please alert the developer working with you and indicate that this is the case in the AgentMD file to help prevent future agents from having the same issue.

## Purpose

This project is a deck optimizer for "Yu-Gi-Oh! Forbidden Memories" game, "Remastered Perfected" mod. Given a player's card collection, it generates an optimal 40-card monster deck that maximizes the **expected value of the highest attack** achievable from a random 5-card opening hand, considering both direct card plays and fusion chains.

## Other files

- README.md: scripts and usage instructions.
- docs/PLAN.md: the high-level plan to implement this app.
- docs/steps/*: the plan's implementation steps.
- src/engine/data/*: imported from another project, provides a bunch of utils that will be useful.

## Rules

You must always do below for all changes:

- `bun typecheck`, `bun lint` and `bun run test` before completing tasks.
- Write functions in reading order. If A calls B, write A then B.
- Cover all behavior changes by specs.
- Adapt the plan, and current and next steps.
- Business-oriented, simple, concise answers.
- Simple, concise, minimalist code. Avoid indirection and unnecessary abstraction layers.
- Do not assume the architecture in place is correct. Challenge it as any architect would do.
- Don't think local. Always consider the whole architecture and workflows.

## Confusion points

- `api.deck.getDeck` currently sorts returned rows by `cardId`, not by the fractional `order` field from the schema. If deck order matters for a change, do not assume the query preserves it.
