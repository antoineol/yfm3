import { atom, type Getter, type Setter } from "jotai";
import type { BridgeDuelist } from "../../../../engine/worker/messages.ts";
import {
  fetchIsoBackups,
  type IsoBackupEntry,
  type PoolType,
  postRestoreIsoBackup,
  putDuelistPool,
} from "./bridge-client.ts";
import { balanceUnpinned, POOL_SUM } from "./redistribute.ts";

export { POOL_SUM } from "./redistribute.ts";

// ── Types & constants ────────────────────────────────────────────

export type { PoolType } from "./bridge-client.ts";

/** Logical grouping of pools the UI edits together. `drops` shows the three
 *  reward pools side by side; `deck` is structurally different (has the
 *  min-distinct rule) and edits alone. */
export type EditView = "drops" | "deck";

export const DROP_POOL_TYPES = ["saPow", "bcd", "saTec"] as const satisfies readonly PoolType[];

export const ALL_POOL_TYPES = [
  "saPow",
  "bcd",
  "saTec",
  "deck",
] as const satisfies readonly PoolType[];

export const POOLS_BY_VIEW: Record<EditView, readonly PoolType[]> = {
  drops: DROP_POOL_TYPES,
  deck: ["deck"],
};

export const POOL_TYPE_LABELS: Record<PoolType, string> = {
  bcd: "B/C/D",
  saPow: "S/A-Pow",
  saTec: "S/A-Tec",
  deck: "Deck",
};

export const POOL_TYPE_DESCRIPTIONS: Record<PoolType, string> = {
  bcd: "Rewards for B/C/D duel ranks.",
  saPow: "Rewards for S/A ranks via brute force (POW).",
  saTec: "Rewards for S/A ranks via skill (TEC).",
  deck: "Cards the AI builds its deck from.",
};

/** Minimum distinct cards a deck pool must have for the AI builder to pick
 *  40 cards with the 3-copies-max rule: ceil(40/3) = 14. Below this the game
 *  hangs on duel start (observed experimentally with single-card pool). */
export const DECK_MIN_DISTINCT = 14;

export type EditingTarget = { duelistId: number; view: EditView };

type PoolWeights = Partial<Record<PoolType, number[]>>;

/** Sticky per-duelist edit state. Stored in `editsByDuelistAtom` keyed by id.
 *  All four pools are snapshotted at hydration so drops↔deck view switches
 *  never lose work. `original` is the baseline for revert/diff; `draft` is the
 *  live in-memory state; `pinned` is the working set for balance/bulk-edit. */
export type DuelistEdit = {
  original: PoolWeights;
  draft: PoolWeights;
  pinned: ReadonlySet<number>;
};

const EMPTY_PINS: ReadonlySet<number> = new Set();

// ── Primitive atoms ──────────────────────────────────────────────

export const editingTargetAtom = atom<EditingTarget | null>(null);

/** Per-duelist edit records, keyed by duelist id. Sparse: a duelist is
 *  present iff the user has visited it since the last save/reload. Drafts
 *  survive duelist and view switches. Wiped on baseline drift (see
 *  `loadTargetAtom`). */
export const editsByDuelistAtom = atom<Record<number, DuelistEdit>>({});

export const savingAtom = atom(false);

export const backupsAtom = atom<IsoBackupEntry[] | null>(null);

// ── Derived: current-duelist shortcuts ───────────────────────────

const currentEditAtom = atom<DuelistEdit | null>((get) => {
  const target = get(editingTargetAtom);
  if (!target) return null;
  return get(editsByDuelistAtom)[target.duelistId] ?? null;
});

/** Current duelist's draft. Read-only view — writers go through action atoms
 *  so every mutation updates the keyed record atomically. */
export const draftWeightsAtom = atom<PoolWeights | null>(
  (get) => get(currentEditAtom)?.draft ?? null,
);

export const originalWeightsAtom = atom<PoolWeights | null>(
  (get) => get(currentEditAtom)?.original ?? null,
);

