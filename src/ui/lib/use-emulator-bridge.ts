import { useCallback, useEffect, useRef, useState } from "react";

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
  sceneId: number;
  duelPhase: number;
  turnIndicator: number;
  hand: RawCardSlot[];
  field: RawCardSlot[];
  lp: [number, number];
  fusions: number;
  terrain: number;
  duelistId: number;
  trunk: number[];
  deckDefinition: number[];
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
  inDuel: boolean;
  lp: [number, number];
  stats: DuelStats;
};

/**
 * Interpret raw bridge state into game-meaningful values.
 * Pure function — all game logic lives here, not in the bridge.
 */
export function interpretRawState(raw: RawBridgeState): InterpretedState {
  const hand = filterCardSlots(raw.hand);
  const field = filterFieldSlots(raw.field);

  const isPlayerTurn = raw.turnIndicator === 0;
  const phase = mapDuelPhase(raw.duelPhase, isPlayerTurn);
  const handReliable =
    isPlayerTurn &&
    (raw.duelPhase === PHASE_CLEANUP ||
      raw.duelPhase === PHASE_DRAW ||
      raw.duelPhase === PHASE_HAND_SELECT);

  // A recognized duel phase means we are in a duel, even if cards have not
  // been dealt yet (e.g. first DRAW).  The game always progresses through
  // DUEL_END / RESULTS at end-of-duel, which are excluded here, so
  // isDuelPhase reliably goes false when the duel ends.
  const isDuelPhase =
    raw.duelPhase === PHASE_INIT ||
    raw.duelPhase === PHASE_CLEANUP ||
    raw.duelPhase === PHASE_DRAW ||
    raw.duelPhase === PHASE_HAND_SELECT ||
    raw.duelPhase === PHASE_FIELD ||
    raw.duelPhase === PHASE_FUSION ||
    raw.duelPhase === PHASE_FUSION_RESOLVE ||
    raw.duelPhase === PHASE_BATTLE ||
    raw.duelPhase === PHASE_POST_BATTLE;
  const inDuel = isDuelPhase;

  return {
    hand,
    field,
    handReliable,
    phase,
    inDuel,
    lp: raw.lp,
    stats: { fusions: raw.fusions, terrain: raw.terrain, duelistId: raw.duelistId },
  };
}

function isActiveSlot(s: RawCardSlot): boolean {
  // Any non-zero status means the card is in an active state.
  // During battle the game temporarily clears the STATUS_PRESENT (0x80)
  // bit on the attacker while keeping other bits (e.g. 0x04 = face-up).
  // Truly empty slots always have status === 0x00.
  return s.cardId > 0 && s.cardId < 723 && s.status !== 0;
}

function filterCardSlots(slots: RawCardSlot[]): number[] {
  const result: number[] = [];
  for (const s of slots) {
    if (isActiveSlot(s)) result.push(s.cardId);
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

export type EmulatorBridge = {
  status: BridgeStatus;
  detail: BridgeDetail;
  detailMessage: string | null;
  version: string | null;
  hand: number[];
  field: FieldCard[];
  handReliable: boolean;
  phase: DuelPhase;
  inDuel: boolean;
  lp: [number, number] | null;
  stats: DuelStats | null;
  collection: Record<number, number> | null;
  deckDefinition: number[] | null;
  scan: () => void;
};

const BRIDGE_URL = "ws://localhost:3333";
const RECONNECT_MS = 3_000;

/**
 * Connects to the emulator bridge WebSocket and returns live game state.
 * Automatically reconnects on disconnect.
 */
export function useEmulatorBridge(enabled = true): EmulatorBridge {
  const [status, setStatus] = useState<BridgeStatus>("disconnected");
  const [detail, setDetail] = useState<BridgeDetail>("bridge_not_found");
  const [detailMessage, setDetailMessage] = useState<string | null>(null);
  const [version, setVersion] = useState<string | null>(null);
  const [hand, setHand] = useState<number[]>([]);
  const [field, setField] = useState<FieldCard[]>([]);
  const [handReliable, setHandReliable] = useState(false);
  const [phase, setPhase] = useState<DuelPhase>("other");
  const [inDuel, setInDuel] = useState(false);
  const [lp, setLp] = useState<[number, number] | null>(null);
  const [stats, setStats] = useState<DuelStats | null>(null);
  const [collection, setCollection] = useState<Record<number, number> | null>(null);
  const [deckDefinition, setDeckDefinition] = useState<number[] | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const endedTrackerRef = useRef<EndedTracker>(INITIAL_ENDED_TRACKER);

  const connect = useCallback(() => {
    if (!enabledRef.current) return;
    if (
      wsRef.current?.readyState === WebSocket.CONNECTING ||
      wsRef.current?.readyState === WebSocket.OPEN
    ) {
      return;
    }

    setStatus("connecting");

    const ws = new WebSocket(BRIDGE_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
    };

    ws.onmessage = (event) => {
      try {
        const msg: RawBridgeMessage = JSON.parse(event.data as string);
        if (msg.connected && msg.status === "ready") {
          // Full game state available
          setStatus("connected");
          setDetail("ready");
          setDetailMessage(null);
          setVersion(msg.version ?? null);
          const state = interpretRawState(msg);

          const { effectivePhase, tracker } = resolveEndedPhase(
            state,
            msg.sceneId,
            endedTrackerRef.current,
            Date.now(),
          );
          endedTrackerRef.current = tracker;

          setHand(state.hand);
          setField(state.field);
          setHandReliable(state.handReliable);
          setPhase(effectivePhase);
          setInDuel(state.inDuel);
          setLp(state.lp);
          setStats(state.stats);
          setCollection(computeOwnedCards(msg.trunk, msg.deckDefinition));
          setDeckDefinition(msg.deckDefinition);
        } else if (msg.connected && msg.status === "waiting_for_game") {
          // Bridge connected to DuckStation but game not loaded yet
          setStatus("connected");
          setDetail("waiting_for_game");
          setDetailMessage(null);
          setVersion(msg.version ?? null);
          setHand([]);
          setField([]);
          setHandReliable(false);
          setPhase("other");
          setInDuel(false);
          setLp(null);
          setStats(null);
          setCollection(null);
          setDeckDefinition(null);
        } else if (!msg.connected) {
          setStatus("connected");
          setDetail(
            msg.status === "no_emulator"
              ? "emulator_not_found"
              : msg.status === "no_shared_memory"
                ? "no_shared_memory"
                : "error",
          );
          setDetailMessage(msg.reason ?? null);
          setVersion(msg.version ?? null);
          setHand([]);
          setField([]);
          setHandReliable(false);
          setPhase("other");
          setInDuel(false);
          setLp(null);
          setStats(null);
          setCollection(null);
          setDeckDefinition(null);
        }
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      setStatus("disconnected");
      setDetail("bridge_not_found");
      setDetailMessage(null);
      setVersion(null);
      setHand([]);
      setField([]);
      setHandReliable(false);
      setPhase("other");
      setInDuel(false);
      setLp(null);
      setStats(null);
      setCollection(null);
      setDeckDefinition(null);
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
      setStatus("disconnected");
      setDetail("bridge_not_found");
      setDetailMessage(null);
      setVersion(null);
      setHand([]);
      setField([]);
      setHandReliable(false);
      setPhase("other");
      setInDuel(false);
      setLp(null);
      setStats(null);
      setCollection(null);
      setDeckDefinition(null);
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

  return {
    status,
    detail,
    detailMessage,
    version,
    hand,
    field,
    handReliable,
    phase,
    inDuel,
    lp,
    stats,
    collection,
    deckDefinition,
    scan,
  };
}
