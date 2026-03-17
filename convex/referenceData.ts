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

// --- Single-row CRUD mutations (called by referenceDataCrud actions) ---

export const insertCard = internalMutation({
  args: referenceCardFields,
  handler: async (ctx, args) => {
    await ctx.db.insert("referenceCards", { ...args, importedAt: Date.now() });
  },
});

export const patchCard = internalMutation({
  args: referenceCardFields,
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("referenceCards")
      .withIndex("by_cardId", (q) => q.eq("cardId", args.cardId))
      .unique();
    if (!doc) throw new Error(`Card ${args.cardId} not found in Convex`);
    await ctx.db.patch(doc._id, { ...args, importedAt: Date.now() });
  },
});

export const deleteCard = internalMutation({
  args: { cardId: v.number() },
  handler: async (ctx, { cardId }) => {
    const doc = await ctx.db
      .query("referenceCards")
      .withIndex("by_cardId", (q) => q.eq("cardId", cardId))
      .unique();
    if (!doc) throw new Error(`Card ${cardId} not found in Convex`);
    await ctx.db.delete(doc._id);
  },
});

export const insertFusion = internalMutation({
  args: referenceFusionFields,
  handler: async (ctx, args) => {
    await ctx.db.insert("referenceFusions", { ...args, importedAt: Date.now() });
  },
});

export const patchFusion = internalMutation({
  args: {
    ...referenceFusionFields,
    originalMaterialA: v.string(),
    originalMaterialB: v.string(),
  },
  handler: async (ctx, { originalMaterialA, originalMaterialB, ...fields }) => {
    const doc = await ctx.db
      .query("referenceFusions")
      .withIndex("by_materials", (q) =>
        q.eq("materialA", originalMaterialA).eq("materialB", originalMaterialB),
      )
      .unique();
    if (!doc) throw new Error(`Fusion ${originalMaterialA} + ${originalMaterialB} not found`);
    await ctx.db.patch(doc._id, { ...fields, importedAt: Date.now() });
  },
});

export const deleteFusion = internalMutation({
  args: { materialA: v.string(), materialB: v.string() },
  handler: async (ctx, { materialA, materialB }) => {
    const doc = await ctx.db
      .query("referenceFusions")
      .withIndex("by_materials", (q) => q.eq("materialA", materialA).eq("materialB", materialB))
      .unique();
    if (!doc) throw new Error(`Fusion ${materialA} + ${materialB} not found`);
    await ctx.db.delete(doc._id);
  },
});
