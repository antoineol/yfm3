# Phase 4: Simulated Annealing Optimizer

This phase is one of the implementation steps of the plan in PLAN.md file.

**Goal:** Build the SA optimizer with tabu list, multi-start seeding, biased candidate selection, and seedable PRNG. This replaces a simple greedy hill-climber with a global search algorithm. ~130 LOC total.

**Depends on:** Phase 1 (buffers), Phase 2 (scorer), Phase 3 (delta evaluator).

---

## 4.1 Seedable PRNG (~20 LOC)

Workers need different random sequences. `Math.random()` is non-seedable and slower than xorshift128+.

```ts
class Rng {
  constructor(seed: number)
  next(): number        // float in [0, 1)
  nextInt(max: number): number  // integer in [0, max)
}
```

Each worker gets `new Rng(workerIndex * 0x9E3779B9)` for distinct sequences.

### File to Create

| File | Purpose |
|------|---------|
| `src/engine/optimizer/rng.ts` | Seedable xorshift128+ PRNG |

---

## 4.2 Simulated Annealing (~50 LOC)

Replace greedy accept (`delta > 0`) with SA acceptance:

```
if delta > 0:       accept unconditionally
else:               accept with probability exp(delta / temperature)

temperature starts at 500
temperature *= 0.9999 every 50 iterations
```

Temperature reaches near-zero by iteration ~23,000, leaving the last ~4,500 iterations as greedy polishing.

### SA Loop

```
run(deck, cardCounts, availableCounts, ..., signal):
  rng = new Rng(seed)
  temp = 500
  bestScore = totalScore = sum(handScores)
  bestDeck = copy of deck

  while !signal.aborted:
    slot = rng.nextInt(40)
    oldCard = deck[slot]
    newCard = selectCandidate(...)   // §4.5
    if newCard == -1: continue
    if isTabu(slot, newCard): continue  // §4.3

    deck[slot] = newCard
    cardCounts[oldCard]--, cardCounts[newCard]++
    delta = deltaEvaluator.computeDelta(...)

    accept = delta > 0 || (temp > 0.1 && rng.next() < exp(delta / temp))

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

    // Cooling
    iteration++
    if iteration % 50 == 0: temp *= 0.9999

  deck.set(bestDeck)
  return bestScore
```

### File to Modify/Create

| File | Purpose |
|------|---------|
| `src/engine/optimizer/sa-optimizer.ts` | SA optimizer implementing `IOptimizer` |

---

## 4.3 Tabu List (~30 LOC)

Per-slot ring buffer tracking the last 8 cards tried and rejected in each slot. Skip a swap if the candidate was recently rejected. Reduces wasted iterations by ~20–30% in late optimization.

```ts
tabuBuffer: Uint16Array(40 * 8)   // card IDs
tabuIndex: Uint8Array(40)          // write cursor per slot

function isTabu(slot: number, cardId: number): boolean
function addTabu(slot: number, cardId: number): void
```

### File to Create

| File | Purpose |
|------|---------|
| `src/engine/optimizer/tabu-list.ts` | Tabu list ring buffer |

---

## 4.4 Multi-Start Seeding (~20 LOC)

Each worker starts from a different initial deck for search-space diversity:

- **Worker 0:** Greedy seed (highest ATK cards)
- **Worker 1:** Greedy seed + 10 random perturbations
- **Workers 2–N:** Fully random valid decks from the collection

### File to Create

| File | Purpose |
|------|---------|
| `src/engine/optimizer/seed-strategies.ts` | Functions to generate different initial decks |

---

## 4.5 Biased Candidate Selection (~30 LOC)

Pre-compute `partnerCount[c]` = number of cards in the current deck that fuse with card `c`. Select swap candidates with probability proportional to `baseATK + α × partnerCount`. Recompute lazily (every ~100 accepted swaps).

```ts
partnerCount: Uint16Array(722)
selectionWeights: Float32Array(722)

function recomputeWeights(deck, fusionTable, cardAtk): void
function selectCandidate(weights, availableCounts, cardCounts, oldCard, rng): number
```

Fallback: if biased selection is too slow, use simple random selection from available cards with rejection sampling.

---

## 4.6 Tests

| Test | Validates |
|------|-----------|
| `Rng determinism` | Same seed → same sequence |
| `Rng distribution` | 10K samples of `nextInt(100)` hit all values roughly uniformly |
| `Rng distinct seeds` | Different seeds → different sequences |
| `SA accepts uphill` | Positive delta always accepted |
| `SA accepts downhill probabilistically` | Negative delta accepted at high temp, not at low temp |
| `SA cooling schedule` | Temperature decreases correctly |
| `SA implements IOptimizer` | Drop-in for any optimizer consumer |
| `SA non-regression` | Output score >= input score |
| `SA valid deck output` | 40 cards, within collection bounds |
| `SA respects abort signal` | Stops within ~1ms of abort |
| `SA improves bad deck` | Starting from weakest cards, finds better deck |
| `tabu prevents repeat` | Recently rejected card is skipped |
| `tabu ring wraps` | After 8 entries, oldest overwritten |
| `multi-start greedy` | Worker 0 produces ATK-sorted deck |
| `multi-start random` | Worker 2+ produces valid random deck |
| `biased selection prefers fusions` | Cards with more fusion partners selected more often |

---

## 4.7 Success Criteria

1. All tests pass.
2. SA finds better decks than pure greedy hill climbing.
3. Tabu list reduces wasted iterations measurably.
4. Zero allocations in hot loop.
5. Per-swap cost ~2ms (1,875 hands × ~1μs/hand).
6. ~27,500 iterations per worker in 55s budget.
