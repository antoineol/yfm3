import { v, type Infer } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth } from "./authHelper";

export const handSourceModeValidator = v.union(v.literal("all"), v.literal("deck"));

export type HandSourceMode = Infer<typeof handSourceModeValidator>;

export const getUserPreferences = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return prefs ?? null;
  },
});

export const getLastAddedCard = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const userPrefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!userPrefs?.lastAddedCard) {
      return null;
    }

    return await ctx.db
      .query("ownedCards")
      .withIndex("by_user_card", (q) =>
        q.eq("userId", userId).eq("cardId", userPrefs.lastAddedCard as number),
      )
      .first();
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
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const now = Date.now();
    const patch: Record<string, unknown> = { updatedAt: now };
    if (args.deckSize !== undefined) patch.deckSize = args.deckSize;
    if (args.fusionDepth !== undefined) patch.fusionDepth = args.fusionDepth;
    if (args.handSourceMode !== undefined) patch.handSourceMode = args.handSourceMode;

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return;
    }

    await ctx.db.insert("userPreferences", {
      userId,
      ...patch,
      deckSize: args.deckSize,
      fusionDepth: args.fusionDepth,
      handSourceMode: args.handSourceMode,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const clearLastAddedCard = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (prefs) {
      await ctx.db.patch(prefs._id, { lastAddedCard: undefined });
    }
  },
});

export const batchMigrateUserPreferences = mutation({
  args: {
    lastAddedCard: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastAddedCard: args.lastAddedCard,
        updatedAt: now,
      });
      return { success: true, action: "updated" };
    }

    await ctx.db.insert("userPreferences", {
      userId,
      lastAddedCard: args.lastAddedCard,
      createdAt: now,
      updatedAt: now,
    });
    return { success: true, action: "created" };
  },
});
