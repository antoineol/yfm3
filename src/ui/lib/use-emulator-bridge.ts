import { useCallback, useEffect, useRef, useState } from "react";
import type { BridgeGameData } from "../../engine/worker/messages.ts";
import { type CpuSwap, detectCpuSwaps } from "./detect-cpu-swaps.ts";

/** Duel phase labels derived from raw bridge data. */
export type DuelPhase =
  | "hand"
  | "draw"
  | "fusion"
  | "field"
  | "battle"
  | "opponent"
  | "ended"
  | "other";

export type DuelStats = {
  fusions: number;
  terrain: number;
  duelistId: number;
};

// ── Raw bridge message types (internal) ──────────────────────────────

type RawCardSlot = { cardId: number; atk: number; def: number; status: number };

type RawBridgeState = {
  connected: true;
  status?: "ready";
  version?: string;
  pid: number;
  modFingerprint?: string;
  gameSerial?: string;
  // Version-dependent fields — null when the game binary is unrecognized
  // (e.g. PAL version without a known offset profile).
  sceneId: number | null;
  duelPhase: number | null;
  turnIndicator: number | null;
  lp: [number, number] | null;
  fusions: number | null;
  terrain: number | null;
  duelistId: number | null;
  /** Hand slot indices (u8[5]): deal index or 0xFF = card left hand. Null if profile unavailable. */
  handSlots: number[] | null;
  // Universal fields — always available.
  hand: RawCardSlot[];
  field: RawCardSlot[];
  /** Player's shuffled deck during a duel (40 card IDs, 0 = empty). */
  shuffledDeck: number[];
  trunk: number[];
  deckDefinition: number[];
  // Opponent data (same card slot struct as player)
  opponentHand: RawCardSlot[];
  opponentField: RawCardSlot[];
  opponentHandSlots: number[] | null;
  cpuShuffledDeck: number[];
};

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

// ── Duel phase bytes ─────────────────────────────────────────────────

const PHASE_INIT = 0x01;
const PHASE_CLEANUP = 0x02;
const PHASE_DRAW = 0x03;
const PHASE_HAND_SELECT = 0x04;
const PHASE_FIELD = 0x05;
const PHASE_FUSION = 0x07;
const PHASE_FUSION_RESOLVE = 0x08;
const PHASE_BATTLE = 0x09;
const PHASE_POST_BATTLE = 0x0a;
const PHASE_DUEL_END = 0x0c;
const PHASE_RESULTS = 0x0d;

/** A monster on the field with its live (equip-boosted) ATK/DEF from RAM. */
export type FieldCard = { cardId: number; atk: number; def: number };

// ── Interpretation logic (pure, testable) ────────────────────────────

type InterpretedState = {
  hand: number[];
  field: FieldCard[];
  handReliable: boolean;
  phase: DuelPhase;
  /** Phase mapped from raw bytes during opponent's turn (for opponent zone toggle). */
  opponentPhase: DuelPhase;
  inDuel: boolean;
  lp: [number, number] | null;
  stats: DuelStats | null;
  opponentHand: number[];
  opponentField: FieldCard[];
};

/**
 * Interpret raw bridge state into game-meaningful values.
 * Pure function — all game logic lives here, not in the bridge.
 *
 * When the bridge has a resolved offset profile (NTSC-U, RP), duelPhase
 * and related fields are numbers → exact phase detection.
 *
 * When the profile is unknown (PAL, etc.), those fields are null →
 * duel state is inferred from hand/field card presence.
 */
