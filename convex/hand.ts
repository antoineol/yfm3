import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { authArgs, resolveUserId } from './authHelper';
import { getUserMod } from './modHelper';
import { getOrderBetween } from './utils';

const MAX_HAND_SIZE = 5;

export const getHand = query({
  args: { ...authArgs },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.anonymousId);
    const mod = await getUserMod(ctx, userId);
    return ctx.db
      .query('hand')
      .withIndex('by_user_mod', q => q.eq('userId', userId).eq('mod', mod))
      .collect();
  },
});

export const addToHand = mutation({
  args: {
    ...authArgs,
    cardId: v.number(),
  },
  handler: async (ctx, { anonymousId, cardId }) => {
    const userId = await resolveUserId(ctx, anonymousId);
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
    ...authArgs,
    id: v.id('hand'),
  },
  handler: async (ctx, { anonymousId, id }) => {
    const userId = await resolveUserId(ctx, anonymousId);
    const oldDoc = await ctx.db.get(id);

    if (!oldDoc || oldDoc.userId !== userId) throw new Error('Deck card not found');

    await ctx.db.delete(id);
  },
});

export const removeMultipleFromHand = mutation({
  args: {
    ...authArgs,
    ids: v.array(v.id('hand')),
  },
  handler: async (ctx, { anonymousId, ids }) => {
    const userId = await resolveUserId(ctx, anonymousId);
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
    ...authArgs,
    copyId: v.string(),
    beforeCardCopyId: v.optional(v.string()), // Insert after this card
    afterCardCopyId: v.optional(v.string()), // Insert before this card
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.anonymousId);
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
  args: { ...authArgs },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.anonymousId);
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

/**
 * Diff-based hand sync. Compares existing hand rows by copyId and only
 * patches/inserts/deletes what actually changed, minimising writes.
 */
export const batchMigrateHand = mutation({
  args: {
    ...authArgs,
    handData: v.array(
      v.object({
        cardId: v.number(),
        copyId: v.string(),
        order: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.anonymousId);
    const mod = await getUserMod(ctx, userId);

    const existingHand = await ctx.db
      .query('hand')
      .withIndex('by_user_mod', q => q.eq('userId', userId).eq('mod', mod))
      .collect();

    const existingByCopyId = new Map(
      existingHand
        .filter((h) => h.copyId != null)
        .map((h) => [h.copyId!, { _id: h._id, cardId: h.cardId, order: h.order }]),
    );

    const handDataToSync = args.handData.slice(0, 5);

    let patched = 0;
    let inserted = 0;
    let deleted = 0;

    // Upsert incoming items
    for (const item of handDataToSync) {
      const existing = existingByCopyId.get(item.copyId);
      if (existing) {
        const diff: Record<string, unknown> = {};
        if (existing.cardId !== item.cardId) diff.cardId = item.cardId;
        if (existing.order !== item.order) diff.order = item.order;
        if (Object.keys(diff).length > 0) {
          await ctx.db.patch(existing._id, diff);
          patched++;
        }
        existingByCopyId.delete(item.copyId);
      } else {
        await ctx.db.insert('hand', {
          userId,
          cardId: item.cardId,
          copyId: item.copyId,
          order: item.order,
          mod,
        });
        inserted++;
      }
    }

    // Delete rows whose copyId is not in incoming set
    for (const [, row] of existingByCopyId) {
      await ctx.db.delete(row._id);
      deleted++;
    }
    // Delete legacy rows without copyId
    for (const row of existingHand) {
      if (row.copyId == null) {
        await ctx.db.delete(row._id);
        deleted++;
      }
    }

    return { success: true, totalProcessed: handDataToSync.length, patched, inserted, deleted };
  },
});
