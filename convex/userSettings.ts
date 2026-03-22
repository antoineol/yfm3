import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth } from "./authHelper";

const DEFAULT_MOD = "rp";

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
