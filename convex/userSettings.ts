import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth } from "./authHelper";
import { handSourceModeValidator } from "./userModSettings";

const DEFAULT_MOD = "vanilla";

export const getSelectedMod = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    return settings?.selectedMod ?? DEFAULT_MOD;
  },
});

export const getUserSettings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    return await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const setSelectedMod = mutation({
  args: { selectedMod: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { selectedMod: args.selectedMod });
    } else {
      await ctx.db.insert("userSettings", { userId, selectedMod: args.selectedMod });
    }
  },
});

const cheatViewValidator = v.union(v.literal("player"), v.literal("opponent"));

const cpuSwapValidator = v.object({
  slotIndex: v.number(),
  fromCardId: v.number(),
  toCardId: v.number(),
  timestamp: v.number(),
});

export const updateUserSettings = mutation({
  args: {
    // null means "unset" (reset to undefined / never-chosen state)
    bridgeAutoSync: v.optional(v.union(v.boolean(), v.null())),
    handSourceMode: v.optional(handSourceModeValidator),
    cheatMode: v.optional(v.boolean()),
    cheatView: v.optional(cheatViewValidator),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // null means "unset the field" — rebuild the doc without it
    if (args.bridgeAutoSync === null && existing) {
      const { _id, _creationTime, bridgeAutoSync: _, ...rest } = existing;
      if (args.handSourceMode !== undefined) rest.handSourceMode = args.handSourceMode;
      if (args.cheatMode !== undefined) rest.cheatMode = args.cheatMode;
      if (args.cheatView !== undefined) rest.cheatView = args.cheatView;
      await ctx.db.replace(_id, rest);
      return;
    }

    const patch: Record<string, unknown> = {};
    if (args.bridgeAutoSync !== undefined) patch.bridgeAutoSync = args.bridgeAutoSync;
    if (args.handSourceMode !== undefined) patch.handSourceMode = args.handSourceMode;
    if (args.cheatMode !== undefined) patch.cheatMode = args.cheatMode;
    if (args.cheatView !== undefined) patch.cheatView = args.cheatView;

    if (existing) {
      await ctx.db.patch(existing._id, patch);
    } else {
      await ctx.db.insert("userSettings", { userId, selectedMod: DEFAULT_MOD, ...patch });
    }
  },
});

export const appendCpuSwaps = mutation({
  args: { swaps: v.array(cpuSwapValidator) },
  handler: async (ctx, args) => {
    if (args.swaps.length === 0) return;
    const userId = await requireAuth(ctx);
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!settings) return;
    const existing = settings.cpuSwaps ?? [];
    await ctx.db.patch(settings._id, { cpuSwaps: [...existing, ...args.swaps] });
  },
});

export const clearCpuSwaps = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!settings || !settings.cpuSwaps?.length) return;
    await ctx.db.patch(settings._id, { cpuSwaps: [] });
  },
});
