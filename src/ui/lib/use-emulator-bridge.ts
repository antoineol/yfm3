import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type BridgeState,
  type EmulatorBridge,
  type EndedTracker,
  INITIAL_BRIDGE_STATE,
  INITIAL_ENDED_TRACKER,
  processBridgeMessage,
} from "./bridge-message-processor.ts";

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
          const result = processBridgeMessage(msg, current, endedTrackerRef.current, Date.now());
          if (!result) return current;
          endedTrackerRef.current = result.tracker;
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
