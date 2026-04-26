import type { BridgeGameData } from "../../engine/worker/messages.ts";
import type {
  DuelPhase,
  DuelStats,
  FieldCard,
  RawBridgeState,
} from "./bridge-state-interpreter.ts";
import {
  computeOwnedCards,
  decodeDuelistUnlock,
  interpretRawState,
} from "./bridge-state-interpreter.ts";
import { accumulateCpuSwaps, type CpuSwap } from "./detect-cpu-swaps.ts";

// ── Raw bridge message types (internal) ──────────────────────────────

type BridgeWaitingForGame = {
  connected: true;
  status: "waiting_for_game";
  version?: string;
  pid: number;
};

type BridgeDisconnected = {
  connected: false;
  status?: "no_emulator" | "no_shared_memory" | "error";
  version?: string;
  reason?: string;
  settingsPatched?: boolean;
};

type RawBridgeMessage = RawBridgeState | BridgeWaitingForGame | BridgeDisconnected;

// ── Public types ─────────────────────────────────────────────────────

export type BridgeStatus = "disconnected" | "connecting" | "connected";

/** Granular connection detail for the setup guide UI. */
export type BridgeDetail =
  | "bridge_not_found"
  | "emulator_not_found"
  | "no_shared_memory"
  | "waiting_for_game"
  | "ready"
  | "error";

/** Reactive bridge state (no callbacks). */
export type BridgeState = {
  status: BridgeStatus;
  detail: BridgeDetail;
  detailMessage: string | null;
  /** Bridge auto-patched DuckStation settings — user must restart DuckStation. */
  settingsPatched: boolean;
  version: string | null;
  hand: number[];
  field: FieldCard[];
  handReliable: boolean;
  phase: DuelPhase;
  /** Phase mapped from raw bytes during opponent's turn (for opponent zone auto-switch). */
  opponentPhase: DuelPhase;
  inDuel: boolean;
  lp: [number, number] | null;
  stats: DuelStats | null;
  collection: Record<number, number> | null;
  deckDefinition: number[] | null;
  /** Player's shuffled deck during a duel (40 card IDs, 0 = empty slot). */
  shuffledDeck: number[] | null;
  /** Hex fingerprint of card stats in RAM — identifies which mod is running. */
  modFingerprint: string | null;
  /** PSX game serial from the running EXE (e.g. "SLUS_027.11"). Identifies the active game. */
  gameSerial: string | null;
  /** Fusion/equip tables extracted from the disc image by the bridge. */
  gameData: BridgeGameData | null;
  /** Error message when bridge failed to acquire game data. */
  gameDataError: string | null;
  /** True when the last restart request failed on the bridge side. */
  restartFailed: boolean;
  /** True while the bridge is updating and restarting (between ack and reconnect). */
  updating: boolean;
  /** True when the bridge has pre-downloaded an update ready for a fast restart. */
  updateStaged: boolean;
  /** True when the bridge tried to stage an update but found nothing to download. */
  stageFailed: boolean;
  /** Opponent's hand card IDs (from RAM, filtered same as player). */
  opponentHand: number[];
  /** Opponent's field cards with live ATK/DEF. */
  opponentField: FieldCard[];
  /** CPU card swaps detected during the current duel. */
  cpuSwaps: CpuSwap[];
  /** Duelist IDs unlocked for free duel (from RAM bitfield). Null if bridge unavailable. */
  unlockedDuelists: number[] | null;
};

export const INITIAL_BRIDGE_STATE: BridgeState = {
  status: "disconnected",
  detail: "bridge_not_found",
  detailMessage: null,
  settingsPatched: false,
  version: null,
  hand: [],
  field: [],
  handReliable: false,
  phase: "other",
  opponentPhase: "other",
  inDuel: false,
  lp: null,
  stats: null,
  collection: null,
  deckDefinition: null,
  shuffledDeck: null,
  modFingerprint: null,
  gameSerial: null,
  gameData: null,
  gameDataError: null,
  restartFailed: false,
  updating: false,
  updateStaged: false,
  stageFailed: false,
  opponentHand: [],
  opponentField: [],
  cpuSwaps: [],
  unlockedDuelists: null,
};

