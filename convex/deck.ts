import { v } from 'convex/values';
import { internal } from './_generated/api';
import { internalMutation, mutation, query } from './_generated/server';
import { authArgs, resolveUserId } from './authHelper';
import { deckAggregate, deckAggregateKey } from './deckAggregate';
import { applyDeckDiff } from './diffHelpers';
import { getUserMod } from './modHelper';
import { generateEvenlySpacedOrders, getOrderBetween } from './utils';

export const getDeck = query({
  args: { ...authArgs },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.anonymousId);
    const mod = await getUserMod(ctx, userId);
    const deckCards = await ctx.db
      .query('deck')
      .withIndex('by_user_mod', q => q.eq('userId', userId).eq('mod', mod))
      .collect();

    return deckCards.sort((a, b) => a.cardId - b.cardId);
  },
});

export const getDeckCardIds = query({
  args: { ...authArgs },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.anonymousId);
    const mod = await getUserMod(ctx, userId);
    const deckCards = await ctx.db
      .query('deck')
      .withIndex('by_user_mod', q => q.eq('userId', userId).eq('mod', mod))
      .collect();
    const cardIds = deckCards.map(card => card.cardId);
    const uniqueCardIds = [...new Set(cardIds)];
    return uniqueCardIds.sort((a, b) => a - b);
  },
});

export const getDeckCount = query({
  args: { ...authArgs },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.anonymousId);
    const mod = await getUserMod(ctx, userId);
    const key = deckAggregateKey(userId, mod);
    const aggregateCount = await deckAggregate.count(ctx, {
      bounds: {
        lower: { key, inclusive: true },
        upper: { key, inclusive: true },
      },
    });
    if (aggregateCount > 0) return aggregateCount;
    // Fallback: aggregate may be stale after sortKey migration.
    const rows = await ctx.db
      .query('deck')
      .withIndex('by_user_mod', q => q.eq('userId', userId).eq('mod', mod))
      .collect();
    return rows.length;
  },
});

