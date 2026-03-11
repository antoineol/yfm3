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


## Step Plan (Prioritized for Copilot UX and supporting infrastructure)


| Priority | Step                       | File                                                                | What It Builds                                                                 |
| -------- | -------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **P0a**  | **Authentication** (DONE)  | [`p1.1-auth.md`](p1.1-auth.md)                                     | Convex Auth + Google OAuth, replace manual userId with real cross-device auth  |
| **P0b**  | **Baseline UX Polish** (DONE) | [`p1.5-baseline-ux-polish.md`](p1.5-baseline-ux-polish.md)      | Fix broken config inputs, visual hierarchy, card display, empty/loading states |
| **P0c**  | **Shared Infrastructure**  | [`p1.9-shared-infrastructure.md`](p1.9-shared-infrastructure.md)    | FusionTable context, CardAutocomplete component, tab navigation shell          |
| P1       | Hand Fusion Calculator     | [`p2-hand-fusion-calculator.md`](p2-hand-fusion-calculator.md)      | 5-card hand simulation, real-time fusion chains, play fusion (consume materials) |
| P2       | Optimization UX            | [`p3-optimization-ux.md`](p3-optimization-ux.md)                   | Progress bar, cancel, accept/reject + **manual fine-tuning** of suggested deck |
| P3       | Deck Intelligence          | [`p4-deck-intelligence.md`](p4-deck-intelligence.md)               | Deck fusion list, score explanation with probabilities                         |
| P4       | Collection UX              | [`p5-collection-ux.md`](p5-collection-ux.md)                       | Last-added hint, collection actions, **manual deck add/remove**                |
| P7       | Shared Reference Data      | [`p7-fusion-reference.md`](p7-fusion-reference.md)                 | Google Sheets as canonical source, shared runtime store, permissions model, and backup snapshots |
| P8       | Google Sheets Fusions      | [`p8-google-sheets-fusions.md`](p8-google-sheets-fusions.md)       | Replace static fusion CSV with backend-imported Google Sheets fusion data       |

P7 is not a direct YFM2 feature port. It is supporting infrastructure needed to keep the reference dataset correct as new discoveries are made during gameplay.
P8 is the concrete migration step that moves the fusion dataset off the bundled CSV path.


## What We Keep As-Is

- **Engine:** SA optimizer, Web Workers, exact scoring — no changes needed.
- **Backend:** Convex schema already has `hand` table, collection/deck mutations — ready to use.
- **Config:** Deck size and fusion depth config exists but inputs are broken (fixed in P0).

## Architecture Notes

- YFM3 uses **Jotai** (not Zustand like YFM2) for client state.
- YFM3 uses **Vite** (not Next.js like YFM2) — no routing framework, will need lightweight client-side routing or tabs.
- YFM3's engine `FusionScorer` returns only max ATK (optimized for speed). The hand fusion calculator needs a **separate, user-facing fusion chain finder** that returns full chain details (materials, intermediate results). This is a new module, not a modification of the hot-path scorer.
- Convex `hand` table already exists with add/remove/clear mutations — ready for P1.