export type EmulatorBridge = BridgeState & {
  scan: () => void;
  restartEmulator: () => void;
  updateAndRestart: () => void;
  stageUpdate: () => void;
};

// ── Ended phase tracker ──────────────────────────────────────────────

/** Tracks state needed to detect stale "ended" phases between messages. */
export type EndedTracker = {
  sceneId: number | null;
  sceneLeft: boolean;
  at: number | null;
  wasInDuel: boolean;
};

export const ENDED_STALE_MS = 15_000;

export const INITIAL_ENDED_TRACKER: EndedTracker = {
  sceneId: null,
  sceneLeft: false,
  at: null,
  wasInDuel: false,
};

// ── Reference-stability helpers ──────────────────────────────────────
// These let `processBridgeMessage` return the same slice refs (and root
// ref) across polls with unchanged content, so React Compiler's auto-memo
// can actually bail out downstream.

function keepRef<T>(prev: T, next: T, eq: (a: T, b: T) => boolean): T {
  return eq(prev, next) ? prev : next;
}

function eqNumArr(a: number[] | null, b: number[] | null): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function eqFieldArr(a: FieldCard[], b: FieldCard[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    if (!x || !y) return false;
    if (x.cardId !== y.cardId || x.atk !== y.atk || x.def !== y.def) return false;
  }
  return true;
}

function eqLp(a: [number, number] | null, b: [number, number] | null): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  return a[0] === b[0] && a[1] === b[1];
}

function eqStats(a: DuelStats | null, b: DuelStats | null): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  return (
    a.fusions === b.fusions &&
    a.terrain === b.terrain &&
    a.duelistId === b.duelistId &&
    eqNumArr(a.rankCounters, b.rankCounters)
  );
}

function eqNumRecord(a: Record<number, number> | null, b: Record<number, number> | null): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  const keysA = Object.keys(a);
  if (keysA.length !== Object.keys(b).length) return false;
  for (const k of keysA) {
    if (a[k as unknown as number] !== b[k as unknown as number]) return false;
  }
  return true;
}

/** Shallow-equal check keyed on every field of BridgeState using Object.is. */
function shallowEqBridgeState(a: BridgeState, b: BridgeState): boolean {
  const keys = Object.keys(a) as (keyof BridgeState)[];
  for (const k of keys) {
    if (!Object.is(a[k], b[k])) return false;
  }
  return true;
}

// ── Exported functions ───────────────────────────────────────────────

type ProcessResult = {
  state: BridgeState;
  tracker: EndedTracker;
};

/**
 * Boundary parser: maps a raw JSON `gameData` payload to a `BridgeGameData`.
 * The return-type annotation forces TypeScript to verify every field of
 * `BridgeGameData` is set — add a field to the type and this function fails
 * to compile until it's handled here. Runtime validation is intentionally
 * minimal (field-level `unknown` casts) because the bridge is a trusted
 * first-party producer; the safety goal is *structural completeness at
 * compile time*, not input sanitization.
 */
function parseGameDataMessage(m: Record<string, unknown>): BridgeGameData {
  return {
    cards: m.cards as BridgeGameData["cards"],
    duelists: m.duelists as BridgeGameData["duelists"],
    fusionTable: m.fusionTable as BridgeGameData["fusionTable"],
    equipTable: m.equipTable as BridgeGameData["equipTable"],
    equipBonuses: (m.equipBonuses ?? null) as BridgeGameData["equipBonuses"],
    perEquipBonuses: (m.perEquipBonuses ?? null) as BridgeGameData["perEquipBonuses"],
    deckLimits: (m.deckLimits ?? null) as BridgeGameData["deckLimits"],
    rankScoring: (m.rankScoring ?? null) as BridgeGameData["rankScoring"],
    fieldBonusTable: (m.fieldBonusTable ?? null) as BridgeGameData["fieldBonusTable"],
    artworkKey: m.artworkKey as BridgeGameData["artworkKey"],
  };
}

