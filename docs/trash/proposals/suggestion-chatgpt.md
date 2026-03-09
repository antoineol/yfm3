# Evaluation for Yu-Gi-Oh! Forbidden Memories

I fetched the fusion / card-count references to ground assumptions: the game (and recent community mods) expose large fusion tables and the base game has 722 playable cards. ([Yu-Gi-Oh! Wiki][1]) Fusion mechanics are name/kind/color based, with rules that a fusion only succeeds if the result's ATK exceeds both materials' ATK and that multiple-result rules pick the lowest card with ATK > both materials in many lists — these are the model constraints the proposals use. ([GameFAQs][2])

Below I compare Proposals A, B and C against the three criteria you requested, quantify where possible, and end with a recommendation and a concrete hybrid architecture that trades off speed, correctness and implementation risk.

---

# 1) Optimization quality (likelihood to reach a near-optimal deck in 60 s)

Key baseline numbers used (from your estimates and feasibility checks):

* Full hand-enumeration cost: C(40,5)=658,008 hands. At 1 µs/hand → ~0.66 s per full deck score. (you already used that; I treat it as plausible in optimized TypeScript + tight typed arrays).
* MC sample variance effect: with n=15,000 hands the standard error on the sample mean of per-hand max-ATK is roughly `σ/√n`. If per-hand SD σ ≈ 1,000 (conservative), SE ≈ 1000/√15000 ≈ 8 ATK. So single-deck MC score noise ≈ ±8 ATK (95% CI ≈ ±16). This fixes the noise floor below which MC cannot reliably detect improvements. (calculation from basic sampling theory).

Evaluation by proposal:

**Proposal A — Monte Carlo CRN Exploration + Exact Refinement**

* Iterations: ~27.5k swaps single-thread (×4 →110k, ×8 →220k).
* Per-swap delta measured on same 15k CRN samples reduces variance of *change* between two nearby decks; CRN often reduces delta-variance substantially vs independent sampling (can be order-of-magnitude if changes are small and sample overlap is large). But the absolute noise floor remains on the MC estimate of expected max-ATK.
* Practical implication: A will move rapidly and find *large* improvements reliably. For small, late-stage gains (< ~8 ATK in expectation) it will often fail to distinguish better from worse and therefore is likely to settle prematurely on a near-good but not best deck.
* Final exact verification (≈0.66 s/deck) allows correcting false positives but not false negatives: if Monte Carlo fails to accept a swap whose true delta is positive but small, that path may never be explored. That makes A **good at broad exploration / fast hill-climb** but **weak at fine-tuning**.
* Estimated probability to reach within top 0.1% of global optimum: moderate-to-high when the landscape has many large, moveable gains (fusion-sparse or when single-card ATK dominates), lower when the optimum requires assembling several specific low-frequency fusion combos (fusion-dense, combinatorial hotspots).

**Proposal B — Tier-DP Exact Exploration + MC Refinement**

* Per-swap cost estimated 0.1–2.5 ms. If median ≈1 ms, then single-thread swaps ≈55k in 55 s; with 4 workers ≈220k. Each swap evaluates exact delta (hypergeometric-based), so decisions are accurate even for tiny deltas.
* This eliminates the MC noise floor: the optimizer can accept even +1 ATK expected improvements deterministically (limited only by numeric precision).
* For fusion-dense decks the number of recomputed "paths" per card can blow up; that drives per-swap cost toward the 2.5 ms end or beyond in pathological decks. But the algorithm's correctness does not depend on MC sampling.
* Multi-starts (20–50) give good coverage; exactness means local search is trustworthy.
* Estimated probability to reach within top 0.1% of optimum: highest of the three when the implementation works correctly and per-swap cost stays near the lower estimate. This proposal is the best option for reliably finding subtle, high-value fusion combos.

**Proposal C — Kind-Abstraction + Exact Delta SA**

