When adding a card to the collection, it should check if integrating it in the deck would increase the score. It's a kind of "delta" operation, where we try to find the most interesting swap that would lead to the best score increase. I guess there is something similar already done during the deck optimization process.

If a swap is found (suggest the most interesting one, of course), then the swap is suggested (optional). Find the best UX for that.

## Current State

- A simplified end-to-end implementation exists: a worker-based suggestion scan for the last added card, a lightweight inline hint UI, and a direct Convex `applySuggestedSwap` mutation.
- The rebase onto `new-app` needs this feature to target the newer `ownedCards` and `userPreferences` APIs instead of the pre-rename collection names.
- The current UX is intentionally lightweight and only surfaces a single recommended swap for the last card added.
- The refactor removes unused suggestion payload fields, deck-order preservation on apply, and the extra validation helper module.
- The slow pure exact scan was replaced with a faster ranked-then-exact worker path that exact-scores a small shortlist and stays comfortably under one second on a full deck.
- The UI now computes last-added availability locally (`totalOwned`, `inDeck`, `availableInCollection`) and passes only `addedCardAvailableCopies` into the suggestion hook, so the worker request only carries deck-scoring inputs.

## Exit Criteria

- Adding a card can surface a one-for-one deck swap suggestion when the deck is already full.
- Suggestions respect owned-card totals, current deck contents, and the active deck-size and fusion-depth preferences.
- Suggestions rerun when the deck or owned-card totals actually change, but not when Convex only returns fresh references for the same data.
- Suggestions do not spawn the worker when the added card has no extra copy available beyond what is already in deck.
- Applying the suggestion performs a validated swap in Convex.
- Engine, Convex, and UI behavior are covered by tests.

## Next Step After This

Keep follow-up scoped to measurement only: profile render and suggestion latency in real usage before considering any further optimization work.
