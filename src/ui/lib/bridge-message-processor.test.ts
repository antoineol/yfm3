import { describe, expect, it } from "vitest";
import {
  type BridgeState,
  ENDED_STALE_MS,
  type EndedTracker,
  INITIAL_BRIDGE_STATE,
  INITIAL_ENDED_TRACKER,
  processBridgeMessage,
  resolveEndedPhase,
} from "./bridge-message-processor.ts";

function makeRaw(overrides: Record<string, unknown> = {}) {
  return {
    connected: true as const,
    pid: 1234,
    sceneId: 0,
    duelPhase: 0x04, // hand select
    turnIndicator: 0, // player's turn
    hand: [
      { cardId: 100, atk: 1200, def: 800, status: 0x80 },
      { cardId: 200, atk: 1500, def: 1000, status: 0x80 },
      { cardId: 300, atk: 900, def: 700, status: 0x80 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
    ],
    field: [
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
    ],
    lp: [8000, 8000] as [number, number],
    fusions: 0,
    terrain: 0,
    duelistId: 5,
    handSlots: [0, 1, 2, 3, 4],
    shuffledDeck: new Array(40).fill(0) as number[],
    trunk: new Array(722).fill(0) as number[],
    deckDefinition: new Array(40).fill(0) as number[],
    opponentHand: [
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
    ],
    opponentField: [
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
    ],
    opponentHandSlots: null,
    cpuShuffledDeck: new Array(40).fill(0) as number[],
    ...overrides,
  };
}

describe("resolveEndedPhase", () => {
  const T = 1_000_000;

  function initial(): EndedTracker {
    return { ...INITIAL_ENDED_TRACKER };
  }

  it("passes through in-duel phases and resets tracker", () => {
    const { effectivePhase, tracker } = resolveEndedPhase(
      { inDuel: true, phase: "hand" },
      42,
      { sceneId: 10, sceneLeft: true, at: T, wasInDuel: false },
      T + 1000,
    );
    expect(effectivePhase).toBe("hand");
    expect(tracker).toEqual({ sceneId: null, sceneLeft: false, at: null, wasInDuel: true });
  });

  it("passes through non-ended out-of-duel phases, preserving tracker", () => {
    const prev: EndedTracker = { sceneId: 10, sceneLeft: false, at: T, wasInDuel: false };
    const { effectivePhase, tracker } = resolveEndedPhase(
      { inDuel: false, phase: "other" },
      42,
      prev,
      T + 1000,
    );
    expect(effectivePhase).toBe("other");
    expect(tracker.sceneId).toBe(10);
    expect(tracker.wasInDuel).toBe(false);
  });

  it("marks genuine 'ended' on duel-exit transition", () => {
    const { effectivePhase, tracker } = resolveEndedPhase(
      { inDuel: false, phase: "ended" },
      42,
      { ...initial(), wasInDuel: true },
      T,
    );
    expect(effectivePhase).toBe("ended");
    expect(tracker).toEqual({ sceneId: 42, sceneLeft: false, at: T, wasInDuel: false });
  });

  it("keeps 'ended' while still on the same scene within time limit", () => {
    const { effectivePhase } = resolveEndedPhase(
      { inDuel: false, phase: "ended" },
      42,
      { sceneId: 42, sceneLeft: false, at: T, wasInDuel: false },
      T + 5000,
    );
    expect(effectivePhase).toBe("ended");
  });

  it("overrides to 'other' when sceneId changes", () => {
    const { effectivePhase, tracker } = resolveEndedPhase(
      { inDuel: false, phase: "ended" },
      99,
      { sceneId: 42, sceneLeft: false, at: T, wasInDuel: false },
      T + 5000,
    );
    expect(effectivePhase).toBe("other");
    expect(tracker.sceneLeft).toBe(true);
  });

  it("stays 'other' once scene was left, even if sceneId returns to original", () => {
    const { effectivePhase } = resolveEndedPhase(
      { inDuel: false, phase: "ended" },
      42,
      { sceneId: 42, sceneLeft: true, at: T, wasInDuel: false },
      T + 5000,
    );
    expect(effectivePhase).toBe("other");
  });

  it("overrides to 'other' when no duel was observed this session", () => {
    const { effectivePhase } = resolveEndedPhase(
      { inDuel: false, phase: "ended" },
      42,
      initial(),
      T,
    );
    expect(effectivePhase).toBe("other");
  });

  it("overrides to 'other' after time expires even on same scene", () => {
    const { effectivePhase } = resolveEndedPhase(
      { inDuel: false, phase: "ended" },
      42,
      { sceneId: 42, sceneLeft: false, at: T, wasInDuel: false },
      T + ENDED_STALE_MS + 1,
    );
    expect(effectivePhase).toBe("other");
  });

  it("keeps 'ended' just before time expires", () => {
    const { effectivePhase } = resolveEndedPhase(
      { inDuel: false, phase: "ended" },
      42,
      { sceneId: 42, sceneLeft: false, at: T, wasInDuel: false },
      T + ENDED_STALE_MS - 1,
    );
    expect(effectivePhase).toBe("ended");
  });
});

// ── processBridgeMessage ─────────────────────────────────────────────

describe("processBridgeMessage", () => {
  const T = 1_000_000;
  const tracker = { ...INITIAL_ENDED_TRACKER };

  function readyMsg(overrides: Record<string, unknown> = {}) {
    return {
      connected: true,
      status: "ready",
      version: "1.2.0",
      pid: 1234,
      modFingerprint: "abc123",
      sceneId: 5,
      duelPhase: 0x04,
      turnIndicator: 0,
      lp: [8000, 8000],
      fusions: 0,
      terrain: 0,
      duelistId: 5,
      handSlots: [0, 1, 2, 3, 4],
      hand: [
        { cardId: 100, atk: 1200, def: 800, status: 0x80 },
        { cardId: 200, atk: 1500, def: 1000, status: 0x80 },
        { cardId: 0, atk: 0, def: 0, status: 0 },
        { cardId: 0, atk: 0, def: 0, status: 0 },
        { cardId: 0, atk: 0, def: 0, status: 0 },
      ],
      field: [
        { cardId: 0, atk: 0, def: 0, status: 0 },
        { cardId: 0, atk: 0, def: 0, status: 0 },
        { cardId: 0, atk: 0, def: 0, status: 0 },
        { cardId: 0, atk: 0, def: 0, status: 0 },
        { cardId: 0, atk: 0, def: 0, status: 0 },
      ],
      shuffledDeck: new Array(40).fill(0),
      trunk: new Array(722).fill(0),
      deckDefinition: new Array(40).fill(0),
      ...overrides,
    };
  }

  /** State with some non-default values to verify resets. */
  function dirtyState(): BridgeState {
    return {
      ...INITIAL_BRIDGE_STATE,
      status: "connected",
      detail: "ready",
      hand: [1, 2, 3],
      modFingerprint: "old",
      gameData: {
        cards: [],
        duelists: [],
        fusionTable: [],
        equipTable: [],
        equipBonuses: null,
        perEquipBonuses: null,
        deckLimits: null,
        fieldBonusTable: null,
        artworkKey: "old-key",
      },
      gameDataError: null,
      restartFailed: true,
    };
  }

  /** Helper that calls processBridgeMessage and asserts non-null. */
  function process(
    msg: unknown,
    current: BridgeState = INITIAL_BRIDGE_STATE,
    t: EndedTracker = tracker,
  ) {
    const result = processBridgeMessage(msg, current, t, T);
    expect(result).not.toBeNull();
    // Safe after the assertion above
    return result as Exclude<typeof result, null>;
  }

  it("returns null for non-object messages", () => {
    expect(processBridgeMessage(null, INITIAL_BRIDGE_STATE, tracker, T)).toBeNull();
    expect(processBridgeMessage("string", INITIAL_BRIDGE_STATE, tracker, T)).toBeNull();
    expect(processBridgeMessage(42, INITIAL_BRIDGE_STATE, tracker, T)).toBeNull();
  });

  it("returns null for unrecognized message shapes", () => {
    // { connected: true } but neither "ready" nor "waiting_for_game"
    const msg = { connected: true, status: "unknown_status", pid: 1 };
    expect(processBridgeMessage(msg, INITIAL_BRIDGE_STATE, tracker, T)).toBeNull();
  });

  describe("ready message", () => {
    it("populates full state from a ready message", () => {
      const { state: s } = process(readyMsg());
      expect(s.status).toBe("connected");
      expect(s.detail).toBe("ready");
      expect(s.version).toBe("1.2.0");
      expect(s.hand).toEqual([100, 200]);
      expect(s.modFingerprint).toBe("abc123");
      expect(s.inDuel).toBe(true);
      expect(s.phase).toBe("hand");
      expect(s.lp).toEqual([8000, 8000]);
    });

    it("preserves existing gameData (arrives via separate message)", () => {
      const prev = dirtyState();
      const { state: s } = process(readyMsg(), prev);
      expect(s.gameData).toBe(prev.gameData);
      expect(s.gameDataError).toBe(prev.gameDataError);
    });

    it("preserves updateStaged flag (arrives via separate message)", () => {
      const prev = { ...dirtyState(), updateStaged: true };
      const { state: s } = process(readyMsg(), prev);
      expect(s.updateStaged).toBe(true);
    });

    it("resets game fields not present in the message", () => {
      const { state: s } = process(readyMsg(), dirtyState());
      expect(s.restartFailed).toBe(false);
      expect(s.settingsPatched).toBe(false);
    });
  });

  describe("waiting_for_game message", () => {
    const msg = { connected: true, status: "waiting_for_game", version: "1.2.0", pid: 1 };

    it("resets game state while keeping connection info", () => {
      const { state: s } = process(msg, dirtyState());
      expect(s.status).toBe("connected");
      expect(s.detail).toBe("waiting_for_game");
      expect(s.version).toBe("1.2.0");
      // Game state fully reset
      expect(s.hand).toEqual([]);
      expect(s.modFingerprint).toBeNull();
      expect(s.collection).toBeNull();
      expect(s.gameData).toBeNull();
      expect(s.restartFailed).toBe(false);
    });

    it("preserves updateStaged flag", () => {
      const prev = { ...dirtyState(), updateStaged: true };
      const { state: s } = process(msg, prev);
      expect(s.updateStaged).toBe(true);
    });
  });

  describe("disconnected message (bridge sees no emulator)", () => {
    it("maps no_emulator status correctly", () => {
      const msg = { connected: false, status: "no_emulator", version: "1.2.0" };
      const { state: s } = process(msg, dirtyState());
      expect(s.status).toBe("connected");
      expect(s.detail).toBe("emulator_not_found");
      expect(s.hand).toEqual([]);
      expect(s.modFingerprint).toBeNull();
      expect(s.restartFailed).toBe(false);
    });

    it("maps no_shared_memory status correctly", () => {
      const msg = { connected: false, status: "no_shared_memory", version: "1.2.0" };
      const { state: s } = process(msg, dirtyState());
      expect(s.detail).toBe("no_shared_memory");
    });

    it("maps unknown status to error", () => {
      const msg = { connected: false, status: "error", reason: "boom" };
      const { state: s } = process(msg, dirtyState());
      expect(s.detail).toBe("error");
      expect(s.detailMessage).toBe("boom");
    });

    it("carries settingsPatched flag through", () => {
      const msg = { connected: false, status: "no_shared_memory", settingsPatched: true };
      const { state: s } = process(msg);
      expect(s.settingsPatched).toBe(true);
    });
  });

  describe("gameData message", () => {
    it("sets gameData on success", () => {
      const msg = {
        type: "gameData",
        cards: [1],
        duelists: [2],
        fusionTable: [3],
        equipTable: [4],
        artworkKey: "abc123def456-78c4801f",
      };
      const { state: s } = process(msg);
      expect(s.gameData).toEqual({
        cards: [1],
        duelists: [2],
        fusionTable: [3],
        equipTable: [4],
        equipBonuses: null,
        perEquipBonuses: null,
        deckLimits: null,
        fieldBonusTable: null,
        artworkKey: "abc123def456-78c4801f",
      });
      expect(s.gameDataError).toBeNull();
    });

    it("passes through deckLimits when present", () => {
      const msg = {
        type: "gameData",
        cards: [],
        duelists: [],
        fusionTable: [],
        equipTable: [],
        deckLimits: { byCard: { 299: 2, 348: 1 } },
      };
      const { state: s } = process(msg);
      expect(s.gameData?.deckLimits).toEqual({ byCard: { 299: 2, 348: 1 } });
    });

    it("sets gameDataError on failure", () => {
      const msg = { type: "gameData", error: "disc not found" };
      const { state: s } = process(msg, dirtyState());
      expect(s.gameData).toBeNull();
      expect(s.gameDataError).toBe("disc not found");
    });

    it("does not reset other state fields", () => {
      const prev = dirtyState();
      const msg = { type: "gameData", cards: [], duelists: [], fusionTable: [], equipTable: [] };
      const { state: s } = process(msg, prev);
      expect(s.hand).toEqual(prev.hand);
      expect(s.modFingerprint).toBe(prev.modFingerprint);
    });
  });

  describe("update_staged message", () => {
    it("sets updateStaged to true", () => {
      const msg = { type: "update_staged" };
      const { state: s } = process(msg);
      expect(s.updateStaged).toBe(true);
    });

    it("does not reset other state fields", () => {
      const prev = dirtyState();
      const msg = { type: "update_staged" };
      const { state: s } = process(msg, prev);
      expect(s.hand).toEqual(prev.hand);
      expect(s.status).toBe(prev.status);
    });
  });

  describe("stage_noop message", () => {
    it("sets stageFailed to true", () => {
      const msg = { type: "stage_noop" };
      const { state: s } = process(msg);
      expect(s.stageFailed).toBe(true);
    });

    it("does not reset other state fields", () => {
      const prev = dirtyState();
      const msg = { type: "stage_noop" };
      const { state: s } = process(msg, prev);
      expect(s.hand).toEqual(prev.hand);
      expect(s.status).toBe(prev.status);
    });
  });

  describe("update_restart_ack message", () => {
    it("sets updating to true", () => {
      const msg = { type: "update_restart_ack" };
      const { state: s } = process(msg);
      expect(s.updating).toBe(true);
    });

    it("does not reset other state fields", () => {
      const prev = dirtyState();
      const msg = { type: "update_restart_ack" };
      const { state: s } = process(msg, prev);
      expect(s.hand).toEqual(prev.hand);
      expect(s.status).toBe(prev.status);
    });
  });

  describe("restart_result message", () => {
    it("sets restartFailed on failure", () => {
      const msg = { type: "restart_result", success: false };
      const { state: s } = process(msg);
      expect(s.restartFailed).toBe(true);
    });

    it("does not reset other state fields", () => {
      const prev = dirtyState();
      const msg = { type: "restart_result", success: false };
      const { state: s } = process(msg, prev);
      expect(s.hand).toEqual(prev.hand);
      expect(s.status).toBe(prev.status);
    });
  });

  describe("tracker passthrough", () => {
    it("returns updated tracker for ready messages", () => {
      const { tracker: t } = process(readyMsg());
      // Ready message with inDuel=true should set wasInDuel=true
      expect(t.wasInDuel).toBe(true);
    });

    it("passes tracker through unchanged for partial-update messages", () => {
      const customTracker: EndedTracker = { sceneId: 42, sceneLeft: false, at: T, wasInDuel: true };
      const msg = { type: "restart_result", success: false };
      const { tracker: t } = process(msg, INITIAL_BRIDGE_STATE, customTracker);
      expect(t).toBe(customTracker);
    });
  });

  describe("CPU swap detection", () => {
    function oppSlot(cardId: number, atk = 1000, def = 800) {
      return { cardId, atk, def, status: 0x80 };
    }

    function readyWithOpp(
      opponentHand: Array<{ cardId: number; atk: number; def: number; status: number }>,
      extra: Record<string, unknown> = {},
    ) {
      return {
        ...makeRaw({
          opponentHand,
          opponentHandSlots: [40, 41, 42, 43, 44],
          turnIndicator: 1, // opponent's turn — swaps only detected here
          ...extra,
        }),
        status: "ready" as const,
        version: "1.0.0",
      };
    }

    /** Chain helper: processes a message and asserts non-null result. */
    function chain(
      msg: ReturnType<typeof makeRaw>,
      prev: { state: BridgeState; tracker: EndedTracker },
      time: number,
    ) {
      const result = processBridgeMessage(msg, prev.state, prev.tracker, time);
      expect(result).not.toBeNull();
      return result as Exclude<typeof result, null>;
    }

    const notInDuel = { state: { ...INITIAL_BRIDGE_STATE, inDuel: false }, tracker };

    /** Creates a "duel already running" seed by processing a duel-start message. */
    function startDuel(hand: Array<{ cardId: number; atk: number; def: number; status: number }>) {
      return chain(readyWithOpp(hand), notInDuel, T - 100);
    }

    it("detects a card swap between consecutive ready messages", () => {
      const baseHand = [oppSlot(22), oppSlot(14), oppSlot(67), oppSlot(0, 0, 0), oppSlot(0, 0, 0)];
      const swapped = [oppSlot(71), oppSlot(14), oppSlot(67), oppSlot(0, 0, 0), oppSlot(0, 0, 0)];

      const r1 = startDuel(baseHand);
      const r2 = chain(readyWithOpp(swapped), r1, T);

      expect(r2.state.cpuSwaps).toHaveLength(1);
      expect(r2.state.cpuSwaps[0]).toMatchObject({ slotIndex: 0, fromCardId: 22, toCardId: 71 });
    });

    it("accumulates multiple swaps across messages", () => {
      const hand1 = [oppSlot(22), oppSlot(14), oppSlot(67), oppSlot(0, 0, 0), oppSlot(0, 0, 0)];
      const hand2 = [oppSlot(71), oppSlot(14), oppSlot(67), oppSlot(0, 0, 0), oppSlot(0, 0, 0)];
      const hand3 = [oppSlot(71), oppSlot(15), oppSlot(67), oppSlot(0, 0, 0), oppSlot(0, 0, 0)];

      const r1 = startDuel(hand1);
      const r2 = chain(readyWithOpp(hand2), r1, T);
      const r3 = chain(readyWithOpp(hand3), r2, T + 50);

      expect(r3.state.cpuSwaps).toHaveLength(2);
      expect(r3.state.cpuSwaps[0]).toMatchObject({ fromCardId: 22, toCardId: 71 });
      expect(r3.state.cpuSwaps[1]).toMatchObject({ fromCardId: 14, toCardId: 15 });
    });

    it("clears swaps when duel ends", () => {
      const hand1 = [oppSlot(22), oppSlot(14), oppSlot(67), oppSlot(0, 0, 0), oppSlot(0, 0, 0)];
      const hand2 = [oppSlot(71), oppSlot(14), oppSlot(67), oppSlot(0, 0, 0), oppSlot(0, 0, 0)];

      const r1 = startDuel(hand1);
      const r2 = chain(readyWithOpp(hand2), r1, T);
      expect(r2.state.cpuSwaps).toHaveLength(1);

      // Duel ends (phase goes to results = 0x0D)
      const r3 = chain(readyWithOpp(hand2, { duelPhase: 0x0d }), r2, T + 50);
      expect(r3.state.cpuSwaps).toEqual([]);
    });

    it("deduplicates when hand flickers back and re-settles", () => {
      const hand1 = [oppSlot(22), oppSlot(14), oppSlot(67), oppSlot(0, 0, 0), oppSlot(0, 0, 0)];
      const hand2 = [oppSlot(71), oppSlot(14), oppSlot(67), oppSlot(0, 0, 0), oppSlot(0, 0, 0)];

      const r1 = startDuel(hand1);
      const r2 = chain(readyWithOpp(hand2), r1, T); // swap detected
      expect(r2.state.cpuSwaps).toHaveLength(1);

      // Hand flickers back to old value then re-settles to new value
      const r3 = chain(readyWithOpp(hand1), r2, T + 50); // revert
      const r4 = chain(readyWithOpp(hand2), r3, T + 100); // re-settle

      // Should still be 1 swap, not 2
      expect(r4.state.cpuSwaps).toHaveLength(1);
    });

    it("does not flag initial deal as swaps on duel start", () => {
      // Previous duel had different cards. New duel starts with a fresh hand.
      const oldHand = [oppSlot(100), oppSlot(200), oppSlot(300), oppSlot(400), oppSlot(500)];
      const newHand = [oppSlot(10), oppSlot(20), oppSlot(30), oppSlot(40), oppSlot(50)];

      const r1 = startDuel(oldHand);
      // Duel ends
      const r2 = chain(readyWithOpp(oldHand, { duelPhase: 0x0d }), r1, T);
      // New duel starts with completely different hand — wasInDuel=false → skipped
      const r3 = chain(readyWithOpp(newHand), r2, T + 50);
      // Second message in new duel (hand unchanged)
      const r4 = chain(readyWithOpp(newHand), r3, T + 100);

      expect(r3.state.cpuSwaps).toEqual([]);
      expect(r4.state.cpuSwaps).toEqual([]);
    });

    it("ignores hand changes during player's turn", () => {
      const hand1 = [oppSlot(22), oppSlot(14), oppSlot(67), oppSlot(0, 0, 0), oppSlot(0, 0, 0)];
      const hand2 = [oppSlot(71), oppSlot(14), oppSlot(67), oppSlot(0, 0, 0), oppSlot(0, 0, 0)];

      const r1 = startDuel(hand1);
      // Hand changes during player's turn (turnIndicator: 0)
      const r2 = chain(readyWithOpp(hand2, { turnIndicator: 0 }), r1, T);

      expect(r2.state.cpuSwaps).toEqual([]);
    });
  });

  // ── Reference stability across unchanged polls ─────────────────────
  // The bridge polls at 20 Hz and re-deserializes JSON into fresh arrays
  // every time. Without per-slice ref preservation, React Compiler's
  // auto-memo invalidates on every poll and the whole duel subtree
  // re-renders uselessly. These tests lock in the invariant that
  // `processBridgeMessage` reuses previous refs when content is unchanged.
  describe("reference stability", () => {
    function firstPoll() {
      const r = processBridgeMessage(
        makeRaw({ status: "ready", connected: true }),
        INITIAL_BRIDGE_STATE,
        INITIAL_ENDED_TRACKER,
        1_000,
      );
      if (!r) throw new Error("processBridgeMessage returned null");
      return r;
    }

    it("preserves the root state ref when nothing changed", () => {
      const r1 = firstPoll();
      // Send a bit-identical message on the next poll.
      const r2 = processBridgeMessage(
        makeRaw({ status: "ready", connected: true }),
        r1.state,
        r1.tracker,
        1_050,
      );
      expect(r2).not.toBeNull();
      expect(r2?.state).toBe(r1.state);
    });

    const slices: Array<keyof BridgeState> = [
      "hand",
      "field",
      "opponentHand",
      "opponentField",
      "collection",
      "deckDefinition",
      "shuffledDeck",
      "unlockedDuelists",
      "stats",
      "lp",
      "cpuSwaps",
    ];

    for (const slice of slices) {
      it(`preserves the ${slice} ref when content is unchanged`, () => {
        const r1 = firstPoll();
        const r2 = processBridgeMessage(
          makeRaw({ status: "ready", connected: true }),
          r1.state,
          r1.tracker,
          1_050,
        );
        expect(r2?.state[slice]).toBe(r1.state[slice]);
      });
    }

    it("produces a new hand ref when hand content actually changes", () => {
      const r1 = firstPoll();
      const r2 = processBridgeMessage(
        makeRaw({
          status: "ready",
          connected: true,
          hand: [
            { cardId: 150, atk: 1200, def: 800, status: 0x80 },
            { cardId: 200, atk: 1500, def: 1000, status: 0x80 },
            { cardId: 300, atk: 900, def: 700, status: 0x80 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
        r1.state,
        r1.tracker,
        1_050,
      );
      expect(r2?.state.hand).not.toBe(r1.state.hand);
      expect(r2?.state.hand).toEqual([150, 200, 300]);
      // ...but unrelated slices stay pinned.
      expect(r2?.state.field).toBe(r1.state.field);
      expect(r2?.state.opponentField).toBe(r1.state.opponentField);
      expect(r2?.state.lp).toBe(r1.state.lp);
    });
  });
});
