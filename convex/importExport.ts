import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { authArgs, resolveUserId } from "./authHelper";
import { deckAggregate } from "./deckAggregate";
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

    // Count deck copies per cardId and validate against collection
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

    // Clear existing ownedCards for this mod
    const existingOwned = await ctx.db
      .query("ownedCards")
      .withIndex("by_user_mod", (q) => q.eq("userId", userId).eq("mod", mod))
      .collect();
    for (const card of existingOwned) {
      await ctx.db.delete(card._id);
    }

    // Insert imported collection
    for (const [cardId, quantity] of collectionCounts) {
      await ctx.db.insert("ownedCards", { userId, cardId, quantity, mod });
    }

    // Clear existing deck for this mod (with aggregate)
    const existingDeck = await ctx.db
      .query("deck")
      .withIndex("by_user_mod", (q) => q.eq("userId", userId).eq("mod", mod))
      .collect();
    for (const card of existingDeck) {
      await ctx.db.delete(card._id);
      await deckAggregate.delete(ctx, card);
    }

    // Insert imported deck
    for (const cardId of deck) {
      const id = await ctx.db.insert("deck", { userId, cardId, mod });
      const doc = await ctx.db.get(id);
      if (doc) await deckAggregate.insert(ctx, doc);
    }

    return {
      collectionCount: collectionCounts.size,
      deckCount: deck.length,
    };
  },
});

/**
 * Sync collection and deck from the emulator bridge.
 * Accepts pre-computed total owned quantities (trunk + deck) and the deck card IDs.
 * The caller passes the mod the bridge was reading from, so the data is written
 * to the correct mod even if the user switches mod mid-sync.
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

    // Clear existing ownedCards for this mod
    const existingOwned = await ctx.db
      .query("ownedCards")
      .withIndex("by_user_mod", (q) => q.eq("userId", userId).eq("mod", mod))
      .collect();
    for (const card of existingOwned) {
      await ctx.db.delete(card._id);
    }

    // Insert owned cards
    for (const { cardId, quantity } of ownedCards) {
      await ctx.db.insert("ownedCards", { userId, cardId, quantity, mod });
    }

    // Clear existing deck for this mod (with aggregate)
    const existingDeck = await ctx.db
      .query("deck")
      .withIndex("by_user_mod", (q) => q.eq("userId", userId).eq("mod", mod))
      .collect();
    for (const card of existingDeck) {
      await ctx.db.delete(card._id);
      await deckAggregate.delete(ctx, card);
    }

    // Insert deck
    for (const cardId of deck) {
      const id = await ctx.db.insert("deck", { userId, cardId, mod });
      const doc = await ctx.db.get(id);
      if (doc) await deckAggregate.insert(ctx, doc);
    }

    return {
      collectionCount: ownedCards.length,
      deckCount: deck.length,
    };
  },
});
