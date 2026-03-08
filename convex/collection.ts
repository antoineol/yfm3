import { v } from 'convex/values';
import { mutation, type MutationCtx, query } from './_generated/server';

export const getCollectionIndexedByCardId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const collection = await ctx.db
      .query('cardCollection')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .collect();

    return collection.reduce(
      (acc, item) => {
        acc[item.cardId] = item;
        return acc;
      },
      {} as Record<number, (typeof collection)[number]>,
    );
  },
});

export const getCollectionWithoutDeck = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const collection = await ctx.db
      .query('cardCollection')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .collect();

    // Filter collection: remove cards that are in the deck
    const deckCards = await ctx.db
      .query('deck')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .collect();

    const deckCounts: Record<number, number> = {};
    for (const deckCard of deckCards) {
      deckCounts[deckCard.cardId] = (deckCounts[deckCard.cardId] ?? 0) + 1;
    }

    const filteredCollection = collection
      .map(item => {
        const deckCount = deckCounts[item.cardId] ?? 0;
        const availableQuantity = Math.max(item.quantity - deckCount, 0);

        return {
          ...item,
          availableQuantity,
        };
      })
      .filter(item => item.availableQuantity > 0);

    return filteredCollection.sort((a, b) => a.cardId - b.cardId);
  },
});

export const getCollectionCardIds = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const collection = await ctx.db
      .query('cardCollection')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .collect();
    const cardIds = collection.map(item => item.cardId);
    const uniqueCardIds = [...new Set(cardIds)];
    return uniqueCardIds.sort((a, b) => a - b);
  },
});

export const getLastAddedCard = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userPrefs = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .first();

    if (!userPrefs?.lastAddedCard) return null;

    return await ctx.db
      .query('cardCollection')
      .withIndex('by_user_card', q => q.eq('userId', args.userId).eq('cardId', userPrefs.lastAddedCard!))
      .first();
  },
});

export const removeFromCollection = mutation({
  args: {
    userId: v.string(),
    id: v.id('cardCollection'),
  },
  handler: async (ctx, { userId, id }) => {
    const oldDoc = await ctx.db.get(id);

    if (!oldDoc || oldDoc.userId !== userId) throw new Error('Collection card not found');

    if (oldDoc.quantity > 1) {
      await ctx.db.patch(id, { quantity: oldDoc.quantity - 1 });
    } else {
      await ctx.db.delete(id);
    }
  },
});

export const addToCollection = mutation({
  args: {
    userId: v.string(),
    cardId: v.number(),
  },
  handler: async (ctx, { userId, cardId }) => {
    const doc = await ctx.db
      .query('cardCollection')
      .withIndex('by_user_card', q => q.eq('userId', userId).eq('cardId', cardId))
      .first();

    if (doc && doc.quantity >= 3) throw new Error('Maximum quantity reached');

    if (doc) {
      await ctx.db.patch(doc._id, { quantity: doc.quantity + 1 });
    } else {
      await ctx.db.insert('cardCollection', { userId, cardId, quantity: 1 });
    }

    await updateLastAddedCard(ctx, userId, cardId);
  },
});

// Deprecated

export const getCollection = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const collection = await ctx.db
      .query('cardCollection')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .collect();

    // Convert to Record<CardId, number> format expected by the app
    const collectionRecord: Record<number, number> = {};
    for (const item of collection) {
      collectionRecord[item.cardId] = item.quantity;
    }

    return collectionRecord;
  },
});

export const getUserPreferences = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const prefs = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .first();

    return prefs ?? null;
  },
});

