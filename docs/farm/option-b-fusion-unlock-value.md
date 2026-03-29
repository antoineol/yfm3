# Option B: Fusion-Unlock Value

## What it answers

"Which duellist drops cards that unlock powerful fusions I can't make yet?"

## Approach

For each card droppable by any unlocked duellist:

1. Scan the fusion table: for each card already in the player's collection, check if `fusion(droppedCard, ownedCard)` produces a result.
2. Score each fusion by ATK uplift: `fusionResult.atk - max(droppedCard.atk, ownedCard.atk)`.
3. Aggregate per duellist, weighted by drop probability.

## Budget estimate

- ~300 droppable cards × 722 fusion lookups = ~216K table reads
- **Total: under 50ms**

## Strengths

- Extremely fast.
- Output is concrete and actionable: "farm X because they drop Y which fuses with your Z into W (3000 ATK)".
- Captures the key game mechanic (fusions dominate hand strength).

## Weaknesses

- Only considers single-step fusions (2 materials). Misses fusion chains (A+B→X, X+C→Y).
- Doesn't account for deck slot competition (a fusion using 2 of 5 hand slots must beat playing those cards individually).
- Ignores standalone high-ATK cards that don't need fusions.
- ATK uplift is a rough proxy — doesn't consider the full deck/hand context.

## Verdict

Great as a fast heuristic and explainability layer. Limited as a standalone engine because it ignores deck context and fusion chains. See the Fusion Discovery variant (Option D) for a more complete version of this idea.
