import { v } from "convex/values";
import { mutation, type MutationCtx, query } from "./_generated/server";
import { requireAuth } from "./authHelper";
import { getUserMod } from "./modHelper";

export const getOwnedCardsIndexedByCardId = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const mod = await getUserMod(ctx, userId);
    const ownedCards = await ctx.db
      .query("ownedCards")
      .withIndex("by_user_mod", (q) => q.eq("userId", userId).eq("mod", mod))
      .collect();

    return ownedCards.reduce(
      (acc, item) => {
        acc[item.cardId] = item;
        return acc;
      },
      {} as Record<number, (typeof ownedCards)[number]>,
    );
  },
});

export const getOwnedCardsWithoutDeck = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const mod = await getUserMod(ctx, userId);
    const ownedCards = await ctx.db
      .query("ownedCards")
      .withIndex("by_user_mod", (q) => q.eq("userId", userId).eq("mod", mod))
      .collect();
    const deckCards = await ctx.db
      .query("deck")
      .withIndex("by_user_mod", (q) => q.eq("userId", userId).eq("mod", mod))
      .collect();

    const deckCounts: Record<number, number> = {};
    for (const deckCard of deckCards) {
      deckCounts[deckCard.cardId] = (deckCounts[deckCard.cardId] ?? 0) + 1;
    }

    return ownedCards
      .map((item) => {
        const deckCount = deckCounts[item.cardId] ?? 0;
        const availableQuantity = Math.max(item.quantity - deckCount, 0);

        return {
          ...item,
          availableQuantity,
        };
      })
      .filter((item) => item.availableQuantity > 0)
      .sort((a, b) => a.cardId - b.cardId);
  },
});

export const getOwnedCardIds = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const mod = await getUserMod(ctx, userId);
    const ownedCards = await ctx.db
      .query("ownedCards")
      .withIndex("by_user_mod", (q) => q.eq("userId", userId).eq("mod", mod))
      .collect();
    const cardIds = ownedCards.map((item) => item.cardId);
    const uniqueCardIds = [...new Set(cardIds)];
    return uniqueCardIds.sort((a, b) => a - b);
  },
});

export const getOwnedCardTotals = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const mod = await getUserMod(ctx, userId);
    const ownedCards = await ctx.db
      .query("ownedCards")
      .withIndex("by_user_mod", (q) => q.eq("userId", userId).eq("mod", mod))
      .collect();

    const ownedCardTotals: Record<number, number> = {};
    for (const item of ownedCards) {
      ownedCardTotals[item.cardId] = item.quantity;
    }

    return ownedCardTotals;
  },
});

export const removeOwnedCardEntry = mutation({
  args: {
    id: v.id("ownedCards"),
  },
  handler: async (ctx, { id }) => {
    const userId = await requireAuth(ctx);
    const oldDoc = await ctx.db.get(id);

    if (!oldDoc || oldDoc.userId !== userId) {
      throw new Error("Owned card not found");
    }

    if (oldDoc.quantity > 1) {
      await ctx.db.patch(id, { quantity: oldDoc.quantity - 1 });
    } else {
      await ctx.db.delete(id);
    }
  },
});

export const addOwnedCardEntry = mutation({
  args: {
    cardId: v.number(),
  },
  handler: async (ctx, { cardId }) => {
    const userId = await requireAuth(ctx);
    const mod = await getUserMod(ctx, userId);
    const doc = await ctx.db
      .query("ownedCards")
      .withIndex("by_user_mod_card", (q) => q.eq("userId", userId).eq("mod", mod).eq("cardId", cardId))
      .first();

    if (doc && doc.quantity >= 3) {
      throw new Error("Maximum quantity reached");
    }

    if (doc) {
      await ctx.db.patch(doc._id, { quantity: doc.quantity + 1 });
    } else {
      await ctx.db.insert("ownedCards", { userId, cardId, quantity: 1, mod });
    }

    await updateLastAddedCard(ctx, userId, mod, cardId);
  },
});

export const addCard = mutation({
  args: {
    cardId: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const mod = await getUserMod(ctx, userId);
    const existing = await ctx.db
      .query("ownedCards")
      .withIndex("by_user_mod", (q) => q.eq("userId", userId).eq("mod", mod))
      .filter((q) => q.eq(q.field("cardId"), args.cardId))
      .first();

    if (existing) {
      if (existing.quantity < 3) {
        await ctx.db.patch(existing._id, {
          quantity: existing.quantity + 1,
        });
        await updateLastAddedCard(ctx, userId, mod, args.cardId);
        return { success: true, newQuantity: existing.quantity + 1 };
      }

      return { success: false, error: "Maximum quantity reached" };
    }

    await ctx.db.insert("ownedCards", {
      userId,
      cardId: args.cardId,
      quantity: 1,
      mod,
    });
    await updateLastAddedCard(ctx, userId, mod, args.cardId);

    return { success: true, newQuantity: 1 };
  },
});

export const removeCard = mutation({
  args: {
    cardId: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const mod = await getUserMod(ctx, userId);
    const existing = await ctx.db
      .query("ownedCards")
      .withIndex("by_user_mod", (q) => q.eq("userId", userId).eq("mod", mod))
      .filter((q) => q.eq(q.field("cardId"), args.cardId))
      .first();

    if (!existing) {
      return { success: false, error: "Card not found in owned cards" };
    }

    const deckCopies = await ctx.db
      .query("deck")
      .withIndex("by_user_mod", (q) => q.eq("userId", userId).eq("mod", mod))
      .filter((q) => q.eq(q.field("cardId"), args.cardId))
      .collect();
    if (existing.quantity <= deckCopies.length) {
      return { success: false, error: "Cannot remove card that is in the deck" };
    }

    if (existing.quantity > 1) {
      await ctx.db.patch(existing._id, {
        quantity: existing.quantity - 1,
      });
      return { success: true, newQuantity: existing.quantity - 1 };
    }

    await ctx.db.delete(existing._id);
    return { success: true, newQuantity: 0 };
  },
});

async function updateLastAddedCard(
  ctx: MutationCtx,
  userId: string,
  mod: string,
  cardId: number,
) {
  const existing = await ctx.db
    .query("userModSettings")
    .withIndex("by_user_mod", (q) => q.eq("userId", userId).eq("mod", mod))
    .first();
  const now = Date.now();

  if (existing) {
    await ctx.db.patch(existing._id, {
      lastAddedCard: cardId,
      updatedAt: now,
    });
    return;
  }

  await ctx.db.insert("userModSettings", {
    userId,
    lastAddedCard: cardId,
    mod,
    createdAt: now,
    updatedAt: now,
  });
}