export function interpretRawState(raw: RawBridgeState): InterpretedState {
  const hand = raw.handSlots
    ? filterHandBySlots(raw.hand, raw.handSlots)
    : filterCardSlots(raw.hand);
  const field = filterFieldSlots(raw.field);
  const stats: DuelStats | null =
    raw.fusions != null
      ? { fusions: raw.fusions, terrain: raw.terrain ?? 0, duelistId: raw.duelistId ?? 0 }
      : null;

  // Opponent data — same filtering logic as player (gracefully handle missing data from older bridges)
  const opponentHand = raw.opponentHand
    ? raw.opponentHandSlots
      ? filterHandBySlots(raw.opponentHand, raw.opponentHandSlots)
      : filterCardSlots(raw.opponentHand)
    : [];
  const opponentField = raw.opponentField ? filterFieldSlots(raw.opponentField) : [];

  // ── Exact detection: duel phase byte is available ──────────────────
  if (raw.duelPhase != null) {
    const isPlayerTurn = raw.turnIndicator === 0;
    const phase = mapDuelPhase(raw.duelPhase, isPlayerTurn);
    const opponentPhase = isPlayerTurn ? ("field" as DuelPhase) : mapRawPhase(raw.duelPhase);
    // With handSlots-based filtering the hand data is deterministic at all
    // phases and turns — no flickering from status-byte transitions.
    // The player's hand doesn't change during the opponent's turn either.
    const handReliable = true;

    // A recognized duel phase means we are in a duel, even if cards have not
    // been dealt yet (e.g. first DRAW).  The game always progresses through
    // DUEL_END / RESULTS at end-of-duel, which are excluded here, so
    // isDuelPhase reliably goes false when the duel ends.
    const inDuel =
      raw.duelPhase === PHASE_INIT ||
      raw.duelPhase === PHASE_CLEANUP ||
      raw.duelPhase === PHASE_DRAW ||
      raw.duelPhase === PHASE_HAND_SELECT ||
      raw.duelPhase === PHASE_FIELD ||
      raw.duelPhase === PHASE_FUSION ||
      raw.duelPhase === PHASE_FUSION_RESOLVE ||
      raw.duelPhase === PHASE_BATTLE ||
      raw.duelPhase === PHASE_POST_BATTLE;

    return {
      hand,
      field,
      handReliable,
      phase,
      opponentPhase,
      inDuel,
      lp: raw.lp,
      stats,
      opponentHand,
      opponentField,
    };
  }

  // ── Fallback: no duel phase — infer from hand/field presence ───────
  // Used when the game binary is unrecognized (e.g. PAL).
  // Hand/field RAM addresses are universal across all versions.
  if (hand.length > 0 || field.length > 0) {
    const fallbackPhase: DuelPhase =
      hand.length >= 5 ? "hand" : field.length > 0 ? "field" : "draw";
    return {
      hand,
      field,
      handReliable: hand.length >= 5,
      phase: fallbackPhase,
      opponentPhase: "other",
      inDuel: true,
      lp: raw.lp,
      stats,
      opponentHand,
      opponentField,
    };
  }

  return {
    hand,
    field,
    handReliable: false,
    phase: "other",
    opponentPhase: "other",
    inDuel: false,
    lp: raw.lp,
    stats,
    opponentHand,
    opponentField,
  };
}

/**
 * Filter hand cards using the hand slot index array from RAM.
 * A slot with a non-0xFF value means the card is present in hand.
 * This is deterministic — no flickering during animations.
 */
function filterHandBySlots(slots: RawCardSlot[], handSlots: number[]): number[] {
  const result: number[] = [];
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    if (!s) continue;
    if (handSlots[i] !== 0xff && s.cardId > 0 && s.cardId < 723) {
      result.push(s.cardId);
    }
  }
  return result;
}

/** A card occupies a slot if it has a valid ID and non-zero status. */
function isActiveSlot(s: RawCardSlot): boolean {
  // Any non-zero status means the card is in an active state.
  // During battle the game temporarily clears the STATUS_PRESENT (0x80)
  // bit on the attacker while keeping other bits (e.g. 0x04 = face-up).
  // Truly empty slots always have status === 0x00.
  return s.cardId > 0 && s.cardId < 723 && s.status !== 0;
}

/**
 * Fallback hand filter when handSlots is unavailable (unknown game binary).
 * Uses the status byte, which can flicker during animations.
 * Bit 0x10 is set when a card is being played from hand to field —
 * the card briefly exists in both zones during the animation.
 * Excluding it prevents double-counting (hand=5 + field=1).
 */
function filterCardSlots(slots: RawCardSlot[]): number[] {
  const result: number[] = [];
  for (const s of slots) {
    if (isActiveSlot(s) && (s.status & 0x10) === 0) result.push(s.cardId);
  }
  return result;
}

function filterFieldSlots(slots: RawCardSlot[]): FieldCard[] {
  const result: FieldCard[] = [];
  for (const s of slots) {
    if (isActiveSlot(s)) result.push({ cardId: s.cardId, atk: s.atk, def: s.def });
  }
  return result;
}

