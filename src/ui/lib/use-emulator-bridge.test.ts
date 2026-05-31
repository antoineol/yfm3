import { describe, expect, it } from "vitest";
import { type BridgeState, INITIAL_BRIDGE_STATE } from "./bridge-message-processor.ts";
import { bridgeStateAfterSocketClose, shouldStartReconnectGrace } from "./use-emulator-bridge.ts";

describe("bridgeStateAfterSocketClose", () => {
  it("keeps the last ready game data during a transient reconnect", () => {
    const ready = readyBridgeState();

    const next = bridgeStateAfterSocketClose(ready);

    expect(next.status).toBe("connecting");
    expect(next.detail).toBe("ready");
    expect(next.gameData).toBe(ready.gameData);
    expect(next.hand).toEqual([10, 20]);
  });

  it("resets setup state when no usable bridge data exists", () => {
    expect(bridgeStateAfterSocketClose(INITIAL_BRIDGE_STATE)).toEqual(INITIAL_BRIDGE_STATE);
  });

  it("keeps the explicit update restart indicator", () => {
    const next = bridgeStateAfterSocketClose({ ...readyBridgeState(), updating: true });

    expect(next).toEqual({ ...INITIAL_BRIDGE_STATE, updating: true });
  });
});

describe("shouldStartReconnectGrace", () => {
  it("starts only for the first disconnect from a ready bridge", () => {
    const ready = readyBridgeState();
    const reconnecting = bridgeStateAfterSocketClose(ready);

    expect(shouldStartReconnectGrace(ready, reconnecting)).toBe(true);
    expect(shouldStartReconnectGrace(reconnecting, reconnecting)).toBe(false);
  });
});

function readyBridgeState(): BridgeState {
  return {
    ...INITIAL_BRIDGE_STATE,
    status: "connected",
    detail: "ready",
    hand: [10, 20],
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
      artworkKey: "cache-key",
    },
  };
}
