import { readLocal, removeLocal, writeLocal } from "./local-store.ts";

const KEY = "yfm_bridge_auto_sync";

/**
 * Synchronous read of the bridge auto-sync mode from localStorage.
 * Returns `undefined` if the user has never chosen a mode,
 * `true` for auto-sync, or `false` for manual.
 */
export function getAutoSyncMode(): boolean | undefined {
  return readLocal<boolean>(KEY) ?? undefined;
}

/** Persist auto-sync mode to localStorage. Pass `null` to clear (reset to "never chosen"). */
export function setAutoSyncMode(value: boolean | null): void {
  if (value == null) {
    removeLocal(KEY);
  } else {
    writeLocal(KEY, value);
  }
}

/** Convenience: returns `true` only if auto-sync mode is explicitly enabled. */
export function isAutoSyncMode(): boolean {
  return getAutoSyncMode() === true;
}