/**
 * Merge trunk (spare copies) + deck definition into total owned per card.
 * trunk[i] = spare copies of card (i+1), deckDef = array of 40 card IDs.
 */
export function computeOwnedCards(trunk: number[], deckDef: number[]): Record<number, number> {
  const owned: Record<number, number> = {};
  for (const [i, count] of trunk.entries()) {
    if (count > 0) owned[i + 1] = count;
  }
  for (const cardId of deckDef) {
    if (cardId > 0) owned[cardId] = (owned[cardId] ?? 0) + 1;
  }
  return owned;
}

/** Map raw phase byte to DuelPhase, ignoring whose turn it is. */
function mapRawPhase(duelPhase: number): DuelPhase {
  if (duelPhase === PHASE_DUEL_END || duelPhase === PHASE_RESULTS) return "ended";
  if (duelPhase === PHASE_INIT) return "draw";
  if (duelPhase === PHASE_HAND_SELECT) return "hand";
  if (duelPhase === PHASE_DRAW || duelPhase === PHASE_CLEANUP) return "draw";
  if (duelPhase === PHASE_FUSION || duelPhase === PHASE_FUSION_RESOLVE) return "fusion";
  if (duelPhase === PHASE_FIELD) return "field";
  if (duelPhase === PHASE_BATTLE) return "battle";
  return "other";
}

function mapDuelPhase(duelPhase: number, isPlayerTurn: boolean): DuelPhase {
  if (duelPhase === PHASE_DUEL_END || duelPhase === PHASE_RESULTS) return "ended";
  if (duelPhase === PHASE_INIT) return "draw"; // pre-deal setup, cards not yet dealt
  if (!isPlayerTurn) return "opponent";
  if (duelPhase === PHASE_HAND_SELECT) return "hand";
  if (duelPhase === PHASE_DRAW || duelPhase === PHASE_CLEANUP) return "draw";
  if (duelPhase === PHASE_FUSION || duelPhase === PHASE_FUSION_RESOLVE) return "fusion";
  if (duelPhase === PHASE_FIELD) return "field";
  if (duelPhase === PHASE_BATTLE) return "battle";
  return "other";
}

// ── Stale "ended" phase resolution (pure, testable) ─────────────────

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

// ── Public hook types ────────────────────────────────────────────────

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
  /** Opponent's hand card IDs (from RAM, filtered same as player). */
  opponentHand: number[];
  /** Opponent's field cards with live ATK/DEF. */
  opponentField: FieldCard[];
  /** CPU card swaps detected during the current duel. */
  cpuSwaps: CpuSwap[];
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
  gameData: null,
  gameDataError: null,
  restartFailed: false,
  updating: false,
  updateStaged: false,
  opponentHand: [],
  opponentField: [],
  cpuSwaps: [],
};

export type EmulatorBridge = BridgeState & {
  scan: () => void;
  restartEmulator: () => void;
  updateAndRestart: () => void;
};

// ── Pure message processor (testable) ────────────────────────────────