export const pinnedCardIdsAtom = atom<ReadonlySet<number>>(
  (get) => get(currentEditAtom)?.pinned ?? EMPTY_PINS,
);

// ── Derived: per-view (current duelist) summaries ────────────────

export const poolSumsAtom = atom<Partial<Record<PoolType, number>>>((get) => {
  const draft = get(draftWeightsAtom);
  if (!draft) return {};
  const out: Partial<Record<PoolType, number>> = {};
  for (const k of Object.keys(draft) as PoolType[]) {
    const pool = draft[k];
    if (!pool) continue;
    let s = 0;
    for (const v of pool) s += v;
    out[k] = s;
  }
  return out;
});

/** Per-pool sets of card ids whose draft weight differs from original, scoped
 *  to the current duelist. Drives pool-pill mod counts and row highlighting. */
export const modifiedCardIdsByPoolAtom = atom<Partial<Record<PoolType, Set<number>>>>((get) => {
  const draft = get(draftWeightsAtom);
  const original = get(originalWeightsAtom);
  if (!draft || !original) return {};
  const out: Partial<Record<PoolType, Set<number>>> = {};
  for (const k of Object.keys(draft) as PoolType[]) {
    const d = draft[k];
    const o = original[k];
    if (!d || !o) continue;
    const s = new Set<number>();
    for (let i = 0; i < d.length; i++) if (d[i] !== o[i]) s.add(i + 1);
    out[k] = s;
  }
  return out;
});

export const modifiedCardIdsAtom = atom<ReadonlySet<number>>((get) => {
  const per = get(modifiedCardIdsByPoolAtom);
  const out = new Set<number>();
  for (const s of Object.values(per)) if (s) for (const id of s) out.add(id);
  return out;
});

export const modifiedPoolsAtom = atom<PoolType[]>((get) => {
  const per = get(modifiedCardIdsByPoolAtom);
  const out: PoolType[] = [];
  for (const k of Object.keys(per) as PoolType[]) {
    if ((per[k]?.size ?? 0) > 0) out.push(k);
  }
  return out;
});

export const isModifiedAtom = atom<boolean>((get) => get(modifiedPoolsAtom).length > 0);

export const distinctCountAtom = atom<number>((get) => {
  const draft = get(draftWeightsAtom);
  const pool = draft?.deck;
  if (!pool) return 0;
  let count = 0;
  for (const v of pool) if (v > 0) count++;
  return count;
});

// ── Derived: global (all duelists) summaries ─────────────────────

/** Every touched duelist's set of modified pools. An entry exists iff the
 *  duelist has ≥1 pool whose draft differs from original. Drives the global
 *  save button and serves as the iteration plan for `saveAtom`. */
export const modifiedByDuelistAtom = atom<Record<number, PoolType[]>>((get) => {
  const edits = get(editsByDuelistAtom);
  const out: Record<number, PoolType[]> = {};
  for (const [idStr, edit] of Object.entries(edits)) {
    const pools: PoolType[] = [];
    for (const p of ALL_POOL_TYPES) {
      const d = edit.draft[p];
      const o = edit.original[p];
      if (!d || !o) continue;
      if (!arraysEqual(d, o)) pools.push(p);
    }
    if (pools.length > 0) out[Number(idStr)] = pools;
  }
  return out;
});

export const modifiedDuelistCountAtom = atom<number>(
  (get) => Object.keys(get(modifiedByDuelistAtom)).length,
);

export const totalModifiedCardCountAtom = atom<number>((get) => {
  const edits = get(editsByDuelistAtom);
  const modified = get(modifiedByDuelistAtom);
  let total = 0;
  for (const [idStr, poolTypes] of Object.entries(modified)) {
    const edit = edits[Number(idStr)];
    if (!edit) continue;
    const cardIds = new Set<number>();
    for (const p of poolTypes) {
      const d = edit.draft[p];
      const o = edit.original[p];
      if (!d || !o) continue;
      for (let i = 0; i < d.length; i++) if (d[i] !== o[i]) cardIds.add(i + 1);
    }
    total += cardIds.size;
  }
  return total;
});

