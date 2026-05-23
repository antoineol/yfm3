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

When choosing a solution, apply these principles:

- Implement the business need, not a generalized future-proof variant of it. Do not add capability for hypothetical future use.
- Earn every added line. If a change feels large for the requested behavior, stop and redesign before continuing.
- Prefer restructuring or simplifying the existing workflow so the feature becomes cheap, rather than layering new state, glue, or synchronization on top. Restructuring should decrease or maintain total LOC, not increase.
- Prefer the design with the lowest overall complexity and the lowest local reading cost.
- Split code into small independent units when that gives narrower interfaces and clearer responsibilities without adding glue state or control flow.
- Reject both extremes: giant monoliths and fragmented abstractions. If a split adds indirection, props, args, or synchronization without making the code simpler to understand, redesign the seam.
- Treat uncertainty as a reason to verify with tests, reproduction, or reading more code, not as a reason to add defensive machinery. When a feature exposes surrounding bloat, simplify that area if it leads to a smaller and clearer end state.

## Confusion points

- `api.deck.getDeck` currently sorts returned rows by `cardId`, not by the fractional `order` field from the schema. If deck order matters for a change, do not assume the query preserves it.
- Rank scoring thresholds live in repeated loaded executable copies in the raw BIN, not reliably in the ISO9660-extracted `SLUS_014.11`. RP 1.3 patches 39 of 40 copies of the cards-used row; scanning only the extracted executable shows zeroed runtime data and misses the active rank table.
- The community x15 drop recipe is Ghost's `Drop More Cards` approach for vanilla/FMR `SLUS_014.11`: patch the root executable and `DATA/WA_MRG.MRG`, or the matching raw loop anchors. Do **not** apply the Ghost WA_MRG injection to Gold `SLUS_000.04`; Gold's active WA_MRG blocks differ and that crash was reproduced at duel start after drawing the hand.
- Gold `SLUS_000.04` x15 patching is disabled until proven by manual test. Failed attempts: Ghost `WA_MRG.MRG` injection crashed at duel start; buffered/visible-hook variants using `0x80021f24` crashed entering the result screen; `gold-expansion-picker-x15` in zeroed `SLUS:0x19b440` also crashed entering the result screen. Ghidra C decompilation shows Gold still uses `FUN_80021810(selector)` to pick and `FUN_80021894(card)` to credit, with displayed reward picked before the award site at `0x80021f10`. The next candidate should be an isolated no-stack award-site trampoline: credit the displayed card, recompute or preserve the selector with evidence, roll and credit 14 extra cards, then jump to `0x8002209c`.
- Use `bun run test`, not raw `bun test`: the test suite relies on Vitest features and environment directives such as `vi.hoisted` and `happy-dom`.
