import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { deckAggregate } from "./deckAggregate";

/**
 * Diff-based sync for ownedCards.
 * Compares existing DB rows with the target map and only patches/inserts/deletes
 * what actually changed, minimising writes and subscription invalidations.
 */
export async function applyOwnedCardsDiff(
  ctx: MutationCtx,
  userId: string,
  mod: string,
  target: Map<number, number>,
): Promise<{ patched: number; inserted: number; deleted: number }> {
  const existing = await ctx.db
    .query("ownedCards")
    .withIndex("by_user_mod", (q) => q.eq("userId", userId).eq("mod", mod))
    .collect();

  const existingByCard = new Map<number, { _id: Id<"ownedCards">; quantity: number }>();
  for (const row of existing) {
    existingByCard.set(row.cardId, { _id: row._id, quantity: row.quantity });
  }

  let patched = 0;
  let inserted = 0;
  let deleted = 0;

  // Upsert: patch if quantity differs, insert if new
  for (const [cardId, quantity] of target) {
    const row = existingByCard.get(cardId);
    if (row) {
      if (row.quantity !== quantity) {
        await ctx.db.patch(row._id, { quantity });
        patched++;
      }
      existingByCard.delete(cardId);
    } else {
      await ctx.db.insert("ownedCards", { userId, cardId, quantity, mod });
      inserted++;
    }
  }

  // Delete rows no longer in target
  for (const [, row] of existingByCard) {
    await ctx.db.delete(row._id);
    deleted++;
  }

  return { patched, inserted, deleted };
}

/**
 * Diff-based sync for deck rows.
 * Groups existing rows by cardId and only inserts/deletes the difference.
 */
export async function applyDeckDiff(
  ctx: MutationCtx,
  userId: string,
  mod: string,
  targetCardIds: number[],
): Promise<{ kept: number; inserted: number; deleted: number }> {
  const existing = await ctx.db
    .query("deck")
    .withIndex("by_user_mod", (q) => q.eq("userId", userId).eq("mod", mod))
    .collect();

  // Group existing rows by cardId
  const existingByCard = new Map<number, Doc<"deck">[]>();
  for (const row of existing) {
    const arr = existingByCard.get(row.cardId);
    if (arr) arr.push(row);
    else existingByCard.set(row.cardId, [row]);
  }

  // Count target copies per cardId
  const targetCounts = new Map<number, number>();
  for (const cardId of targetCardIds) {
    targetCounts.set(cardId, (targetCounts.get(cardId) ?? 0) + 1);
  }

  let kept = 0;
  let inserted = 0;
  let deleted = 0;

  // For each target cardId: keep what we can, delete excess, insert deficit
  for (const [cardId, wantCount] of targetCounts) {
    const rows = existingByCard.get(cardId) ?? [];
    existingByCard.delete(cardId);
    const haveCount = rows.length;

    if (haveCount === wantCount) {
      kept += haveCount;
    } else if (haveCount > wantCount) {
      kept += wantCount;
      for (let i = wantCount; i < haveCount; i++) {
        const row = rows[i]!;
        await ctx.db.delete(row._id);
        await deckAggregate.delete(ctx, row);
        deleted++;
      }
    } else {
      kept += haveCount;
      for (let i = haveCount; i < wantCount; i++) {
        const id = await ctx.db.insert("deck", { userId, cardId, mod });
        const doc = await ctx.db.get(id);
        if (doc) await deckAggregate.insert(ctx, doc);
        inserted++;
      }
    }
  }

  // Delete rows for cardIds no longer in target
  for (const [, rows] of existingByCard) {
    for (const row of rows) {
      await ctx.db.delete(row._id);
      await deckAggregate.delete(ctx, row);
      deleted++;
    }
  }

  return { kept, inserted, deleted };
}
