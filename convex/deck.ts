import { v } from 'convex/values';
import { internal } from './_generated/api';
import { internalMutation, mutation, query } from './_generated/server';
import { requireAuth } from './authHelper';
import { deckAggregate } from './deckAggregate';
import { validateSuggestedSwap, validateSuggestedSwapDeckSize } from './deckSwap';
import { generateEvenlySpacedOrders, getOrderBetween } from './utils';

export const getDeck = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const deckCards = await ctx.db
      .query('deck')
      .withIndex('by_user', q => q.eq('userId', userId))
      .collect();

    return deckCards.sort((a, b) => a.cardId - b.cardId);
  },
});

export const getDeckCardIds = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const deckCards = await ctx.db
      .query('deck')
      .withIndex('by_user', q => q.eq('userId', userId))
      .collect();
    const cardIds = deckCards.map(card => card.cardId);
    const uniqueCardIds = [...new Set(cardIds)];
    return uniqueCardIds.sort((a, b) => a - b);
  },
});

export const getDeckCount = query({
  args: {},
  handler: async (ctx) => {
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
    cardId: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const { cardId } = args;

    // Server-side deck size cap
    const prefs = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', q => q.eq('userId', userId))
      .first();
    const targetSize = prefs?.deckSize ?? 40;
    const currentCount = await deckAggregate.count(ctx);
    if (currentCount >= targetSize) throw new Error('Deck is full');

    // Verify the user has an available copy in their collection
    const collectionEntry = await ctx.db
      .query('ownedCards')
      .withIndex('by_user_card', q => q.eq('userId', userId).eq('cardId', cardId))
      .first();
    if (!collectionEntry) throw new Error('Card not in collection');

    const deckCopies = await ctx.db
      .query('deck')
      .withIndex('by_user', q => q.eq('userId', userId))
      .filter(q => q.eq(q.field('cardId'), cardId))
      .collect();
    if (deckCopies.length >= collectionEntry.quantity) {
      throw new Error('No available copies in collection');
    }

    const id = await ctx.db.insert('deck', { userId, cardId });
    const doc = await ctx.db.get(id);
    if (doc) await deckAggregate.insert(ctx, doc);
  },
});

export const removeFromDeck = mutation({
  args: {
    id: v.id('deck'),
  },
  handler: async (ctx, { id }) => {
    const userId = await requireAuth(ctx);
    const oldDoc = await ctx.db.get(id);

    if (!oldDoc || oldDoc.userId !== userId) throw new Error('Deck card not found');

    await ctx.db.delete(id);
    await deckAggregate.delete(ctx, oldDoc).catch(e => console.warn('Record', id, 'not found in aggregate', e));
  },
});

// Ownership is guaranteed by the by_user index filter (only queries current user's rows).
export const removeOneByCardId = mutation({
  args: { cardId: v.number() },
  handler: async (ctx, { cardId }) => {
    const userId = await requireAuth(ctx);
    const doc = await ctx.db
      .query('deck')
      .withIndex('by_user', q => q.eq('userId', userId))
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
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
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
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
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
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const deckCards = await ctx.db
      .query('deck')
      .withIndex('by_user', q => q.eq('userId', userId))
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
    newDeck: v.array(
      v.object({
        cardId: v.number(),
        copyId: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    // Clear existing deck first
    const deckCards = await ctx.db
      .query('deck')
      .withIndex('by_user', q => q.eq('userId', userId))
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
        userId,
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
        cardId: v.number(),
        copyId: v.string(),
        order: v.number(), // Now using fractional order instead of position
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const results = [];

    // First, clear any existing deck data for this user to avoid duplicates
    const existingDeck = await ctx.db
      .query('deck')
      .withIndex('by_user', q => q.eq('userId', userId))
      .collect();

    // Delete existing deck and update aggregate
    for (const item of existingDeck) {
      await ctx.db.delete(item._id);
      await deckAggregate.delete(ctx, item);
    }

    // Now insert the new deck data
    for (const item of args.deckData) {
      try {
        const id = await ctx.db.insert('deck', {
          userId,
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
    cardIds: v.array(v.number()),
  },
  handler: async (ctx, { cardIds }) => {
    const userId = await requireAuth(ctx);
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

export const applySuggestedSwap = mutation({
  args: {
    addCardId: v.number(),
    removeCardId: v.number(),
  },
  handler: async (ctx, { addCardId, removeCardId }) => {
    const userId = await requireAuth(ctx);

    const [deckCards, collectionEntry, prefs] = await Promise.all([
      ctx.db
        .query('deck')
        .withIndex('by_user', q => q.eq('userId', userId))
        .collect(),
      ctx.db
        .query('ownedCards')
        .withIndex('by_user_card', q => q.eq('userId', userId).eq('cardId', addCardId))
        .first(),
      ctx.db
        .query('userPreferences')
        .withIndex('by_user', q => q.eq('userId', userId))
        .first(),
    ]);
    const expectedDeckSize = prefs?.deckSize ?? 40;

    const deckCopiesOfAddedCard = deckCards.filter(card => card.cardId === addCardId).length;
    const removableCard = deckCards.find(card => card.cardId === removeCardId);
    const deckCopiesOfRemovedCard = deckCards.filter(card => card.cardId === removeCardId).length;

    const deckSizeValidationError = validateSuggestedSwapDeckSize({
      currentDeckSize: deckCards.length,
      expectedDeckSize,
    });
    if (deckSizeValidationError) {
      throw new Error(deckSizeValidationError);
    }

    const validationError = validateSuggestedSwap({
      addCardId,
      collectionQuantity: collectionEntry?.quantity ?? null,
      deckCopiesOfAddedCard,
      deckCopiesOfRemovedCard,
      removeCardId,
    });
    if (validationError) {
      throw new Error(validationError);
    }
    if (!removableCard) {
      throw new Error('Card to remove not found in deck');
    }

    await ctx.db.delete(removableCard._id);
    await deckAggregate.delete(ctx, removableCard);

    const id = await ctx.db.insert('deck', {
      userId,
      cardId: addCardId,
      order: removableCard.order,
    });
    const doc = await ctx.db.get(id);
    if (doc) await deckAggregate.insert(ctx, doc);

    return { success: true };
  },
});
