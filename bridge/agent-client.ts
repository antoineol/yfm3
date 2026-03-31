/**
 * Agent client for controlling a PS1 game through the bridge WebSocket.
 *
 * Provides an async API for AI agents to:
 *   - Send PS1 controller inputs (tap, hold)
 *   - Load save states by slot
 *   - Observe game state and wait for specific conditions
 *
 * Usage:
 *   const agent = createAgentClient("ws://localhost:3333");
 *   await agent.connect();
 *   await agent.tap("cross");
 *   await agent.waitForPhase("hand");
 *   const state = agent.state;
 *   await agent.loadState(1);
 *   agent.disconnect();
 */

import type { Ps1Button } from "./input.ts";

// ── Types ────────────────────────────────────────────────────────

export type DuelPhase =
  | "hand"
  | "draw"
  | "field"
  | "fusion"
  | "battle"
  | "opponent"
  | "ended"
  | "other"
  | null;

export interface CardSlot {
  cardId: number;
  atk: number;
  def: number;
  status: number;
}

export interface AgentGameState {
  connected: boolean;
  status: string;
  pid: number | null;
  modFingerprint: string | null;
  gameSerial: string | null;
  sceneId: number | null;
  duelPhase: number | null;
  turnIndicator: number | null;
  hand: CardSlot[];
  field: CardSlot[];
  opponentHand: CardSlot[];
  opponentField: CardSlot[];
  lp: [number, number] | null;
  fusions: number | null;
  terrain: number | null;
  duelistId: number | null;
  handSlots: number[] | null;
  shuffledDeck: number[];
  trunk: number[];
  deckDefinition: number[];
  cpuShuffledDeck: number[];
  duelistUnlock: number[];
  rankCounters: number[] | null;
}

export interface CommandResult {
  type: string;
  success: boolean;
  error?: string;
}

type StateListener = (state: AgentGameState) => void;

// ── Phase mapping (mirrors use-emulator-bridge.ts logic) ────────

const PHASE_MAP: Record<number, DuelPhase> = {
  1: "draw",
  2: "draw",
  3: "draw",
  4: "hand",
  5: "field",
  7: "fusion",
  8: "fusion",
  9: "battle",
  10: "battle",
  12: "ended",
  13: "ended",
};

function mapPhase(raw: number | null, turn: number | null): DuelPhase {
  if (raw === null) return null;
  const base = PHASE_MAP[raw] ?? "other";
  if (turn === 1 && base !== "ended") return "opponent";
  return base;
}

// ── Agent Client ────────────────────────────────────────────────

export interface AgentClient {
  /** Current game state snapshot. */
  readonly state: AgentGameState | null;
  /** Current mapped duel phase. */
  readonly phase: DuelPhase;
  /** Whether the WebSocket is connected. */
  readonly connected: boolean;

  /** Connect to the bridge WebSocket. */
  connect(): Promise<void>;
  /** Disconnect from the bridge. */
  disconnect(): void;

  /** Tap a PS1 button (press and release). */
  tap(button: Ps1Button): Promise<CommandResult>;
  /** Hold a PS1 button for a duration in ms. */
  hold(button: Ps1Button, ms: number): Promise<CommandResult>;
  /** Load a save state by slot (1–8). */
  loadState(slot: number): Promise<CommandResult>;

  /** Wait until the duel phase matches. Rejects on timeout. */
  waitForPhase(phase: DuelPhase, timeoutMs?: number): Promise<AgentGameState>;
  /** Wait until a predicate is true on the game state. Rejects on timeout. */
  waitFor(
    predicate: (state: AgentGameState) => boolean,
    timeoutMs?: number,
  ): Promise<AgentGameState>;

  /** Register a listener for state updates. Returns unsubscribe function. */
  onStateChange(listener: StateListener): () => void;
}

const DEFAULT_TIMEOUT_MS = 30_000;

