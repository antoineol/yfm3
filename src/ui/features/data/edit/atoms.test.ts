import { createStore } from "jotai";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { BridgeDuelist } from "../../../../engine/worker/messages.ts";

vi.mock("./bridge-client.ts", () => ({
  putDuelistPool: vi.fn(),
  fetchIsoBackups: vi.fn(async () => []),
  postRestoreIsoBackup: vi.fn(),
}));

const { putDuelistPool, fetchIsoBackups } = await import("./bridge-client.ts");
const putDuelistPoolMock = putDuelistPool as unknown as ReturnType<typeof vi.fn>;
const fetchIsoBackupsMock = fetchIsoBackups as unknown as ReturnType<typeof vi.fn>;

const {
  draftWeightsAtom,
  editsByDuelistAtom,
  globalSaveGateAtom,
  loadTargetAtom,
  modifiedByDuelistAtom,
  modifiedDuelistCountAtom,
  POOL_SUM,
  pinnedCardIdsAtom,
  revertAllAtom,
  revertCurrentDuelistAtom,
  saveAtom,
  setPoolWeightForCardsAtom,
  setWeightAtom,
  togglePinAtom,
  totalModifiedCardCountAtom,
} = await import("./atoms.ts");

type PoolType = "saPow" | "bcd" | "saTec" | "deck";

const POOL_SIZE = 722;

function makePool(size = POOL_SIZE, valuesByIdx: Record<number, number> = {}): number[] {
  const out = new Array<number>(size).fill(0);
  for (const [k, v] of Object.entries(valuesByIdx)) out[Number(k)] = v;
  return out;
}

function makeDuelist(id: number, pools: Partial<Record<PoolType, number[]>> = {}): BridgeDuelist {
  return {
    id,
    name: `Duelist ${id}`,
    saPow: pools.saPow ?? makePool(),
    bcd: pools.bcd ?? makePool(),
    saTec: pools.saTec ?? makePool(),
    deck: pools.deck ?? makePool(),
  };
}

/** Seed a store by hydrating one duelist through `loadTargetAtom` — the path
 *  real UI code takes. Keeps tests honest against the atom contract. */
function seedStore(duelists: BridgeDuelist[], duelistId = 1, view: "drops" | "deck" = "drops") {
  const store = createStore();
  store.set(loadTargetAtom, { target: { duelistId, view }, duelists });
  return store;
}

describe("setPoolWeightForCardsAtom", () => {
  test("applies the same weight to every card id in the target pool", () => {
    const store = seedStore([
      makeDuelist(1, { saPow: makePool(POOL_SIZE, { 0: 50, 1: 50, 2: 50 }) }),
    ]);

    store.set(setPoolWeightForCardsAtom, { cardIds: [1, 2, 3], poolType: "saPow", weight: 200 });

    const draft = store.get(draftWeightsAtom);
    expect(draft?.saPow?.[0]).toBe(200);
    expect(draft?.saPow?.[1]).toBe(200);
    expect(draft?.saPow?.[2]).toBe(200);
    expect(draft?.saPow?.[3]).toBe(0);
  });

  test("does not touch other pools", () => {
    const store = seedStore([
      makeDuelist(1, {
        bcd: makePool(POOL_SIZE, { 0: 123 }),
        saTec: makePool(POOL_SIZE, { 0: 456 }),
      }),
    ]);

    store.set(setPoolWeightForCardsAtom, { cardIds: [1], poolType: "saPow", weight: 77 });

    const draft = store.get(draftWeightsAtom);
    expect(draft?.bcd?.[0]).toBe(123);
    expect(draft?.saTec?.[0]).toBe(456);
    expect(draft?.saPow?.[0]).toBe(77);
  });

  test("clamps weights above 0xffff", () => {
    const store = seedStore([makeDuelist(1)]);
    store.set(setPoolWeightForCardsAtom, { cardIds: [1, 2], poolType: "saPow", weight: 999_999 });
    const draft = store.get(draftWeightsAtom);
    expect(draft?.saPow?.[0]).toBe(0xffff);
    expect(draft?.saPow?.[1]).toBe(0xffff);
  });

  test("clamps negative weights to zero", () => {
    const store = seedStore([makeDuelist(1, { saPow: makePool(POOL_SIZE, { 0: 500 }) })]);
    store.set(setPoolWeightForCardsAtom, { cardIds: [1], poolType: "saPow", weight: -50 });
    expect(store.get(draftWeightsAtom)?.saPow?.[0]).toBe(0);
  });

  test("ignores card ids outside the pool's range", () => {
    const store = seedStore([makeDuelist(1, { saPow: makePool(5, { 0: 10, 4: 10 }) })]);
    store.set(setPoolWeightForCardsAtom, {
      cardIds: [0, 6, 999, 3],
      poolType: "saPow",
      weight: 42,
    });
    expect(store.get(draftWeightsAtom)?.saPow).toEqual([10, 0, 42, 0, 10]);
  });

  test("accepts an empty cardIds list as a no-op", () => {
    const store = seedStore([makeDuelist(1, { saPow: makePool(POOL_SIZE, { 2: 99 }) })]);
    store.set(setPoolWeightForCardsAtom, { cardIds: [], poolType: "saPow", weight: 1 });
    expect(store.get(draftWeightsAtom)?.saPow?.[2]).toBe(99);
  });

  test("no-op when the current duelist has no hydrated edit", () => {
    const store = createStore();
    store.set(setPoolWeightForCardsAtom, { cardIds: [1], poolType: "saPow", weight: 100 });
    expect(store.get(draftWeightsAtom)).toBeNull();
  });

  test("bulk edit writes only to the active duelist, leaves other duelists' drafts alone", () => {
    const duelists = [makeDuelist(1), makeDuelist(2)];
    const store = seedStore(duelists, 1);

    store.set(setPoolWeightForCardsAtom, { cardIds: [1, 2, 3], poolType: "saPow", weight: 500 });

    store.set(loadTargetAtom, { target: { duelistId: 2, view: "drops" }, duelists });
    // Duelist 2's draft is untouched by duelist 1's bulk edit.
    expect(store.get(draftWeightsAtom)?.saPow?.[0]).toBe(0);
    expect(store.get(draftWeightsAtom)?.saPow?.[1]).toBe(0);

    // And the edit on duelist 1 is still intact.
    store.set(loadTargetAtom, { target: { duelistId: 1, view: "drops" }, duelists });
    expect(store.get(draftWeightsAtom)?.saPow?.slice(0, 3)).toEqual([500, 500, 500]);
  });
});

