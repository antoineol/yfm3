import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

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

type CardRow = {
  cardId: number; name: string; attack: number; defense: number;
  kind1?: string; kind2?: string; kind3?: string; color?: string;
};
type FusionRow = {
  materialA: string; materialB: string; resultName: string;
  resultAttack: number; resultDefense: number;
};

export const replaceReferenceData = internalMutation({
  // Schema validates individual fields on insert; typed locally via CardRow/FusionRow.
  args: { cards: v.any(), fusions: v.any() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const cards = args.cards as CardRow[];
    const fusions = args.fusions as FusionRow[];

    // Convex mutations are transactional — delete-then-insert is safe.
    for (const c of await ctx.db.query("referenceCards").collect()) await ctx.db.delete(c._id);
    for (const f of await ctx.db.query("referenceFusions").collect()) await ctx.db.delete(f._id);
    for (const c of cards) await ctx.db.insert("referenceCards", { ...c, importedAt: now });
    for (const f of fusions) await ctx.db.insert("referenceFusions", { ...f, importedAt: now });
    return { importedAt: now };
  },
});
