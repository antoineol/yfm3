import { atom } from "jotai";
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

// ── Primitive atoms ──────────────────────────────────────────────

export const editingTargetAtom = atom<EditingTarget | null>(null);

/** Snapshot of on-disk weights for each pool in the current view. Used as the
 *  baseline for "modified" / "revert" and as the proportional template for
 *  `balanceUnpinned`. */
export const originalWeightsAtom = atom<PoolWeights | null>(null);

/** Current in-memory draft weights per pool. Mutated locally until save. */
export const draftWeightsAtom = atom<PoolWeights | null>(null);

/** Shared pin set across every pool in the current view. `balanceUnpinned`
 *  consults this when rescaling a specific pool. */
export const pinnedCardIdsAtom = atom<ReadonlySet<number>>(new Set<number>());

export const savingAtom = atom(false);

export const backupsAtom = atom<IsoBackupEntry[] | null>(null);

// ── Derived atoms ────────────────────────────────────────────────

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

/** True iff every pool in the current view sums to exactly POOL_SUM. */
export const allValidSumsAtom = atom<boolean>((get) => {
  const sums = get(poolSumsAtom);
  const keys = Object.keys(sums);
  if (keys.length === 0) return false;
  for (const k of keys) if (sums[k as PoolType] !== POOL_SUM) return false;
  return true;
});

/** Per-pool sets of card ids whose draft weight differs from original. */
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

/** Union of card ids modified in any pool — drives row highlighting and the
 *  Save button's count badge. */
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

/** Distinct count for the deck pool (used only in deck view). */
export const distinctCountAtom = atom<number>((get) => {
  const draft = get(draftWeightsAtom);
  const pool = draft?.deck;
  if (!pool) return 0;
  let count = 0;
  for (const v of pool) if (v > 0) count++;
  return count;
});

// ── Action atoms ─────────────────────────────────────────────────

/** Load the current view's pools into the editor from the bridge duelists. */
export const loadTargetAtom = atom(
  null,
  (_get, set, payload: { target: EditingTarget; duelists: BridgeDuelist[] }) => {
    const duelist = payload.duelists[payload.target.duelistId - 1];
    if (!duelist) return;
    const pools = POOLS_BY_VIEW[payload.target.view];
    const original: PoolWeights = {};
    const draft: PoolWeights = {};
    for (const p of pools) {
      original[p] = [...duelist[p]];
      draft[p] = [...duelist[p]];
    }
    set(editingTargetAtom, payload.target);
    set(originalWeightsAtom, original);
    set(draftWeightsAtom, draft);
    set(pinnedCardIdsAtom, new Set());
  },
);

export const setWeightAtom = atom(
  null,
  (get, set, payload: { cardId: number; weight: number; poolType: PoolType }) => {
    const draft = get(draftWeightsAtom);
    if (!draft) return;
    const pool = draft[payload.poolType];
    if (!pool) return;
    const next = [...pool];
    next[payload.cardId - 1] = clampWeight(payload.weight);
    set(draftWeightsAtom, { ...draft, [payload.poolType]: next });
  },
);

export const togglePinAtom = atom(null, (get, set, cardId: number) => {
  const prev = get(pinnedCardIdsAtom);
  const next = new Set(prev);
  if (next.has(cardId)) next.delete(cardId);
  else next.add(cardId);
  set(pinnedCardIdsAtom, next);
});

/** Apply the same pinned state to every card in `cardIds`. Used for shift-click
 *  range selection in the table and for the master header checkbox. */
export const setRangePinnedAtom = atom(
  null,
  (get, set, payload: { cardIds: readonly number[]; pinned: boolean }) => {
    const prev = get(pinnedCardIdsAtom);
    const next = new Set(prev);
    for (const id of payload.cardIds) {
      if (payload.pinned) next.add(id);
      else next.delete(id);
    }
    set(pinnedCardIdsAtom, next);
  },
);

/** Rebalance unpinned weights of a specific pool so its sum equals POOL_SUM.
 *  Uses the current draft as the proportional template so unpinned edits are
 *  preserved (only the magnitudes are rescaled to absorb the pinned slack). */
export const balancePoolAtom = atom(null, (get, set, poolType: PoolType) => {
  const draft = get(draftWeightsAtom);
  const pinned = get(pinnedCardIdsAtom);
  if (!draft) return;
  const d = draft[poolType];
  if (!d) return;
  set(draftWeightsAtom, { ...draft, [poolType]: balanceUnpinned(d, pinned, d) });
});

export const revertAtom = atom(null, (get, set) => {
  const original = get(originalWeightsAtom);
  if (!original) return;
  const draft: PoolWeights = {};
  for (const k of Object.keys(original) as PoolType[]) {
    const o = original[k];
    if (o) draft[k] = [...o];
  }
  set(draftWeightsAtom, draft);
  set(pinnedCardIdsAtom, new Set());
});

export type SaveOutcome =
  | { ok: true; backup: { filename: string } | null; closedGame: boolean; savedPools: number }
  | { ok: false; error: string; reason?: string };

export const saveAtom = atom(null, async (get, set): Promise<SaveOutcome | null> => {
  const target = get(editingTargetAtom);
  const draft = get(draftWeightsAtom);
  const original = get(originalWeightsAtom);
  const modifiedPools = get(modifiedPoolsAtom);
  if (!target || !draft || !original || modifiedPools.length === 0) return null;
  set(savingAtom, true);
  try {
    // Each pool is one HTTP call. The first write may close DuckStation to
    // release the lock; later writes then run through the fast path.
    const nextDraft: PoolWeights = { ...draft };
    const nextOriginal: PoolWeights = { ...original };
    let firstBackup: { filename: string } | null = null;
    let closedGame = false;
    for (const poolType of modifiedPools) {
      const result = await putDuelistPool(target.duelistId, poolType, draft[poolType] ?? []);
      if (!result.ok) return { ok: false, error: result.error, reason: result.reason };
      if (!firstBackup) firstBackup = result.backup;
      if (result.closedGame) closedGame = true;
      nextDraft[poolType] = [...result.pool];
      nextOriginal[poolType] = [...result.pool];
    }
    set(draftWeightsAtom, nextDraft);
    set(originalWeightsAtom, nextOriginal);
    set(pinnedCardIdsAtom, new Set());
    const updatedBackups = await fetchIsoBackups();
    set(backupsAtom, updatedBackups);
    return { ok: true, backup: firstBackup, closedGame, savedPools: modifiedPools.length };
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

function clampWeight(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const i = Math.round(n);
  if (i < 0) return 0;
  if (i > 0xffff) return 0xffff;
  return i;
}
