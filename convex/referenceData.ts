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

export const getMaxFusionId = internalQuery({
  args: {},
  handler: async (ctx): Promise<number> => {
    const fusions = await ctx.db.query("referenceFusions").collect();
    return fusions.reduce((max, f) => Math.max(max, f.fusionId), 0);
  },
});

export const insertFusion = internalMutation({
  args: referenceFusionFields,
  handler: async (ctx, args) => {
    await ctx.db.insert("referenceFusions", { ...args, importedAt: Date.now() });
  },
});

export const patchFusion = internalMutation({
  args: referenceFusionFields,
  handler: async (ctx, fields) => {
    const doc = await ctx.db
      .query("referenceFusions")
      .withIndex("by_fusionId", (q) => q.eq("fusionId", fields.fusionId))
      .unique();
    if (!doc) throw new Error(`Fusion ${fields.fusionId} not found in Convex`);
    await ctx.db.patch(doc._id, { ...fields, importedAt: Date.now() });
  },
});

export const deleteFusion = internalMutation({
  args: { fusionId: v.number() },
  handler: async (ctx, { fusionId }) => {
    const doc = await ctx.db
      .query("referenceFusions")
      .withIndex("by_fusionId", (q) => q.eq("fusionId", fusionId))
      .unique();
    if (!doc) throw new Error(`Fusion ${fusionId} not found in Convex`);
    await ctx.db.delete(doc._id);
  },
});
