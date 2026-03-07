# Phase 4: Simulated Annealing Optimizer (DONE)

This phase is one of the implementation steps of the plan in PLAN.md file.

**Goal:** Build the SA optimizer with tabu list and biased candidate selection. Single-threaded for V1; designed to be worker-ready for V2 (Phase 6).

**Depends on:** Phase 1 (buffers), Phase 3 (scorer, initial scoring).

---

## 4.1 PRNG

Reuse the existing `mulberry32` from `src/engine/initialize-buffers.ts`. It produces floats in [0, 1) from a seed, which is all SA needs. Integer selection: `(rand() * max) | 0`.

No new file — import from `initialize-buffers.ts`.

---

## 4.2 Simulated Annealing

Replace greedy accept (`delta > 0`) with SA acceptance:

```
if delta > 0:       accept unconditionally
else:               accept with probability exp(delta / temperature)

temperature starts at calibrated T0 (see below)
temperature *= 0.99963 every iteration
```

Temperature reaches near-zero (~0.1) by iteration ~23,000, leaving the last ~4,500 iterations as greedy polishing.

### Temperature Calibration

T0 is calibrated at startup by running ~50 random swaps (without committing), measuring average |delta|, and setting `T0 = avgAbsDelta / ln(2)`. This ensures a typical negative delta has ~50% acceptance probability at the start, regardless of deck composition and card ATK ranges.

### SA Loop

```
run(buf, scorer, deltaEvaluator, deadline):
  rand = mulberry32(seed)
  temp = calibrateTemp(buf, ...)
  bestScore = totalScore = sum(handScores)
  bestDeck = copy of deck

  while iteration % 64 != 0 || performance.now() < deadline:
    slot = (rand() * 40) | 0
    oldCard = deck[slot]
    newCard = selectCandidate(...)   // §4.4
    if newCard == -1: continue
    if isTabu(slot, newCard): continue  // §4.3

    deck[slot] = newCard
    cardCounts[oldCard]--, cardCounts[newCard]++
    delta = deltaEvaluator.computeDelta(...)

    accept = delta > 0 || (temp > 0.1 && rand() < exp(delta / temp))

    if accept:
      deltaEvaluator.commitDelta(handScores)
      totalScore += delta
      if totalScore > bestScore:
        bestScore = totalScore
        bestDeck.set(deck)
    else:
      deck[slot] = oldCard
      cardCounts[oldCard]++, cardCounts[newCard]--
      addTabu(slot, newCard)  // §4.3

    iteration++
    temp *= 0.99963

  deck.set(bestDeck)
  rebuild cardCounts from bestDeck
  return bestScore
```

**Worker-ready design:** The SA loop takes a `deadline` timestamp (`performance.now()` value) for time-based stopping. Time is checked every 64 iterations to amortize the cost. `AbortSignal` cannot be used because signals don't fire during synchronous tight loops in Bun/V8. In V1, the main thread computes `performance.now() + 55_000`. In V2 (Phase 6), the main thread posts a time budget and each worker computes its own local deadline — no cross-thread signal plumbing needed.

### IOptimizer Interface

```ts
interface IOptimizer {
  run(buf: OptBuffers, scorer: IScorer, deltaEvaluator: IDeltaEvaluator, deadline: number): number;
}
```

### File

| File | Purpose |
|------|---------|
| `src/engine/optimizer/sa-optimizer.ts` | SA optimizer implementing `IOptimizer` |

---

## 4.3 Tabu List (~30 LOC)

Per-slot ring buffer tracking the last 8 cards tried and rejected in each slot. Skip a swap if the candidate was recently rejected. Reduces wasted iterations by ~20–30% in late optimization. Coupled with biased selection (§4.4) — without tabu, biased selection keeps picking the same promising-but-rejected candidates.

```ts
tabuBuffer: Uint16Array(40 * 8)   // card IDs
tabuIndex: Uint8Array(40)          // write cursor per slot

function isTabu(slot: number, cardId: number): boolean
function addTabu(slot: number, cardId: number): void
```

### File

| File | Purpose |
|------|---------|
| `src/engine/optimizer/tabu-list.ts` | Tabu list ring buffer |

---

## 4.4 Biased Candidate Selection (~30 LOC)

Pre-compute `partnerCount[c]` = number of cards in the current deck that fuse with card `c`. Select swap candidates with probability proportional to `baseATK + 200 × partnerCount` (α = 200, roughly half of a mid-range ATK). Recompute lazily (every ~100 accepted swaps).

Cumulative weight array with binary search (O(log 722)) for weighted random selection. `selectCandidate` enforces availability (`cardCounts[c] < availableCounts[c]`) and skips the card currently in the slot. Up to 20 rejection-sampling attempts before returning -1.

```ts
partnerCount: Uint16Array(722)
cumulativeWeights: Float64Array(722)

function recomputeWeights(buf: OptBuffers): void
function selectCandidate(buf: OptBuffers, oldCard: number, rand: () => number): number
```

This is critical for finding fusion synergies — without it, SA wastes most iterations on cards with no fusion potential, producing results barely better than the greedy starting deck.

### File

| File | Purpose |
|------|---------|
| `src/engine/optimizer/biased-selection.ts` | Biased candidate selection |

---

## 4.5 Tests

| Test | Validates |
|------|-----------|
| `SA accepts uphill` | Positive delta always accepted |
| `SA accepts downhill probabilistically` | Negative delta accepted at high temp, not at low temp |
| `SA cooling schedule` | Temperature decreases correctly |
| `SA non-regression` | Output score >= input score |
| `SA valid deck output` | 40 cards, within collection bounds, cardCounts consistent |
| `SA respects deadline` | Stops promptly when deadline is in the past |
| `SA improves bad deck` | Starting from weakest cards, finds better deck |
| `tabu prevents repeat` | Recently rejected card is skipped |
| `tabu ring wraps` | After 8 entries, oldest overwritten |
| `biased selection prefers fusions` | Cards with more fusion partners selected more often |

---

## 4.6 Success Criteria

1. All tests pass.
2. SA finds better decks than pure greedy hill climbing.
3. Tabu list reduces wasted iterations measurably.
4. Zero allocations in hot loop.
5. Per-swap cost ~2ms (1,875 hands × ~1us/hand).
6. ~27,500 iterations in 55s budget.
