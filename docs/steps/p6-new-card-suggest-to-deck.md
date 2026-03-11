When adding a card to the collection, it should check if integrating it in the deck would increase the score. It's a kind of "delta" operation, where we try to find the most interesting swap that would lead to the best score increase. I guess there is something similar already done during the deck optimization process.

If a swap is found (suggest the most interesting one, of course), then the swap is suggested (optional). Find the best UX for that.
