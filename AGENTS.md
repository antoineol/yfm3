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
- Starchip x15 is a separate verified reward-save arithmetic patch, not part of Ghost's card picker loop. Preserve the result-screen `rankStarchips` field and patch only the save update from `save += rankStarchips` to `save += rankStarchips * 15`. The byte anchor is `3a004390 e005828c 00000000 21104300 e00582ac`; the x15 form is `3a004390 e005828c 00290300 2318a300 21104300 e00582ac`. Verified runtime results: PAL FR S-rank `22 -> 97`, NTSC S-rank `5 -> 80`, both with 15 cards.
- Gold `SLUS_000.04` uses the same community x15 shape as vanilla/FMR, but has a local continuation instruction at `SLUS:0x1247c`; preserve it by writing only the two hook words at `0x1246c`. Do not add custom local reward trampolines or call the drop picker at the later award site.
- Use `bun run test`, not raw `bun test`: the test suite relies on Vitest features and environment directives such as `vi.hoisted` and `happy-dom`.
- Duel battle prediction does not yet know the selected guardian star from RAM. Until that byte is mapped, it falls back to each card's primary guardian star, so live checks with manually selected secondary stars may disagree.
- PAL French rank stats for live `SLES_039.48` use the result block at `0x0eb279`; the earlier `0x0eae59` note was wrong for the running bridge and reads code/table-looking bytes. Important PAL rank bytes: turns `0x0eb279`, effective attacks `0x0eb27a`, defensive wins `0x0eb27b`, face-downs `0x0eb27c`, pure magic `0x0eb27d`, traps `0x0eb27e`, recap combo plays `0x0eb27f`, initiated fusions/rank "Fusions" `0x0eb280`, equip magic `0x0eb281`, rank LP `0x0eb28a`, cards used `0x0eb296`. `0x0eb290` is the hand/deal helper counter, not rank cards-used.
- PAL French `0x0eb296` is the result-screen rank cards-used byte and can be `0xff` or stale during an active duel. For live in-duel "Cards left", use the hand/deal counter at `0x0eb290`; on the result screen, use `0x0eb296` so the recap/rank score matches the game.
- PAL French cursor target card id is `0x09c6b8` (`duelPhase+0x154`), not the NTSC `duelPhase+0xfe`. PAL French field-card focus uses `0x09c6d1` as a non-zero focus-present signal and `0x00` on empty field slots; it is not a trusted physical slot index. Do not treat `0x09c6e8` as the PAL field cursor slot; it matched one empty-slot snapshot but is a false lead from the previously rejected per-duelist area.
- PAL WA_MRG stores localized type and guardian-star display labels, but bridge card metadata must keep canonical structural enum values (`Magic`, `Sun`, etc.) so shared engine/UI code behaves like NTSC/RP. Localize names/descriptions/duelists only.
- Post-duel optimization must tolerate fast results-screen advancement. Reward collection changes may arrive before the bridge reports `ended`, and optimization should keep running even if the next duel starts; do not cancel just because a confirmed active duel begins.
- Post-duel optimization must also handle reconnecting while already on the results screen. The bridge can legitimately report an initial `ended` phase for known duel scenes, and the optimizer detector may need the last saved bridge collection as its pre-duel baseline before auto-sync overwrites it.
- This WSL dev environment may not have a `node` binary even though Convex's package bin uses `#!/usr/bin/env node`; run Convex through Bun/package scripts such as `bun run dev:backend`, not by executing `./node_modules/.bin/convex` directly.