* Phase 1 (10 s): small search space, yields a single (or a few) type distributions that bias the deck.
* Phase 2: exact per-swap cost dominated by rescoring all hands containing the swapped slot: C(39,4)=82,251 hands → at 1 µs/hand ≈ 82 ms/swap. That limits single-thread swaps to ~600 in 50 s (×8 → 4,800).
* Consequence: Although each accepted swap is accurate and SA can escape local minima, the *low iteration count* severely restricts exploration. With only ~600–4,800 state-changes available, SA may fail to discover narrow, specific fusion combos unless the Kind seed happens to include the exact right slots.
* If the Kind-abstraction seed is close to optimal, C is efficient. If the seed is off, the limited iterations make recovery unlikely.
* Estimated probability to reach near-optimal: high only when the abstraction is highly predictive for your collection; otherwise low.

**Summary (quality):**

* If the global optimum is structured (requires assembling low-frequency, multi-card fusion chains), **B** has the best chance given exact deltas.
* If large gains are available via single-card swaps and many options (fusion-sparse or dominated by high-ATK single cards), **A** reaches good solutions fastest.
* **C** is high-variance on outcome: good when abstraction mapping is predictive, otherwise poor due to low iteration budget.

---

# 2) Implementation complexity & risk

**Proposal A — Complexity: low → medium**

* Simple to implement: sample hands, build slot→hands CSR list, implement hill-climb/SA using CRN for low-variance deltas. Parallelize easily with web workers by partitioning swap proposals or replicating state with occasional best-state merge.
* Risks:

  * MC noise causes false negatives; mitigations (increase sample size, stratification, importance sampling) are available but increase memory/CPU.
  * Sampling edge-cases: ensure the sampled hands are drawn without replacement per hand (your design notes imply that). If you sample hands with replacement across the 15k sample set, the estimator remains unbiased but variance differs; be deliberate.
  * Hard to guarantee final optimality; correctness relies on final exact refinement, but false negatives can hide the global optimum.

**Proposal B — Complexity: high**

* Must index and enumerate all fusion "paths" (1–4 material combinations) and compute exact hypergeometric probabilities for overlapping paths.
* Nontrivial combinatorics: overlapping paths that share cards and produce the same ATK require inclusion-exclusion or an exact probabilistic union computation to avoid double-counting when computing `P(can achieve A)`. This is the single largest implementation risk and source of bugs.
* Performance engineering required: precompute combinatorial coefficients, incremental updates for per-card deltas, aggressive caching of path→probability; maintain numeric stability for very small probabilities.
* Risks:

  * Algorithmic correctness is delicate (inclusion-exclusion over many overlapping events). A naïve union approximation will introduce bias.
  * Path explosion in fusion-dense subsets can make per-swap cost much higher than estimates.
  * No ready reference implementation; expect ~2–4× development effort vs A.

**Proposal C — Complexity: medium→high**

* Phase 1 abstraction is relatively simple: pick representatives and optimize ratios.
* Phase 2 is simpler conceptually (exact scoring) but computationally heavy per-swap. Implementing full rescoring of affected hands is straightforward (brute-force recompute subset of hands), but it hits performance limits.
* Risks:

  * Seed quality sensitivity: abstraction mapping must be tuned and validated against concrete deck performance (nontrivial work).
  * If per-swap rescoring becomes slower than estimated in JS (due to GC, interpreted overhead) Phase 2 may be unusably slow.
  * Memory pressure and cache misses when rescoring 82k hands repeatedly in JS.

**Implementation effort ranking:** A (lowest) < C < B (highest).
**Development risk ranking:** B (highest, correctness risk) > C > A.

---

# 3) Robustness (fusion-dense vs fusion-sparse collections)

* **Fusion-sparse collections (few multi-material synergies):**

  * A performs well: large single-card ATK dominates; MC finds those quickly.
  * B still works and is overkill but reliable.
  * C works if abstraction roughly matches dominant kinds.

