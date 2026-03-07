# Phase 4 Review: Challenges & Corrections

## Critical: Cooling Schedule Math Is Wrong

Section 4.2 states:

> `temperature *= 0.9999 every 50 iterations`
> Temperature reaches near-zero by iteration ~23,000

This is incorrect. After 23,000 iterations with this schedule:

- Cooling steps = 23,000 / 50 = 460
- `500 * 0.9999^460 = 500 * 0.955 = 477.5`

Temperature barely drops 5%. To actually reach near-zero (~0.1) by iteration 23,000, the decay rate must be ~0.982 per 50 iterations, not 0.9999.

| Approach | Formula | Temp @ 23,000 | Temp @ 27,500 |
|---|---|---|---|
| Current plan | `*= 0.9999` / 50 iters | 477.5 | 472.7 |
| Fix A: stronger decay / 50 iters | `*= 0.982` / 50 iters | 0.10 | 0.01 |
| Fix B: cool every iteration | `*= 0.99963` / every iter | 0.10 | 0.002 |

**Decision:** Use Fix B (`temp *= 0.99963` every iteration). Simpler code (no modulo check), smoother cooling curve, same outcome.

---

## Medium: Temperature Scale vs Delta Magnitude

`T0 = 500` must be calibrated against typical delta values. Delta is a sum across ~1,875 rescored hands, so its magnitude depends heavily on deck composition and card ATK ranges.

For reference, with temp = 500:

- delta = -500: `exp(-1) = 0.37` (accepted often)
- delta = -1000: `exp(-2) = 0.14` (sometimes)
- delta = -5000: `exp(-10) = 0.00005` (never)

If real deltas are routinely in the tens of thousands, temp = 500 makes SA behave as pure greedy. If deltas are in the tens, SA behaves as random walk.

**Decision:** Start with `T0 = 500` as a reasonable default. If empirical testing shows poor SA exploration, add initial calibration: run ~50 random swaps, measure average |delta|, set `T0 = avgDelta * k`.

---

## Medium: Seed Not in the Interface

The SA loop calls `mulberry32(seed)` but `run()` has no seed parameter. The PRNG seed must come from somewhere.

**Decision:** Pass seed to the constructor (`new SAOptimizer(seed)`). This is cleaner than adding it to `run()` and is essential for V2 (Phase 6) where each worker needs a distinct seed for independent search trajectories.

---

## Minor: Candidate Selection Gaps

Section 4.4 is underspecified in several ways:

1. **alpha value undefined** -- the weight formula `baseATK + alpha * partnerCount` doesn't specify what alpha is. Needs a concrete value or a derivation.

2. **Selection method unspecified** -- for 722 cards, a cumulative weight array with linear scan is fine. Should be stated explicitly.

3. **Availability guard missing from main loop pseudocode** -- `selectCandidate` presumably checks `cardCounts[c] < availableCounts[c]`, but the swap loop in 4.2 doesn't show this. A reader could implement the loop without the guard.

4. **Same-card no-op** -- if `newCard == oldCard`, the swap is wasted. `selectCandidate` should exclude the card currently in the slot.

**Decision:** Address all four in implementation. Pick `alpha = 200` as a starting point (roughly half of a mid-range ATK), tune empirically. Use cumulative weight linear scan. Enforce availability in `selectCandidate` and skip `oldCard`.

---

## Minor: IOptimizer Monotonicity Contract

The interface docstring says "Monotonic: returned totalScore >= initial totalScore" but SA deliberately accepts downhill moves. The contract holds because the loop tracks `bestDeck` and restores it at the end.

However, the initial totalScore is not passed to `run()` -- the optimizer must compute it internally via `sum(handScores)`.

**Decision:** Compute `totalScore = sum(buf.handScores)` at the start of `run()`. This is O(15,000) -- negligible. The contract is correct as-is; the best-ever tracking guarantees monotonicity of the returned value.
