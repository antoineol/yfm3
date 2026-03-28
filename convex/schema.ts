import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { handSourceModeValidator, postDuelSuggestionValidator } from './userModSettings';

export default defineSchema({
  // User's owned cards - total copies owned regardless of deck assignment.
  ownedCards: defineTable({
    userId: v.string(), // Stable auth identity from Clerk via Convex
    cardId: v.number(), // CardId from the game
    quantity: v.number(), // Number of copies owned (bridge sync may exceed 3)
    mod: v.string(), // Game mod identifier (e.g. "rp", "vanilla")
  })
    .index('by_user', ['userId'])
    .index('by_user_card', ['userId', 'cardId'])
    .index('by_user_mod', ['userId', 'mod'])
    .index('by_user_mod_card', ['userId', 'mod', 'cardId']),

  // User's deck - ordered list of card copies using fractional indexing
  deck: defineTable({
    userId: v.string(),
    cardId: v.number(),
    copyId: v.optional(v.string()),
    order: v.optional(v.number()), // Fractional order (0-1) for efficient reordering
    mod: v.string(),
  })
    .index('by_user', ['userId'])
    .index('by_user_order', ['userId', 'order'])
    .index('by_user_mod', ['userId', 'mod'])
    .index('by_user_mod_order', ['userId', 'mod', 'order']),

  // User's hand for fusion calculator - max 5 cards using fractional indexing
  hand: defineTable({
    userId: v.string(),
    cardId: v.number(),
    copyId: v.optional(v.string()),
    order: v.optional(v.number()), // Fractional order (0-1) for efficient reordering
    mod: v.string(),
  })
    .index('by_user', ['userId'])
    .index('by_user_mod', ['userId', 'mod']),

  // Per-mod user settings (deck config, optimization state)
  userModSettings: defineTable({
    userId: v.string(),
    lastAddedCard: v.optional(v.number()), // CardId of last added card for UI hints
    deckSize: v.optional(v.number()), // Optimizer deck size (default 40)
    fusionDepth: v.optional(v.number()), // Max fusion chain depth (default 3)
    useEquipment: v.optional(v.boolean()), // Consider equip boosts (+500/+1000) in deck optimization
    postDuelSuggestion: v.optional(postDuelSuggestionValidator), // Persisted post-duel optimization result
    mod: v.string(),
    createdAt: v.number(), // Timestamp
    updatedAt: v.number(), // Timestamp
  })
    .index('by_user', ['userId'])
    .index('by_user_mod', ['userId', 'mod']),

  // Global user settings (not per-mod)
  userSettings: defineTable({
    userId: v.string(),
    selectedMod: v.string(), // Currently active mod (e.g. "rp", "vanilla")
    bridgeAutoSync: v.optional(v.boolean()), // Auto-sync collection/deck from emulator bridge
    handSourceMode: v.optional(handSourceModeValidator),
    cheatMode: v.optional(v.boolean()), // Millennium Eye: reveal opponent's cards
    cheatView: v.optional(v.union(v.literal("player"), v.literal("opponent"))),
    cpuSwaps: v.optional(v.array(v.object({
      slotIndex: v.number(),
      fromCardId: v.number(),
      toCardId: v.number(),
      timestamp: v.number(),
    }))),
  }).index('by_user', ['userId']),
});
