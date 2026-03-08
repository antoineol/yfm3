# Port YFM2 Front-End Features to YFM3

## Context

YFM3 has a solid deck optimization engine (SA + Web Workers + exact scoring). Its front-end is minimal: 3-column layout (Collection, Deck, Results) with basic config and a single "Optimize" button.

YFM2 has a richer front-end with features designed for a **game copilot** experience — helping the player during actual gameplay, not just deck building.

## Goal

Port YFM2's best UX features to YFM3, prioritized by impact on the copilot experience.

## Feature Gap Analysis


| Feature                        | YFM2       | YFM3             | Copilot Impact                             |
| ------------------------------ | ---------- | ---------------- | ------------------------------------------ |
| Hand Fusion Calculator         | Yes        | No               | **Critical** — real-time gameplay aid      |
| Optimization Progress + Cancel | Yes        | No               | High — long-running process needs feedback |
| Accept/Reject Suggested Deck   | Yes        | No               | High — review before committing            |
| Manual Deck Fine-Tuning        | Yes        | No               | High — tweak suggestion or current deck    |
| Score Explanation              | Yes        | No               | Medium — understand deck strengths         |
| Deck Fusion List               | Yes        | No               | Medium — know possible fusions pre-game    |
| Card Autocomplete Search       | Yes        | No               | Medium — faster collection management      |
| Last Added Card Hint           | Yes        | No               | Low-Medium — convenience for bulk entry    |
| Fusion Search/Browse           | Yes        | No               | Low — reference tool                       |
| Multi-page Navigation          | Yes (tabs) | No (single page) | Depends on feature count                   |
| Card Registration Form         | Yes        | No               | Not needed — data comes from CSV           |


## Step Plan (Prioritized for Copilot UX)


| Priority | Step                   | File                                                                | What It Builds                                                                 |
| -------- | ---------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **P0a**  | **Authentication**     | [`p1.1-auth.md`](p1.1-auth.md)                                     | Auto-generated user ID, remove manual input, shared session with YFM2          |
| **P0b**  | **Baseline UX Polish** | [`p1.5-baseline-ux-polish.md`](p1.5-baseline-ux-polish.md)         | Fix broken config inputs, visual hierarchy, card display, empty/loading states |
| P1       | Hand Fusion Calculator | [`p2-hand-fusion-calculator.md`](p2-hand-fusion-calculator.md)      | 5-card hand simulation, real-time fusion chains, "play fusion" action          |
| P2       | Optimization UX        | [`p3-optimization-ux.md`](p3-optimization-ux.md)                   | Progress bar, cancel, accept/reject + **manual fine-tuning** of suggested deck |
| P3       | Deck Intelligence      | [`p4-deck-intelligence.md`](p4-deck-intelligence.md)               | Deck fusion list, score explanation with probabilities                         |
| P4       | Collection UX          | [`p5-collection-ux.md`](p5-collection-ux.md)                       | Card autocomplete, last-added hint, **manual deck add/remove**                 |
| P5       | Fusion Reference       | [`p6-fusion-reference.md`](p6-fusion-reference.md)                 | Fusion lookup tool, browsable fusion database                                  |


## What We Keep As-Is

- **Engine:** SA optimizer, Web Workers, exact scoring — no changes needed.
- **Backend:** Convex schema already has `hand` table, collection/deck mutations — ready to use.
- **Config:** Deck size and fusion depth config exists but inputs are broken (fixed in P0).

## Architecture Notes

- YFM3 uses **Jotai** (not Zustand like YFM2) for client state.
- YFM3 uses **Vite** (not Next.js like YFM2) — no routing framework, will need lightweight client-side routing or tabs.
- YFM3's engine `FusionScorer` returns only max ATK (optimized for speed). The hand fusion calculator needs a **separate, user-facing fusion chain finder** that returns full chain details (materials, intermediate results). This is a new module, not a modification of the hot-path scorer.
- Convex `hand` table already exists with add/remove/clear mutations — ready for P1.

