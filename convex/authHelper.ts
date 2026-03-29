import { v } from 'convex/values';
import type { MutationCtx, QueryCtx } from './_generated/server';

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const authArgs = { anonymousId: v.optional(v.string()) };

export async function resolveUserId(
  ctx: QueryCtx | MutationCtx,
  anonymousId?: string,
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity?.tokenIdentifier) return identity.tokenIdentifier;

  if (anonymousId) {
    if (!UUID_V4_RE.test(anonymousId)) throw new Error('Invalid anonymous ID format');
    return `anon:${anonymousId}`;
  }

  throw new Error('Not authenticated');
}
