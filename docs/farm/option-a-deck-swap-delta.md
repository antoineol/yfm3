# Option A: Deck-Swap Delta

## What it answers

"Which duellist gives me the highest expected deck score improvement per duel?"

## Approach

For each unlocked duellist, for each card in their drop pool with non-zero weight:

1. Use the existing `rankCandidates()` delta evaluator to estimate whether swapping that card into the current optimized deck improves the score.
2. Weight the improvement by drop probability: `contribution = dropProb × max(0, sampledDelta)`.
3. Sum contributions across all droppable cards: `FarmScore(duellist) = Σ contributions`.
4. Rank duellists by FarmScore.

Optionally, exact-score the top N duellist recommendations to confirm the sampled ranking.

## Budget estimate

- Buffer initialization (one-time): ~200ms
- ~300 unique droppable cards × 40 delta evals × ~0.01ms each ≈ 300ms for the sampled pass
- Optional: exact-score top 5 duellists ≈ 2s each = 10s
- **Total: under 1s (sampled only) or ~10s (with exact confirmation)**

## Strengths

- Directly answers the question in terms of deck score.
- Reuses existing infrastructure (`DeltaEvaluator`, `FusionScorer`, `OptBuffers`).
- Mathematically principled: same signal the SA optimizer trusts during search.

## Weaknesses

- Requires a pre-optimized deck as input — meaningless without one.
- Output is abstract ("score improves by 47.3") — not directly actionable without explanation of *why*.
- Sampled delta can be noisy for small improvements; exact scoring is expensive.
- Doesn't tell the player *which card* to hope for or *what fusion* it unlocks.

## Verdict

Strong engine-level answer, but poor standalone UX. Best combined with an explainability layer (Option B or the fusion-discovery variant).
