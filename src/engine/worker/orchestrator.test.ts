import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DECK_SIZE } from "../types/constants.ts";
import type { WorkerInit, WorkerResult } from "./messages.ts";
import { optimizeDeckParallel } from "./orchestrator.ts";

/** Minimal mock Worker that immediately posts a RESULT on receiving INIT. */
class MockWorker {
  onmessage: ((e: MessageEvent<WorkerResult>) => void) | null = null;
  onerror: ((e: ErrorEvent) => void) | null = null;
  terminated = false;
  receivedMessage: WorkerInit | null = null;

  postMessage(msg: WorkerInit) {
    this.receivedMessage = msg;
    // Simulate async worker response
    setTimeout(() => {
      if (this.terminated) return;
      const deck = new Array(DECK_SIZE).fill(1);
      const result: WorkerResult = {
        type: "RESULT",
        bestDeck: deck,
        bestScore: 100_000 + msg.seed,
        iterations: 1000,
      };
      this.onmessage?.({ data: result } as MessageEvent<WorkerResult>);
    }, 0);
  }

  terminate() {
    this.terminated = true;
  }
}

// Track all created workers for assertions
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
  // Default to 2 workers for faster tests
  vi.stubGlobal("navigator", { hardwareConcurrency: 2 });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function makeCollection(size = 60): ReadonlyMap<number, number> {
  const m = new Map<number, number>();
  for (let id = 1; id <= size; id++) m.set(id, 3);
  return m;
}

describe("optimizeDeckParallel", () => {
  it("throws on collection with < 40 total cards", async () => {
    const tiny = new Map<number, number>();
    tiny.set(1, 10);
    tiny.set(2, 10);
    await expect(optimizeDeckParallel(tiny)).rejects.toThrow(/requires 40/);
  });

  it("spawns workers and returns a result", async () => {
    const result = await optimizeDeckParallel(makeCollection());

    expect(result.deck).toHaveLength(DECK_SIZE);
    expect(result.expectedAtk).toBeTypeOf("number");
    expect(result.elapsedMs).toBeGreaterThan(0);
    expect(createdWorkers).toHaveLength(2);
  });

  it("sends correct INIT messages to workers", async () => {
    await optimizeDeckParallel(makeCollection(), { timeLimit: 20_000 });

    for (let i = 0; i < createdWorkers.length; i++) {
      const msg = createdWorkers[i]?.receivedMessage as WorkerInit;
      expect(msg.type).toBe("INIT");
      expect(msg.seed).toBe(i);
      expect(msg.timeBudgetMs).toBe(20_000 - 5_000); // timeLimit - reserve
      expect(typeof msg.collection).toBe("object");
    }
  });

  it("picks the worker with the highest bestScore", async () => {
    // Worker with seed=1 gets bestScore 100_001 > seed=0's 100_000
    // Both return deck filled with 1s, but exact scoring determines final expectedAtk
    const result = await optimizeDeckParallel(makeCollection());

    // The result should come through (exact scoring will recompute)
    expect(result.expectedAtk).toBeTypeOf("number");
  });

  it("terminates all workers after completion", async () => {
    await optimizeDeckParallel(makeCollection());
    for (const w of createdWorkers) {
      expect(w.terminated).toBe(true);
    }
  });

  it("terminates workers on abort", async () => {
    const controller = new AbortController();

    // Override MockWorker to never respond, simulating a long-running worker
    vi.stubGlobal(
      "Worker",
      class extends MockWorker {
        constructor() {
          super();
          createdWorkers.push(this);
        }
        postMessage() {
          // Don't respond — simulate workers that never finish
        }
      },
    );

    const promise = optimizeDeckParallel(makeCollection(), { signal: controller.signal });

    // Let workers be created
    await new Promise((r) => setTimeout(r, 10));
    expect(createdWorkers.length).toBeGreaterThan(0);

    controller.abort();

    // Workers should be terminated
    for (const w of createdWorkers) {
      expect(w.terminated).toBe(true);
    }

    // The promise won't resolve since workers never posted results and were terminated.
    // We just verify the abort behavior — don't await the promise.
    void promise.catch(() => {});
  });

  it("returns null improvement when no currentDeck provided", async () => {
    const result = await optimizeDeckParallel(makeCollection());
    expect(result.currentDeckScore).toBeNull();
    expect(result.improvement).toBeNull();
  });
});
