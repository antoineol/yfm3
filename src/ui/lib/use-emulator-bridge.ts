import { useCallback, useEffect, useRef, useState } from "react";

/** Game state received from the bridge WebSocket server. */
export type BridgeGameState = {
  connected: true;
  pid: number;
  inDuel: boolean;
  sceneId: number;
  /** 5 card IDs (0 = empty slot). */
  hand: number[];
  /** 5 card IDs (0 = empty slot). */
  field: number[];
  /** [player LP, opponent LP]. */
  lp: [number, number];
};

type BridgeDisconnected = {
  connected: false;
  reason?: string;
};

type BridgeMessage = BridgeGameState | BridgeDisconnected;

export type BridgeStatus = "disconnected" | "connecting" | "connected";

export type EmulatorBridge = {
  status: BridgeStatus;
  /** Non-zero card IDs currently in the player's hand. */
  hand: number[];
  /** Whether the game is currently in a duel scene. */
  inDuel: boolean;
  /** [player LP, opponent LP], or null if not in duel. */
  lp: [number, number] | null;
  /** Request the bridge to re-scan for DuckStation. */
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
  const [inDuel, setInDuel] = useState(false);
  const [lp, setLp] = useState<[number, number] | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const connect = useCallback(() => {
    // Don't connect if already connecting/connected
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
          setInDuel(msg.inDuel);
          setLp(msg.lp);
        } else {
          // Bridge is connected but DuckStation isn't
          setStatus("connected");
          setHand([]);
          setInDuel(false);
          setLp(null);
        }
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      setStatus("disconnected");
      setHand([]);
      setInDuel(false);
      setLp(null);
      // Schedule reconnect
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

  return { status, hand, inDuel, lp, scan };
}
