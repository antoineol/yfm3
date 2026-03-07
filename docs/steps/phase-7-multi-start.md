# Phase 7 (V2): Multi-Start Seeding

This phase is an optional V2 enhancement to the plan in PLAN.md file.

**Goal:** Start each worker from a different initial deck for search-space diversity. Prevents all workers from getting stuck in the same local optimum near the greedy starting deck.

**Depends on:** Phase 6 (Web Workers).

**Risk addressed:** The greedy starting deck is a specific local optimum (high ATK, few fusions). Without multi-start, all workers explore the same neighborhood. Multi-start lets some workers discover fusion-synergy-rich regions that greedy misses entirely.

---

## 7.1 Seed Strategies

Each worker gets a different initial deck:

- **Worker 0:** Greedy seed (highest ATK cards) — the default from Phase 1
- **Worker 1:** Greedy seed + 10 random perturbations (swap 10 random slots with random available cards)
- **Workers 2–N:** Fully random valid decks from the collection (pick 40 random cards respecting MAX_COPIES)

---

## 7.2 File to Create

| File | Purpose |
|------|---------|
| `src/engine/optimizer/seed-strategies.ts` | Functions to generate different initial decks |

---

## 7.3 Refinement Pipeline Update

With multiple workers returning different best decks, the refinement step (Phase 5.1) expands:

1. **Deduplicate:** Sort card IDs in each deck, remove identical decks.
2. **Rank by MC score:** Take top ~7 unique decks.
3. **Exact score each:** Run exhaustive evaluator (~660ms each, ~5s total).
4. **Select winner:** Return deck with highest exact expected ATK.

This is important because MC scores have sampling noise — the worker with the highest MC score may not have the truly best deck. Exact scoring resolves ties.
