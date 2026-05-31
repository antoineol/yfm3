// @vitest-environment happy-dom
import { cleanup, render, waitFor } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BridgeProvider } from "../../lib/bridge-context.tsx";
import { type EmulatorBridge, INITIAL_BRIDGE_STATE } from "../../lib/bridge-message-processor.ts";
import { localCpuSwapsAtom } from "../../lib/bridge-snapshot-atoms.ts";
import { useSyncCpuSwaps } from "./use-sync-cpu-swaps.ts";

const SWAP = { slotIndex: 0, fromCardId: 22, toCardId: 71, timestamp: 1000 };

afterEach(() => {
  cleanup();
});

describe("useSyncCpuSwaps", () => {
  it("clears local swaps when the bridge reaches the duel-ended phase", async () => {
    const store = createStore();
    const activeBridge = bridge({
      inDuel: true,
      phase: "opponent",
      cpuSwaps: [SWAP],
    });

    const { rerender } = render(<Harness bridge={activeBridge} store={store} />);
    await waitFor(() => expect(store.get(localCpuSwapsAtom)).toEqual([SWAP]));

    rerender(
      <Harness
        bridge={bridge({
          inDuel: true,
          phase: "ended",
          cpuSwaps: [],
        })}
        store={store}
      />,
    );

    await waitFor(() => expect(store.get(localCpuSwapsAtom)).toEqual([]));
  });

  it("clears stale local swaps when mounting at the beginning of a new duel", async () => {
    const store = createStore();
    store.set(localCpuSwapsAtom, [SWAP]);

    render(
      <Harness
        bridge={bridge({
          inDuel: true,
          phase: "draw",
          cpuSwaps: [],
        })}
        store={store}
      />,
    );

    await waitFor(() => expect(store.get(localCpuSwapsAtom)).toEqual([]));
  });
});

function Harness({
  bridge,
  store,
}: {
  bridge: EmulatorBridge;
  store: ReturnType<typeof createStore>;
}) {
  return (
    <Provider store={store}>
      <BridgeProvider bridge={bridge}>
        <SyncCpuSwaps />
      </BridgeProvider>
    </Provider>
  );
}

function SyncCpuSwaps() {
  useSyncCpuSwaps();
  return null;
}

function bridge(overrides: Partial<EmulatorBridge> = {}): EmulatorBridge {
  return {
    ...INITIAL_BRIDGE_STATE,
    status: "connected",
    detail: "ready",
    scan: vi.fn(),
    restartEmulator: vi.fn(),
    updateAndRestart: vi.fn(),
    stageUpdate: vi.fn(),
    ...overrides,
  };
}
