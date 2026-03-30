import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { authArgs, resolveUserId } from "./authHelper";
import { applyDeckDiff, applyOwnedCardsDiff } from "./diffHelpers";
import { getUserMod } from "./modHelper";

export const importData = mutation({
  args: {
    collection: v.array(v.number()),
    deck: v.array(v.number()),
    ...authArgs,
  },
  handler: async (ctx, { collection, deck, anonymousId }) => {
    const userId = await resolveUserId(ctx, anonymousId);
    const mod = await getUserMod(ctx, userId);

    // Count collection copies per cardId
    const collectionCounts = new Map<number, number>();
    for (const cardId of collection) {
      collectionCounts.set(cardId, (collectionCounts.get(cardId) ?? 0) + 1);
    }

    // Validate deck against collection
    const deckCounts = new Map<number, number>();
    for (const cardId of deck) {
      const count = (deckCounts.get(cardId) ?? 0) + 1;
      deckCounts.set(cardId, count);
      const owned = collectionCounts.get(cardId) ?? 0;
      if (count > owned) {
        throw new Error(
          `Deck has more copies of card ${cardId} than collection`,
        );
      }
    }

    await applyOwnedCardsDiff(ctx, userId, mod, collectionCounts);
    await applyDeckDiff(ctx, userId, mod, deck);

    return {
      collectionCount: collectionCounts.size,
      deckCount: deck.length,
    };
  },
});

/**
 * Sync collection and deck from the emulator bridge.
 * Uses diff-based updates to minimise DB writes and subscription invalidations.
 */
export const syncCollectionFromBridge = mutation({
  args: {
    ownedCards: v.array(v.object({ cardId: v.number(), quantity: v.number() })),
    deck: v.array(v.number()),
    mod: v.string(),
    ...authArgs,
  },
  handler: async (ctx, { ownedCards, deck, mod, anonymousId }) => {
    const userId = await resolveUserId(ctx, anonymousId);

    const target = new Map<number, number>();
    for (const { cardId, quantity } of ownedCards) {
      target.set(cardId, quantity);
    }

    await applyOwnedCardsDiff(ctx, userId, mod, target);
    await applyDeckDiff(ctx, userId, mod, deck);

    return {
      collectionCount: ownedCards.length,
      deckCount: deck.length,
    };
  },
});
