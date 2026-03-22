import type { MutationCtx, QueryCtx } from "./_generated/server";

const DEFAULT_MOD = "rp";

/** Read the user's currently selected mod. Falls back to "rp". */
export async function getUserMod(ctx: QueryCtx | MutationCtx, userId: string): Promise<string> {
  const settings = await ctx.db
    .query("userSettings")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
  return settings?.selectedMod ?? DEFAULT_MOD;
}
