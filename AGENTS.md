# AGENTS.md

The role of this file is to describe common mistakes and confusion points that agents might encounter as they work in this project. If you ever encounter something in the project that surprises you, please alert the developer working with you and indicate that this is the case in the AgentMD file to help prevent future agents from having the same issue.

## Purpose

This project is a deck optimizer for "Yu-Gi-Oh! Forbidden Memories" game, "Remastered Perfected" mod. Given a player's card collection, it generates an optimal 40-card monster deck that maximizes the **expected value of the highest attack** achievable from a random 5-card opening hand, considering both direct card plays and fusion chains.

## Other files

- README.md: scripts and usage instructions.
- docs/SPEC.md: product and architecture source of truth.
- docs/TODO.md: active backlog only; delete completed items instead of preserving history.
- src/engine/data/*: imported from another project, provides a bunch of utils that will be useful.

## Rules

You must always do below for all changes:

- `bun typecheck`, `bun lint` and `bun run test` before completing tasks.
- Write functions in reading order. If A calls B, write A then B.
- Cover all behavior changes by specs.
- Adapt docs/SPEC.md and docs/TODO.md when a change affects durable behavior or active work.
- Business-oriented, simple, concise answers.
- Simple, concise, minimalist code. Avoid indirection and unnecessary abstraction layers.
- Do not assume the architecture in place is correct. Challenge it as any architect would do.
- Don't think local. Always consider the whole architecture and workflows.

When choosing a solution, apply these principles:

- Implement the business need, not a generalized future-proof variant of it. Do not add capability for hypothetical future use.
- Earn every added line. If a change feels large for the requested behavior, stop and redesign before continuing.
- Prefer restructuring or simplifying the existing workflow so the feature becomes cheap, rather than layering new state, glue, or synchronization on top. Restructuring should decrease or maintain total LOC, not increase.
- Prefer the design with the lowest overall complexity and the lowest local reading cost.
- Split code into small independent units when that gives narrower interfaces and clearer responsibilities without adding glue state or control flow.
- Reject both extremes: giant monoliths and fragmented abstractions. If a split adds indirection, props, args, or synchronization without making the code simpler to understand, redesign the seam.
- Treat uncertainty as a reason to verify with tests, reproduction, or reading more code, not as a reason to add defensive machinery. When a feature exposes surrounding bloat, simplify that area if it leads to a smaller and clearer end state.

## Confusion points

- The Ghost Drop More Cards reward expansion contains its own MIPS loop counters. Counts above 255 require halfword/word counter opcodes in the injected expansion; changing TypeScript selectable/recognized count tables alone can create an ISO that patches successfully but hangs/crashes at the duel result screen.