/**
 * Pure function: maps a raw bridge WebSocket message to the next BridgeState.
 * Returns null for malformed/unparseable messages.
 *
 * `currentState` is needed for partial-update messages (gameData, restart_result)
 * that only touch a subset of fields.
 */
export function processBridgeMessage(
  msg: unknown,
  currentState: BridgeState,
  tracker: EndedTracker,
  now: number,
): ProcessResult | null {
  if (typeof msg !== "object" || msg === null) return null;

  const m = msg as Record<string, unknown>;

  // ── Partial update: background download staged an update ────────
  if (m.type === "update_staged") {
    return { state: { ...currentState, updateStaged: true }, tracker };
  }

  // ── Partial update: staging found nothing to download ────────────
  if (m.type === "stage_noop") {
    return { state: { ...currentState, stageFailed: true }, tracker };
  }

  // ── Partial update: update-and-restart acknowledged ─────────────
  if (m.type === "update_restart_ack") {
    return { state: { ...currentState, updating: true }, tracker };
  }

  // ── Partial update: restart failure ─────────────────────────────
  if (m.type === "restart_result" && m.success === false) {
    return { state: { ...currentState, restartFailed: true }, tracker };
  }

  // ── Partial update: game data from disc ─────────────────────────
  if (m.type === "gameData") {
    if (m.error) {
      return {
        state: { ...currentState, gameData: null, gameDataError: m.error as string },
        tracker,
      };
    }
    return {
      state: { ...currentState, gameData: parseGameDataMessage(m), gameDataError: null },
      tracker,
    };
  }

  // ── Full state messages ─────────────────────────────────────────
  const stateMsg = msg as RawBridgeMessage;

  if (stateMsg.connected && stateMsg.status === "ready") {
    const raw = stateMsg as RawBridgeState;
    const interpreted = interpretRawState(raw);
    const { effectivePhase, tracker: nextTracker } = resolveEndedPhase(
      interpreted,
      raw.sceneId ?? 0,
      tracker,
      now,
    );

    const cpuSwaps = accumulateCpuSwaps(
      currentState.cpuSwaps,
      {
        opponentHand: currentState.opponentHand,
        opponentFieldCount: currentState.opponentField.length,
        inDuel: currentState.inDuel,
      },
      {
        opponentHand: interpreted.opponentHand,
        opponentFieldCount: interpreted.opponentField.length,
        inDuel: interpreted.inDuel,
      },
      effectivePhase,
      now,
    );

    // ── Reference-stability pass ─────────────────────────────────
    // JSON deserialization + interpretation produce fresh array refs every
    // poll (~20 Hz). React Compiler's auto-memo can only bail out when
    // props keep Object.is identity, so we reuse previous refs for every
    // slice whose content is structurally unchanged.
    const hand = keepRef(currentState.hand, interpreted.hand, eqNumArr);
    const field = keepRef(currentState.field, interpreted.field, eqFieldArr);
    const opponentHand = keepRef(currentState.opponentHand, interpreted.opponentHand, eqNumArr);
    const opponentField = keepRef(
      currentState.opponentField,
      interpreted.opponentField,
      eqFieldArr,
    );
    const lp = keepRef(currentState.lp, interpreted.lp, eqLp);
    const stats = keepRef(currentState.stats, interpreted.stats, eqStats);
    const collection = keepRef(
      currentState.collection,
      computeOwnedCards(raw.trunk, raw.deckDefinition),
      eqNumRecord,
    );
    const deckDefinition = keepRef(currentState.deckDefinition, raw.deckDefinition, eqNumArr);
    const shuffledDeck = keepRef(currentState.shuffledDeck, raw.shuffledDeck ?? null, eqNumArr);
    const unlockedDuelists = keepRef(
      currentState.unlockedDuelists,
      raw.duelistUnlock ? decodeDuelistUnlock(raw.duelistUnlock) : null,
      eqNumArr,
    );

    const candidate: BridgeState = {
      ...INITIAL_BRIDGE_STATE,
      status: "connected",
      detail: "ready",
      version: stateMsg.version ?? null,
      hand,
      field,
      handReliable: interpreted.handReliable,
      phase: effectivePhase,
      opponentPhase: interpreted.opponentPhase,
      inDuel: interpreted.inDuel,
      lp,
      stats,
      collection,
      deckDefinition,
      shuffledDeck,
      modFingerprint: raw.modFingerprint ?? null,
      gameSerial: raw.gameSerial ?? null,
      // Preserve game data — it arrives via a separate message
      gameData: currentState.gameData,
      gameDataError: currentState.gameDataError,
      // Preserve update flag — it arrives via a separate message
      updateStaged: currentState.updateStaged,
      opponentHand,
      opponentField,
      cpuSwaps,
      unlockedDuelists,
    };

    // Every slice already matches currentState ref? Skip the allocation.
    const state = shallowEqBridgeState(currentState, candidate) ? currentState : candidate;
    return { state, tracker: nextTracker };
  }

  if (stateMsg.connected && stateMsg.status === "waiting_for_game") {
    return {
      state: {
        ...INITIAL_BRIDGE_STATE,
        status: "connected",
        detail: "waiting_for_game",
        version: stateMsg.version ?? null,
        updateStaged: currentState.updateStaged,
      },
      tracker,
    };
  }

  if (!stateMsg.connected) {
    const disconnected = stateMsg as BridgeDisconnected;
    return {
      state: {
        ...INITIAL_BRIDGE_STATE,
        status: "connected",
        detail:
          disconnected.status === "no_emulator"
            ? "emulator_not_found"
            : disconnected.status === "no_shared_memory"
              ? "no_shared_memory"
              : "error",
        detailMessage: disconnected.reason ?? null,
        settingsPatched: disconnected.settingsPatched === true,
        version: disconnected.version ?? null,
      },
      tracker,
    };
  }

  return null;
}

