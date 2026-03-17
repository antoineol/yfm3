import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { handSourceModeValidator } from './userPreferences';

export const referenceCardFields = {
  cardId: v.number(),
  name: v.string(),
  attack: v.number(),
  defense: v.number(),
  kind1: v.optional(v.string()),
  kind2: v.optional(v.string()),
  kind3: v.optional(v.string()),
  color: v.optional(v.string()),
};

export const referenceFusionFields = {
  fusionId: v.number(),
  materialA: v.string(),
  materialB: v.string(),
  resultName: v.string(),
  resultAttack: v.number(),
  resultDefense: v.number(),
};

export default defineSchema({
  // User's owned cards - total copies owned regardless of deck assignment.
  ownedCards: defineTable({
    userId: v.string(), // Stable auth identity from Clerk via Convex
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


  // Shared reference data imported from Google Sheets.
  referenceCards: defineTable({ ...referenceCardFields, importedAt: v.number() })
    .index('by_cardId', ['cardId']),
  referenceFusions: defineTable({ ...referenceFusionFields, importedAt: v.number() })
    .index('by_fusionId', ['fusionId'])
    .index('by_materials', ['materialA', 'materialB']),
  userPreferences: defineTable({
    userId: v.string(),
    lastAddedCard: v.optional(v.number()), // CardId of last added card for UI hints
    deckSize: v.optional(v.number()), // Optimizer deck size (default 40)
    fusionDepth: v.optional(v.number()), // Max fusion chain depth (default 3)
    handSourceMode: v.optional(handSourceModeValidator),
    createdAt: v.number(), // Timestamp
    updatedAt: v.number(), // Timestamp
  }).index('by_user', ['userId']),
});