describe("cross-duelist persistence", () => {
  test("switching duelists preserves drafts on both sides", () => {
    const duelists = [makeDuelist(1), makeDuelist(2)];
    const store = createStore();

    store.set(loadTargetAtom, { target: { duelistId: 1, view: "drops" }, duelists });
    store.set(setWeightAtom, { cardId: 10, weight: 500, poolType: "saPow" });

    store.set(loadTargetAtom, { target: { duelistId: 2, view: "drops" }, duelists });
    store.set(setWeightAtom, { cardId: 20, weight: 777, poolType: "bcd" });

    // Back to duelist 1: original edit still there.
    store.set(loadTargetAtom, { target: { duelistId: 1, view: "drops" }, duelists });
    expect(store.get(draftWeightsAtom)?.saPow?.[9]).toBe(500);

    // And duelist 2 held onto its own edit too.
    store.set(loadTargetAtom, { target: { duelistId: 2, view: "drops" }, duelists });
    expect(store.get(draftWeightsAtom)?.bcd?.[19]).toBe(777);
  });

  test("switching views on the same duelist preserves drops edits across drops↔deck", () => {
    const duelists = [makeDuelist(1)];
    const store = seedStore(duelists);

    store.set(setWeightAtom, { cardId: 5, weight: 333, poolType: "saPow" });

    // Flip to deck view and back.
    store.set(loadTargetAtom, { target: { duelistId: 1, view: "deck" }, duelists });
    store.set(loadTargetAtom, { target: { duelistId: 1, view: "drops" }, duelists });

    expect(store.get(draftWeightsAtom)?.saPow?.[4]).toBe(333);
  });

  test("pins are preserved across duelist switches (working set is per duelist)", () => {
    const duelists = [makeDuelist(1), makeDuelist(2)];
    const store = seedStore(duelists);
    store.set(togglePinAtom, 42);

    store.set(loadTargetAtom, { target: { duelistId: 2, view: "drops" }, duelists });
    expect(store.get(pinnedCardIdsAtom).has(42)).toBe(false);

    store.set(loadTargetAtom, { target: { duelistId: 1, view: "drops" }, duelists });
    expect(store.get(pinnedCardIdsAtom).has(42)).toBe(true);
  });
});

