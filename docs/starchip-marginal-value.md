# Buy view — marginal value metric (v2 design notes)

## Why `ATK / cost` is wrong (in a useful way)

V1 ranks buyable monsters by `attack / starchipCost`. It's transparent, cheap, and stable — three real virtues. But it's deck-agnostic: a 1200-ATK monster at 10 starchips scores 120 and sits at the top of the list even when the user's current deck is full of 1500+ ATK monsters. Buying that card would not raise the project's core metric (expected value of the highest ATK in a 5-card opening hand).

The ratio answers "which card gives me the most ATK per starchip?" The user's real question is "which purchase moves my deck's expected-max-ATK the most per starchip?"

## Proposed v2 metric

For each candidate card c:

```
uplift(c)       = optimizedScore(collection ∪ {c}) − optimizedScore(collection)
marginalValue(c) = uplift(c) / starchipCost(c)
```

where `optimizedScore` is whatever the deck optimizer already produces as its target function.

Meaning: "if I bought one copy of c and re-optimized my 40-card deck, how much does the scoring metric rise, per starchip spent?" Now a 1200-ATK card is correctly worth zero if it would never enter the optimized deck.

## Compute cost

Naive cost: one optimizer pass per candidate card. With ~800 buyable monsters this is unacceptable at interactive speed.

Mitigations, in order of effort:
- **Top-N by ATK prefilter.** Cards below the current worst slot in the optimized deck cannot improve the score — bound the candidate set.
- **Delta scoring.** Instead of re-running the full optimizer, compute an incremental delta given the optimized deck: the uplift from one card is bounded by replacing the weakest deck slot the new card dominates. This may undercount fusion-material gains; validate against a sample.
- **Result cache.** Keyed on `(collection hash, cost cap, filter state)`. Invalidate on collection change. Marginal values are stable between purchases until the collection itself changes.

## Open design questions

- **Which deck context?** Options: (a) the user's current on-screen deck; (b) the optimizer's best deck given current collection; (c) a hypothetical "best possible with 3 copies of everything" baseline. (b) is the most honest answer but adds dependency on the optimizer pipeline.
- **Ranking stability.** Unlike `ATK / cost`, marginal value changes every time the collection changes. Surface this so users don't feel whiplashed: maybe show a small "changed since last visit" marker instead of reordering silently.
- **Presentation.** The ratio unit ("score points per starchip") has no natural interpretation — consider grading (S/A/B) or a normalized 0–100 band for scannability, and keep the raw number in a tooltip.
- **Non-monsters.** Equip/Magic/Trap/Ritual cards also cost starchips. Their contribution to `optimizedScore` is indirect (fusions, utility). If we extend the Buy view to them, marginal value is arguably the *only* metric that makes sense.

## When to revisit

- When users ask "why is card X at the top of Buy?" and the deck-agnostic answer feels wrong.
- When the optimizer exposes a stable incremental scoring API.
- When we surface per-card optimizer diagnostics elsewhere (then adding one more consumer is cheap).
