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
- Deck optimization may optimize fewer than 40 scoring slots when magic/trap/utility cards are preserved, but score calculation still uses the full 40-card deck probability model. Do not treat `deckSize` as the physical deck size without checking the scoring-slots workflow.
- Rank scoring thresholds live in repeated loaded executable copies in the raw BIN, not reliably in the ISO9660-extracted `SLUS_014.11`. RP 1.3 patches 39 of 40 copies of the cards-used row; scanning only the extracted executable shows zeroed runtime data and misses the active rank table.
- The community x15 drop recipe is Ghost's `Drop More Cards` approach: patch the root executable and `DATA/WA_MRG.MRG`, or the matching raw loop anchors. The full blob includes a 0x40-byte zero prelude; code starts 0x40 bytes later. For root executables, write the full blob at `0x19b400` so hooks land at code entry `0x801aac40` / file `0x19b440`. In NTSC `WA_MRG.MRG`, the full blob starts at `0xb4c400 + i*0x75800` for `i=1..7`.
- PAL French `SLES_039.48` x15 is verified with a PAL-specific Ghost port: root hooks `0x120f0`, `0x12528`, `0x127cc`, picker delay-slot nop at `0x12100`, root full blob at `0x19b400`, and PAL WA copies at `0xe25400 + i*0x78000` for `i=0..6`. Keep `0x28590` vanilla; hooking it hits shared PAL script/text rendering and crashed deck edit.
- Gold `SLUS_000.04` uses the same community x15 shape as vanilla/FMR, but has a local continuation instruction at `SLUS:0x1247c`; preserve it by writing only the two hook words at `0x1246c`. Do not add custom local reward trampolines or call the drop picker at the later award site.
- Use `bun run test`, not raw `bun test`: the test suite relies on Vitest features and environment directives such as `vi.hoisted` and `happy-dom`.
- Duel battle prediction does not yet know the selected guardian star from RAM. Until that byte is mapped, it falls back to each card's primary guardian star, so live checks with manually selected secondary stars may disagree.
