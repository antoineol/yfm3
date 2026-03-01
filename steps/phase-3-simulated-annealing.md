# Phase 3: Simulated Annealing Worker Loop

This phase is one of the implementation step of the plan in PLAN.md file.

**Goal:** Replace the greedy `RandomSwapOptimizer` with a proper Simulated Annealing (SA) optimizer. This is the real search algorithm that explores the deck space intelligently by accepting worse moves probabilistically to escape local optima.

**Depends on:** Phase 0 (IOptimizer interface), Phase 1 (buffers, data), Phase 2 (FusionScorer, FusionDeltaScorer).

---

## 3.1 Files to Create

| File | Purpose |
|------|---------|
| `src/optimizer/sa-optimizer.ts` | `SAOptimizer` implementing `IOptimizer` — simulated annealing search |
| `src/optimizer/rng.ts` | Fast, seedable PRNG (xorshift128+) for deterministic runs and worker diversity |

---

## 3.2 Seedable PRNG (`src/optimizer/rng.ts`)

Workers must use **different** random sequences. JavaScript's `Math.random()` is non-seedable and slow. Implement a fast xorshift128+ PRNG:

```ts
export class Rng {
  private s0: number;
  private s1: number;

  constructor(seed: number) { /* init state from seed */ }

  /** Returns a random float in [0, 1) */
  next(): number;

  /** Returns a random integer in [0, max) */
  nextInt(max: number): number;
}
```

- **Why not Math.random():** Not seedable (can't reproduce runs), and call overhead adds up at millions of invocations.
- **xorshift128+** is ~3x faster than `Math.random()` in V8.
- Each worker gets `new Rng(workerIndex * 0x9E3779B9)` for distinct sequences.

---

## 3.3 Simulated Annealing Optimizer (`src/optimizer/sa-optimizer.ts`)

### Configuration

```ts
interface SAConfig {
  initialTemp: number;     // Starting temperature. Default: 1000
  coolingRate: number;      // Multiplicative factor. Default: 0.9999
  coolingInterval: number;  // Apply cooling every N iterations. Default: 100
  minTemp: number;          // Stop annealing below this. Default: 0.1
  seed: number;             // PRNG seed for this worker
}
```

### Algorithm

```
run(deck, cardCounts, availableCounts, ..., signal):
  rng = new Rng(config.seed)
  temp = config.initialTemp
  totalScore = sum(handScores)
  bestScore = totalScore
  bestDeck = Int16Array(40)  // pre-allocated at construction
  bestDeck.set(deck)
  iteration = 0

  while !signal.aborted:
    // 1. Pick random swap
    slotIndex = rng.nextInt(40)
    oldCard = deck[slotIndex]

    // Pick candidate replacement from available cards
    newCard = pickCandidate(rng, cardCounts, availableCounts, oldCard)
    if newCard === -1: continue  // no valid candidate

    // 2. Tentatively apply swap
    deck[slotIndex] = newCard
    cardCounts[oldCard]--
    cardCounts[newCard]++

    // 3. Compute delta
    delta = deltaScorer.computeDelta(deck, slotIndex, ...)

    // 4. Acceptance decision
    accept = false
    if delta > 0:
      accept = true
    else if temp > config.minTemp:
      // Metropolis criterion
      prob = Math.exp(delta / temp)
      accept = rng.next() < prob

    // 5. Apply or revert
    if accept:
      deltaScorer.commitDelta(handScores)
      totalScore += delta
      if totalScore > bestScore:
        bestScore = totalScore
        bestDeck.set(deck)
    else:
      deck[slotIndex] = oldCard
      cardCounts[oldCard]++
      cardCounts[newCard]--

    // 6. Cooling
    iteration++
    if iteration % config.coolingInterval === 0:
      temp *= config.coolingRate

  // Restore best deck to output buffer
  deck.set(bestDeck)
  return bestScore
```

### Candidate Selection (`pickCandidate`)

Naive approach: pick a random card ID in [0, 721]. Reject if:
- Same as `oldCard`.
- `cardCounts[newCard] >= availableCounts[newCard]` (player doesn't own enough).

If rejection rate is too high (e.g., player owns few cards), build a **candidate list** at construction: `candidates: Int16Array` containing only card IDs where `availableCounts[id] > 0`. Pick from this list instead.

```
pickCandidate(rng, cardCounts, availableCounts, oldCard):
  // Try up to 10 times with random selection
  for attempt = 0 to 9:
    idx = rng.nextInt(candidateCount)
    newCard = candidates[idx]
    if newCard !== oldCard && cardCounts[newCard] < availableCounts[newCard]:
      return newCard
  return -1  // give up this iteration
```

---

## 3.4 Restart Strategy

To improve exploration, implement periodic restarts:

```
Every 50,000 iterations (configurable):
  if totalScore < bestScore * 0.95:
    // We've drifted too far from the best — restart from best known
    deck.set(bestDeck)
    recomputeCardCounts(deck, cardCounts)
    recomputeAllHandScores(deck, handIndices, handScores, scorer, fusionTable, cardAtk)
    totalScore = sum(handScores)
    temp = config.initialTemp * 0.5  // restart at lower temp
```

The recomputation functions must also be zero-allocation — they just iterate and write into existing buffers.

---

## 3.5 Tests

### File to Create

| File | Purpose |
|------|---------|
| `tests/phase3.test.ts` | Tests for SA optimizer and PRNG |

| Test | Validates |
|------|-----------|
| `Rng determinism` | Same seed produces same sequence |
| `Rng distribution` | 10,000 samples of `nextInt(100)` hit all values roughly uniformly |
| `Rng distinct seeds` | Different seeds produce different sequences |
| `SA: implements IOptimizer` | SAOptimizer is a drop-in for RandomSwapOptimizer |
| `SA: non-regression` | Output score >= input score |
| `SA: valid deck output` | 40 cards, within collection bounds |
| `SA: respects abort signal` | Stops within ~1ms of abort |
| `SA: improves trivially bad deck` | Starting from a deck of the weakest cards, SA finds a better deck when strong cards are available |
| `SA: accepts worse moves early` | At high temperature, some negative-delta moves are accepted (verify via counters) |
| `SA: stabilizes at low temperature` | At near-zero temperature, virtually no negative-delta moves accepted |
| `SA: candidate rejection` | When `cardCounts[c] >= availableCounts[c]`, card `c` is never swapped in |

---

## 3.6 Benchmarks

| Benchmark | Target |
|-----------|--------|
| `SAOptimizer` iterations/sec (with FusionScorer) | >5K/sec |
| `SAOptimizer` iterations/sec (with DummyScorer) | >30K/sec |
| `Rng.next()` ops/sec | >100M/sec |
| `Rng.nextInt(722)` ops/sec | >50M/sec |

Critical calculation: At 5K iterations/sec × 55 seconds = **275,000 iterations per worker**. With 4–8 workers, that's 1M–2M total iterations exploring the search space.

---

## 3.7 Success Criteria

1. All Phase 3 tests pass.
2. `SAOptimizer` implements `IOptimizer` — drop-in replacement for `RandomSwapOptimizer`.
3. SA finds better decks than greedy hill climbing on test cases with local optima.
4. Abort signal is respected promptly.
5. PRNG is seedable and deterministic.
6. Zero heap allocations in the SA hot loop (verified by benchmark stability).
7. `bestDeck` is always a valid deck at every point during execution.

---

## 3.8 File Tree Additions After Phase 3

```
src/
  optimizer/
    sa-optimizer.ts
    rng.ts
tests/
  phase3.test.ts
```
