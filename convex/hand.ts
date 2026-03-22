import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { requireAuth } from './authHelper';
import { getUserMod } from './modHelper';
import { getOrderBetween } from './utils';

const MAX_HAND_SIZE = 5;

export const getHand = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const mod = await getUserMod(ctx, userId);
    return ctx.db
      .query('hand')
      .withIndex('by_user_mod', q => q.eq('userId', userId).eq('mod', mod))
      .collect();
  },
});

export const addToHand = mutation({
  args: {
    cardId: v.number(),
  },
  handler: async (ctx, { cardId }) => {
    const userId = await requireAuth(ctx);
    const mod = await getUserMod(ctx, userId);
    const currentHand = await ctx.db
      .query('hand')
      .withIndex('by_user_mod', q => q.eq('userId', userId).eq('mod', mod))
      .collect();

    if (currentHand.length >= MAX_HAND_SIZE) {
      throw new Error('Hand is full (max 5 cards)');
    }

    await ctx.db.insert('hand', { userId, cardId, mod });
  },
});

export const removeFromHand = mutation({
  args: {
    id: v.id('hand'),
  },
  handler: async (ctx, { id }) => {
    const userId = await requireAuth(ctx);
    const oldDoc = await ctx.db.get(id);

    if (!oldDoc || oldDoc.userId !== userId) throw new Error('Deck card not found');

    await ctx.db.delete(id);
  },
});

export const removeMultipleFromHand = mutation({
  args: {
    ids: v.array(v.id('hand')),
  },
  handler: async (ctx, { ids }) => {
    const userId = await requireAuth(ctx);
    const oldDocs = await Promise.all(ids.map(id => ctx.db.get(id)));

    for (const oldDoc of oldDocs) {
      if (!oldDoc || oldDoc.userId !== userId) throw new Error('Card not found in hand');
    }

    for (const id of ids) {
      await ctx.db.delete(id);
    }
  },
});

export const moveHandCard = mutation({
  args: {
    copyId: v.string(),
    beforeCardCopyId: v.optional(v.string()), // Insert after this card
    afterCardCopyId: v.optional(v.string()), // Insert before this card
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const mod = await getUserMod(ctx, userId);
    // Find the card to move
    const cardToMove = await ctx.db
      .query('hand')
      .withIndex('by_user_mod', q => q.eq('userId', userId).eq('mod', mod))
      .filter(q => q.eq(q.field('copyId'), args.copyId))
      .first();

    if (!cardToMove) {
      return { success: false, error: 'Card not found in hand' };
    }

    let beforeOrder: number | null = null;
    let afterOrder: number | null = null;

    if (args.beforeCardCopyId) {
      const beforeCard = await ctx.db
        .query('hand')
        .withIndex('by_user_mod', q => q.eq('userId', userId).eq('mod', mod))
        .filter(q => q.eq(q.field('copyId'), args.beforeCardCopyId))
        .first();
      beforeOrder = beforeCard?.order ?? null;
    }

    if (args.afterCardCopyId) {
      const afterCard = await ctx.db
        .query('hand')
        .withIndex('by_user_mod', q => q.eq('userId', userId).eq('mod', mod))
        .filter(q => q.eq(q.field('copyId'), args.afterCardCopyId))
        .first();
      afterOrder = afterCard?.order ?? null;
    }

    const newOrder = getOrderBetween(beforeOrder, afterOrder);

    await ctx.db.patch(cardToMove._id, {
      order: newOrder,
    });

    return { success: true, newOrder };
  },
});

export const clearHand = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const mod = await getUserMod(ctx, userId);
    const handCards = await ctx.db
      .query('hand')
      .withIndex('by_user_mod', q => q.eq('userId', userId).eq('mod', mod))
      .collect();

    // Delete all hand cards for this user
    for (const card of handCards) {
      await ctx.db.delete(card._id);
    }

    return { success: true, removedCount: handCards.length };
  },
});

// Batch migration function for robust hand migration
export const batchMigrateHand = mutation({
  args: {
    handData: v.array(
      v.object({
        cardId: v.number(),
        copyId: v.string(),
        order: v.number(), // Now using fractional order instead of position
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const mod = await getUserMod(ctx, userId);
    const results = [];

    // First, clear any existing hand data for this user to avoid duplicates
    const existingHand = await ctx.db
      .query('hand')
      .withIndex('by_user_mod', q => q.eq('userId', userId).eq('mod', mod))
      .collect();

    for (const item of existingHand) {
      await ctx.db.delete(item._id);
    }

    // Now insert the new hand data (max 5 cards)
    const handDataToInsert = args.handData.slice(0, 5); // Enforce max 5 cards

    for (const item of handDataToInsert) {
      try {
        await ctx.db.insert('hand', {
          userId,
          cardId: item.cardId,
          copyId: item.copyId,
          order: item.order,
          mod,
        });
        results.push({ copyId: item.copyId, action: 'created' });
      } catch (error) {
        results.push({ copyId: item.copyId, action: 'error', error: String(error) });
      }
    }

    return { success: true, results, totalProcessed: handDataToInsert.length };
  },
});
