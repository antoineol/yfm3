# TODO

Keep this file short. Delete completed items instead of turning it into history.

## Active

- Map the selected guardian-star byte from RAM for duel battle prediction. Until then, predictions fall back to each card's primary guardian star and can disagree with live duels when the player selected a secondary star.
- Validate active-disc rank table extraction against a live RP 1.3 bridge run after cache refresh, including extraction metadata (`tableCount`, `selectedCount`, `variantCount`) when users report rank mismatches.
- Verify PAL focused-card display across hand focus, player field, opponent focus, duplicated card IDs, and target-selection battle prediction.
- Map remaining PAL live-duel fields only when they unlock a real UI behavior: opponent field-slot focus, selected guardian star, and free-duel unlock bytes.

## Recommended Backlog

- Keep agent game control as a testing tool, but add no high-level gameplay automation until there is a concrete test or data-collection need.
- Revisit starchip/drop farming metrics only after the current farm recommendations produce a demonstrably wrong priority for a real collection.
