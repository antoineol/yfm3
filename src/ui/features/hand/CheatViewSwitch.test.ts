import { describe, expect, it } from "vitest";
import { type BridgeState, INITIAL_BRIDGE_STATE } from "../../lib/bridge-message-processor.ts";
import { duelFocusRowVisible, focusedCardForDisplay } from "./CheatViewSwitch.tsx";

function bridgeWithTarget(overrides: Partial<BridgeState>): BridgeState {
  return {
    ...INITIAL_BRIDGE_STATE,
    inDuel: true,
    gameData: {
      cards: [
        { id: 65, name: "Silver Fang" },
        { id: 493, name: "Maha Vailo" },
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
