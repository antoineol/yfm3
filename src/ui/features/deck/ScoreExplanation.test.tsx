// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ExplainerResponse } from "../../../engine/worker/messages.ts";

vi.mock("../../db/use-owned-card-totals.ts", () => ({
  useOwnedCardTotals: vi.fn(),
}));

vi.mock("../../db/use-user-preferences.ts", () => ({
  useDeckSize: vi.fn(() => 5),
  useFusionDepth: vi.fn(() => 3),
  useUseEquipment: vi.fn(() => true),
  useTerrain: vi.fn(() => 0),
}));

vi.mock("../../lib/use-selected-mod.ts", () => ({
  useSelectedMod: vi.fn(() => "rp"),
}));

vi.mock("../../lib/bridge-context.tsx", () => ({
  useBridge: vi.fn(() => ({ gameData: null })),
}));

import { useOwnedCardTotals } from "../../db/use-owned-card-totals.ts";
import { ScoreExplanation } from "./ScoreExplanation.tsx";

const mockOwnedCardTotals = useOwnedCardTotals as ReturnType<typeof vi.fn>;

class MockWorker {
  onmessage: ((e: MessageEvent<ExplainerResponse>) => void) | null = null;
  onerror: ((e: ErrorEvent) => void) | null = null;
  terminated = false;

  postMessage(_msg: unknown) {}

  terminate() {
    this.terminated = true;
  }

  respond(distribution: ExplainerResponse["distribution"]) {
    this.onmessage?.({
      data: {
        type: "EXPLAIN_RESULT",
        expectedAtk: 0,
        distribution,
      },
    } as MessageEvent<ExplainerResponse>);
  }
}

let createdWorkers: MockWorker[] = [];

beforeEach(() => {
  createdWorkers = [];
  vi.stubGlobal(
    "Worker",
    class extends MockWorker {
      constructor() {
        super();
        createdWorkers.push(this);
      }
    },
  );
  mockOwnedCardTotals.mockReturnValue({ 1: 3, 2: 3, 3: 3, 4: 3, 5: 3 });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("ScoreExplanation", () => {
  it("renders cumulative percentages from top to bottom", () => {
    const distribution = [
      { atk: 3000, count: 2, probabilityMax: 0.2 },
      { atk: 2500, count: 3, probabilityMax: 0.3 },
      { atk: 1800, count: 5, probabilityMax: 0.5 },
    ];

    render(<ScoreExplanation deckCardIds={[1, 2, 3, 4, 5]} />);

    fireEvent.click(screen.getByRole("button", { name: /score breakdown/i }));
    expect(createdWorkers).toHaveLength(1);

    act(() => {
      createdWorkers[0]?.respond(distribution);
    });

    expect(screen.getByText("Cumul")).toBeDefined();

    const rows = screen.getAllByRole("row").slice(1);
    expect(within(rows[0] ?? document.body).getAllByRole("cell")[2]?.textContent).toBe("20.0%");
    expect(within(rows[1] ?? document.body).getAllByRole("cell")[2]?.textContent).toBe("50.0%");
    expect(within(rows[2] ?? document.body).getAllByRole("cell")[2]?.textContent).toBe("100.0%");
  });
});
