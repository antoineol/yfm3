import { useCallback, useEffect, useRef, useState } from "react";

/** Duel phase labels from the bridge. */
export type DuelPhase = "hand" | "draw" | "fusion" | "field" | "battle" | "opponent" | "other";

export type DuelStats = {
  fusions: number;
  terrain: number;
  duelistId: number;
};

/** Game state received from the bridge WebSocket server. */
type BridgeGameState = {
  connected: true;
  pid: number;
  inDuel: boolean;
  sceneId: number;
  hand: number[];
  field: number[];
  lp: [number, number];
  handReliable: boolean;
  phase: DuelPhase;
  stats: DuelStats;
};

type BridgeDisconnected = {
  connected: false;
  reason?: string;
};

type BridgeMessage = BridgeGameState | BridgeDisconnected;

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
  scan: () => void;
};

const BRIDGE_URL = "ws://localhost:3333";
const RECONNECT_MS = 3_000;

/**
 * Connects to the emulator bridge WebSocket and returns live game state.
 * Automatically reconnects on disconnect.
 */
export function useEmulatorBridge(): EmulatorBridge {
  const [status, setStatus] = useState<BridgeStatus>("disconnected");
  const [hand, setHand] = useState<number[]>([]);
  const [field, setField] = useState<number[]>([]);
  const [handReliable, setHandReliable] = useState(false);
  const [phase, setPhase] = useState<DuelPhase>("other");
  const [inDuel, setInDuel] = useState(false);
  const [lp, setLp] = useState<[number, number] | null>(null);
  const [stats, setStats] = useState<DuelStats | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const connect = useCallback(() => {
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
        const msg: BridgeMessage = JSON.parse(event.data as string);
        if (msg.connected) {
          setStatus("connected");
          setHand(msg.hand.filter((id) => id > 0 && id < 723));
          setField(msg.field.filter((id) => id > 0 && id < 723));
          setHandReliable(msg.handReliable);
          setPhase(msg.phase);
          setInDuel(msg.inDuel);
          setLp(msg.lp);
          setStats(msg.stats);
        } else {
          setStatus("connected");
          setHand([]);
          setField([]);
          setHandReliable(false);
          setPhase("other");
          setInDuel(false);
          setLp(null);
          setStats(null);
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
      reconnectTimer.current = setTimeout(connect, RECONNECT_MS);
    };

    ws.onerror = () => {
      // onclose will fire after onerror
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);

  const scan = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "scan" }));
    }
  }, []);

  return { status, hand, field, handReliable, phase, inDuel, lp, stats, scan };
}