export const updatePreferences = mutation({
  args: {
    userId: v.string(),
    deckSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .first();

    const now = Date.now();
    const patch: Record<string, unknown> = { updatedAt: now };
    if (args.deckSize !== undefined) patch.deckSize = args.deckSize;

    if (existing) {
      await ctx.db.patch(existing._id, patch);
    } else {
      await ctx.db.insert('userPreferences', {
        userId: args.userId,
        ...patch,
        deckSize: args.deckSize,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Mutations
export const addCard = mutation({
  args: {
    userId: v.string(),
    cardId: v.number(),
  },
  handler: async (ctx, args) => {
    // Find existing collection entry
    const existing = await ctx.db
      .query('cardCollection')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .filter(q => q.eq(q.field('cardId'), args.cardId))
      .first();

    if (existing) {
      if (existing.quantity < 3) {
        // Update quantity
        await ctx.db.patch(existing._id, {
          quantity: existing.quantity + 1,
        });

        // Update last added card
        await updateLastAddedCard(ctx, args.userId, args.cardId);

        return { success: true, newQuantity: existing.quantity + 1 };
      } else {
        return { success: false, error: 'Maximum quantity reached' };
      }
    } else {
      // Create new collection entry
      await ctx.db.insert('cardCollection', {
        userId: args.userId,
        cardId: args.cardId,
        quantity: 1,
      });

      // Update last added card
      await updateLastAddedCard(ctx, args.userId, args.cardId);

      return { success: true, newQuantity: 1 };
    }
  },
});

export const removeCard = mutation({
  args: {
    userId: v.string(),
    cardId: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('cardCollection')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .filter(q => q.eq(q.field('cardId'), args.cardId))
      .first();

    if (!existing) {
      return { success: false, error: 'Card not found in collection' };
    }

    if (existing.quantity > 1) {
      // Decrease quantity
      await ctx.db.patch(existing._id, {
        quantity: existing.quantity - 1,
      });
      return { success: true, newQuantity: existing.quantity - 1 };
    } else {
      // Remove entirely
      await ctx.db.delete(existing._id);
      return { success: true, newQuantity: 0 };
    }
  },
});

// Helper function to update last added card
async function updateLastAddedCard(ctx: MutationCtx, userId: string, cardId: number) {
  const existing = await ctx.db
    .query('userPreferences')
    .withIndex('by_user', q => q.eq('userId', userId))
    .first();

  const now = Date.now();

  if (existing) {
    await ctx.db.patch(existing._id, {
      lastAddedCard: cardId,
      updatedAt: now,
    });
  } else {
    await ctx.db.insert('userPreferences', {
      userId,
      lastAddedCard: cardId,
      createdAt: now,
      updatedAt: now,
    });
  }
}

// Batch migration functions for robust data migration
export const batchMigrateCollection = mutation({
  args: {
    userId: v.string(),
    collectionData: v.array(
      v.object({
        cardId: v.number(),
        quantity: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const results = [];

    for (const item of args.collectionData) {
      try {
        // Check if card already exists
        const existing = await ctx.db
          .query('cardCollection')
          .withIndex('by_user_card', q => q.eq('userId', args.userId).eq('cardId', item.cardId))
          .first();

        if (existing) {
          // Update existing record with the migration quantity (replace, don't add)
          await ctx.db.patch(existing._id, {
            quantity: Math.min(item.quantity, 3), // Ensure max 3
          });
          results.push({ cardId: item.cardId, action: 'updated', quantity: Math.min(item.quantity, 3) });
        } else {
          // Create new record
          await ctx.db.insert('cardCollection', {
            userId: args.userId,
            cardId: item.cardId,
            quantity: Math.min(item.quantity, 3), // Ensure max 3
          });
          results.push({ cardId: item.cardId, action: 'created', quantity: Math.min(item.quantity, 3) });
        }
      } catch (error) {
        results.push({ cardId: item.cardId, action: 'error', error: String(error) });
      }
    }

    return { success: true, results };
  },
});

export const batchMigrateUserPreferences = mutation({
  args: {
    userId: v.string(),
    lastAddedCard: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing preferences
      await ctx.db.patch(existing._id, {
        lastAddedCard: args.lastAddedCard,
        updatedAt: now,
      });
      return { success: true, action: 'updated' };
    } else {
      // Create new preferences
      await ctx.db.insert('userPreferences', {
        userId: args.userId,
        lastAddedCard: args.lastAddedCard,
        createdAt: now,
        updatedAt: now,
      });
      return { success: true, action: 'created' };
    }
  },
});

// Check migration status - returns what data already exists
export const getMigrationStatus = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const collection = await ctx.db
      .query('cardCollection')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .collect();

    const deck = await ctx.db
      .query('deck')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .collect();

    const hand = await ctx.db
      .query('hand')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .collect();

    const preferences = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .first();

    return {
      hasCollection: collection.length > 0,
      hasDeck: deck.length > 0,
      hasHand: hand.length > 0,
      hasPreferences: preferences !== null,
      collectionCount: collection.length,
      deckCount: deck.length,
      handCount: hand.length,
    };
  },
});
