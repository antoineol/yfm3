# AUTONOMOUS IMPLEMENTATION BLUEPRINT: FM DECK OPTIMIZER

**Architecture:** Fixed-Index Correlated Monte Carlo (CRN) with Simulated Annealing and Exact Refinement.

**Target Environment:** TypeScript (Browser/Bun), Web Workers, Strict 60s Execution.

## 1. Global Directives for the AI Agent

- **Zero Allocations in Hot Loops:** You must not use `new Array()`, `[]`, `.map()`, `.filter()`, or instantiate objects during the search phase. The garbage collector will kill performance.
- **Typed Arrays Only:** All state, lookups, and buffers must be implemented using 1D typed arrays (`Int16Array`, `Uint8Array`, `Uint16Array`, `Uint32Array`).
- **Flatten Everything:** 2D arrays (like the fusion table or lists of hands) must be mathematically flattened into 1D arrays with index offset calculations.

---

## 2. Phase 1: Pre-Computation & Data Structures

This phase runs once on the main thread before spawning workers.

### A. The Card & Fusion Lookups

- **`fusionTable: Int16Array(722 * 722)`:** Initialize with `1`. Populate via `fusionTable[CardA * 722 + CardB] = ResultCard`. Ensure symmetry: populate both `[A, B]` and `[B, A]`.
- **`cardAtk: Int16Array(722)`:** Maps Card ID to its base attack.

### B. The Fixed-Index Monte Carlo Pool

- **Constants:** `NUM_HANDS = 15000`.
- **`handIndices: Uint8Array(15000 * 5)`:** A flat array storing 15,000 distinct, randomly generated combinations of 5 indices (ranging from 0 to 39).
- **`handScores: Int16Array(15000)`:** Stores the maximum achievable ATK for each of the 15,000 hands based on the *current* deck state.

### C. The Reverse Lookup Map (Crucial for Delta Updates)

We need to know exactly which hands in `handIndices` are affected when a specific deck slot (0-39) is swapped.

- **`affectedHandIds: Uint16Array(15000 * 5)`:** A flat array storing the IDs (0 to 14999) of hands.
- **`affectedHandOffsets: Uint32Array(40)`:** The starting index in `affectedHandIds` for a given deck slot.
- **`affectedHandCounts: Uint16Array(40)`:** The number of hands a given deck slot appears in (averages $\approx 1875$).

---

## 3. Phase 2: Zero-Allocation 5-Card Hand Evaluator

This is the core engine. It evaluates the max ATK of a hand using depth-first search, but uses pre-allocated typed arrays as a stack to avoid GC pauses.

- **`stackBuffer: Int16Array(5 * 5)`:** Pre-allocate a flat buffer to hold hand states for up to 5 levels of recursion.
    - Level 0 (size 5): `indices 0-4`
    - Level 1 (size 4): `indices 5-8`
    - Level 2 (size 3): `indices 9-11`...
- **Logic (Pseudo-TS):**
    1. Read the 5 `CardID`s from the deck into `stackBuffer[0..4]`.
    2. Track `max_atk_found` initialized to the highest `cardAtk` among the 5 cards.
    3. Loop through all pairs $(i, j)$ in the current level's buffer.
    4. If `fusionTable[Card_i * 722 + Card_j] !== -1`, copy the unused cards and the new fusion result into the *next* level's slice of the `stackBuffer`.
    5. Recurse synchronously to the next level.
    6. Update and return `max_atk_found`.

---

## 4. Phase 3: Simulated Annealing Worker Loop

Each Web Worker receives the pre-computed arrays (via `postMessage` or SharedArrayBuffer) and runs this loop independently.

### A. State Tracking

- **`currentDeck: Int16Array(40)`:** The current working deck.
- **`cardCounts: Uint8Array(722)`:** Tracks how many copies of each card are in `currentDeck`. Max 3 allowed.
- **`currentTotalAtk: number`:** The sum of all values in `handScores`.

### B. The Delta Swap (1 Iteration)

1. Pick a random `deckIndex` (0-39). Let $C_{old}$ be `currentDeck[deckIndex]`.
2. Pick a random $C_{new}$ (0-721). Reject if `cardCounts[C_new] >= 3` or if $C_{new} == C_{old}$.
3. **Delta Calculation:**
    - Temporarily set `currentDeck[deckIndex] = C_new`.
    - Let `delta = 0`.
    - Look up `offset = affectedHandOffsets[deckIndex]` and `count = affectedHandCounts[deckIndex]`.
    - Iterate `i` from `0` to `count - 1`:
        - `handId = affectedHandIds[offset + i]`
        - Evaluate new max ATK using the 5-Card Evaluator.
        - `delta += (newMaxAtk - handScores[handId])`.

### C. Acceptance Criteria

- If `delta > 0`, **accept** the move.
- If `delta <= 0`, accept with probability:

$$P = \exp\left(\frac{delta}{Temperature}\right)$$

- **If Accepted:** Update `currentTotalAtk += delta`, update the affected indices in `handScores` permanently, update `cardCounts`.
- **If Rejected:** Revert `currentDeck[deckIndex] = C_old`.
- **Cooling Schedule:** Start $T = 1000$. Multiply $T$ by $0.9999$ every 100 iterations.

---

## 5. Phase 4: Main Thread Orchestration & Exact Refinement

- **Initialization:** Main thread parses game data, builds Phase 1 arrays, and spawns $N$ workers (`navigator.hardwareConcurrency`).
- **Time Limit:** Main thread sets a `setTimeout` for 55 seconds.
- **Worker Payload:** Send initial random valid decks, different random seeds, and the shared lookup tables to workers.
- **Halt & Gather:** At 55s, send a `{ type: 'HALT' }` message to all workers. Workers return their all-time best `Int16Array(40)` deck and its `currentTotalAtk` score.
- **Exact Refinement (Final 5 Seconds):**
    - Deduplicate the returned decks from the workers.
    - Run the **Exact Combinatorial Evaluator** on the top unique decks.
    - This evaluator does *not* use the 15,000 fixed indices. It uses 5 nested `for` loops to iterate through all $\binom{40}{5} = 658,008$ possible index combinations.
    - Calculate the true mathematical expected maximum ATK.
- **Output:** Print the winning deck array, its exact expected ATK score, and execution metrics.
