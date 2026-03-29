# Option C: Rank-Conditional Refinement

## What it answers

Not a standalone approach. Answers: "What drop table should we use for each duellist?"

## Approach

Each duellist has 3 drop tables with very different distributions:

- `sa_pow` — S/A rank, Power victory
- `sa_tec` — S/A rank, Technique victory
- `bcd` — B/C/D rank victory

The player's achievable rank against each duellist determines which table applies. This is a required input parameter for any farm scoring approach.

## Options for determining rank

1. **Manual per-duellist toggle** (most accurate): player selects their expected rank for each duellist.
2. **Global default** (simplest): assume BCD for all duellists (conservative — "I can beat them but won't get S/A rank"). Let the player override globally to S/A POW or S/A TEC.
3. **Blended probability**: assume some mix (e.g., 70% BCD + 30% S/A POW) to reflect realistic play. Could be a single slider.

## Budget estimate

Zero additional compute — just selects which weight column to read from the duellist data.

## Recommendation

Start with a global BCD default + per-duellist override. This matches the common player experience: most duellists are farmed at BCD rank, with a few easy ones at S/A.
