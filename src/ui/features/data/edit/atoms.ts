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

/** Selection of which duelist + pool the user is currently editing. */
export type EditingTarget = { duelistId: number; poolType: PoolType };

// ── Primitive atoms ──────────────────────────────────────────────

export const editingTargetAtom = atom<EditingTarget | null>(null);

/**
 * Snapshot of on-disk weights at load time. Used as the proportional template
 * for `balanceUnpinned`, and as the baseline for "modified" / "revert".
 */
export const originalWeightsAtom = atom<number[] | null>(null);

/** Current in-memory draft weights. Mutated locally until the user saves. */
export const draftWeightsAtom = atom<number[] | null>(null);

export const pinnedCardIdsAtom = atom<ReadonlySet<number>>(new Set<number>());

export const savingAtom = atom(false);

export const backupsAtom = atom<IsoBackupEntry[] | null>(null);

// ── Derived atoms ────────────────────────────────────────────────

export const poolSumAtom = atom<number>((get) => {
  const draft = get(draftWeightsAtom);
  if (!draft) return 0;
  let sum = 0;
  for (const v of draft) sum += v;
  return sum;
});

export const isValidSumAtom = atom<boolean>((get) => get(poolSumAtom) === POOL_SUM);

export const modifiedCardIdsAtom = atom<ReadonlySet<number>>((get) => {
  const draft = get(draftWeightsAtom);
  const original = get(originalWeightsAtom);
  if (!draft || !original) return new Set();
  const out = new Set<number>();
  for (let i = 0; i < draft.length; i++) {
    if (draft[i] !== original[i]) out.add(i + 1);
  }
  return out;
});

export const isModifiedAtom = atom<boolean>((get) => get(modifiedCardIdsAtom).size > 0);

export const distinctCountAtom = atom<number>((get) => {
  const draft = get(draftWeightsAtom);
  if (!draft) return 0;
  let count = 0;
  for (const v of draft) if (v > 0) count++;
  return count;
});

/** Minimum distinct cards a deck pool must have for the AI builder to pick
 *  40 cards with the 3-copies-max rule: ceil(40/3) = 14. Below this the game
 *  hangs on duel start (observed experimentally with single-card pool). */
export const DECK_MIN_DISTINCT = 14;

// ── Action atoms ─────────────────────────────────────────────────

/** Load a pool from the bridge's gameData duelists into the editor. */
export const loadPoolAtom = atom(
  null,
  (_get, set, payload: { target: EditingTarget; duelists: BridgeDuelist[] }) => {
    const duelist = payload.duelists[payload.target.duelistId - 1];
    if (!duelist) return;
    const pool = duelist[payload.target.poolType];
    set(editingTargetAtom, payload.target);
    set(originalWeightsAtom, [...pool]);
    set(draftWeightsAtom, [...pool]);
    set(pinnedCardIdsAtom, new Set());
  },
);

export const setWeightAtom = atom(null, (get, set, payload: { cardId: number; weight: number }) => {
  const draft = get(draftWeightsAtom);
  if (!draft) return;
  const next = [...draft];
  next[payload.cardId - 1] = clampWeight(payload.weight);
  set(draftWeightsAtom, next);
});

export const togglePinAtom = atom(null, (get, set, cardId: number) => {
  const prev = get(pinnedCardIdsAtom);
  const next = new Set(prev);
  if (next.has(cardId)) next.delete(cardId);
  else next.add(cardId);
  set(pinnedCardIdsAtom, next);
});

/** Apply the same pinned state to every card in `cardIds`. Used for shift-click
 *  range selection in the table. */
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

export const clearPinsAtom = atom(null, (_get, set) => {
  set(pinnedCardIdsAtom, new Set());
});

export const balanceUnpinnedAtom = atom(null, (get, set) => {
  const draft = get(draftWeightsAtom);
  const original = get(originalWeightsAtom);
  const pinned = get(pinnedCardIdsAtom);
  if (!draft || !original) return;
  set(draftWeightsAtom, balanceUnpinned(draft, pinned, original));
});

export const revertAtom = atom(null, (get, set) => {
  const original = get(originalWeightsAtom);
  if (!original) return;
  set(draftWeightsAtom, [...original]);
  set(pinnedCardIdsAtom, new Set());
});

export type SaveOutcome =
  | { ok: true; backup: { filename: string } | null; closedGame: boolean }
  | { ok: false; error: string; reason?: string };

export const saveAtom = atom(null, async (get, set): Promise<SaveOutcome | null> => {
  const target = get(editingTargetAtom);
  const draft = get(draftWeightsAtom);
  if (!target || !draft) return null;
  set(savingAtom, true);
  try {
    const result = await putDuelistPool(target.duelistId, target.poolType, draft);
    if (!result.ok) {
      return { ok: false, error: result.error, reason: result.reason };
    }
    // Server re-read returns the authoritative post-write pool; adopt it so
    // the UI reflects on-disk truth even if the server normalized anything.
    set(originalWeightsAtom, [...result.pool]);
    set(draftWeightsAtom, [...result.pool]);
    set(pinnedCardIdsAtom, new Set());
    const updatedBackups = await fetchIsoBackups();
    set(backupsAtom, updatedBackups);
    return { ok: true, backup: result.backup, closedGame: result.closedGame };
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
