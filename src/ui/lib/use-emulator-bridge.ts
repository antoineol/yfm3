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

type RawCardSlot = { cardId: number; status: number };

type RawBridgeState = {
  connected: true;
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

type BridgeDisconnected = {
  connected: false;
  reason?: string;
};

type RawBridgeMessage = RawBridgeState | BridgeDisconnected;

// ── Duel phase bytes ─────────────────────────────────────────────────

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

// ── Interpretation logic (pure, testable) ────────────────────────────

type InterpretedState = {
  hand: number[];
  field: number[];
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
  const field = filterCardSlots(raw.field);

  const isPlayerTurn = raw.turnIndicator === 0;
  const phase = mapDuelPhase(raw.duelPhase, isPlayerTurn);
  const handReliable =
    isPlayerTurn &&
    (raw.duelPhase === PHASE_CLEANUP ||
      raw.duelPhase === PHASE_DRAW ||
      raw.duelPhase === PHASE_HAND_SELECT);

  // Hand/field RAM retains stale card data after a duel ends, so card
  // presence alone is not reliable. Require a recognized duel phase too.
  const isDuelPhase =
    raw.duelPhase === PHASE_CLEANUP ||
    raw.duelPhase === PHASE_DRAW ||
    raw.duelPhase === PHASE_HAND_SELECT ||
    raw.duelPhase === PHASE_FIELD ||
    raw.duelPhase === PHASE_FUSION ||
    raw.duelPhase === PHASE_FUSION_RESOLVE ||
    raw.duelPhase === PHASE_BATTLE ||
    raw.duelPhase === PHASE_POST_BATTLE;
  const inDuel = isDuelPhase && (hand.length > 0 || field.length > 0);

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

function filterCardSlots(slots: RawCardSlot[]): number[] {
  const result: number[] = [];
  for (const s of slots) {
    // Any non-zero status means the card is in an active state.
    // During battle the game temporarily clears the STATUS_PRESENT (0x80)
    // bit on the attacker while keeping other bits (e.g. 0x04 = face-up).
    // Truly empty slots always have status === 0x00.
    if (s.cardId > 0 && s.cardId < 723 && s.status !== 0) {
      result.push(s.cardId);
    }
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
  if (!isPlayerTurn) return "opponent";
  if (duelPhase === PHASE_HAND_SELECT) return "hand";
  if (duelPhase === PHASE_DRAW || duelPhase === PHASE_CLEANUP) return "draw";
  if (duelPhase === PHASE_FUSION || duelPhase === PHASE_FUSION_RESOLVE) return "fusion";
  if (duelPhase === PHASE_FIELD) return "field";
  if (duelPhase === PHASE_BATTLE) return "battle";
  return "other";
}

// ── Public hook types ────────────────────────────────────────────────

export type BridgeStatus = "disconnected" | "connecting" | "connected";

export type EmulatorBridge = {
  status: BridgeStatus;
  hand: number[];
  field: number[];
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
  const [hand, setHand] = useState<number[]>([]);
  const [field, setField] = useState<number[]>([]);
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
        if (msg.connected) {
          setStatus("connected");
          const state = interpretRawState(msg);
          setHand(state.hand);
          setField(state.field);
          setHandReliable(state.handReliable);
          setPhase(state.phase);
          setInDuel(state.inDuel);
          setLp(state.lp);
          setStats(state.stats);
          setCollection(computeOwnedCards(msg.trunk, msg.deckDefinition));
          setDeckDefinition(msg.deckDefinition);
        } else {
          setStatus("connected");
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
