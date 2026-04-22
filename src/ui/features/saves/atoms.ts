import { atom } from "jotai";
import {
  CARD_QUANTITY_COUNT,
  CARD_QUANTITY_OFFSET,
  getStarchips,
  loadSave,
  type Save,
  setCardQuantity,
  setStarchips,
  updateCrcs,
} from "../../../engine/savefile/save.ts";
import {
  type ActiveSaveEntry,
  type ActiveSaveError,
  type BridgeBackupEntry,
  fetchActiveSave,
  fetchActiveSaveBackups,
  fetchActiveSaveBytes,
  postRestoreActiveSaveBackup,
  putActiveSaveBytes,
} from "./bridge-client.ts";

// ── State ────────────────────────────────────────────────────────

export type LoadedSave = {
  entry: ActiveSaveEntry;
  originalBytes: Uint8Array;
  save: Save;
  backups: BridgeBackupEntry[];
};

export type LoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: ActiveSaveError };

export const loadedSaveAtom = atom<LoadedSave | null>(null);
export const loadStateAtom = atom<LoadState>({ status: "idle" });
export const savingAtom = atom(false);

// ── Derived ──────────────────────────────────────────────────────

export const quantitiesAtom = atom<Uint8Array>((get) => {
  const loaded = get(loadedSaveAtom);
  if (!loaded) return new Uint8Array(0);
  return loaded.save.bytes.slice(CARD_QUANTITY_OFFSET, CARD_QUANTITY_OFFSET + CARD_QUANTITY_COUNT);
});

export const starchipsAtom = atom<number>((get) => {
  const loaded = get(loadedSaveAtom);
  return loaded ? getStarchips(loaded.save) : 0;
});

export const isModifiedAtom = atom<boolean>((get) => {
  const loaded = get(loadedSaveAtom);
  if (!loaded) return false;
  const a = loaded.originalBytes;
  const b = loaded.save.bytes;
  if (a.length !== b.length) return true;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return true;
  return false;
});

export const modifiedIndicesAtom = atom<ReadonlySet<number>>((get) => {
  const loaded = get(loadedSaveAtom);
  if (!loaded) return new Set();
  const a = loaded.originalBytes;
  const b = loaded.save.bytes;
  const out = new Set<number>();
  for (let i = 0; i < CARD_QUANTITY_COUNT; i++) {
    if (a[CARD_QUANTITY_OFFSET + i] !== b[CARD_QUANTITY_OFFSET + i]) out.add(i);
  }
  return out;
});

/**
 * Owned-card totals built from trunk (save file) merged with the live deck
 * definition from the bridge. The save file only stores trunk counts at
 * CARD_QUANTITY_OFFSET; cards currently in the deck are tracked separately
 * in RAM. Rest of the app counts deck cards as owned too, so we mirror that.
 */
export function mergeOwnedCounts(
  trunk: Uint8Array,
  deckDefinition: readonly number[] | null,
): Record<number, number> {
  const owned: Record<number, number> = {};
  for (let i = 0; i < trunk.length; i++) {
    const count = trunk[i] ?? 0;
    if (count > 0) owned[i + 1] = count;
  }
  if (deckDefinition) {
    for (const cardId of deckDefinition) {
      if (cardId > 0) owned[cardId] = (owned[cardId] ?? 0) + 1;
    }
  }
  return owned;
}

// ── Actions ──────────────────────────────────────────────────────

export const loadActiveSaveAtom = atom(null, async (_get, set) => {
  set(loadStateAtom, { status: "loading" });
  const resolved = await fetchActiveSave();
  if (!resolved.ok) {
    set(loadStateAtom, { status: "error", error: resolved.error });
    set(loadedSaveAtom, null);
    return;
  }
  try {
    const [bytes, backups] = await Promise.all([fetchActiveSaveBytes(), fetchActiveSaveBackups()]);
    const save = loadSave(bytes);
    set(loadedSaveAtom, {
      entry: resolved.entry,
      originalBytes: new Uint8Array(bytes),
      save,
      backups,
    });
    set(loadStateAtom, { status: "idle" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    set(loadStateAtom, { status: "error", error: { kind: "network", message } });
    set(loadedSaveAtom, null);
  }
});

export const revertEditsAtom = atom(null, (get, set) => {
  const loaded = get(loadedSaveAtom);
  if (!loaded) return;
  set(loadedSaveAtom, { ...loaded, save: loadSave(loaded.originalBytes) });
});

export const setQuantityAtom = atom(
  null,
  (get, set, payload: { index: number; quantity: number }) => {
    const loaded = get(loadedSaveAtom);
    if (!loaded) return;
    setCardQuantity(loaded.save, payload.index, payload.quantity);
    updateCrcs(loaded.save);
    set(loadedSaveAtom, { ...loaded });
  },
);

export const setStarchipsAtom = atom(null, (get, set, value: number) => {
  const loaded = get(loadedSaveAtom);
  if (!loaded) return;
  setStarchips(loaded.save, value);
  updateCrcs(loaded.save);
  set(loadedSaveAtom, { ...loaded });
});

export const grantAllCardsAtom = atom(null, (get, set, quantity: number) => {
  const loaded = get(loadedSaveAtom);
  if (!loaded) return;
  loaded.save.bytes.fill(
    quantity,
    CARD_QUANTITY_OFFSET,
    CARD_QUANTITY_OFFSET + CARD_QUANTITY_COUNT,
  );
  updateCrcs(loaded.save);
  set(loadedSaveAtom, { ...loaded });
});

export const saveToDiskAtom = atom(null, async (get, set) => {
  const loaded = get(loadedSaveAtom);
  if (!loaded) return null;
  set(savingAtom, true);
  try {
    const result = await putActiveSaveBytes(loaded.save.bytes);
    const updatedBackups = await fetchActiveSaveBackups();
    set(loadedSaveAtom, {
      ...loaded,
      originalBytes: new Uint8Array(loaded.save.bytes),
      backups: updatedBackups,
    });
    return result.backup;
  } finally {
    set(savingAtom, false);
  }
});

export const restoreBackupAtom = atom(null, async (get, set, backupFilename: string) => {
  const loaded = get(loadedSaveAtom);
  if (!loaded) return null;
  const result = await postRestoreActiveSaveBackup(backupFilename);
  const bytes = await fetchActiveSaveBytes();
  set(loadedSaveAtom, {
    ...loaded,
    originalBytes: new Uint8Array(bytes),
    save: loadSave(bytes),
    backups: result.backups,
  });
  return result.preRestore;
});
