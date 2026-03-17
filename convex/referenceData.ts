import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const getReferenceData = query({
  args: {},
  handler: async (ctx) => {
    const [cards, fusions] = await Promise.all([
      ctx.db.query("referenceCards").collect(),
      ctx.db.query("referenceFusions").collect(),
    ]);
    return {
      cards,
      fusions,
      importedAt: cards[0]?.importedAt ?? null,
    };
  },
});

export const replaceReferenceData = internalMutation({
  args: {
    cards: v.array(
      v.object({
        cardId: v.number(),
        name: v.string(),
        attack: v.number(),
        defense: v.number(),
        kind1: v.optional(v.string()),
        kind2: v.optional(v.string()),
        kind3: v.optional(v.string()),
        color: v.optional(v.string()),
      }),
    ),
    fusions: v.array(
      v.object({
        materialA: v.string(),
        materialB: v.string(),
        resultName: v.string(),
        resultAttack: v.number(),
        resultDefense: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    for (const card of await ctx.db.query("referenceCards").collect()) {
      await ctx.db.delete(card._id);
    }
    for (const fusion of await ctx.db.query("referenceFusions").collect()) {
      await ctx.db.delete(fusion._id);
    }

    for (const card of args.cards) {
      await ctx.db.insert("referenceCards", { ...card, importedAt: now });
    }
    for (const fusion of args.fusions) {
      await ctx.db.insert("referenceFusions", { ...fusion, importedAt: now });
    }

    await ctx.db.insert("referenceImports", {
      importedAt: now,
      cardsCount: args.cards.length,
      fusionsCount: args.fusions.length,
    });

    return { importedAt: now };
  },
});
