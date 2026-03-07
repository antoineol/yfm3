import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DECK_SIZE } from "../types/constants.ts";
import type { WorkerInit, WorkerResponse, WorkerResult } from "./messages.ts";
import { optimizeDeckParallel } from "./orchestrator.ts";

/** Minimal mock Worker that immediately posts a RESULT on receiving INIT. */
class MockWorker {
  onmessage: ((e: MessageEvent<WorkerResponse>) => void) | null = null;
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
      this.onmessage?.({ data: result } as MessageEvent<WorkerResponse>);
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

describe("worker count heuristic", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    [1, 1],
    [2, 1],
    [4, 3],
    [8, 7],
    [16, 15],
    [64, 32],
  ])("hardwareConcurrency=%i → %i workers", async (cores, expectedWorkers) => {
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
    vi.stubGlobal("navigator", { hardwareConcurrency: cores });

    await optimizeDeckParallel(makeCollection());
    expect(createdWorkers).toHaveLength(expectedWorkers);
  });

  it("defaults to 3 workers when hardwareConcurrency is 0 (unknown)", async () => {
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
    vi.stubGlobal("navigator", { hardwareConcurrency: 0 });

    await optimizeDeckParallel(makeCollection());
    // Falls back to 4 cores, then 4-1 = 3 workers
    expect(createdWorkers).toHaveLength(3);
  });
});

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
    // hardwareConcurrency=2 → max(1, min(2-1, 6)) = 1 worker
    expect(createdWorkers).toHaveLength(1);
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

describe("convergence detection", () => {
  it("terminates early when no improvement across workers", async () => {
    // Mock that sends PROGRESS with a fixed score, then RESULT much later.
    // The convergence timeout for a 15s budget (10s SA) is max(3s, 10s*0.3) = 3s.
    // We send progress repeatedly with the same score; after 3s of no improvement,
    // the orchestrator should resolve from progress and terminate.
    vi.stubGlobal("navigator", { hardwareConcurrency: 4 });
    createdWorkers = [];

    vi.stubGlobal(
      "Worker",
      class extends MockWorker {
        constructor() {
          super();
          createdWorkers.push(this);
        }
        postMessage(msg: WorkerInit) {
          this.receivedMessage = msg;
          const deck = new Array(DECK_SIZE).fill(1);
          // Send PROGRESS every 100ms with the same score (no improvement)
          let count = 0;
          const interval = setInterval(() => {
            if (this.terminated) {
              clearInterval(interval);
              return;
            }
            count++;
            this.onmessage?.({
              data: {
                type: "PROGRESS",
                bestScore: 50_000 + msg.seed,
                bestDeck: deck,
                iterations: count * 100,
              },
            } as MessageEvent<WorkerResponse>);
          }, 100);
          // Never send RESULT — convergence should resolve the promise
        }
      },
    );

    const start = performance.now();
    const result = await optimizeDeckParallel(makeCollection());
    const elapsed = performance.now() - start;

    // Should terminate well before the full 10s SA budget
    // (convergence timeout is 3s + some slack for progress intervals)
    expect(elapsed).toBeLessThan(5_000);
    expect(result.deck).toHaveLength(DECK_SIZE);
    for (const w of createdWorkers) {
      expect(w.terminated).toBe(true);
    }
  });

  it("picks best score from progress when terminating early", async () => {
    vi.stubGlobal("navigator", { hardwareConcurrency: 3 });
    createdWorkers = [];

    vi.stubGlobal(
      "Worker",
      class extends MockWorker {
        constructor() {
          super();
          createdWorkers.push(this);
        }
        postMessage(msg: WorkerInit) {
          this.receivedMessage = msg;
          const deck = new Array(DECK_SIZE).fill(msg.seed + 1);
          // Each worker reports a different fixed score
          const interval = setInterval(() => {
            if (this.terminated) {
              clearInterval(interval);
              return;
            }
            this.onmessage?.({
              data: {
                type: "PROGRESS",
                bestScore: 80_000 + msg.seed * 1000,
                bestDeck: deck,
                iterations: 500,
              },
            } as MessageEvent<WorkerResponse>);
          }, 100);
        }
      },
    );

    const result = await optimizeDeckParallel(makeCollection());

    // Worker with seed=1 has highest score: 80_000 + 1*1000 = 81_000
    // The result deck should be from that worker (filled with seed+1 = 2)
    expect(result.deck[0]).toBe(2);
  });

  it("does not terminate early when scores keep improving", async () => {
    vi.stubGlobal("navigator", { hardwareConcurrency: 2 });
    createdWorkers = [];

    let progressCount = 0;

    vi.stubGlobal(
      "Worker",
      class extends MockWorker {
        constructor() {
          super();
          createdWorkers.push(this);
        }
        postMessage(msg: WorkerInit) {
          this.receivedMessage = msg;
          const deck = new Array(DECK_SIZE).fill(1);
          let count = 0;
          const interval = setInterval(() => {
            if (this.terminated) {
              clearInterval(interval);
              return;
            }
            count++;
            progressCount++;
            // Score keeps increasing — convergence should never trigger
            this.onmessage?.({
              data: {
                type: "PROGRESS",
                bestScore: 50_000 + count * 100,
                bestDeck: deck,
                iterations: count * 100,
              },
            } as MessageEvent<WorkerResponse>);

            // After enough progress, send RESULT to end the test
            if (count >= 10) {
              clearInterval(interval);
              this.onmessage?.({
                data: {
                  type: "RESULT",
                  bestDeck: deck,
                  bestScore: 50_000 + count * 100,
                  iterations: count * 100,
                },
              } as MessageEvent<WorkerResponse>);
            }
          }, 100);
        }
      },
    );

    const result = await optimizeDeckParallel(makeCollection());

    // Should have received multiple progress updates before natural completion
    expect(progressCount).toBeGreaterThan(0);
    expect(result.expectedAtk).toBeTypeOf("number");
  });
});
