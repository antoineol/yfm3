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

export type DropX15Status =
  | {
      supported: true;
      enabled: boolean;
      definitionId: string;
      definitionName: string;
      cardDropCount: number;
      starchipMultiplier: number;
      availableDropCounts: number[];
      gameSerial: string;
      discFilename: string;
      reason?: string;
    }
  | {
      supported: false;
      enabled: false;
      gameSerial: string;
      discFilename: string;
      reason: string;
    };

export type PalFrWordingKind = "cardDescription" | "cardName";

export type PalFrWordingEntry = {
  id: string;
  kind: PalFrWordingKind;
  entryIndex: number;
  offset: number;
  byteLength: number;
  maxByteLength: number;
  text: string;
};

export type PalFrGlyphRenderingPatchStatus = {
  applied: boolean;
  changed: boolean;
  targets: {
    label: string;
    rawByte: number;
    tableRamAddress: number;
    fileOffset: number;
    currentWord: number;
    expectedWord: number;
  }[];
};

export type PalFrWordingStatus =
  | {
      supported: true;
      gameSerial: string;
      discFilename: string;
      glyphRenderingPatch: PalFrGlyphRenderingPatchStatus;
      entries: PalFrWordingEntry[];
    }
  | {
      supported: false;
      gameSerial: string;
      discFilename: string;
      reason: string;
    };

type PalFrWordingCacheKey = string;

let palFrWordingStatusCache: { cacheKey: PalFrWordingCacheKey; status: PalFrWordingStatus } | null =
  null;
let palFrWordingStatusRequest: {
  cacheKey: PalFrWordingCacheKey;
  promise: Promise<PalFrWordingStatus>;
  requestId: number;
} | null = null;
let palFrWordingStatusRequestId = 0;
let palFrWordingStatusCacheVersion = 0;

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

export type BridgeFusion = { material1: number; material2: number; result: number };

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

export type PutFusionTableResult =
  | {
      ok: true;
      backup: IsoBackupEntry | null;
      fusionTable: BridgeFusion[];
      closedGame: boolean;
    }
  | {
      ok: false;
      error: string;
      reason?: string;
    };

export async function putFusionTable(
  fusions: readonly BridgeFusion[],
): Promise<PutFusionTableResult> {
  const res = await fetch(`${BRIDGE_HTTP_BASE}/api/active-iso/fusion-table`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fusions }),
  });
  if (res.status === 409) return (await res.json()) as PutFusionTableResult;
  return parseJson<PutFusionTableResult>(res);
}

export type PutDropX15Result =
  | {
      ok: true;
      backup: IsoBackupEntry | null;
      changed: boolean;
      closedGame: boolean;
      status: Extract<DropX15Status, { supported: true }>;
    }
  | {
      ok: false;
      error: string;
      reason?: string;
    };

export async function fetchDropX15Status(): Promise<DropX15Status> {
  return parseJson(await fetch(`${BRIDGE_HTTP_BASE}/api/active-iso/drop-x15`));
}

export async function putDropX15Patch(cardDropCount: number): Promise<PutDropX15Result> {
  const res = await fetch(`${BRIDGE_HTTP_BASE}/api/active-iso/drop-x15`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cardDropCount }),
  });
  if (res.status === 409) return (await res.json()) as PutDropX15Result;
  return parseJson<PutDropX15Result>(res);
}

export function getCachedPalFrWordingStatus(
  cacheKey: PalFrWordingCacheKey,
): PalFrWordingStatus | null {
  return palFrWordingStatusCache?.cacheKey === cacheKey ? palFrWordingStatusCache.status : null;
}

export function primePalFrWordingStatusCache(
  cacheKey: PalFrWordingCacheKey,
  status: PalFrWordingStatus,
): void {
  palFrWordingStatusCache = { cacheKey, status };
}

export function invalidatePalFrWordingStatusCache(cacheKey?: PalFrWordingCacheKey): void {
  palFrWordingStatusCacheVersion++;
  if (cacheKey == null || palFrWordingStatusCache?.cacheKey === cacheKey) {
    palFrWordingStatusCache = null;
  }
  if (cacheKey == null || palFrWordingStatusRequest?.cacheKey === cacheKey) {
    palFrWordingStatusRequest = null;
  }
}

export async function fetchPalFrWordingStatus({
  cacheKey = "active",
  force = false,
}: {
  cacheKey?: PalFrWordingCacheKey;
  force?: boolean;
} = {}): Promise<PalFrWordingStatus> {
  if (!force) {
    const cached = getCachedPalFrWordingStatus(cacheKey);
    if (cached) return cached;
    if (palFrWordingStatusRequest?.cacheKey === cacheKey) return palFrWordingStatusRequest.promise;
  }

  const requestId = ++palFrWordingStatusRequestId;
  const cacheVersion = palFrWordingStatusCacheVersion;
  const promise = fetch(`${BRIDGE_HTTP_BASE}/api/active-iso/pal-fr-wording`)
    .then((res) => parseJson<PalFrWordingStatus>(res))
    .then((status) => {
      if (
        cacheVersion === palFrWordingStatusCacheVersion &&
        palFrWordingStatusRequest?.requestId === requestId
      ) {
        primePalFrWordingStatusCache(cacheKey, status);
      }
      return status;
    });
  palFrWordingStatusRequest = { cacheKey, promise, requestId };
  try {
    return await promise;
  } finally {
    if (palFrWordingStatusRequest?.requestId === requestId) palFrWordingStatusRequest = null;
  }
}

export type PutPalFrWordingResult =
  | {
      ok: true;
      backup: IsoBackupEntry | null;
      closedGame: boolean;
      entry?: PalFrWordingEntry;
      entries: PalFrWordingEntry[];
      glyphRenderingPatch: PalFrGlyphRenderingPatchStatus;
    }
  | {
      ok: false;
      error: string;
      reason?: string;
    };

export async function putPalFrWordingEntry(
  entryId: string,
  text: string,
): Promise<PutPalFrWordingResult> {
  const res = await fetch(`${BRIDGE_HTTP_BASE}/api/active-iso/pal-fr-wording`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entryId, text }),
  });
  if (res.status === 409) return (await res.json()) as PutPalFrWordingResult;
  return parseJson<PutPalFrWordingResult>(res);
}

export async function putPalFrWordingEntries(
  changes: { entryId: string; text: string }[],
): Promise<PutPalFrWordingResult> {
  const res = await fetch(`${BRIDGE_HTTP_BASE}/api/active-iso/pal-fr-wording`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ changes }),
  });
  if (res.status === 409) return (await res.json()) as PutPalFrWordingResult;
  return parseJson<PutPalFrWordingResult>(res);
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
