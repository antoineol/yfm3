import { describe, expect, it } from "vitest";
import { type BridgeState, INITIAL_BRIDGE_STATE } from "../../lib/bridge-message-processor.ts";
import {
  battlePredictionLabel,
  duelFocusRowVisible,
  focusedCardForDisplay,
  focusedStatsForDisplay,
} from "./CheatViewSwitch.tsx";

function bridgeWithTarget(overrides: Partial<BridgeState>): BridgeState {
  return {
    ...INITIAL_BRIDGE_STATE,
    inDuel: true,
    gameData: {
      cards: [
        { id: 65, name: "Silver Fang", atk: 1200, def: 800, type: "Beast" },
        { id: 401, name: "Ushi Oni", atk: 2150, def: 1950, type: "Fiend" },
        { id: 493, name: "Maha Vailo", atk: 1550, def: 1400, type: "Spellcaster" },
      ],
    } as BridgeState["gameData"],
    ...overrides,
  };
}

describe("focusedCardForDisplay", () => {
  it("returns the targeted player card in cheat mode", () => {
    const bridge = bridgeWithTarget({
      cursorTarget: { zone: "playerHand", index: 2, cardId: 65, hidden: false },
    });

    expect(focusedCardForDisplay(bridge, true)).toEqual(
      expect.objectContaining({ id: 65, name: "Silver Fang" }),
    );
  });

  it("returns no focused card without cheat mode", () => {
    const bridge = bridgeWithTarget({
      cursorTarget: { zone: "playerHand", index: 2, cardId: 65, hidden: false },
    });

    expect(focusedCardForDisplay(bridge, false)).toBeNull();
  });

  it("reveals hidden opponent targets with cheat mode", () => {
    const bridge = bridgeWithTarget({
      cursorTarget: { zone: "opponentField", index: 0, cardId: 493, hidden: true },
    });

    expect(focusedCardForDisplay(bridge, true)).toEqual(
      expect.objectContaining({ id: 493, name: "Maha Vailo" }),
    );
  });

  it("returns null when no card is focused", () => {
    expect(focusedCardForDisplay(bridgeWithTarget({ cursorTarget: null }), true)).toBeNull();
  });
});

describe("focusedStatsForDisplay", () => {
  it("returns base stats for a focused hand card", () => {
    const bridge = bridgeWithTarget({
      cursorTarget: { zone: "playerHand", index: 2, cardId: 65, hidden: false },
    });
    const focused = focusedCardForDisplay(bridge, true);

    expect(focused && focusedStatsForDisplay(bridge, focused)).toEqual({ atk: 1200, def: 800 });
  });

  it("returns terrain-adjusted live stats for a focused player field card", () => {
    const bridge = bridgeWithTarget({
      stats: { fusions: 0, terrain: 6, duelistId: 1, rankCounters: null },
      field: [{ cardId: 401, atk: 2150, def: 1950, status: 0x84, slotIndex: 0 }],
      cursorTarget: { zone: "playerField", index: 0, cardId: 401, hidden: false },
    });
    const focused = focusedCardForDisplay(bridge, true);

    expect(focused && focusedStatsForDisplay(bridge, focused)).toEqual({ atk: 2650, def: 2450 });
  });

  it("returns terrain-adjusted live stats for a focused opponent field card", () => {
    const bridge = bridgeWithTarget({
      stats: { fusions: 0, terrain: 6, duelistId: 1, rankCounters: null },
      opponentField: [{ cardId: 493, atk: 1550, def: 1400, status: 0xbc, slotIndex: 0 }],
      cursorTarget: { zone: "opponentField", index: 0, cardId: 493, hidden: true },
    });
    const focused = focusedCardForDisplay(bridge, true);

    expect(focused && focusedStatsForDisplay(bridge, focused)).toEqual({ atk: 2050, def: 1900 });
  });
});

describe("duelFocusRowVisible", () => {
  it("is visible only during a duel with cheat mode enabled", () => {
    expect(duelFocusRowVisible(bridgeWithTarget({ inDuel: true }), true)).toBe(true);
    expect(duelFocusRowVisible(bridgeWithTarget({ inDuel: true }), false)).toBe(false);
    expect(duelFocusRowVisible(bridgeWithTarget({ inDuel: false }), true)).toBe(false);
  });

  it("is hidden when the duel has ended", () => {
    expect(duelFocusRowVisible(bridgeWithTarget({ phase: "ended" }), true)).toBe(false);
    expect(
      focusedCardForDisplay(
        bridgeWithTarget({
          cursorTarget: { zone: "playerHand", index: 2, cardId: 65, hidden: false },
          phase: "ended",
        }),
        true,
      ),
    ).toBeNull();
  });
});

describe("battlePredictionLabel", () => {
  it("returns only the battle outcome state", () => {
    expect(battlePredictionLabel("win")).toBe("Win");
    expect(battlePredictionLabel("bothDestroyed")).toBe("Both destroyed");
    expect(battlePredictionLabel("lose")).toBe("Lose");
  });
});