export function createAgentClient(url = "ws://localhost:3333"): AgentClient {
  let ws: WebSocket | null = null;
  let currentState: AgentGameState | null = null;
  const listeners = new Set<StateListener>();
  const pendingCommands = new Map<string, { resolve: (r: CommandResult) => void }>();

  function notifyListeners(state: AgentGameState): void {
    for (const listener of listeners) {
      listener(state);
    }
  }

  function handleMessage(data: string): void {
    try {
      const msg = JSON.parse(data);

      // Command results
      if (msg.type === "input_result" || msg.type === "loadState_result") {
        const pending = pendingCommands.get(msg.type);
        if (pending) {
          pendingCommands.delete(msg.type);
          pending.resolve(msg as CommandResult);
        }
        return;
      }

      // Game data messages (separate channel, skip for now)
      if (
        msg.type === "gameData" ||
        msg.type === "update_staged" ||
        msg.type === "update_restart_ack"
      ) {
        return;
      }

      // State broadcast
      if ("connected" in msg) {
        currentState = msg as AgentGameState;
        notifyListeners(currentState);
      }
    } catch {
      // ignore invalid JSON
    }
  }

  function sendCommand(type: string, payload: Record<string, unknown>): Promise<CommandResult> {
    return new Promise((resolve, reject) => {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        reject(new Error("Not connected to bridge"));
        return;
      }
      const resultType = `${type}_result`;
      pendingCommands.set(resultType, { resolve });
      ws.send(JSON.stringify({ type, ...payload }));

      // Timeout for command response
      setTimeout(() => {
        if (pendingCommands.has(resultType)) {
          pendingCommands.delete(resultType);
          resolve({ type: resultType, success: false, error: "Command timed out" });
        }
      }, 5000);
    });
  }

  const client: AgentClient = {
    get state() {
      return currentState;
    },

    get phase(): DuelPhase {
      if (!currentState) return null;
      return mapPhase(currentState.duelPhase, currentState.turnIndicator);
    },

    get connected() {
      return ws?.readyState === WebSocket.OPEN;
    },

    connect(): Promise<void> {
      return new Promise((resolve, reject) => {
        if (ws) {
          ws.close();
        }
        ws = new WebSocket(url);

        ws.onopen = () => {
          console.log(`Agent connected to bridge at ${url}`);
          resolve();
        };

        ws.onerror = (event) => {
          reject(new Error(`WebSocket error: ${event}`));
        };

        ws.onmessage = (event) => {
          handleMessage(String(event.data));
        };

        ws.onclose = () => {
          console.log("Agent disconnected from bridge");
          ws = null;
        };
      });
    },

    disconnect(): void {
      if (ws) {
        ws.close();
        ws = null;
      }
    },

    tap(button: Ps1Button): Promise<CommandResult> {
      return sendCommand("input", { button });
    },

    hold(button: Ps1Button, ms: number): Promise<CommandResult> {
      return sendCommand("input", { button, hold: ms });
    },

    loadState(slot: number): Promise<CommandResult> {
      return sendCommand("loadState", { slot });
    },

    waitForPhase(phase: DuelPhase, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<AgentGameState> {
      return client.waitFor((s) => mapPhase(s.duelPhase, s.turnIndicator) === phase, timeoutMs);
    },

    waitFor(
      predicate: (state: AgentGameState) => boolean,
      timeoutMs = DEFAULT_TIMEOUT_MS,
    ): Promise<AgentGameState> {
      // Check current state first
      if (currentState && predicate(currentState)) {
        return Promise.resolve(currentState);
      }

      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          unsubscribe();
          reject(new Error(`waitFor timed out after ${timeoutMs}ms`));
        }, timeoutMs);

        const listener = (state: AgentGameState) => {
          if (predicate(state)) {
            clearTimeout(timer);
            unsubscribe();
            resolve(state);
          }
        };

        listeners.add(listener);
        const unsubscribe = () => listeners.delete(listener);
      });
    },

    onStateChange(listener: StateListener): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };

  return client;
}