* **Fusion-dense collections (many high-value, low-probability combos):**

  * B is the most robust: exact deltas allow assembling low-frequency combos because optimizer can reward small but real expected gains that MC would hide.
  * A degrades: MC will have difficulty detecting and rewarding rare combinations (the rare events have low sample support), causing the optimizer to ignore them. You can partially mitigate with importance sampling that over-samples hands containing candidates for powerful fusions, but that adds complexity (and requires careful reweighting).
  * C: mixed. If abstraction captures fusion structure (i.e., kind quotas align with fusion groups), it can seed an effective deck; otherwise it fails because Phase 2 doesn't have enough iterations to find the rare combos.

**Graceful degradation:** B degrades least (cost increases, but correctness remains), A degrades by losing ability to detect low-probability/high-value combos, C degrades badly if abstraction misses the right types.

---

# Concrete recommendation (with numbers & roadmap)

**Recommended primary architecture: a hybrid that combines A (fast MC + CRN) for broad exploration and B (exact delta) for local refinement and final polishing.** Rationale: this minimizes implementation risk while leveraging exactness where it matters and exploration speed where it matters.

Concrete staged pipeline (60 s budget):

1. **Precompute (0–1 s)**

   * Build fusion table, ATK arrays and name/kind/color indices (as you already plan). Cache combinatorial nCr table up to 40 for fast hypergeometric computations. (This is cheap and required for B.)
   * Create the full slot index hand list if you will use MC CRN (sampled hands or full enumeration later).

2. **Phase A — Fast global exploration (1–30 s)**

   * Use MC CRN with *30k* sampled 5-card hands (increase from 15k to cut SE by √2 → SE ≈ 6 ATK for σ=1000). Sampling cost: 30k×5 ≈ 150k indices stored; reverse CSR size ~150k entries — negligible memory.
   * Run multi-worker hill-climb / SA: each worker runs independent MC-CRN hill climbs (replicated root deck) for ~14 s each, merging best candidates every few seconds. With 4 workers you get ~4× the iteration budget and variance reduction via independent restarts. Expected swaps: with 4 workers ~110k swaps total (your original A numbers scaled to 30k samples slightly slows per-swap but still in budget).
   * Use stratified sampling augmentation: always include (deterministically) a set of *targeted hands* that contain combinations of the top 20 candidate cards (to increase sensitivity to rare but important combos); include these in the CRN set to reduce false negatives around suspected fusion hotspots. (This is an engineering tweak that significantly reduces MC blind spots.)

3. **Phase B1 — Candidate exact refine (30–55 s)**

   * Take top K decks from Phase A (K≈50). For each candidate, run the exact full-enumeration scoring (0.66 s per deck) and keep the best M (M≈10). This step verifies Phase A outcomes and eliminates false positives.
   * For the top M decks, run an **exact delta hill-climb** using the Tier-DP approach but restricted and pragmatic:

     * Implement *incremental exact deltas* only for fusion paths up to a sensible cap (e.g., per-card consider the top T fusion paths by resulting ATK or expected contribution, T=200). This bounds worst-case work and reduces path explosion risk while capturing the high-impact paths.
     * Use precomputed combinatoric tables to compute hypergeometric probabilities for each path; for overlapping paths that share cards but produce different ATKs, use a conservative **pairwise inclusion-exclusion correction** for overlaps > threshold and otherwise approximate union by `1 - ∏(1 - p_i)` where p_i are small; log and later audit cases where the approximation may be large. (This is an engineering trade: exact inclusion-exclusion over thousands of overlapping events is correct but expensive; approximate union is acceptable if you detect when approximation error might be material.)
   * Budget: with exact full score cost 0.66 s/deck, scoring 50 candidates ≈33 s — but you already used 30 s earlier; schedule this as top-priority for the very top candidates only. To stay within 60 s, limit K or reduce Phase A time accordingly (practical schedule below).

4. **Phase B2 — Final polish & verify (55–60 s)**

   * Run full enumeration on the final 6–8 refined decks to produce final ranking and output.

**Practical 60 s schedule (concrete):**

