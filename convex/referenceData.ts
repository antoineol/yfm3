import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { referenceCardFields, referenceFusionFields } from "./schema";

export const getReferenceData = query({
  args: {},
  handler: async (ctx) => {
    const [cards, fusions] = await Promise.all([
      ctx.db.query("referenceCards").collect(),
      ctx.db.query("referenceFusions").collect(),
    ]);
    return { cards, fusions, importedAt: cards[0]?.importedAt ?? null };
  },
});

export const getLastImportedAt = internalQuery({
  args: {},
  handler: async (ctx): Promise<number | null> => {
    const card = await ctx.db.query("referenceCards").first();
    return card?.importedAt ?? null;
  },
});

export const replaceReferenceData = internalMutation({
  args: {
    cards: v.array(v.object(referenceCardFields)),
    fusions: v.array(v.object(referenceFusionFields)),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    // Convex mutations are transactional — delete-then-insert is safe.
    for (const c of await ctx.db.query("referenceCards").collect()) await ctx.db.delete(c._id);
    for (const f of await ctx.db.query("referenceFusions").collect()) await ctx.db.delete(f._id);
    for (const c of args.cards) await ctx.db.insert("referenceCards", { ...c, importedAt: now });
    for (const f of args.fusions) await ctx.db.insert("referenceFusions", { ...f, importedAt: now });
    return { importedAt: now };
  },
});