describe("loadTargetAtom baseline drift", () => {
  test("wipes all stored edits when incoming game data differs from stored baseline", () => {
    const duelists = [makeDuelist(1), makeDuelist(2)];
    const store = seedStore(duelists);
    store.set(setWeightAtom, { cardId: 1, weight: 500, poolType: "saPow" });
    store.set(loadTargetAtom, { target: { duelistId: 2, view: "drops" }, duelists });
    store.set(setWeightAtom, { cardId: 1, weight: 600, poolType: "bcd" });

    // Bridge reloads: duelist 1's saPow pool is now different.
    const newDuelists = [makeDuelist(1, { saPow: makePool(POOL_SIZE, { 0: 42 }) }), makeDuelist(2)];
    store.set(loadTargetAtom, { target: { duelistId: 1, view: "drops" }, duelists: newDuelists });

    // Every touched duelist's draft is gone; only duelist 1 is re-hydrated.
    const edits = store.get(editsByDuelistAtom);
    expect(Object.keys(edits)).toEqual(["1"]);
    expect(edits[1]?.original.saPow?.[0]).toBe(42);
    expect(edits[1]?.draft.saPow?.[0]).toBe(42); // no pending edit
  });

  test("same game-data content (new array identity) keeps drafts", () => {
    const pools = { saPow: makePool(POOL_SIZE, { 0: 10 }) };
    const store = seedStore([makeDuelist(1, pools)]);
    store.set(setWeightAtom, { cardId: 5, weight: 200, poolType: "saPow" });

    // Same pool values, fresh BridgeDuelist reference (simulates gameData
    // message being reprocessed with identical content).
    store.set(loadTargetAtom, {
      target: { duelistId: 1, view: "drops" },
      duelists: [makeDuelist(1, { saPow: [...pools.saPow] })],
    });

    expect(store.get(draftWeightsAtom)?.saPow?.[4]).toBe(200);
  });
});

describe("global modified summaries", () => {
  test("modifiedByDuelistAtom and counters reflect every touched duelist", () => {
    const duelists = [makeDuelist(1), makeDuelist(2), makeDuelist(3)];
    const store = seedStore(duelists);

    store.set(setWeightAtom, { cardId: 1, weight: 100, poolType: "saPow" });
    store.set(loadTargetAtom, { target: { duelistId: 2, view: "drops" }, duelists });
    store.set(setWeightAtom, { cardId: 1, weight: 200, poolType: "bcd" });
    store.set(setWeightAtom, { cardId: 2, weight: 300, poolType: "bcd" });
    // duelist 3 is visited but not edited.
    store.set(loadTargetAtom, { target: { duelistId: 3, view: "drops" }, duelists });

    const modified = store.get(modifiedByDuelistAtom);
    expect(Object.keys(modified).sort()).toEqual(["1", "2"]);
    expect(modified[1]).toEqual(["saPow"]);
    expect(modified[2]).toEqual(["bcd"]);
    expect(store.get(modifiedDuelistCountAtom)).toBe(2);
    expect(store.get(totalModifiedCardCountAtom)).toBe(3);
  });
});

describe("globalSaveGateAtom", () => {
  test("passes when every modified pool sums to POOL_SUM", () => {
    const pool = makePool(POOL_SIZE, { 0: POOL_SUM });
    const store = seedStore([makeDuelist(1, { saPow: pool })]);
    // Make a no-op modification that nets to POOL_SUM: move weight between two cells.
    store.set(setWeightAtom, { cardId: 1, weight: POOL_SUM - 100, poolType: "saPow" });
    store.set(setWeightAtom, { cardId: 2, weight: 100, poolType: "saPow" });

    expect(store.get(globalSaveGateAtom).ok).toBe(true);
  });

  test("fails when any modified pool is off-sum, listing the offender", () => {
    const store = seedStore([makeDuelist(1)]);
    store.set(setWeightAtom, { cardId: 1, weight: 500, poolType: "saPow" });

    const gate = store.get(globalSaveGateAtom);
    expect(gate.ok).toBe(false);
    expect(gate.offenders).toHaveLength(1);
    expect(gate.offenders[0]?.duelistId).toBe(1);
    expect(gate.offenders[0]?.reason).toMatch(/S\/A-Pow sums to 500/);
  });

  test("fails a deck edit that drops below DECK_MIN_DISTINCT", () => {
    // 14 cards × (POOL_SUM / 14 rounded) ≈ 146 each; start there so sum matches.
    const per = Math.floor(POOL_SUM / 14);
    const remainder = POOL_SUM - per * 14;
    const deck = makePool();
    for (let i = 0; i < 14; i++) deck[i] = per;
    deck[0] = per + remainder;

    const store = seedStore([makeDuelist(1, { deck })], 1, "deck");

    // Zero out one entry without fixing the sum — two violations (distinct < 14 AND sum ≠ POOL_SUM).
    store.set(setWeightAtom, { cardId: 1, weight: 0, poolType: "deck" });
    const gate = store.get(globalSaveGateAtom);
    expect(gate.ok).toBe(false);
    expect(gate.offenders.some((o) => /distinct cards/.test(o.reason))).toBe(true);
  });
});

