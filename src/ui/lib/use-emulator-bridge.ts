import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type BridgeState,
  type BridgeTracker,
  type EmulatorBridge,
  INITIAL_BRIDGE_STATE,
  INITIAL_BRIDGE_TRACKER,
  processBridgeMessage,
} from "./bridge-message-processor.ts";

const BRIDGE_URL = "ws://localhost:3333";
const RECONNECT_MS = 500;
const RECONNECT_GRACE_MS = 15_000;
const GAME_DATA_REQUEST_MS = 3_000;

export function bridgeStateAfterSocketClose(prev: BridgeState): BridgeState {
  if (prev.updating) return { ...INITIAL_BRIDGE_STATE, updating: true };
  if (canKeepBridgeStateDuringReconnect(prev)) return { ...prev, status: "connecting" };
  return INITIAL_BRIDGE_STATE;
}

export function shouldStartReconnectGrace(prev: BridgeState, next: BridgeState): boolean {
  return prev.status !== "connecting" && next.status === "connecting" && next.detail === "ready";
}

function canKeepBridgeStateDuringReconnect(state: BridgeState): boolean {
  return state.detail === "ready" && state.gameData !== null;
}

/**
 * Connects to the emulator bridge WebSocket and returns live game state.
 * Automatically reconnects on disconnect.
 */
export function useEmulatorBridge(enabled = true): EmulatorBridge {
  const [state, setState] = useState<BridgeState>(INITIAL_BRIDGE_STATE);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reconnectGraceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const bridgeTrackerRef = useRef<BridgeTracker>(INITIAL_BRIDGE_TRACKER);

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
      clearTimeout(reconnectGraceTimer.current);
      setState((s) => ({ ...s, status: "connected" }));
    };

    ws.onmessage = (event) => {
      try {
        const msg: unknown = JSON.parse(event.data as string);
        setState((current) => {
          const result = processBridgeMessage(msg, current, bridgeTrackerRef.current, Date.now());
          if (!result) return current;
          bridgeTrackerRef.current = result.tracker;
          return result.state;
        });
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      bridgeTrackerRef.current = INITIAL_BRIDGE_TRACKER;
      // Keep the last usable snapshot through bridge live-reload, but fall
      // back to setup if the bridge really stays down.
      setState((prev) => {
        const next = bridgeStateAfterSocketClose(prev);
        if (shouldStartReconnectGrace(prev, next)) {
          clearTimeout(reconnectGraceTimer.current);
          reconnectGraceTimer.current = setTimeout(() => {
            setState((current) =>
              current.status === "connecting" && current.detail === "ready"
                ? INITIAL_BRIDGE_STATE
                : current,
            );
          }, RECONNECT_GRACE_MS);
        }
        return next;
      });
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
      clearTimeout(reconnectGraceTimer.current);
      wsRef.current?.close();
      wsRef.current = null;
      bridgeTrackerRef.current = INITIAL_BRIDGE_TRACKER;
      setState(INITIAL_BRIDGE_STATE);
      return;
    }
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      clearTimeout(reconnectGraceTimer.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [enabled, connect]);

  const scan = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "scan" }));
    }
  }, []);

  const requestGameData = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "request_game_data" }));
    }
  }, []);

  useEffect(() => {
    if (
      !enabled ||
      state.status !== "connected" ||
      state.detail !== "ready" ||
      state.gameData ||
      state.gameDataError
    ) {
      return;
    }

    requestGameData();
    const timer = setInterval(requestGameData, GAME_DATA_REQUEST_MS);
    return () => clearInterval(timer);
  }, [enabled, requestGameData, state.detail, state.gameData, state.gameDataError, state.status]);

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

  const stageUpdate = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "stage_update" }));
    }
  }, []);

  // React Compiler silently bails out on this hook (likely because of the
  // mutable-ref assignments above), so we memoize the return explicitly.
  // Without this, every `state` update returns a fresh object and defeats
  // the per-slice ref stability established in `processBridgeMessage`.
  return useMemo(
    () => ({ ...state, scan, restartEmulator, updateAndRestart, stageUpdate }),
    [state, scan, restartEmulator, updateAndRestart, stageUpdate],
  );
}
