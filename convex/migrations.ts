import { Migrations } from "@convex-dev/migrations";
import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { mutation } from "./_generated/server";
import { deckAggregate } from "./deckAggregate";

const migrations = new Migrations<DataModel>(components.migrations);

/** CLI runner: `npx convex run migrations:run` */
export const run = migrations.runner();

/** Run all pending migrations in order: `npx convex run migrations:runAll` */
export const runAll = migrations.runner([
  internal.migrations.backfillModOnOwnedCards,
  internal.migrations.backfillModOnDeck,
  internal.migrations.backfillModOnHand,
  internal.migrations.backfillModOnUserModSettings,
  internal.migrations.ensureUserSettings,
]);

// ── Backfill mod field ──────────────────────────────────────────────

export const backfillModOnOwnedCards = migrations.define({
  table: "ownedCards",
  migrateOne: (_ctx, doc) => {
    if (doc.mod === undefined) return { mod: "rp" };
  },
});

export const backfillModOnDeck = migrations.define({
  table: "deck",
  migrateOne: async (ctx, doc) => {
    if (doc.mod === undefined) {
      await ctx.db.patch(doc._id, { mod: "rp" });
      const patched = await ctx.db.get(doc._id);
      if (patched) {
        try {
          await deckAggregate.insertIfDoesNotExist(ctx, patched);
        } catch {
          // Already in aggregate
        }
      }
    }
  },
});

export const backfillModOnHand = migrations.define({
  table: "hand",
  migrateOne: (_ctx, doc) => {
    if (doc.mod === undefined) return { mod: "rp" };
  },
});

export const backfillModOnUserModSettings = migrations.define({
  table: "userModSettings",
  migrateOne: (_ctx, doc) => {
    if (doc.mod === undefined) return { mod: "rp" };
  },
});

// ── Create userSettings rows ────────────────────────────────────────

export const ensureUserSettings = migrations.define({
  table: "userModSettings",
  migrateOne: async (ctx, doc) => {
    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", doc.userId))
      .first();
    if (!existing) {
      await ctx.db.insert("userSettings", { userId: doc.userId, selectedMod: "rp" });
    }
  },
});

// ── Rename: copy userPreferences → userModSettings ──────────────────
// Plain mutation (not using migrations component) because the old table
// is no longer in the schema and the component can't iterate it.
// Run once after deploying: `npx convex run migrations:migrateUserPreferencesTable`

export const migrateUserPreferencesTable = mutation({
  args: {},
  handler: async (ctx) => {
    // Read all rows from the old unschema'd table
    const oldRows = await (ctx.db as never as { query: (t: string) => { collect: () => Promise<Record<string, unknown>[]> } })
      .query("userPreferences")
      .collect();

    let migrated = 0;
    for (const doc of oldRows) {
      const userId = doc.userId as string;
      const mod = (doc.mod as string) ?? "rp";

      // Copy per-mod fields to new table (if not already there)
      const existingModSettings = await ctx.db
        .query("userModSettings")
        .withIndex("by_user_mod", (q) => q.eq("userId", userId).eq("mod", mod))
        .first();
      if (!existingModSettings) {
        await ctx.db.insert("userModSettings", {
          userId,
          mod,
          lastAddedCard: doc.lastAddedCard as number | undefined,
          deckSize: doc.deckSize as number | undefined,
          fusionDepth: doc.fusionDepth as number | undefined,
          useEquipment: doc.useEquipment as boolean | undefined,
          postDuelSuggestion: doc.postDuelSuggestion as undefined,
          createdAt: (doc.createdAt as number) ?? Date.now(),
          updatedAt: (doc.updatedAt as number) ?? Date.now(),
        });
      }

      // Move global fields to userSettings
      const settings = await ctx.db
        .query("userSettings")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();
      if (settings) {
        const patch: Record<string, unknown> = {};
        if (doc.bridgeAutoSync !== undefined) patch.bridgeAutoSync = doc.bridgeAutoSync;
        if (doc.handSourceMode !== undefined) patch.handSourceMode = doc.handSourceMode;
        if (Object.keys(patch).length > 0) {
          await ctx.db.patch(settings._id, patch);
        }
      }

      // Delete the old row
      await ctx.db.delete(doc._id as never);
      migrated++;
    }

    return { migrated };
  },
});