export type SaveOffender = { duelistId: number; reason: string };

/** Global save gate: every modified pool must sum to POOL_SUM; every modified
 *  deck pool must have ≥ DECK_MIN_DISTINCT distinct cards. Returns an offender
 *  list so the UI can point users at the exact (duelist, pool) that blocks save. */
export const globalSaveGateAtom = atom<{ ok: boolean; offenders: SaveOffender[] }>((get) => {
  const edits = get(editsByDuelistAtom);
  const modified = get(modifiedByDuelistAtom);
  const offenders: SaveOffender[] = [];
  for (const [idStr, poolTypes] of Object.entries(modified)) {
    const duelistId = Number(idStr);
    const edit = edits[duelistId];
    if (!edit) continue;
    for (const p of poolTypes) {
      const pool = edit.draft[p];
      if (!pool) continue;
      let sum = 0;
      let distinct = 0;
      for (const v of pool) {
        sum += v;
        if (v > 0) distinct++;
      }
      if (sum !== POOL_SUM) {
        offenders.push({
          duelistId,
          reason: `${POOL_TYPE_LABELS[p]} sums to ${sum} (needs ${POOL_SUM})`,
        });
      }
      if (p === "deck" && distinct < DECK_MIN_DISTINCT) {
        offenders.push({
          duelistId,
          reason: `Deck has ${distinct} distinct cards (needs ≥ ${DECK_MIN_DISTINCT})`,
        });
      }
    }
  }
  return { ok: offenders.length === 0, offenders };
});

// ── Action atoms ─────────────────────────────────────────────────

/** Point the editor at `target`. On every call, checks whether any stored
 *  baseline still matches the incoming game data; if not (ISO reloaded,
 *  external patch, etc.), wipes all stored edits before hydrating, so we
 *  never save deltas against a stale baseline. Otherwise, hydrates the
 *  target duelist only if it hasn't been hydrated yet — preserving in-memory
 *  drafts across duelist and view switches. */
export const loadTargetAtom = atom(
  null,
  (get, set, payload: { target: EditingTarget; duelists: readonly BridgeDuelist[] }) => {
    const { target, duelists } = payload;
    const duelist = duelists[target.duelistId - 1];
    if (!duelist) return;

    const prev = get(editingTargetAtom);
    if (!prev || prev.duelistId !== target.duelistId || prev.view !== target.view) {
      set(editingTargetAtom, target);
    }

    const edits = get(editsByDuelistAtom);
    if (isBaselineStale(edits, duelists)) {
      const fresh = cloneDuelistPools(duelist);
      set(editsByDuelistAtom, {
        [target.duelistId]: {
          original: fresh,
          draft: clonePools(fresh),
          pinned: new Set<number>(),
        },
      });
      return;
    }

    if (edits[target.duelistId]) return;
    const snap = cloneDuelistPools(duelist);
    set(editsByDuelistAtom, {
      ...edits,
      [target.duelistId]: { original: snap, draft: clonePools(snap), pinned: new Set<number>() },
    });
  },
);

export const setWeightAtom = atom(
  null,
  (get, set, payload: { cardId: number; weight: number; poolType: PoolType }) => {
    updateCurrentDraft(get, set, payload.poolType, (pool) => {
      const next = [...pool];
      next[payload.cardId - 1] = clampWeight(payload.weight);
      return next;
    });
  },
);

/** Set the same weight on many cards in a single pool in one atom update.
 *  Drives the bulk-edit row; scope (all visible vs. pinned only) is decided
 *  by the caller. */
export const setPoolWeightForCardsAtom = atom(
  null,
  (get, set, payload: { poolType: PoolType; cardIds: readonly number[]; weight: number }) => {
    updateCurrentDraft(get, set, payload.poolType, (pool) => {
      const w = clampWeight(payload.weight);
      const next = [...pool];
      for (const id of payload.cardIds) {
        const idx = id - 1;
        if (idx >= 0 && idx < next.length) next[idx] = w;
      }
      return next;
    });
  },
);

