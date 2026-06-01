import { describe, expect, it } from "vitest";
import {
  type BridgeState,
  type BridgeTracker,
  type EndedTracker,
  INITIAL_BRIDGE_STATE,
  INITIAL_BRIDGE_TRACKER,
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

  it("keeps 'ended' while still on the same scene", () => {
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

  it("restores 'ended' on startup when already on a known duel scene", () => {
    const { effectivePhase, tracker } = resolveEndedPhase(
      { inDuel: false, phase: "ended" },
      0x06c3,
      initial(),
      T,
    );
    expect(effectivePhase).toBe("ended");
    expect(tracker).toEqual({ sceneId: 0x06c3, sceneLeft: false, at: T, wasInDuel: false });
  });

  it("overrides to 'other' when no duel was observed this session on a non-duel scene", () => {
    const { effectivePhase } = resolveEndedPhase(
      { inDuel: false, phase: "ended" },
      42,
      initial(),
      T,
    );
    expect(effectivePhase).toBe("other");
  });

  it("overrides to 'other' when no scene is known and no duel was observed this session", () => {
    const { effectivePhase } = resolveEndedPhase(
      { inDuel: false, phase: "ended" },
      null,
      initial(),
      T,
    );
    expect(effectivePhase).toBe("other");
  });

  it("keeps 'ended' after a long wait on the same scene", () => {
    const { effectivePhase } = resolveEndedPhase(
      { inDuel: false, phase: "ended" },
      42,
      { sceneId: 42, sceneLeft: false, at: T, wasInDuel: false },
      T + 60_000,
    );
    expect(effectivePhase).toBe("ended");
  });
});

// ── processBridgeMessage ─────────────────────────────────────────────

describe("processBridgeMessage", () => {
  const T = 1_000_000;
  const tracker = { ...INITIAL_BRIDGE_TRACKER };

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
        rankScoring: null,
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
    t: BridgeTracker = tracker,
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

    it("keeps results screen inside the duel lifecycle until the scene changes", () => {
      const active = process(readyMsg({ sceneId: 42 }));
      const ended = process(
        readyMsg({ sceneId: 42, duelPhase: 0x0d }),
        active.state,
        active.tracker,
      );

      expect(ended.state.phase).toBe("ended");
      expect(ended.state.inDuel).toBe(true);

      const leftResults = process(
        readyMsg({ sceneId: 99, duelPhase: 0x0d }),
        ended.state,
        ended.tracker,
      );

      expect(leftResults.state.phase).toBe("other");
      expect(leftResults.state.inDuel).toBe(false);
    });

    it("keeps an initial results-screen ready message inside the duel lifecycle", () => {
      const ended = process(readyMsg({ sceneId: 0, duelPhase: 0x0d }));

      expect(ended.state.phase).toBe("ended");
      expect(ended.state.inDuel).toBe(true);
    });

    it("restores the confirmed hand target when field preview closes before raw target updates", () => {
      const hand = [
        { cardId: 649, atk: 500, def: 200, status: 0x80 },
        { cardId: 387, atk: 400, def: 300, status: 0x80 },
        { cardId: 2, atk: 800, def: 600, status: 0x80 },
        { cardId: 2, atk: 800, def: 600, status: 0x80 },
        { cardId: 635, atk: 200, def: 100, status: 0x80 },
      ];
      const normalField = [
        { cardId: 22, atk: 800, def: 1000, status: 0x80 },
        { cardId: 401, atk: 800, def: 1200, status: 0x80 },
        { cardId: 529, atk: 1000, def: 1000, status: 0x80 },
        { cardId: 0, atk: 0, def: 0, status: 0 },
        { cardId: 0, atk: 0, def: 0, status: 0 },
      ];
      const previewField = normalField.map((slot) =>
        slot.cardId > 0 ? { ...slot, status: 0x84 } : slot,
      );
      const opponentClosed = [
        { cardId: 282, atk: 1400, def: 1000, status: 0xb8 },
        { cardId: 0, atk: 0, def: 0, status: 0 },
        { cardId: 0, atk: 0, def: 0, status: 0 },
        { cardId: 0, atk: 0, def: 0, status: 0 },
        { cardId: 0, atk: 0, def: 0, status: 0 },
      ];
      const opponentPreview = [{ ...opponentClosed[0], status: 0xbc }, ...opponentClosed.slice(1)];

      const handPoll = process(
        readyMsg({
          hand,
          handSlots: [5, 6, 8, 9, 10],
          field: normalField,
          opponentField: opponentClosed,
          duelCursorTargetCardId: 387,
          duelCursorFieldSlotIndex: 0,
        }),
      );
      expect(handPoll.state.cursorTarget).toEqual({
        zone: "playerHand",
        index: 1,
        cardId: 387,
        hidden: false,
      });

      const previewEmpty = process(
        readyMsg({
          hand,
          handSlots: [5, 6, 8, 9, 10],
          field: previewField,
          opponentField: opponentPreview,
          duelCursorTargetCardId: 387,
          duelCursorFieldSlotIndex: null,
        }),
        handPoll.state,
        handPoll.tracker,
      );
      expect(previewEmpty.state.cursorTarget).toBeNull();

      const previewPoll = process(
        readyMsg({
          hand,
          handSlots: [5, 6, 8, 9, 10],
          field: previewField,
          opponentField: opponentPreview,
          duelCursorTargetCardId: 282,
          duelCursorFieldSlotIndex: 2,
        }),
        previewEmpty.state,
        previewEmpty.tracker,
      );
      expect(previewPoll.state.cursorTarget).toEqual({
        zone: "opponentField",
        index: 0,
        cardId: 282,
        hidden: true,
      });

      const returnedToHand = process(
        readyMsg({
          hand,
          handSlots: [5, 6, 8, 9, 10],
          field: normalField,
          opponentField: opponentClosed,
          duelCursorTargetCardId: 282,
          duelCursorFieldSlotIndex: 2,
        }),
        previewPoll.state,
        previewPoll.tracker,
      );

      expect(returnedToHand.state.cursorTarget).toEqual({
        zone: "playerHand",
        index: 1,
        cardId: 387,
        hidden: false,
      });
    });

    it("tracks the player attacker while an opponent target is focused", () => {
      const field = [
        { cardId: 0, atk: 0, def: 0, status: 0 },
        { cardId: 531, atk: 2100, def: 1700, status: 0x84 },
        { cardId: 0, atk: 0, def: 0, status: 0 },
        { cardId: 0, atk: 0, def: 0, status: 0 },
        { cardId: 0, atk: 0, def: 0, status: 0 },
      ];
      const opponentField = [
        { cardId: 493, atk: 1550, def: 1400, status: 0xbc },
        { cardId: 0, atk: 0, def: 0, status: 0 },
        { cardId: 0, atk: 0, def: 0, status: 0 },
        { cardId: 0, atk: 0, def: 0, status: 0 },
        { cardId: 0, atk: 0, def: 0, status: 0 },
      ];

      const attackerPoll = process(
        readyMsg({
          duelPhase: 0x05,
          field,
          opponentField,
          duelCursorTargetCardId: 531,
          duelCursorFieldSlotIndex: 1,
        }),
      );
      expect(attackerPoll.state.battleTarget).toBeNull();

      const targetPoll = process(
        readyMsg({
          duelPhase: 0x05,
          field,
          opponentField,
          duelCursorTargetCardId: 493,
          duelCursorFieldSlotIndex: 1,
        }),
        attackerPoll.state,
        attackerPoll.tracker,
      );

      expect(targetPoll.state.battleTarget).toEqual({
        attacker: { zone: "playerField", index: 1, cardId: 531, hidden: false },
        defender: { zone: "opponentField", index: 0, cardId: 493, hidden: true },
      });
    });

    it("recovers the attacker from the current field slot signal without prior cursor history", () => {
      const { state } = process(
        readyMsg({
          duelPhase: 0x05,
          field: [
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 531, atk: 2100, def: 1700, status: 0x84 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
          opponentField: [
            { cardId: 493, atk: 1550, def: 1400, status: 0xbc },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
          duelCursorTargetCardId: 493,
          duelCursorFieldSlotIndex: 1,
        }),
      );

      expect(state.battleTarget).toEqual({
        attacker: { zone: "playerField", index: 1, cardId: 531, hidden: false },
        defender: { zone: "opponentField", index: 0, cardId: 493, hidden: true },
      });
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
        rankScoring: null,
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

    it("passes through rankScoring when present", () => {
      const rankScoring = {
        source: "bin-majority",
        tableCount: 3,
        selectedCount: 2,
        variantCount: 2,
        factors: [
          {
            name: "Cards left",
            key: "remainingCards",
            thresholds: [4, 8, 26, 32],
            points: [-7, -5, 0, 20, 32],
          },
        ],
      };
      const msg = {
        type: "gameData",
        cards: [],
        duelists: [],
        fusionTable: [],
        equipTable: [],
        rankScoring,
      };
      const { state: s } = process(msg);
      expect(s.gameData?.rankScoring).toEqual(rankScoring);
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
      const customTracker: BridgeTracker = {
        ...INITIAL_BRIDGE_TRACKER,
        sceneId: 42,
        sceneLeft: false,
        at: T,
        wasInDuel: true,
      };
      const msg = { type: "restart_result", success: false };
      const { tracker: t } = process(msg, INITIAL_BRIDGE_STATE, customTracker);
      expect(t).toBe(customTracker);
    });
  });

  describe("CPU swap detection disabled", () => {
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
          turnIndicator: 1,
          ...extra,
        }),
        status: "ready" as const,
        version: "1.0.0",
      };
    }

    /** Chain helper: processes a message and asserts non-null result. */
    function chain(
      msg: ReturnType<typeof makeRaw>,
      prev: { state: BridgeState; tracker: BridgeTracker },
      time: number,
    ) {
      const result = processBridgeMessage(msg, prev.state, prev.tracker, time);
      expect(result).not.toBeNull();
      return result as Exclude<typeof result, null>;
    }

    const notInDuel = { state: { ...INITIAL_BRIDGE_STATE, inDuel: false }, tracker };

    it("keeps cpuSwaps empty even when opponent hand cards change", () => {
      const hand1 = [oppSlot(22), oppSlot(14), oppSlot(67), oppSlot(0, 0, 0), oppSlot(0, 0, 0)];
      const hand2 = [oppSlot(71), oppSlot(14), oppSlot(67), oppSlot(0, 0, 0), oppSlot(0, 0, 0)];

      const r1 = chain(readyWithOpp(hand1), notInDuel, T - 100);
      const r2 = chain(readyWithOpp(hand2), r1, T);
      const r3 = chain(readyWithOpp([oppSlot(71), oppSlot(15), oppSlot(67)]), r2, T + 50);

      expect(r1.state.cpuSwaps).toEqual([]);
      expect(r2.state.cpuSwaps).toEqual([]);
      expect(r3.state.cpuSwaps).toEqual([]);
    });

    it("clears legacy cpuSwaps from an existing state", () => {
      const hand1 = [oppSlot(22), oppSlot(14), oppSlot(67), oppSlot(0, 0, 0), oppSlot(0, 0, 0)];
      const stateWithLegacySwap: BridgeState = {
        ...INITIAL_BRIDGE_STATE,
        cpuSwaps: [{ slotIndex: 0, fromCardId: 22, toCardId: 71, timestamp: T - 50 }],
      };
      const r1 = chain(readyWithOpp(hand1), { state: stateWithLegacySwap, tracker }, T);

      expect(r1.state.cpuSwaps).toEqual([]);
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
        INITIAL_BRIDGE_TRACKER,
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
      "opponentHandCards",
      "opponentHandPool",
      "opponentAvailablePool",
      "opponentReserve",
      "opponentReservePool",
      "opponentField",
      "collection",
      "deckDefinition",
      "shuffledDeck",
      "unlockedDuelists",
      "stats",
      "lp",
      "cpuSwaps",
      "battleTarget",
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

    it("preserves the last complete deck when a poll reports an empty deck definition", () => {
      const deck = Array.from({ length: 40 }, (_, i) => i + 1);
      deck[0] = 426;
      deck[1] = 571;
      const r1 = processBridgeMessage(
        makeRaw({ status: "ready", connected: true, deckDefinition: deck }),
        INITIAL_BRIDGE_STATE,
        INITIAL_BRIDGE_TRACKER,
        1_000,
      );
      if (!r1) throw new Error("processBridgeMessage returned null");

      const trunk = new Array(722).fill(0) as number[];
      trunk[570] = 1;
      const r2 = processBridgeMessage(
        makeRaw({
          status: "ready",
          connected: true,
          trunk,
          deckDefinition: new Array(40).fill(0),
        }),
        r1.state,
        r1.tracker,
        1_050,
      );

      expect(r2?.state.deckDefinition).toBe(r1.state.deckDefinition);
      expect(r2?.state.collection?.[426]).toBe(1);
      expect(r2?.state.collection?.[571]).toBe(2);
    });

    it("does not publish an empty deck definition without a previous complete deck", () => {
      const trunk = new Array(722).fill(0) as number[];
      trunk[570] = 1;
      const result = processBridgeMessage(
        makeRaw({
          status: "ready",
          connected: true,
          trunk,
          deckDefinition: new Array(40).fill(0),
        }),
        INITIAL_BRIDGE_STATE,
        INITIAL_BRIDGE_TRACKER,
        1_000,
      );

      expect(result?.state.deckDefinition).toBeNull();
      expect(result?.state.collection).toEqual({ 571: 1 });
    });

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