* 0–1 s: precompute fusion and combinatorics.
* 1–26 s (25 s): Phase A MC-CRN multi-worker exploration using 30k sample set, 4 workers.
* 26–52 s (26 s): From Phase A pick top 40 decks; run full enumeration scoring on them in parallel → 40 × 0.66 s ≈ 26.4 s (parallelism / CPU permitting). Keep top 8.
* 52–60 s (8 s): For top 8 decks run exact local Tier-DP hill-climb refinement for 8 s (focused exact moves), then final full-enum re-score on the resulting top 3 (≈2 s).

This schedule is a concrete, feasible mapping of phases to the 60 s budget and leverages both speed and exactness. You can adjust sample count, worker count, and K to trade exploration vs refinement.

---

# Mitigations for the main risks

1. **MC false negatives (A):**

   * Increase sample size (15k → 30k or 50k depending on CPU and memory).
   * Use CRN + stratified / targeted sampling: ensure hands containing candidate high-ATK or fusion-material cards are overrepresented in the sample and properly reweighted.
2. **Exact inclusion-exclusion explosion (B):**

   * Bound the number of paths considered per card by ATK/expected-contribution threshold.
   * Use pairwise overlap corrections only when pairwise overlap probability > ε; otherwise assume independence (fast).
   * Build unit tests that compare approximate union vs brute-force enumeration on small decks to calibrate approximation error and set thresholds.
3. **Phase-2 low iteration count (C):**

   * If you use C’s abstraction, only use it to generate *several* seeds rather than the single seed. That increases robustness and reduces dependency on one seed.
4. **JS performance pitfalls:**

   * Write hot loops in a tightly-typed TS subset; use `Int16Array`/`Uint16Array` views, avoid allocations in inner loops, pre-allocate hand buffers, and minimize GC pressure.
   * Benchmark on target runtime (Bun + Vite output) early and profile — microseconds matter.

---

# Final verdict (short)

* If you must pick **one** approach to implement first and you want the best balance of final deck quality and acceptable implementation effort: **implement the hybrid A→B pipeline described above.** It keeps engineering complexity moderate, achieves high exploration coverage, and uses exact scoring where it matters to avoid settling on suboptimal decks.
* If you have a long runway and can accept higher implementation risk for marginally better final quality (and you must handle worst-case, fusion-dense collections perfectly), then **Pursue Proposal B** as a long-term, production-grade solution — but budget significant implementation, testing, and validation time for the inclusion-exclusion logic and path management.

---

# Actionable next steps (implementation milestones)

1. Prototype the MC-CRN engine (15k → 30k sample set) and CSR reverse lookup; measure per-swap time on Bun on representative data. (target: ≤2.5 ms/swap single-thread).
2. Implement exact full-enumeration scorer (fast C(40,5) loop) and verify ~0.66 s per deck on same runtime/hardware.
3. Implement the hybrid orchestration: multi-worker MC search → select top N → exact verify → localized Tier-DP polish on top M.
4. Add diagnostics that detect when MC suggests no improvement for many swaps — trigger additional targeted sampling or increase sample size dynamically.
5. If you later implement full Tier-DP, start with a conservative bounded-path implementation and add inclusion-exclusion refinements only where tests show the approximation misses ground truth.

---

If you want, I can:

* produce the exact 60 s schedule as runnable pseudo-code for workers + orchestrator, including data structures and memory layout (slot→hands CSR, path index tables), or
* write a small TypeScript microbenchmark that measures per-hand evaluation time and per-swap rescore costs on Bun (so we can validate the 1 µs / hand assumption on your target platform).

Which of those would you prefer (I will produce the code/benchmark immediately)?

[1]: https://yugioh.fandom.com/wiki/List_of_Yu-Gi-Oh%21_Forbidden_Memories_cards?utm_source=chatgpt.com "List of Yu-Gi-Oh! Forbidden Memories cards"
[2]: https://gamefaqs.gamespot.com/ps/561010-yu-gi-oh-forbidden-memories/faqs/16613?utm_source=chatgpt.com "Yu-Gi-Oh! Forbidden Memories - Fusion FAQ - PlayStation"
