# Full-Rebuild Optimizer Proposals

Status: proposal. Goal: improve full rebuild suggestions without increasing the existing optimization time budget.

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

After SA finds its best deck, spend a small fixed reserve on local positive moves only.

- Start from the best deck returned by SA.
- Try one-slot swaps using the existing sampled delta evaluator.
- Accept only positive sampled deltas.
- Stop on deadline or after a full pass with no accepted move.

Why: SA may end with avoidable local noise because it spends much of its time exploring. A short greedy pass should improve local quality without changing the objective.

Risk: sampled deltas can still be noisy. Mitigation: exact-score only the final polished deck, as already done.

### 2. Diff Cleanup Against Current Deck

After finding the rebuild candidate, try to remove noisy suggested changes without making the deck worse.

- Compare suggested deck to the current deck.
- For changed cards, try reverting suggested cards back to current-deck cards.
- Keep a revert only when sampled score does not decrease.
- Exact-score the cleaned candidate once at the end.

Why: preserves full rebuild behavior while reducing annoying changes that do not help the score.

Risk: over-cleaning can hide real small gains. Mitigation: use a strict non-decrease rule and keep cleanup best-effort with a hard time cap.

### 3. Exact-Score A Small Candidate Shortlist

Workers currently compete by sampled score, then only the sampled winner is exact-scored. Exact-score a tiny number of distinct worker outputs within the existing final reserve.

- Deduplicate worker decks by sorted card multiset.
- Exact-score the top 2-4 sampled candidates while time remains.
- Return the best exact-scored deck.
- If time runs out, fall back to the current sampled winner behavior.

Why: reduces sampled-hand overfit without broadening the search.

Risk: exact scoring is expensive on fusion-heavy data. Mitigation: cap candidate count and deadline strictly.

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

1. Add final greedy polish.
2. Add small exact-scored shortlist.
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
