# Full-Rebuild Optimizer Proposals

Status: proposal with items 1 and 3 implemented. Goal: improve full rebuild suggestions without increasing the existing optimization time budget.

## Scope

Keep the current business objective:

> Maximize expected highest ATK from a random 5-card opening hand, using the full 40-card deck probability model.

Do not add opponent, rank, win-rate, or hand-authored archetype objectives now. The current proxy is good enough, and widening the model would add complexity before proving value.

## Budget Rule

Every change below must fit inside the current rebuild budget. Prefer moving time from SA search into validation/polish over increasing total runtime.

Target allocation:

| Phase | Budget |
| --- | ---: |
| SA search | Existing budget minus polish/validation reserve |
| Greedy polish | 0.5-1.5s max |
| Candidate exact validation | Existing exact reserve only |
| Diff cleanup | Best-effort inside polish reserve |

If a phase exceeds its slice, stop it and return the best known deck.

## Recommendations

### 1. Final Greedy Polish

Status: implemented in `SAOptimizer.run()`.

After SA finds its best deck, spend a small fixed reserve on local positive moves only.

- Start from the best deck returned by SA.
- Try one-slot swaps using the existing sampled delta evaluator.
- Accept only positive sampled deltas.
- Stop on deadline or after a full pass with no accepted move.

Why: SA may end with avoidable local noise because it spends much of its time exploring. A short greedy pass should improve local quality without changing the objective.

Risk: sampled deltas can still be noisy. Mitigation: exact-score only the final polished deck, as already done.

Budget note: the polish reserve is carved out of the existing SA deadline. It does not extend the full rebuild wall-clock budget.

### 2. Diff Cleanup Against Current Deck

After finding the rebuild candidate, try to remove noisy suggested changes without making the deck worse.

- Compare suggested deck to the current deck.
- For changed cards, try reverting suggested cards back to current-deck cards.
- Keep a revert only when sampled score does not decrease.
- Exact-score the cleaned candidate once at the end.

Why: preserves full rebuild behavior while reducing annoying changes that do not help the score.

Risk: over-cleaning can hide real small gains. Mitigation: use a strict non-decrease rule and keep cleanup best-effort with a hard time cap.

### 3. Exact-Score Worker Candidates

Status: implemented in SA workers.

Workers previously competed by sampled score, then only the sampled winner was exact-scored. Each SA worker now reserves time from its existing worker budget, exact-scores its own final deck, and returns that exact expected ATK with the sampled score.

- Run SA until the worker's exact-scoring reserve.
- Exact-score the worker's own final deck in the same worker.
- Return the best exact-scored deck across workers.
- If workers are terminated from progress-only convergence, fall back to exact-scoring the sampled winner.

Why: reduces sampled-hand overfit without broadening the search, while fully leveraging worker parallelism.

Risk: exact scoring is expensive on fusion-heavy data. Mitigation: carve the reserve out of the existing worker budget and keep the old sampled-winner exact-score path as fallback.

### 4. Better Generic Worker Diversity

Improve starting points without card-specific assumptions.

Good seeds:

- current deck, when available;
- ATK-greedy deck;
- fusion/equip-biased greedy deck using generic selector weights;
- random valid decks.

Avoid:

- card-ID proxy seeds;
- hand-authored fusion packages;
- known archetype lists.

Why: better coverage for the same worker budget, while keeping the scorer as the source of truth.

### 5. Limited Multi-Swap Moves

Add a low-rate move that changes two cards at once, accepted only by scorer delta.

- Keep one-card swaps as the default.
- Occasionally try a two-card mutation.
- Accept by the same SA rule.
- Disable if throughput drops too much in benchmarks.

Why: helps cross valleys where a card is bad alone but good with another card.

Risk: more expensive deltas. Mitigation: benchmark first; ship only if iterations/sec stays close to current behavior.

## Priority

1. Final greedy polish. Done.
2. Exact-score worker candidates. Done.
3. Add diff cleanup if noisy diffs remain.
4. Replace weak seed diversity with scorer-neutral seeds.
5. Experiment with limited multi-swap moves only after measuring the first four.

## Validation

Required before implementation:

- benchmark current optimizer vs proposed allocations on vanilla, RP, and fusion-heavy sample collections;
- verify total wall-clock stays inside the current budget;
- compare exact final scores, not sampled scores;
- track diff size against current deck as a secondary UX metric;
- keep tests focused on budget fallback, candidate dedupe, and monotonic polish behavior.
