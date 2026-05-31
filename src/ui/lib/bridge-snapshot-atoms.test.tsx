// @vitest-environment happy-dom
import { cleanup, renderHook } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";
import {
  bridgeCollectionAtom,
  bridgeDeckAtom,
  collectionKey,
  deckKey,
  useHydrateBridgeSnapshot,
} from "./bridge-snapshot-atoms.ts";
import { writeLocal } from "./local-store.ts";

function makeWrapper(store: ReturnType<typeof createStore>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("useHydrateBridgeSnapshot", () => {
  it("hydrates a saved collection only with a complete saved deck", () => {
    const store = createStore();
    const deck = Array.from({ length: 40 }, (_, i) => i + 1);
    writeLocal(collectionKey("vanilla"), { 1: 2, 571: 1 });
    writeLocal(deckKey("vanilla"), deck);

    renderHook(() => useHydrateBridgeSnapshot("vanilla"), { wrapper: makeWrapper(store) });

    expect(store.get(bridgeCollectionAtom)).toEqual({ 1: 2, 571: 1 });
    expect(store.get(bridgeDeckAtom)).toEqual(deck);
  });

  it("ignores saved collection and deck when the saved deck is empty", () => {
    const store = createStore();
    writeLocal(collectionKey("vanilla"), { 571: 1 });
    writeLocal(deckKey("vanilla"), new Array(40).fill(0));

    renderHook(() => useHydrateBridgeSnapshot("vanilla"), { wrapper: makeWrapper(store) });

    expect(store.get(bridgeCollectionAtom)).toBeNull();
    expect(store.get(bridgeDeckAtom)).toBeNull();
  });
});