describe("revert actions", () => {
  test("revertCurrentDuelistAtom resets only the current duelist", () => {
    const duelists = [makeDuelist(1), makeDuelist(2)];
    const store = seedStore(duelists);
    store.set(setWeightAtom, { cardId: 1, weight: 100, poolType: "saPow" });
    store.set(loadTargetAtom, { target: { duelistId: 2, view: "drops" }, duelists });
    store.set(setWeightAtom, { cardId: 1, weight: 200, poolType: "bcd" });

    // Revert while on duelist 2.
    store.set(revertCurrentDuelistAtom);

    expect(store.get(draftWeightsAtom)?.bcd?.[0]).toBe(0); // duelist 2 back to baseline

    store.set(loadTargetAtom, { target: { duelistId: 1, view: "drops" }, duelists });
    expect(store.get(draftWeightsAtom)?.saPow?.[0]).toBe(100); // duelist 1 preserved
  });

  test("revertAllAtom clears drafts on every touched duelist", () => {
    const duelists = [makeDuelist(1), makeDuelist(2)];
    const store = seedStore(duelists);
    store.set(setWeightAtom, { cardId: 1, weight: 100, poolType: "saPow" });
    store.set(loadTargetAtom, { target: { duelistId: 2, view: "drops" }, duelists });
    store.set(setWeightAtom, { cardId: 1, weight: 200, poolType: "bcd" });

    store.set(revertAllAtom);

    expect(store.get(modifiedDuelistCountAtom)).toBe(0);
    store.set(loadTargetAtom, { target: { duelistId: 1, view: "drops" }, duelists });
    expect(store.get(draftWeightsAtom)?.saPow?.[0]).toBe(0);
  });
});

describe("saveAtom", () => {
  beforeEach(() => {
    putDuelistPoolMock.mockReset();
    fetchIsoBackupsMock.mockReset();
    fetchIsoBackupsMock.mockResolvedValue([]);
  });

  test("calls putDuelistPool once per (duelist, modified pool) across all touched duelists", async () => {
    const duelists = [makeDuelist(1), makeDuelist(2)];
    const store = seedStore(duelists);
    store.set(setWeightAtom, { cardId: 1, weight: POOL_SUM, poolType: "saPow" });
    store.set(loadTargetAtom, { target: { duelistId: 2, view: "drops" }, duelists });
    store.set(setWeightAtom, { cardId: 1, weight: POOL_SUM, poolType: "bcd" });
    store.set(setWeightAtom, { cardId: 2, weight: 0, poolType: "saTec" });
    store.set(setWeightAtom, { cardId: 2, weight: POOL_SUM, poolType: "saTec" });

    putDuelistPoolMock.mockImplementation(
      async (id: number, poolType: string, weights: number[]) => ({
        ok: true,
        backup: { filename: `bk-${id}-${poolType}`, timestamp: "t", sizeBytes: 1 },
        pool: weights,
        closedGame: false,
      }),
    );

    const outcome = await store.set(saveAtom);
    expect(outcome?.ok).toBe(true);
    if (outcome?.ok) {
      expect(outcome.savedDuelists).toBe(2);
      expect(outcome.savedPools).toBe(3);
    }
    // (1, saPow) + (2, bcd) + (2, saTec)
    expect(putDuelistPoolMock).toHaveBeenCalledTimes(3);
  });

  test("partial failure stops the plan and keeps already-saved pools as new baselines", async () => {
    const duelists = [makeDuelist(1)];
    const store = seedStore(duelists);
    store.set(setWeightAtom, { cardId: 1, weight: POOL_SUM, poolType: "saPow" });
    store.set(setWeightAtom, { cardId: 1, weight: POOL_SUM, poolType: "bcd" });

    let calls = 0;
    putDuelistPoolMock.mockImplementation(
      async (_id: number, _poolType: string, weights: number[]) => {
        calls++;
        if (calls === 1) {
          return { ok: true, backup: null, pool: weights, closedGame: false };
        }
        return { ok: false, error: "iso_locked", reason: "DuckStation still holds the lock" };
      },
    );

    const outcome = await store.set(saveAtom);
    expect(outcome?.ok).toBe(false);

    // Remaining pending pool (the one that failed) is still in the modified set;
    // the succeeded one is baselined so it no longer counts as pending.
    const modified = store.get(modifiedByDuelistAtom);
    expect(modified[1]).toBeDefined();
    expect(modified[1]).toHaveLength(1); // only the un-saved pool remains
  });

  test("no-op when nothing is modified", async () => {
    const store = seedStore([makeDuelist(1)]);
    const outcome = await store.set(saveAtom);
    expect(outcome).toBeNull();
    expect(putDuelistPoolMock).not.toHaveBeenCalled();
  });
});
