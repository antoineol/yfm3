/**
 * Thin fetch wrapper around the bridge's `/api/active-save/*` HTTP routes.
 *
 * The save editor is scoped to the active game: there's exactly one save in
 * play at any time, identified by the serial the bridge already reads from
 * RAM. No id indirection, no listing.
 */

const BRIDGE_HTTP_BASE = "http://localhost:3333";

export type ActiveSaveEntry = {
  gameSerial: string;
  memcardFilename: string;
  memcardPath: string;
  /** Embedded PSX game code from the directory frame (may be null). */
  gameCode: string | null;
  sizeBytes: number;
  mtime: string;
  backupCount: number;
};

export type BridgeBackupEntry = {
  filename: string;
  timestamp: string;
  sizeBytes: number;
};

export type ActiveSaveDiagnostics = {
  /** Raw DuckStation window title read via user32 FFI. */
  windowTitle: string | null;
  /** Title used to build the memcard filename (window title with suffixes stripped). */
  resolvedTitle: string | null;
  card1Type: string;
  memcardsDir: string | null;
  expectedFilename: string | null;
  expectedExists: boolean;
  availableMemcards: string[];
};

export type ActiveSaveError =
  | { kind: "no_active_game" }
  | {
      kind: "no_save_for_active_game";
      gameSerial: string | null;
      reason: string | null;
      diagnostics: ActiveSaveDiagnostics | null;
    }
  | { kind: "network"; message: string };

export type ActiveSaveResponse =
  | { ok: true; entry: ActiveSaveEntry }
  | { ok: false; error: ActiveSaveError };

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${await res.text()}`);
  return (await res.json()) as T;
}

export async function fetchActiveSave(): Promise<ActiveSaveResponse> {
  let res: Response;
  try {
    res = await fetch(`${BRIDGE_HTTP_BASE}/api/active-save`);
  } catch (err) {
    return {
      ok: false,
      error: { kind: "network", message: err instanceof Error ? err.message : String(err) },
    };
  }
  if (res.ok) {
    return { ok: true, entry: (await res.json()) as ActiveSaveEntry };
  }
  if (res.status === 409) return { ok: false, error: { kind: "no_active_game" } };
  if (res.status === 404) {
    const body = (await res.json().catch(() => ({}))) as {
      gameSerial?: string;
      reason?: string;
      diagnostics?: ActiveSaveDiagnostics;
    };
    return {
      ok: false,
      error: {
        kind: "no_save_for_active_game",
        gameSerial: body.gameSerial ?? null,
        reason: body.reason ?? null,
        diagnostics: body.diagnostics ?? null,
      },
    };
  }
  return {
    ok: false,
    error: { kind: "network", message: `${res.status} ${res.statusText}` },
  };
}

export async function fetchActiveSaveBytes(): Promise<Uint8Array> {
  const res = await fetch(`${BRIDGE_HTTP_BASE}/api/active-save/bytes`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return new Uint8Array(await res.arrayBuffer());
}

export async function putActiveSaveBytes(
  bytes: Uint8Array,
): Promise<{ ok: true; backup: BridgeBackupEntry | null }> {
  // Blob gives fetch a known length + content type, avoiding the chunked /
  // streaming paths some browser+Bun combinations reject with "Failed to fetch".
  // Copy into a plain ArrayBuffer so TS's BlobPart typing is happy even when
  // the Uint8Array's buffer is typed as ArrayBufferLike.
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  const body = new Blob([ab], { type: "application/octet-stream" });
  const res = await fetch(`${BRIDGE_HTTP_BASE}/api/active-save/bytes`, {
    method: "PUT",
    body,
  });
  return parseJson(res);
}

export async function fetchActiveSaveBackups(): Promise<BridgeBackupEntry[]> {
  return parseJson(await fetch(`${BRIDGE_HTTP_BASE}/api/active-save/backups`));
}

export async function postRestoreActiveSaveBackup(
  backupFilename: string,
): Promise<{ ok: true; preRestore: BridgeBackupEntry | null; backups: BridgeBackupEntry[] }> {
  const res = await fetch(
    `${BRIDGE_HTTP_BASE}/api/active-save/backups/${encodeURIComponent(backupFilename)}/restore`,
    { method: "POST" },
  );
  return parseJson(res);
}
