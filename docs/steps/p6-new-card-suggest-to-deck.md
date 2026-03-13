When adding a card to the collection, it should check if integrating it in the deck would increase the score. It's a kind of "delta" operation, where we try to find the most interesting swap that would lead to the best score increase. I guess there is something similar already done during the deck optimization process.

If a swap is found (suggest the most interesting one, of course), then the swap is suggested (optional). Find the best UX for that.

## Current State

- A first end-to-end implementation exists: exact swap scoring logic, worker plumbing, Convex swap validation, and a `LastAddedCardHint` CTA to apply a suggested swap.
- The rebase onto `new-app` needs this feature to target the newer `ownedCards` and `userPreferences` APIs instead of the pre-rename collection names.
- The current UX is intentionally lightweight and only surfaces a single best swap for the last card added.
- Review follow-up fixes have closed the main correctness gaps: the engine exact-scores every unique removable candidate while reusing buffers, the worker lifecycle handles pre-aborted and failed runs safely, the hint clears optimistically after a successful apply, and Convex now rejects swaps unless the deck is still at the configured size.

## Exit Criteria

- Adding a card can surface a one-for-one deck swap suggestion when the deck is already full.
- Suggestions respect owned-card totals, current deck contents, and the active deck-size and fusion-depth preferences.
- Applying the suggestion performs a validated swap in Convex and keeps the deck order intact.
- Engine, Convex, and UI behavior are covered by tests.

## Next Step After This

The next improvement should focus on UX quality rather than broader scope: explain why no upgrade was found, tune the copy and loading states, and decide whether this suggestion should remain inline in the collection panel or move into a more explicit review surface.