export const getDeckItem = query({
  args: { id: v.id('deck') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const addToDeck = mutation({
  args: {
    cardId: v.number(),
    ...authArgs,
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.anonymousId);
    const mod = await getUserMod(ctx, userId);
    const { cardId } = args;

    // Server-side deck size cap
    const prefs = await ctx.db
      .query('userModSettings')
      .withIndex('by_user_mod', q => q.eq('userId', userId).eq('mod', mod))
      .first();
    const targetSize = prefs?.deckSize ?? 40;
    // Direct query count for correctness — the aggregate may be stale after
    // a sortKey migration until rebuildDeckAggregate runs.
    const deckCards = await ctx.db
      .query('deck')
      .withIndex('by_user_mod', q => q.eq('userId', userId).eq('mod', mod))
      .collect();
    if (deckCards.length >= targetSize) throw new Error('Deck is full');

    // Verify the user has an available copy in their collection
    const collectionEntry = await ctx.db
      .query('ownedCards')
      .withIndex('by_user_mod_card', q => q.eq('userId', userId).eq('mod', mod).eq('cardId', cardId))
      .first();
    if (!collectionEntry) throw new Error('Card not in collection');

    const deckCopies = await ctx.db
      .query('deck')
      .withIndex('by_user_mod', q => q.eq('userId', userId).eq('mod', mod))
      .filter(q => q.eq(q.field('cardId'), cardId))
      .collect();
    if (deckCopies.length >= 3) {
      throw new Error('Maximum copies of this card in deck');
    }
    if (deckCopies.length >= collectionEntry.quantity) {
      throw new Error('No available copies in collection');
    }

    const id = await ctx.db.insert('deck', { userId, cardId, mod });
    const doc = await ctx.db.get(id);
    if (doc) await deckAggregate.insert(ctx, doc);
  },
});

export const removeFromDeck = mutation({
  args: {
    id: v.id('deck'),
    ...authArgs,
  },
  handler: async (ctx, { id, anonymousId }) => {
    const userId = await resolveUserId(ctx, anonymousId);
    const oldDoc = await ctx.db.get(id);

    if (!oldDoc || oldDoc.userId !== userId) throw new Error('Deck card not found');

    await ctx.db.delete(id);
    await deckAggregate.delete(ctx, oldDoc).catch(e => console.warn('Record', id, 'not found in aggregate', e));
  },
});

// Ownership is guaranteed by the by_user_mod index filter (only queries current user's rows).
export const removeOneByCardId = mutation({
  args: { cardId: v.number(), ...authArgs },
  handler: async (ctx, { cardId, anonymousId }) => {
    const userId = await resolveUserId(ctx, anonymousId);
    const mod = await getUserMod(ctx, userId);
    const doc = await ctx.db
      .query('deck')
      .withIndex('by_user_mod', q => q.eq('userId', userId).eq('mod', mod))
      .filter(q => q.eq(q.field('cardId'), cardId))
      .first();

    if (!doc) throw new Error('Card not found in deck');

    await ctx.db.delete(doc._id);
    await deckAggregate.delete(ctx, doc).catch(e => console.warn('Record', doc._id, 'not found in aggregate', e));
  },
});

export const moveDeckCard = mutation({
  args: {
    id: v.id('deck'),
    newOrder: v.number(), // Target fractional order
    ...authArgs,
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.anonymousId);
    // First, fetch the record to check ownership
    const deckCard = await ctx.db.get(args.id);

    if (!deckCard) {
      return { success: false, error: 'Deck card not found' };
    }

    // Verify ownership - ensure the record belongs to the requesting user
    if (deckCard.userId !== userId) {
      return { success: false, error: 'Unauthorized: card does not belong to user' };
    }

    // Safe to update - record exists and belongs to the user
    await ctx.db.patch(args.id, {
      order: args.newOrder,
    });
    return { success: true };
  },
});

export const insertDeckCardBetween = mutation({
  args: {
    id: v.id('deck'),
    beforeCardId: v.optional(v.id('deck')), // Insert after this card
    afterCardId: v.optional(v.id('deck')), // Insert before this card
    ...authArgs,
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.anonymousId);
    // First, fetch the record to check ownership
    const deckCard = await ctx.db.get(args.id);

    if (!deckCard) {
      return { success: false, error: 'Deck card not found' };
    }

    // Verify ownership - ensure the record belongs to the requesting user
    if (deckCard.userId !== userId) {
      return { success: false, error: 'Unauthorized: card does not belong to user' };
    }

    let beforeOrder: number | null = null;
    let afterOrder: number | null = null;

    if (args.beforeCardId) {
      const beforeCard = await ctx.db.get(args.beforeCardId);
      // Also verify ownership of reference cards if they exist
      if (beforeCard && beforeCard.userId !== userId) {
        return { success: false, error: 'Unauthorized: reference card does not belong to user' };
      }
      beforeOrder = beforeCard?.order ?? null;
    }

    if (args.afterCardId) {
      const afterCard = await ctx.db.get(args.afterCardId);
      // Also verify ownership of reference cards if they exist
      if (afterCard && afterCard.userId !== userId) {
        return { success: false, error: 'Unauthorized: reference card does not belong to user' };
      }
      afterOrder = afterCard?.order ?? null;
    }

    const newOrder = getOrderBetween(beforeOrder, afterOrder);

    await ctx.db.patch(args.id, {
      order: newOrder,
    });

    return { success: true, newOrder };
  },
});

export const clearDeck = mutation({
  args: { ...authArgs },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.anonymousId);
    const mod = await getUserMod(ctx, userId);
    const deckCards = await ctx.db
      .query('deck')
      .withIndex('by_user_mod', q => q.eq('userId', userId).eq('mod', mod))
      .collect();

    // Delete all deck cards for this user and update aggregate
    for (const card of deckCards) {
      await ctx.db.delete(card._id);
      await deckAggregate.delete(ctx, card);
    }

    return { success: true, removedCount: deckCards.length };
  },
});

/**
 * Replace the deck with a new set of cards.
 * Uses diff-based approach for the card set (minimising writes), then
 * assigns evenly-spaced fractional orders to all rows.
 */
export const replaceDeck = mutation({
  args: {
    newDeck: v.array(
      v.object({
        cardId: v.number(),
        copyId: v.string(),
      }),
    ),
    ...authArgs,
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.anonymousId);
    const mod = await getUserMod(ctx, userId);

    // Diff by cardId counts to minimise inserts/deletes
    const cardIds = args.newDeck.map((c) => c.cardId);
    await applyDeckDiff(ctx, userId, mod, cardIds);

    // Now re-read and assign copyId + evenly spaced orders
    const deckCards = await ctx.db
      .query('deck')
      .withIndex('by_user_mod', q => q.eq('userId', userId).eq('mod', mod))
      .collect();

    const orders = generateEvenlySpacedOrders(deckCards.length);
    for (let i = 0; i < deckCards.length; i++) {
      const card = deckCards[i]!;
      const newData = args.newDeck[i];
      const patch: Record<string, unknown> = {};
      if (newData && card.copyId !== newData.copyId) patch.copyId = newData.copyId;
      if (card.order !== orders[i]) patch.order = orders[i];
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(card._id, patch);
      }
    }

    return { success: true, deckSize: args.newDeck.length };
  },
});

