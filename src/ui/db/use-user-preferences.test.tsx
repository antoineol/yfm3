// @vitest-environment happy-dom
import { cleanup, renderHook } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { setAutoSyncMode } from "../lib/auto-sync-mode.ts";
import { bridgeDeckAtom } from "../lib/bridge-snapshot-atoms.ts";
import { useScoringSlots } from "./use-user-preferences.ts";

vi.mock("../core/convex-hooks.ts", () => ({
  useAuthQuery: vi.fn(() => undefined),
}));

function makeWrapper(store: ReturnType<typeof createStore>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(Provider, { store }, children);
  };
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("useScoringSlots", () => {
  it("does not require card data while auto-sync reference data is still loading", () => {
    setAutoSyncMode(true);
    const store = createStore();
    store.set(
      bridgeDeckAtom,
      Array.from({ length: 40 }, (_, i) => i + 1),
    );

    const { result } = renderHook(() => useScoringSlots(), { wrapper: makeWrapper(store) });

    expect(result.current).toBe(40);
  });
});
