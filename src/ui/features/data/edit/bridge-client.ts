/**
 * Thin fetch wrapper around the bridge's `/api/active-iso/*` HTTP routes.
 *
 * Like the save editor: the ISO in play is whatever `currentGameData` on the
 * bridge points at — the UI never ships a path or id. Writes auto-create a
 * rotating backup on the bridge side.
 */

const BRIDGE_HTTP_BASE = "http://localhost:3333";

export type PoolType = "deck" | "saPow" | "bcd" | "saTec";

export type ActiveIsoEntry = {
  gameSerial: string;
  discFilename: string;
  backupCount: number;
};

export type IsoBackupEntry = {
  filename: string;
  timestamp: string;
  sizeBytes: number;
};

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${await res.text()}`);
  return (await res.json()) as T;
}

export async function fetchActiveIso(): Promise<ActiveIsoEntry | null> {
  const res = await fetch(`${BRIDGE_HTTP_BASE}/api/active-iso`);
  if (res.status === 409) return null;
  return parseJson<ActiveIsoEntry>(res);
}

export type PutDuelistPoolResult = {
  ok: true;
  backup: IsoBackupEntry | null;
  pool: number[];
  /** True iff the bridge had to close DuckStation's running game to release
   *  the ISO lock before writing. Used client-side to tailor the toast. */
  closedGame: boolean;
};

export type PutDuelistPoolError = {
  ok: false;
  /** `iso_locked` means the bridge tried the close-game fallback and it
   *  didn't work (DuckStation window not found, lock never released, etc.).
   *  Anything else is an unexpected server error. */
  error: string;
  reason?: string;
};

export async function putDuelistPool(
  duelistId: number,
  poolType: PoolType,
  weights: number[],
): Promise<PutDuelistPoolResult | PutDuelistPoolError> {
  const res = await fetch(`${BRIDGE_HTTP_BASE}/api/active-iso/duelist-pool`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ duelistId, poolType, weights }),
  });
  // 409 is the structured "game couldn't be closed" response — surface the
  // body so the UI can show a specific toast. Other non-2xx responses are
  // genuine server errors and go through parseJson's throw path.
  if (res.status === 409) {
    return (await res.json()) as PutDuelistPoolError;
  }
  return parseJson<PutDuelistPoolResult>(res);
}

export async function fetchIsoBackups(): Promise<IsoBackupEntry[]> {
  return parseJson(await fetch(`${BRIDGE_HTTP_BASE}/api/active-iso/backups`));
}

export async function postRestoreIsoBackup(
  backupFilename: string,
): Promise<{ ok: true; preRestore: IsoBackupEntry | null; backups: IsoBackupEntry[] }> {
  const res = await fetch(
    `${BRIDGE_HTTP_BASE}/api/active-iso/backups/${encodeURIComponent(backupFilename)}/restore`,
    { method: "POST" },
  );
  return parseJson(res);
}