/**
 * Batch migrate deck data. Uses diff-based approach, then patches
 * copyId/order on the resulting rows.
 */
export const batchMigrateDeck = mutation({
  args: {
    deckData: v.array(
      v.object({
        cardId: v.number(),
        copyId: v.string(),
        order: v.number(),
      }),
    ),
    ...authArgs,
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.anonymousId);
    const mod = await getUserMod(ctx, userId);

    // Diff by cardId counts
    const cardIds = args.deckData.map((d) => d.cardId);
    await applyDeckDiff(ctx, userId, mod, cardIds);

    // Re-read and patch copyId + order
    const deckCards = await ctx.db
      .query('deck')
      .withIndex('by_user_mod', q => q.eq('userId', userId).eq('mod', mod))
      .collect();

    for (let i = 0; i < deckCards.length; i++) {
      const card = deckCards[i]!;
      const data = args.deckData[i];
      if (!data) continue;
      const patch: Record<string, unknown> = {};
      if (card.copyId !== data.copyId) patch.copyId = data.copyId;
      if (card.order !== data.order) patch.order = data.order;
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(card._id, patch);
      }
    }

    return { success: true, totalProcessed: args.deckData.length };
  },
});

// Migration function to backfill aggregate with existing deck data
export const backfillDeckAggregate = internalMutation({
  args: { cursor: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Process existing deck documents in batches to populate the aggregate
    const batch = await ctx.db.query('deck').paginate({
      cursor: args.cursor ?? null,
      numItems: 100,
    });

    // Insert each existing deck item into the aggregate
    for (const deckDoc of batch.page) {
      try {
        await deckAggregate.insertIfDoesNotExist(ctx, deckDoc);
      } catch (error) {
        console.warn('Failed to insert deck item into aggregate:', error);
      }
    }

    // If there are more items to process, schedule next batch
    if (!batch.isDone) {
      await ctx.scheduler.runAfter(0, internal.deck.backfillDeckAggregate, {
        cursor: batch.continueCursor,
      });
    }

    return {
      processed: batch.page.length,
      isComplete: batch.isDone,
      nextCursor: batch.continueCursor,
    };
  },
});

/**
 * Accept an optimized deck suggestion. Uses diff-based replacement so that
 * unchanged cards stay in place and only the swaps are written.
 */
export const acceptSuggestedDeck = mutation({
  args: {
    cardIds: v.array(v.number()),
    ...authArgs,
  },
  handler: async (ctx, { cardIds, anonymousId }) => {
    const userId = await resolveUserId(ctx, anonymousId);
    const mod = await getUserMod(ctx, userId);
    await applyDeckDiff(ctx, userId, mod, cardIds);
  },
});

export const applySuggestedSwap = mutation({
  args: {
    addCardId: v.number(),
    removeCardId: v.number(),
    ...authArgs,
  },
  handler: async (ctx, { addCardId, removeCardId, anonymousId }) => {
    const userId = await resolveUserId(ctx, anonymousId);
    const mod = await getUserMod(ctx, userId);

    const [deckCards, collectionEntry] = await Promise.all([
      ctx.db
        .query('deck')
        .withIndex('by_user_mod', q => q.eq('userId', userId).eq('mod', mod))
        .collect(),
      ctx.db
        .query('ownedCards')
        .withIndex('by_user_mod_card', q => q.eq('userId', userId).eq('mod', mod).eq('cardId', addCardId))
        .first(),
    ]);
    const deckCopiesOfAddedCard = deckCards.filter(card => card.cardId === addCardId).length;
    const removableCard = deckCards.find(card => card.cardId === removeCardId);

    if (addCardId === removeCardId) {
      throw new Error('Suggested swap must change the deck');
    }
    if (!removableCard) {
      throw new Error('Card to remove not found in deck');
    }
    if (!collectionEntry || collectionEntry.quantity <= 0) {
      throw new Error('Card to add not found in collection');
    }
    if (deckCopiesOfAddedCard >= collectionEntry.quantity) {
      throw new Error('No available copies in collection');
    }

    await ctx.db.delete(removableCard._id);
    await deckAggregate.delete(ctx, removableCard);

    const id = await ctx.db.insert('deck', {
      userId,
      cardId: addCardId,
      mod,
    });
    const doc = await ctx.db.get(id);
    if (doc) await deckAggregate.insert(ctx, doc);

    return { success: true };
  },
});
