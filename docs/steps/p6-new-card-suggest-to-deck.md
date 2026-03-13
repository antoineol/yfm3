When adding a card to the collection, it should check if integrating it in the deck would increase the score. It's a kind of "delta" operation, where we try to find the most interesting swap that would lead to the best score increase. I guess there is something similar already done during the deck optimization process.

If a swap is found (suggest the most interesting one, of course), then the swap is suggested (optional). Find the best UX for that.

## Current State

- A simplified end-to-end implementation exists: an exact worker scan for the last added card, a lightweight inline hint UI, and a direct Convex `applySuggestedSwap` mutation.
- The rebase onto `new-app` needs this feature to target the newer `ownedCards` and `userPreferences` APIs instead of the pre-rename collection names.
- The current UX is intentionally lightweight and only surfaces a single best swap for the last card added.
- The refactor removes the sampled-ranking layer, unused suggestion payload fields, deck-order preservation on apply, and the extra validation helper module.

## Exit Criteria

- Adding a card can surface a one-for-one deck swap suggestion when the deck is already full.
- Suggestions respect owned-card totals, current deck contents, and the active deck-size and fusion-depth preferences.
- Applying the suggestion performs a validated swap in Convex.
- Engine, Convex, and UI behavior are covered by tests.

## Next Step After This

Only move on to [`docs/steps/p6.6-optimize.md`](p6.6-optimize.md) if measurement shows the simplified exact scan is too slow in practice. Otherwise keep the simpler version.
