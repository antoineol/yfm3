// @vitest-environment happy-dom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DuelPhase } from "../../lib/bridge-state-interpreter.ts";
import { useZoneToggle } from "./use-zone-toggle.ts";

type MockTransition = { finished: Promise<void> };

describe("useZoneToggle", () => {
  const startViewTransition = vi.fn<(cb: () => void) => MockTransition>();

  beforeEach(() => {
    startViewTransition.mockReset();
    startViewTransition.mockImplementation((cb) => {
      cb();
      return { finished: Promise.resolve() };
    });
    (
      document as unknown as { startViewTransition: typeof startViewTransition }
    ).startViewTransition = startViewTransition;
  });

  afterEach(() => {
    cleanup();
    delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
  });

  it("does not start a view transition when phase maps to the already-focused zone", () => {
    // Initial focusedZone is "hand". Mounting with phase "hand" must not
    // trigger a view transition (target matches current zone).
    const { rerender } = renderHook(
      ({ phase }: { phase: DuelPhase }) => useZoneToggle(true, phase),
      { initialProps: { phase: "hand" as DuelPhase } },
    );
    expect(startViewTransition).not.toHaveBeenCalled();

    // "hand" → "draw" both map to the "hand" zone → still no transition.
    rerender({ phase: "draw" });
    expect(startViewTransition).not.toHaveBeenCalled();
  });

  it("starts a view transition only on actual zone changes", () => {
    const { rerender, result } = renderHook(
      ({ phase }: { phase: DuelPhase }) => useZoneToggle(true, phase),
      { initialProps: { phase: "hand" as DuelPhase } },
    );
    expect(result.current.focusedZone).toBe("hand");

    rerender({ phase: "field" });
    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(result.current.focusedZone).toBe("field");

    // "field" → "fusion" → "battle" all map to "field" zone → no new transitions.
    rerender({ phase: "fusion" });
    rerender({ phase: "battle" });
    expect(startViewTransition).toHaveBeenCalledTimes(1);

    // Back to a hand-mapped phase → exactly one more transition.
    rerender({ phase: "draw" });
    expect(startViewTransition).toHaveBeenCalledTimes(2);
    expect(result.current.focusedZone).toBe("hand");
  });

  it("ignores phase 'other' (neither zone)", () => {
    const { rerender } = renderHook(
      ({ phase }: { phase: DuelPhase }) => useZoneToggle(true, phase),
      { initialProps: { phase: "field" as DuelPhase } },
    );
    startViewTransition.mockClear();

    rerender({ phase: "other" });
    expect(startViewTransition).not.toHaveBeenCalled();
  });

  it("click handler skips transition when clicking the already-active zone", () => {
    const { result } = renderHook(() => useZoneToggle(false, "hand"));
    expect(result.current.focusedZone).toBe("hand");

    act(() => {
      result.current.switchZone("hand");
    });
    expect(startViewTransition).not.toHaveBeenCalled();

    act(() => {
      result.current.switchZone("field");
    });
    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(result.current.focusedZone).toBe("field");
  });
});