/**
 * Determine whether the "ended" phase from RAM is genuine (user is on
 * results screen) or stale (user navigated away). Returns the effective
 * phase and an updated tracker.
 *
 * Stale signals (any one triggers override to "other"):
 * 1. No duel was ever observed ending this session (sceneId null).
 * 2. sceneId changed since the duel ended (user navigated away).
 * 3. sceneId returned to the ended value after leaving (scene-left flag).
 * 4. More than ENDED_STALE_MS elapsed since the duel ended.
 */
export function resolveEndedPhase(
  interpreted: { inDuel: boolean; phase: DuelPhase },
  msgSceneId: number,
  prev: EndedTracker,
  now: number,
): { effectivePhase: DuelPhase; tracker: EndedTracker } {
  // In duel — clear tracker
  if (interpreted.inDuel) {
    return {
      effectivePhase: interpreted.phase,
      tracker: { sceneId: null, sceneLeft: false, at: null, wasInDuel: true },
    };
  }

  // Not "ended" — pass through, just update wasInDuel
  if (interpreted.phase !== "ended") {
    return {
      effectivePhase: interpreted.phase,
      tracker: { ...prev, wasInDuel: false },
    };
  }

  // phase === "ended" && !inDuel

  // Just transitioned out of duel → genuine, record scene + timestamp
  if (prev.wasInDuel) {
    return {
      effectivePhase: "ended",
      tracker: { sceneId: msgSceneId, sceneLeft: false, at: now, wasInDuel: false },
    };
  }

  // Already was not in duel — check staleness
  if (
    prev.sceneId === null || // never observed a duel end this session
    prev.sceneLeft || // user already navigated away once
    (prev.at !== null && now - prev.at > ENDED_STALE_MS) // time expired
  ) {
    return {
      effectivePhase: "other",
      tracker: { ...prev, wasInDuel: false },
    };
  }

  // Scene changed from where duel ended → mark as left, stale
  if (prev.sceneId !== msgSceneId) {
    return {
      effectivePhase: "other",
      tracker: { ...prev, sceneLeft: true, wasInDuel: false },
    };
  }

  // Still on results screen (sceneId matches, not left, not timed out)
  return {
    effectivePhase: "ended",
    tracker: { ...prev, wasInDuel: false },
  };
}
