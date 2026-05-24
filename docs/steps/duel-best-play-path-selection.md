# Duel Best Play Path Selection

## Goal

When multiple paths produce the same displayed Best Play, show the path that leaves the strongest follow-up play in the remaining hand.

## Current Step

- Done: equivalent play groups now collect all candidate paths before choosing the representative path by current ATK, remaining-hand best ATK, total cards consumed, then lowest consumed material ATK.

## Next Steps

- Watch real duel usage for any field-card-specific tie cases that should include remaining field state, not only remaining hand cards.

## Notes

- The tie-breaker removes consumed hand materials and applied equips by card-id multiset, then reuses the normal `findFusionChains` flow on the remaining hand.
- Field materials are not included in the leftover simulation yet; this matches the current hand-focused Best Plays workflow and avoids pretending a consumed field card is still available.
