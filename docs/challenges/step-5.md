# Phase 5 Review: Challenges & Corrections

## Medium: `exactScore` duplicates `referenceScoreDeck`

The plan proposes creating `src/engine/scoring/exact-scorer.ts` with a 5-nested-loop enumeration of all C(40,5) hands. But `referenceScoreDeck` in `src/test/reference-scorer.ts` already does exactly this — same loop structure, same 658,008 hands.

The only difference is which hand evaluator is used: `referenceEvaluateHand` (plain arrays + recursion) vs `FusionScorer.evaluateHand` (typed-array DFS stack). Since `FusionScorer` was already validated against the reference in phase 3, the production exact scorer should just be the same 5-nested loop calling `FusionScorer.evaluateHand`.

**Decision:** Create the exact scorer using `FusionScorer`, not a new evaluator. Test by comparing its output against `referenceScoreDeck` on the same decks.

---

## Medium: `optimizeDeck` is `async` for no reason

The plan declares:

```ts
export async function optimizeDeck(...): Promise<{ ... }>
```

But nothing in the V1 pipeline is async — `initializeBuffers`, `computeInitialScores`, `SAOptimizer.run`, and exact scoring are all synchronous. Making it async adds unnecessary complexity (callers need `await`, error handling changes, harder to test).

**Decision:** Make it a plain synchronous function for V1. Phase 6 (web workers) can make the orchestrator async when it actually needs to await worker results.

---

## Minor: `signal?: AbortSignal` still in the API

The public API signature shows `signal?: AbortSignal` in the options. But we established in phase 4 that `AbortSignal` doesn't fire during synchronous tight loops in Bun/V8 — that's why the optimizer uses `deadline: number` instead.

Since V1 is fully synchronous, mid-run cancellation is impossible. The `signal` option is misleading.

**Decision:** Remove `signal` from the V1 public API. Phase 6 (async workers) can add cancellation support when there's actually an event loop to check it.

---

## Minor: `Collection < 40 total cards → Return error`

The edge case table says to return an error if the collection has fewer than 40 total cards. This is correct — the deck size invariant (exactly 40 cards) can't be satisfied. But the plan doesn't specify the error mechanism: throw an exception? Return a result with an error field?

**Decision:** Throw an error. This is a precondition violation (invalid input), not a runtime failure. The caller should validate before calling.

---

## Minor: `handScores` inconsistent after SA restore

The SA optimizer restores `bestDeck` and rebuilds `cardCounts` at the end, but `handScores` still reflects the current deck's scores (which may have drifted downhill from the best). This means `buf.handScores` is stale after `run()` returns.

This is fine if the exact scorer recomputes from scratch (it does — it doesn't use `handScores`). But it's a subtle invariant that could trip up future code.

**Decision:** Document that `handScores` is not valid after `run()` returns. The exact scorer and public API should not rely on it.

---

## Informational: SPEC validation tests overlap with phases 2–3

The phase 5 test table lists F1–F5, S6 as tests to write. But these were already validated:

- F1 (name priority), F2 (strict improvement), F3 (commutativity), F4 (chain depth), F5 (fusion results are regular): all tested in `fusion-scorer.test.ts` and `reference-scorer.test.ts` via the hand fixtures.
- S6 (determinism): implicit in every test that checks exact expected values.

**Decision:** Don't duplicate these tests. The phase 5 test suite should focus on the *new* code: exact scorer correctness, public API behavior, and the integration tests (O1–O4, S1–S3) that exercise the full pipeline.
