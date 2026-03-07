import { v } from 'convex/values';
import { internal } from './_generated/api';
import { internalMutation, mutation, query } from './_generated/server';
import { deckAggregate } from './deckAggregate';
import { generateEvenlySpacedOrders, getOrderBetween } from './utils';

export const getDeck = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const deckCards = await ctx.db
      .query('deck')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .collect();

    return deckCards.sort((a, b) => a.cardId - b.cardId);
  },
});

export const getDeckCardIds = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const deckCards = await ctx.db
      .query('deck')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .collect();
    const cardIds = deckCards.map(card => card.cardId);
    const uniqueCardIds = [...new Set(cardIds)];
    return uniqueCardIds.sort((a, b) => a - b);
  },
});

export const getDeckCount = query({
  args: { userId: v.string() },
  handler: async (ctx, _args) => {
    return await deckAggregate.count(ctx);
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
    userId: v.string(),
    cardId: v.number(),
  },
  handler: async (ctx, args) => {
    const { userId, cardId } = args;
    const id = await ctx.db.insert('deck', { userId, cardId });
    const doc = await ctx.db.get(id);
    if (doc) await deckAggregate.insert(ctx, doc);
  },
});

export const removeFromDeck = mutation({
  args: {
    userId: v.string(),
    id: v.id('deck'),
  },
  handler: async (ctx, { userId, id }) => {
    const oldDoc = await ctx.db.get(id);

    if (!oldDoc || oldDoc.userId !== userId) throw new Error('Deck card not found');

    await ctx.db.delete(id);
    await deckAggregate.delete(ctx, oldDoc).catch(e => console.warn('Record', id, 'not found in aggregate', e));
  },
});

export const moveDeckCard = mutation({
  args: {
    userId: v.string(),
    id: v.id('deck'),
    newOrder: v.number(), // Target fractional order
  },
  handler: async (ctx, args) => {
    // First, fetch the record to check ownership
    const deckCard = await ctx.db.get(args.id);

    if (!deckCard) {
      return { success: false, error: 'Deck card not found' };
    }

    // Verify ownership - ensure the record belongs to the requesting user
    if (deckCard.userId !== args.userId) {
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
    userId: v.string(),
    id: v.id('deck'),
    beforeCardId: v.optional(v.id('deck')), // Insert after this card
    afterCardId: v.optional(v.id('deck')), // Insert before this card
  },
  handler: async (ctx, args) => {
    // First, fetch the record to check ownership
    const deckCard = await ctx.db.get(args.id);

    if (!deckCard) {
      return { success: false, error: 'Deck card not found' };
    }

    // Verify ownership - ensure the record belongs to the requesting user
    if (deckCard.userId !== args.userId) {
      return { success: false, error: 'Unauthorized: card does not belong to user' };
    }

    let beforeOrder: number | null = null;
    let afterOrder: number | null = null;

    if (args.beforeCardId) {
      const beforeCard = await ctx.db.get(args.beforeCardId);
      // Also verify ownership of reference cards if they exist
      if (beforeCard && beforeCard.userId !== args.userId) {
        return { success: false, error: 'Unauthorized: reference card does not belong to user' };
      }
      beforeOrder = beforeCard?.order ?? null;
    }

    if (args.afterCardId) {
      const afterCard = await ctx.db.get(args.afterCardId);
      // Also verify ownership of reference cards if they exist
      if (afterCard && afterCard.userId !== args.userId) {
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
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const deckCards = await ctx.db
      .query('deck')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .collect();

    // Delete all deck cards for this user and update aggregate
    for (const card of deckCards) {
      await ctx.db.delete(card._id);
      await deckAggregate.delete(ctx, card);
    }

    return { success: true, removedCount: deckCards.length };
  },
});

export const replaceDeck = mutation({
  args: {
    userId: v.string(),
    newDeck: v.array(
      v.object({
        cardId: v.number(),
        copyId: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Clear existing deck first
    const deckCards = await ctx.db
      .query('deck')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .collect();

    // Delete all deck cards for this user and update aggregate
    for (const card of deckCards) {
      await ctx.db.delete(card._id);
      await deckAggregate.delete(ctx, card);
    }

    // Add new cards with evenly spaced fractional orders
    const orders = generateEvenlySpacedOrders(args.newDeck.length);

    for (let i = 0; i < args.newDeck.length; i++) {
      const card = args.newDeck[i];
      if (!card) throw new Error('Card is undefined');

      const id = await ctx.db.insert('deck', {
        userId: args.userId,
        cardId: card.cardId,
        copyId: card.copyId,
        order: orders[i] ?? 0.5,
      });
      const doc = await ctx.db.get(id);
      if (doc) await deckAggregate.insert(ctx, doc);
    }

    return { success: true, deckSize: args.newDeck.length };
  },
});

// Batch migration function for robust deck migration
export const batchMigrateDeck = mutation({
  args: {
    deckData: v.array(
      v.object({
        userId: v.string(),
        cardId: v.number(),
        copyId: v.string(),
        order: v.number(), // Now using fractional order instead of position
      }),
    ),
  },
  handler: async (ctx, args) => {
    const results = [];
    const userId = args.deckData[0]?.userId ?? null;

    // First, clear any existing deck data for this user to avoid duplicates
    const existingDeck = userId
      ? await ctx.db
          .query('deck')
          .withIndex('by_user', q => q.eq('userId', userId))
          .collect()
      : [];

    // Delete existing deck and update aggregate
    for (const item of existingDeck) {
      await ctx.db.delete(item._id);
      await deckAggregate.delete(ctx, item);
    }

    // Now insert the new deck data
    for (const item of args.deckData) {
      try {
        const id = await ctx.db.insert('deck', {
          userId: item.userId,
          cardId: item.cardId,
          copyId: item.copyId,
          order: item.order,
        });
        const doc = await ctx.db.get(id);
        if (doc) await deckAggregate.insert(ctx, doc);

        results.push({ copyId: item.copyId, action: 'created' });
      } catch (error) {
        results.push({ copyId: item.copyId, action: 'error', error: String(error) });
      }
    }

    return { success: true, results, totalProcessed: args.deckData.length };
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

export const acceptSuggestedDeck = mutation({
  args: {
    userId: v.string(),
    cardIds: v.array(v.number()),
  },
  handler: async (ctx, { userId, cardIds }) => {
    const existingDeckCards = await ctx.db
      .query('deck')
      .withIndex('by_user', q => q.eq('userId', userId))
      .collect();

    await Promise.all([
      // Delete old deck cards
      ...existingDeckCards.map(async card => {
        await ctx.db.delete(card._id);
        await deckAggregate.delete(ctx, card);
      }),
      // Add new deck cards
      ...cardIds.map(async cardId => {
        const id = await ctx.db.insert('deck', {
          userId,
          cardId,
        });
        const doc = await ctx.db.get(id);
        if (doc) await deckAggregate.insert(ctx, doc);
      }),
    ]);
  },
});
