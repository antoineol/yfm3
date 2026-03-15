import type { MutationCtx, QueryCtx } from './_generated/server';

export async function requireAuth(ctx: QueryCtx | MutationCtx): Promise<string> {
  const userId = (await ctx.auth.getUserIdentity())?.tokenIdentifier;
  if (!userId) throw new Error('Not authenticated');
  return userId;
}
