import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  ...authTables,

  // User's card collection - tracks owned cards and their quantities
  cardCollection: defineTable({
    userId: v.string(), // User identifier (could be session ID or auth user ID)
    cardId: v.number(), // CardId from the game
    quantity: v.number(), // Number of copies owned (max 3)
  })
    .index('by_user', ['userId'])
    .index('by_user_card', ['userId', 'cardId']),

  // User's deck - ordered list of card copies using fractional indexing
  deck: defineTable({
    userId: v.string(),
    cardId: v.number(),
    copyId: v.optional(v.string()),
    order: v.optional(v.number()), // Fractional order (0-1) for efficient reordering
  })
    .index('by_user', ['userId'])
    .index('by_user_order', ['userId', 'order']),

  // User's hand for fusion calculator - max 5 cards using fractional indexing
  hand: defineTable({
    userId: v.string(),
    cardId: v.number(),
    copyId: v.optional(v.string()),
    order: v.optional(v.number()), // Fractional order (0-1) for efficient reordering
  }).index('by_user', ['userId']),

  // User metadata and preferences
  userPreferences: defineTable({
    userId: v.string(),
    lastAddedCard: v.optional(v.number()), // CardId of last added card for UI hints
    deckSize: v.optional(v.number()), // Optimizer deck size (default 40)
    fusionDepth: v.optional(v.number()), // Max fusion chain depth (default 3)
    createdAt: v.number(), // Timestamp
    updatedAt: v.number(), // Timestamp
  }).index('by_user', ['userId']),
});
