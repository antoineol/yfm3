import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  type AgentClient,
  type AgentGameState,
  createAgentClient,
} from "../../bridge/agent-client.ts";

// ── Mock WebSocket ──────────────────────────────────────────────

class MockWebSocket {
  static OPEN = 1;
  static CLOSED = 3;

  readyState = MockWebSocket.OPEN;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;

  sent: string[] = [];

  constructor(_url: string) {
    // Simulate async open
    setTimeout(() => this.onopen?.(), 0);
  }

  send(data: string): void {
    this.sent.push(data);
  }

  close(): void {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.();
  }

  // Test helper: simulate server message
  _receive(data: unknown): void {
    this.onmessage?.({ data: JSON.stringify(data) });
  }
}

let mockWs: MockWebSocket | null = null;

function ws(): MockWebSocket {
  if (!mockWs) throw new Error("MockWebSocket not initialized");
  return mockWs;
}

beforeEach(() => {
  vi.stubGlobal(
    "WebSocket",
    class extends MockWebSocket {
      constructor(url: string) {
        super(url);
        mockWs = this;
      }
    },
  );
});

afterEach(() => {
  mockWs = null;
  vi.restoreAllMocks();
});

function makeState(overrides: Partial<AgentGameState> = {}): AgentGameState {
  return {
    connected: true,
    status: "ready",
    pid: 1234,
    modFingerprint: "abc",
    gameSerial: "SLUS_014.11",
    sceneId: 100,
    duelPhase: 0x04,
    turnIndicator: 0,
    hand: [],
    field: [],
    opponentHand: [],
    opponentField: [],
    lp: [8000, 8000],
    fusions: 0,
    terrain: 0,
    duelistId: 5,
    handSlots: null,
    shuffledDeck: [],
    trunk: [],
    deckDefinition: [],
    cpuShuffledDeck: [],
    duelistUnlock: [],
    rankCounters: null,
    ...overrides,
  };
}

describe("createAgentClient", () => {
  let client: AgentClient;

  beforeEach(async () => {
    client = createAgentClient("ws://localhost:3333");
    await client.connect();
  });

  afterEach(() => {
    client.disconnect();
  });

  it("connects to the bridge", () => {
    expect(client.connected).toBe(true);
  });

  it("receives and stores game state", () => {
    const state = makeState({ duelPhase: 0x04 });
    ws()._receive(state);
    expect(client.state).toEqual(state);
  });

  it("maps duel phase correctly", () => {
    ws()._receive(makeState({ duelPhase: 0x04, turnIndicator: 0 }));
    expect(client.phase).toBe("hand");

    ws()._receive(makeState({ duelPhase: 0x09, turnIndicator: 0 }));
    expect(client.phase).toBe("battle");

    ws()._receive(makeState({ duelPhase: 0x05, turnIndicator: 1 }));
    expect(client.phase).toBe("opponent");

    ws()._receive(makeState({ duelPhase: 0x0c, turnIndicator: 0 }));
    expect(client.phase).toBe("ended");

    ws()._receive(makeState({ duelPhase: 0x0c, turnIndicator: 1 }));
    expect(client.phase).toBe("ended");
  });

  it("returns null phase when no state", () => {
    const fresh = createAgentClient();
    expect(fresh.phase).toBeNull();
  });

  it("sends tap command", async () => {
    const tapPromise = client.tap("cross");

    // Verify message was sent
    expect(ws().sent).toHaveLength(1);
    const sent = JSON.parse(ws().sent[0] ?? "");
    expect(sent).toEqual({ type: "input", button: "cross" });

    // Simulate server response
    ws()._receive({ type: "input_result", success: true });

    const result = await tapPromise;
    expect(result.success).toBe(true);
  });

  it("sends hold command with duration", async () => {
    const holdPromise = client.hold("up", 500);

    const sent = JSON.parse(ws().sent[0] ?? "");
    expect(sent).toEqual({ type: "input", button: "up", hold: 500 });

    ws()._receive({ type: "input_result", success: true });
    const result = await holdPromise;
    expect(result.success).toBe(true);
  });

  it("sends loadState command", async () => {
    const loadPromise = client.loadState(3);

    const sent = JSON.parse(ws().sent[0] ?? "");
    expect(sent).toEqual({ type: "loadState", slot: 3 });

    ws()._receive({ type: "loadState_result", success: true });
    const result = await loadPromise;
    expect(result.success).toBe(true);
  });

  it("waitForPhase resolves immediately if already in phase", async () => {
    ws()._receive(makeState({ duelPhase: 0x04, turnIndicator: 0 }));
    const state = await client.waitForPhase("hand", 100);
    expect(state.duelPhase).toBe(0x04);
  });

  it("waitForPhase waits for phase change", async () => {
    ws()._receive(makeState({ duelPhase: 0x04, turnIndicator: 0 }));

    const promise = client.waitForPhase("battle", 1000);

    // Simulate phase change
    setTimeout(() => {
      ws()._receive(makeState({ duelPhase: 0x09, turnIndicator: 0 }));
    }, 10);

    const state = await promise;
    expect(state.duelPhase).toBe(0x09);
  });

  it("waitForPhase rejects on timeout", async () => {
    ws()._receive(makeState({ duelPhase: 0x04, turnIndicator: 0 }));
    await expect(client.waitForPhase("battle", 50)).rejects.toThrow("timed out");
  });

  it("waitFor with custom predicate", async () => {
    ws()._receive(makeState({ lp: [8000, 8000] }));

    const promise = client.waitFor((s) => s.lp !== null && s.lp[1] < 5000, 1000);

    setTimeout(() => {
      ws()._receive(makeState({ lp: [8000, 3000] }));
    }, 10);

    const state = await promise;
    expect(state.lp?.[1]).toBe(3000);
  });

  it("onStateChange listener fires on state updates", () => {
    const states: AgentGameState[] = [];
    const unsub = client.onStateChange((s) => states.push(s));

    ws()._receive(makeState({ duelPhase: 0x04 }));
    ws()._receive(makeState({ duelPhase: 0x09 }));

    expect(states).toHaveLength(2);
    expect(states[0]?.duelPhase).toBe(0x04);
    expect(states[1]?.duelPhase).toBe(0x09);

    unsub();
    ws()._receive(makeState({ duelPhase: 0x0c }));
    expect(states).toHaveLength(2); // no more events
  });

  it("ignores gameData messages", () => {
    ws()._receive({ type: "gameData", cards: [] });
    expect(client.state).toBeNull();
  });
});
