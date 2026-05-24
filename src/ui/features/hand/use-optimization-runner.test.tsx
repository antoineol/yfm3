// @vitest-environment happy-dom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../db/use-user-preferences.ts", () => ({
  useDeckSize: vi.fn(() => 40),
  useFusionDepth: vi.fn(() => 3),
  useUseEquipment: vi.fn(() => true),
  useTerrain: vi.fn(() => 0),
}));
vi.mock("../../../engine/index-browser.ts", () => ({
  optimizeDeckParallel: vi.fn(),
}));

import {
  type OptimizeDeckParallelResult,
  optimizeDeckParallel,
} from "../../../engine/index-browser.ts";
import type { BridgeGameData } from "../../../engine/worker/messages.ts";
import { type OptimizationCallbacks, useOptimizationRunner } from "./use-optimization-runner.ts";

const mockOptimize = optimizeDeckParallel as ReturnType<typeof vi.fn>;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function makeWrapper(store: ReturnType<typeof createStore>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

const snapshot = {
  collection: Object.fromEntries(Array.from({ length: 40 }, (_, i) => [i + 1, 1])),
  deck: Array.from({ length: 40 }, (_, i) => i + 1),
};

interface RunnerProps {
  enabled: boolean;
  gameData: BridgeGameData | null;
}

function makeGameData(): BridgeGameData {
  return {} as BridgeGameData;
}

describe("useOptimizationRunner", () => {
  let store: ReturnType<typeof createStore>;
  let callbacks: OptimizationCallbacks;

  beforeEach(() => {
    store = createStore();
    callbacks = {
      onComplete: vi.fn(),
      onError: vi.fn(),
    };
  });

  it("does not restart an active run when bridge game data is refreshed", async () => {
    let resolveOptimize!: (value: OptimizeDeckParallelResult) => void;
    const optimizePromise = new Promise<OptimizeDeckParallelResult>((resolve) => {
      resolveOptimize = resolve;
    });
    mockOptimize.mockReturnValue(optimizePromise);

    const { rerender } = renderHook(
      ({ enabled, gameData }: RunnerProps) =>
        useOptimizationRunner(snapshot, { modId: "rp", enabled, gameData }, callbacks),
      {
        wrapper: makeWrapper(store),
        initialProps: { enabled: false, gameData: null } as RunnerProps,
      },
    );

    expect(mockOptimize).not.toHaveBeenCalled();

    rerender({ enabled: true, gameData: makeGameData() });
    await waitFor(() => expect(mockOptimize).toHaveBeenCalledTimes(1));
    const firstCall = mockOptimize.mock.calls[0];
    expect(firstCall).toBeDefined();
    const signal = firstCall?.[1].signal as AbortSignal;

    rerender({ enabled: true, gameData: makeGameData() });
    await Promise.resolve();

    expect(mockOptimize).toHaveBeenCalledTimes(1);
    expect(signal.aborted).toBe(false);

    await act(async () => {
      resolveOptimize({
        deck: snapshot.deck,
        expectedAtk: 2000,
        currentDeckScore: 1900,
        improvement: 100,
        elapsedMs: 10,
      });
      await optimizePromise;
    });

    expect(callbacks.onComplete).toHaveBeenCalledTimes(1);
    expect(callbacks.onError).not.toHaveBeenCalled();
  });
});
