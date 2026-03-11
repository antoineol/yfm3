import { v } from 'convex/values';
import { mutation, type MutationCtx, query } from './_generated/server';
import { requireAuth } from './authHelper';
import { handSourceModeValidator } from './userPreferences';

export const getCollectionIndexedByCardId = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const collection = await ctx.db
      .query('cardCollection')
      .withIndex('by_user', q => q.eq('userId', userId))
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
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const collection = await ctx.db
      .query('cardCollection')
      .withIndex('by_user', q => q.eq('userId', userId))
      .collect();

    // Filter collection: remove cards that are in the deck
    const deckCards = await ctx.db
      .query('deck')
      .withIndex('by_user', q => q.eq('userId', userId))
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
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const collection = await ctx.db
      .query('cardCollection')
      .withIndex('by_user', q => q.eq('userId', userId))
      .collect();
    const cardIds = collection.map(item => item.cardId);
    const uniqueCardIds = [...new Set(cardIds)];
    return uniqueCardIds.sort((a, b) => a - b);
  },
});

export const getLastAddedCard = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const userPrefs = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', q => q.eq('userId', userId))
      .first();

    if (!userPrefs?.lastAddedCard) return null;

    return await ctx.db
      .query('cardCollection')
      .withIndex('by_user_card', q => q.eq('userId', userId).eq('cardId', userPrefs.lastAddedCard!))
      .first();
  },
});

export const removeFromCollection = mutation({
  args: {
    id: v.id('cardCollection'),
  },
  handler: async (ctx, { id }) => {
    const userId = await requireAuth(ctx);
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
    cardId: v.number(),
  },
  handler: async (ctx, { cardId }) => {
    const userId = await requireAuth(ctx);
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
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const collection = await ctx.db
      .query('cardCollection')
      .withIndex('by_user', q => q.eq('userId', userId))
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
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const prefs = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', q => q.eq('userId', userId))
      .first();

    return prefs ?? null;
  },
});

export const updatePreferences = mutation({
  args: {
    deckSize: v.optional(v.number()),
    fusionDepth: v.optional(v.number()),
    handSourceMode: v.optional(handSourceModeValidator),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const existing = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', q => q.eq('userId', userId))
      .first();

    const now = Date.now();
    const patch: Record<string, unknown> = { updatedAt: now };
    if (args.deckSize !== undefined) patch.deckSize = args.deckSize;
    if (args.fusionDepth !== undefined) patch.fusionDepth = args.fusionDepth;
    if (args.handSourceMode !== undefined) patch.handSourceMode = args.handSourceMode;

    if (existing) {
      await ctx.db.patch(existing._id, patch);
    } else {
      await ctx.db.insert('userPreferences', {
        userId,
        ...patch,
        deckSize: args.deckSize,
        fusionDepth: args.fusionDepth,
        handSourceMode: args.handSourceMode,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Mutations
export const addCard = mutation({
  args: {
    cardId: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    // Find existing collection entry
    const existing = await ctx.db
      .query('cardCollection')
      .withIndex('by_user', q => q.eq('userId', userId))
      .filter(q => q.eq(q.field('cardId'), args.cardId))
      .first();

    if (existing) {
      if (existing.quantity < 3) {
        // Update quantity
        await ctx.db.patch(existing._id, {
          quantity: existing.quantity + 1,
        });

        // Update last added card
        await updateLastAddedCard(ctx, userId, args.cardId);

        return { success: true, newQuantity: existing.quantity + 1 };
      } else {
        return { success: false, error: 'Maximum quantity reached' };
      }
    } else {
      // Create new collection entry
      await ctx.db.insert('cardCollection', {
        userId,
        cardId: args.cardId,
        quantity: 1,
      });

      // Update last added card
      await updateLastAddedCard(ctx, userId, args.cardId);

      return { success: true, newQuantity: 1 };
    }
  },
});

export const removeCard = mutation({
  args: {
    cardId: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const existing = await ctx.db
      .query('cardCollection')
      .withIndex('by_user', q => q.eq('userId', userId))
      .filter(q => q.eq(q.field('cardId'), args.cardId))
      .first();

    if (!existing) {
      return { success: false, error: 'Card not found in collection' };
    }

    // Prevent removing a copy that is committed to the deck
    const deckCopies = await ctx.db
      .query('deck')
      .withIndex('by_user', q => q.eq('userId', userId))
      .filter(q => q.eq(q.field('cardId'), args.cardId))
      .collect();
    if (existing.quantity <= deckCopies.length) {
      return { success: false, error: 'Cannot remove card that is in the deck' };
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

export const clearLastAddedCard = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const prefs = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', q => q.eq('userId', userId))
      .first();
    if (prefs) {
      await ctx.db.patch(prefs._id, { lastAddedCard: undefined });
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
    collectionData: v.array(
      v.object({
        cardId: v.number(),
        quantity: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const results = [];

    for (const item of args.collectionData) {
      try {
        // Check if card already exists
        const existing = await ctx.db
          .query('cardCollection')
          .withIndex('by_user_card', q => q.eq('userId', userId).eq('cardId', item.cardId))
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
            userId,
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
    lastAddedCard: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const existing = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', q => q.eq('userId', userId))
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
        userId,
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
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const collection = await ctx.db
      .query('cardCollection')
      .withIndex('by_user', q => q.eq('userId', userId))
      .collect();

    const deck = await ctx.db
      .query('deck')
      .withIndex('by_user', q => q.eq('userId', userId))
      .collect();

    const hand = await ctx.db
      .query('hand')
      .withIndex('by_user', q => q.eq('userId', userId))
      .collect();

    const preferences = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', q => q.eq('userId', userId))
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
