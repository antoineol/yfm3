import { Migrations } from "@convex-dev/migrations";
import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { deckAggregate } from "./deckAggregate";

const migrations = new Migrations<DataModel>(components.migrations);

/** CLI runner: `npx convex run migrations:run` */
export const run = migrations.runner();

/** Run all pending migrations in order: `npx convex run migrations:runAll` */
export const runAll = migrations.runner([
  internal.migrations.backfillModOnOwnedCards,
  internal.migrations.backfillModOnDeck,
  internal.migrations.backfillModOnHand,
  internal.migrations.backfillModOnUserPreferences,
  internal.migrations.ensureUserSettings,
]);

// ── Individual table migrations ─────────────────────────────────────

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
      // Re-read so the aggregate sees the patched doc
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

export const backfillModOnUserPreferences = migrations.define({
  table: "userPreferences",
  migrateOne: (_ctx, doc) => {
    if (doc.mod === undefined) return { mod: "rp" };
  },
});

export const ensureUserSettings = migrations.define({
  table: "userPreferences",
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
