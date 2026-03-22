import { v, type Infer } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth } from "./authHelper";
import { getUserMod } from "./modHelper";

export const handSourceModeValidator = v.union(v.literal("all"), v.literal("deck"));

export type HandSourceMode = Infer<typeof handSourceModeValidator>;

export const postDuelSuggestionValidator = v.object({
  deck: v.array(v.number()),
  expectedAtk: v.number(),
  currentDeckScore: v.union(v.number(), v.null()),
  improvement: v.union(v.number(), v.null()),
  elapsedMs: v.number(),
  currentDeck: v.array(v.number()),
});

export const getUserPreferences = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const mod = await getUserMod(ctx, userId);
    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user_mod", (q) => q.eq("userId", userId).eq("mod", mod))
      .first();

    return prefs ?? null;
  },
});

export const getLastAddedCard = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const mod = await getUserMod(ctx, userId);
    const userPrefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user_mod", (q) => q.eq("userId", userId).eq("mod", mod))
      .first();

    if (!userPrefs?.lastAddedCard) {
      return null;
    }

    return await ctx.db
      .query("ownedCards")
      .withIndex("by_user_mod_card", (q) =>
        q.eq("userId", userId).eq("mod", mod).eq("cardId", userPrefs.lastAddedCard as number),
      )
      .first();
  },
});

export const updatePreferences = mutation({
  args: {
    deckSize: v.optional(v.number()),
    fusionDepth: v.optional(v.number()),
    handSourceMode: v.optional(handSourceModeValidator),
    bridgeAutoSync: v.optional(v.boolean()),
    useEquipment: v.optional(v.boolean()),
    postDuelSuggestion: v.optional(v.union(postDuelSuggestionValidator, v.null())),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const mod = await getUserMod(ctx, userId);
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user_mod", (q) => q.eq("userId", userId).eq("mod", mod))
      .first();

    const now = Date.now();
    const patch: Record<string, unknown> = { updatedAt: now };
    if (args.deckSize !== undefined) patch.deckSize = args.deckSize;
    if (args.fusionDepth !== undefined) patch.fusionDepth = args.fusionDepth;
    if (args.handSourceMode !== undefined) patch.handSourceMode = args.handSourceMode;
    if (args.bridgeAutoSync !== undefined) patch.bridgeAutoSync = args.bridgeAutoSync;
    if (args.useEquipment !== undefined) patch.useEquipment = args.useEquipment;
    if (args.postDuelSuggestion !== undefined) {
      // null = clear the field, object = set it
      patch.postDuelSuggestion = args.postDuelSuggestion === null ? undefined : args.postDuelSuggestion;
    }

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return;
    }

    await ctx.db.insert("userPreferences", {
      userId,
      ...patch,
      mod,
      deckSize: args.deckSize,
      fusionDepth: args.fusionDepth,
      handSourceMode: args.handSourceMode,
      bridgeAutoSync: args.bridgeAutoSync,
      useEquipment: args.useEquipment,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const clearLastAddedCard = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const mod = await getUserMod(ctx, userId);
    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user_mod", (q) => q.eq("userId", userId).eq("mod", mod))
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
    const mod = await getUserMod(ctx, userId);
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user_mod", (q) => q.eq("userId", userId).eq("mod", mod))
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
      mod,
      createdAt: now,
      updatedAt: now,
    });
    return { success: true, action: "created" };
  },
});
