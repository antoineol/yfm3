import { v, type Infer } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authArgs, resolveUserId } from "./authHelper";
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

export const getUserModSettings = query({
  args: { ...authArgs },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.anonymousId);
    const mod = await getUserMod(ctx, userId);
    const prefs = await ctx.db
      .query("userModSettings")
      .withIndex("by_user_mod", (q) => q.eq("userId", userId).eq("mod", mod))
      .first();

    return prefs ?? null;
  },
});

export const getLastAddedCard = query({
  args: { ...authArgs },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.anonymousId);
    const mod = await getUserMod(ctx, userId);
    const settings = await ctx.db
      .query("userModSettings")
      .withIndex("by_user_mod", (q) => q.eq("userId", userId).eq("mod", mod))
      .first();

    if (!settings?.lastAddedCard) {
      return null;
    }

    return await ctx.db
      .query("ownedCards")
      .withIndex("by_user_mod_card", (q) =>
        q.eq("userId", userId).eq("mod", mod).eq("cardId", settings.lastAddedCard as number),
      )
      .first();
  },
});

export const updateModSettings = mutation({
  args: {
    ...authArgs,
    deckSize: v.optional(v.number()),
    fusionDepth: v.optional(v.number()),
    useEquipment: v.optional(v.boolean()),
    postDuelSuggestion: v.optional(v.union(postDuelSuggestionValidator, v.null())),
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.anonymousId);
    const mod = await getUserMod(ctx, userId);
    const existing = await ctx.db
      .query("userModSettings")
      .withIndex("by_user_mod", (q) => q.eq("userId", userId).eq("mod", mod))
      .first();

    const now = Date.now();
    const patch: Record<string, unknown> = { updatedAt: now };
    if (args.deckSize !== undefined) patch.deckSize = args.deckSize;
    if (args.fusionDepth !== undefined) patch.fusionDepth = args.fusionDepth;
    if (args.useEquipment !== undefined) patch.useEquipment = args.useEquipment;
    if (args.postDuelSuggestion !== undefined) {
      patch.postDuelSuggestion = args.postDuelSuggestion === null ? undefined : args.postDuelSuggestion;
    }

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return;
    }

    await ctx.db.insert("userModSettings", {
      userId,
      ...patch,
      mod,
      deckSize: args.deckSize,
      fusionDepth: args.fusionDepth,
      useEquipment: args.useEquipment,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const clearLastAddedCard = mutation({
  args: { ...authArgs },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.anonymousId);
    const mod = await getUserMod(ctx, userId);
    const prefs = await ctx.db
      .query("userModSettings")
      .withIndex("by_user_mod", (q) => q.eq("userId", userId).eq("mod", mod))
      .first();

    if (prefs) {
      await ctx.db.patch(prefs._id, { lastAddedCard: undefined });
    }
  },
});

export const batchMigrateUserModSettings = mutation({
  args: {
    ...authArgs,
    lastAddedCard: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.anonymousId);
    const mod = await getUserMod(ctx, userId);
    const existing = await ctx.db
      .query("userModSettings")
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

    await ctx.db.insert("userModSettings", {
      userId,
      lastAddedCard: args.lastAddedCard,
      mod,
      createdAt: now,
      updatedAt: now,
    });
    return { success: true, action: "created" };
  },
});