type ProcessResult = {
  state: BridgeState;
  tracker: EndedTracker;
  /** Raw state for CPU swap detection across consecutive messages. */
  raw: RawBridgeState | null;
};

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
  prevRaw: RawBridgeState | null,
  now: number,
): ProcessResult | null {
  if (typeof msg !== "object" || msg === null) return null;

  const m = msg as Record<string, unknown>;

  // ── Partial update: background download staged an update ────────
  if (m.type === "update_staged") {
    return { state: { ...currentState, updateStaged: true }, tracker, raw: prevRaw };
  }

  // ── Partial update: update-and-restart acknowledged ─────────────
  if (m.type === "update_restart_ack") {
    return { state: { ...currentState, updating: true }, tracker, raw: prevRaw };
  }

  // ── Partial update: restart failure ─────────────────────────────
  if (m.type === "restart_result" && m.success === false) {
    return { state: { ...currentState, restartFailed: true }, tracker, raw: prevRaw };
  }

  // ── Partial update: game data from disc ─────────────────────────
  if (m.type === "gameData") {
    if (m.error) {
      return {
        state: { ...currentState, gameData: null, gameDataError: m.error as string },
        tracker,
        raw: prevRaw,
      };
    }
    return {
      state: {
        ...currentState,
        gameData: {
          cards: m.cards,
          duelists: m.duelists,
          fusionTable: m.fusionTable,
          equipTable: m.equipTable,
        } as BridgeGameData,
        gameDataError: null,
      },
      tracker,
      raw: prevRaw,
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

    // CPU swap detection: compare raw opponent hand across consecutive messages
    const newSwaps = detectCpuSwaps(
      prevRaw?.opponentHand,
      raw.opponentHand,
      prevRaw?.opponentHandSlots,
      raw.opponentHandSlots,
      currentState.inDuel,
      interpreted.inDuel,
      now,
    );
    const cpuSwaps = interpreted.inDuel ? [...currentState.cpuSwaps, ...newSwaps] : [];

    return {
      state: {
        ...INITIAL_BRIDGE_STATE,
        status: "connected",
        detail: "ready",
        version: stateMsg.version ?? null,
        hand: interpreted.hand,
        field: interpreted.field,
        handReliable: interpreted.handReliable,
        phase: effectivePhase,
        opponentPhase: interpreted.opponentPhase,
        inDuel: interpreted.inDuel,
        lp: interpreted.lp,
        stats: interpreted.stats,
        collection: computeOwnedCards(raw.trunk, raw.deckDefinition),
        deckDefinition: raw.deckDefinition,
        shuffledDeck: raw.shuffledDeck ?? null,
        modFingerprint: raw.modFingerprint ?? null,
        // Preserve game data — it arrives via a separate message
        gameData: currentState.gameData,
        gameDataError: currentState.gameDataError,
        opponentHand: interpreted.opponentHand,
        opponentField: interpreted.opponentField,
        cpuSwaps,
      },
      tracker: nextTracker,
      raw,
    };
  }

  if (stateMsg.connected && stateMsg.status === "waiting_for_game") {
    return {
      state: {
        ...INITIAL_BRIDGE_STATE,
        status: "connected",
        detail: "waiting_for_game",
        version: stateMsg.version ?? null,
      },
      tracker,
      raw: null,
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
      raw: null,
    };
  }

  return null;
}

// ── Hook ─────────────────────────────────────────────────────────────

const BRIDGE_URL = "ws://localhost:3333";
const RECONNECT_MS = 3_000;

/**
 * Connects to the emulator bridge WebSocket and returns live game state.
 * Automatically reconnects on disconnect.
 */
export function useEmulatorBridge(enabled = true): EmulatorBridge {
  const [state, setState] = useState<BridgeState>(INITIAL_BRIDGE_STATE);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const endedTrackerRef = useRef<EndedTracker>(INITIAL_ENDED_TRACKER);
  const prevRawRef = useRef<RawBridgeState | null>(null);

  const connect = useCallback(() => {
    if (!enabledRef.current) return;
    if (
      wsRef.current?.readyState === WebSocket.CONNECTING ||
      wsRef.current?.readyState === WebSocket.OPEN
    ) {
      return;
    }

    setState((s) => ({ ...s, status: "connecting" }));

    const ws = new WebSocket(BRIDGE_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setState((s) => ({ ...s, status: "connected" }));
    };

    ws.onmessage = (event) => {
      try {
        const msg: unknown = JSON.parse(event.data as string);
        setState((current) => {
          const result = processBridgeMessage(
            msg,
            current,
            endedTrackerRef.current,
            prevRawRef.current,
            Date.now(),
          );
          if (!result) return current;
          endedTrackerRef.current = result.tracker;
          prevRawRef.current = result.raw;
          return result.state;
        });
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      // Preserve `updating` flag so the UI shows "Updating…" during reconnect
      setState((prev) =>
        prev.updating ? { ...INITIAL_BRIDGE_STATE, updating: true } : INITIAL_BRIDGE_STATE,
      );
      if (enabledRef.current) {
        reconnectTimer.current = setTimeout(connect, RECONNECT_MS);
      }
    };

    ws.onerror = () => {
      // onclose will fire after onerror
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
      wsRef.current = null;
      setState(INITIAL_BRIDGE_STATE);
      return;
    }
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [enabled, connect]);

  const scan = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "scan" }));
    }
  }, []);

  const restartEmulator = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setState((s) => ({ ...s, restartFailed: false }));
      wsRef.current.send(JSON.stringify({ type: "restart_duckstation" }));
    }
  }, []);

  const updateAndRestart = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "update_and_restart" }));
    }
  }, []);

  return { ...state, scan, restartEmulator, updateAndRestart };
}