export const togglePinAtom = atom(null, (get, set, cardId: number) => {
  updateCurrentPinned(get, set, (prev) => {
    const next = new Set(prev);
    if (next.has(cardId)) next.delete(cardId);
    else next.add(cardId);
    return next;
  });
});

export const setRangePinnedAtom = atom(
  null,
  (get, set, payload: { cardIds: readonly number[]; pinned: boolean }) => {
    updateCurrentPinned(get, set, (prev) => {
      const next = new Set(prev);
      for (const id of payload.cardIds) {
        if (payload.pinned) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  },
);

/** Rebalance unpinned weights of a specific pool so its sum equals POOL_SUM.
 *  Uses the current draft as the proportional template so unpinned edits are
 *  preserved (only the magnitudes are rescaled to absorb the pinned slack). */
export const balancePoolAtom = atom(null, (get, set, poolType: PoolType) => {
  const target = get(editingTargetAtom);
  if (!target) return;
  const edit = get(editsByDuelistAtom)[target.duelistId];
  if (!edit) return;
  const pinned = edit.pinned;
  updateCurrentDraft(get, set, poolType, (pool) => balanceUnpinned(pool, pinned, pool));
});

/** Revert the current duelist's draft back to its baseline and clear its
 *  pins. Does not touch other duelists. Exposed below the table in
 *  `DropPoolSummary`. */
export const revertCurrentDuelistAtom = atom(null, (get, set) => {
  const target = get(editingTargetAtom);
  if (!target) return;
  const edits = get(editsByDuelistAtom);
  const edit = edits[target.duelistId];
  if (!edit) return;
  set(editsByDuelistAtom, {
    ...edits,
    [target.duelistId]: {
      original: edit.original,
      draft: clonePools(edit.original),
      pinned: new Set<number>(),
    },
  });
});

/** Revert drafts of every touched duelist. Lives in the top toolbar next to
 *  the global Save button. */
export const revertAllAtom = atom(null, (get, set) => {
  const edits = get(editsByDuelistAtom);
  const next: Record<number, DuelistEdit> = {};
  for (const [idStr, edit] of Object.entries(edits)) {
    next[Number(idStr)] = {
      original: edit.original,
      draft: clonePools(edit.original),
      pinned: new Set<number>(),
    };
  }
  set(editsByDuelistAtom, next);
});

export type SaveOutcome =
  | {
      ok: true;
      backup: { filename: string } | null;
      closedGame: boolean;
      savedPools: number;
      savedDuelists: number;
    }
  | { ok: false; error: string; reason?: string };

/** Persist every modified pool across every touched duelist. Each pool is one
 *  HTTP call (the first write may close DuckStation; later writes hit the fast
 *  path). On partial failure, already-saved pools are retained as the new
 *  baseline — the user just re-clicks Save to retry the rest. */
export const saveAtom = atom(null, async (get, set): Promise<SaveOutcome | null> => {
  const modifiedByDuelist = get(modifiedByDuelistAtom);
  const plan = Object.entries(modifiedByDuelist);
  if (plan.length === 0) return null;
  set(savingAtom, true);
  try {
    const edits = get(editsByDuelistAtom);
    const nextEdits: Record<number, DuelistEdit> = { ...edits };
    let firstBackup: { filename: string } | null = null;
    let closedGame = false;
    let savedPools = 0;

    for (const [idStr, poolTypes] of plan) {
      const duelistId = Number(idStr);
      const current = nextEdits[duelistId];
      if (!current) continue;
      let nextDraft = current.draft;
      let nextOriginal = current.original;
      for (const poolType of poolTypes) {
        const result = await putDuelistPool(duelistId, poolType, nextDraft[poolType] ?? []);
        if (!result.ok) {
          nextEdits[duelistId] = { ...current, draft: nextDraft, original: nextOriginal };
          set(editsByDuelistAtom, nextEdits);
          return { ok: false, error: result.error, reason: result.reason };
        }
        if (!firstBackup) firstBackup = result.backup;
        if (result.closedGame) closedGame = true;
        nextDraft = { ...nextDraft, [poolType]: [...result.pool] };
        nextOriginal = { ...nextOriginal, [poolType]: [...result.pool] };
        savedPools++;
      }
      nextEdits[duelistId] = {
        draft: nextDraft,
        original: nextOriginal,
        pinned: new Set<number>(),
      };
    }

    set(editsByDuelistAtom, nextEdits);
    const updatedBackups = await fetchIsoBackups();
    set(backupsAtom, updatedBackups);
    return {
      ok: true,
      backup: firstBackup,
      closedGame,
      savedPools,
      savedDuelists: plan.length,
    };
  } finally {
    set(savingAtom, false);
  }
});

export const loadBackupsAtom = atom(null, async (_get, set) => {
  try {
    const entries = await fetchIsoBackups();
    set(backupsAtom, entries);
  } catch {
    set(backupsAtom, []);
  }
});

export const restoreBackupAtom = atom(null, async (_get, set, backupFilename: string) => {
  const result = await postRestoreIsoBackup(backupFilename);
  set(backupsAtom, result.backups);
  return result.preRestore;
});

// ── Helpers ──────────────────────────────────────────────────────

/** Patch one pool of the current duelist's draft via `mutate`. Used by every
 *  single-pool writer so the "look up target, look up edit, splice back"
 *  boilerplate lives in one place. No-op when there's no target, no edit, or
 *  the target pool is absent. */
function updateCurrentDraft(
  get: Getter,
  set: Setter,
  poolType: PoolType,
  mutate: (pool: number[]) => number[],
): void {
  const target = get(editingTargetAtom);
  if (!target) return;
  const edits = get(editsByDuelistAtom);
  const edit = edits[target.duelistId];
  if (!edit) return;
  const pool = edit.draft[poolType];
  if (!pool) return;
  set(editsByDuelistAtom, {
    ...edits,
    [target.duelistId]: {
      ...edit,
      draft: { ...edit.draft, [poolType]: mutate(pool) },
    },
  });
}

function updateCurrentPinned(
  get: Getter,
  set: Setter,
  mutate: (prev: ReadonlySet<number>) => ReadonlySet<number>,
): void {
  const target = get(editingTargetAtom);
  if (!target) return;
  const edits = get(editsByDuelistAtom);
  const edit = edits[target.duelistId];
  if (!edit) return;
  set(editsByDuelistAtom, {
    ...edits,
    [target.duelistId]: { ...edit, pinned: mutate(edit.pinned) },
  });
}

function cloneDuelistPools(duelist: BridgeDuelist): PoolWeights {
  return {
    saPow: [...duelist.saPow],
    bcd: [...duelist.bcd],
    saTec: [...duelist.saTec],
    deck: [...duelist.deck],
  };
}

function clonePools(pools: PoolWeights): PoolWeights {
  const out: PoolWeights = {};
  for (const k of Object.keys(pools) as PoolType[]) {
    const v = pools[k];
    if (v) out[k] = [...v];
  }
  return out;
}

function arraysEqual(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** True iff any stored baseline no longer matches the incoming game data
 *  (different length, different values, or duelist no longer present). */
function isBaselineStale(
  edits: Record<number, DuelistEdit>,
  duelists: readonly BridgeDuelist[],
): boolean {
  for (const [idStr, edit] of Object.entries(edits)) {
    const d = duelists[Number(idStr) - 1];
    if (!d) return true;
    for (const p of ALL_POOL_TYPES) {
      const stored = edit.original[p];
      if (!stored || !arraysEqual(stored, d[p])) return true;
    }
  }
  return false;
}

function clampWeight(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const i = Math.round(n);
  if (i < 0) return 0;
  if (i > 0xffff) return 0xffff;
  return i;
}
