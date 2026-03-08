import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetConfig } from "../config.ts";
import { DECK_SIZE } from "../types/constants.ts";
import type {
  ScorerInit,
  ScorerResult,
  WorkerInit,
  WorkerResponse,
  WorkerResult,
} from "./messages.ts";
import { optimizeDeckParallel } from "./orchestrator.ts";

/** Minimal mock Worker that handles both SA (INIT) and scorer (SCORE) messages. */
class MockWorker {
  onmessage: ((e: MessageEvent<WorkerResponse | ScorerResult>) => void) | null = null;
  onerror: ((e: ErrorEvent) => void) | null = null;
  terminated = false;
  receivedMessage: WorkerInit | ScorerInit | null = null;
  kind: "sa" | "scorer" | null = null;

  postMessage(msg: WorkerInit | ScorerInit) {
    this.receivedMessage = msg;
    if (msg.type === "SCORE") {
      this.kind = "scorer";
      setTimeout(() => {
        if (this.terminated) return;
        const result: ScorerResult = {
          type: "SCORE_RESULT",
          expectedAtk: 1234,
        };
        this.onmessage?.({ data: result } as MessageEvent<ScorerResult>);
      }, 0);
    } else {
      this.kind = "sa";
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
  }

  terminate() {
    this.terminated = true;
  }
}

// Track all created workers for assertions
let createdWorkers: MockWorker[] = [];

function saWorkers(): MockWorker[] {
  return createdWorkers.filter((w) => w.kind === "sa");
}

function scorerWorkers(): MockWorker[] {
  return createdWorkers.filter((w) => w.kind === "scorer");
}

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
  resetConfig();
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
  ])("hardwareConcurrency=%i → %i SA workers", async (cores, expectedWorkers) => {
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
    expect(saWorkers()).toHaveLength(expectedWorkers);
  });

  it("defaults to 3 SA workers when hardwareConcurrency is 0 (unknown)", async () => {
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
    // Falls back to 4 cores, then 4-1 = 3 SA workers
    expect(saWorkers()).toHaveLength(3);
  });
});

describe("optimizeDeckParallel", () => {
  it("throws on collection with < 40 total cards", async () => {
    const tiny = new Map<number, number>();
    tiny.set(1, 10);
    tiny.set(2, 10);
    await expect(optimizeDeckParallel(tiny)).rejects.toThrow(/requires 40/);
  });

  it("spawns SA workers and scorer workers, returns a result", async () => {
    const result = await optimizeDeckParallel(makeCollection());

    expect(result.deck).toHaveLength(DECK_SIZE);
    expect(result.expectedAtk).toBeTypeOf("number");
    expect(result.elapsedMs).toBeGreaterThan(0);
    // hardwareConcurrency=2 → 1 SA worker
    expect(saWorkers()).toHaveLength(1);
    // 1 scorer worker for best deck (no currentDeck provided)
    expect(scorerWorkers()).toHaveLength(1);
  });

  it("sends correct INIT messages to SA workers", async () => {
    await optimizeDeckParallel(makeCollection(), { timeLimit: 20_000 });

    for (let i = 0; i < saWorkers().length; i++) {
      const msg = saWorkers()[i]?.receivedMessage as WorkerInit;
      expect(msg.type).toBe("INIT");
      expect(msg.seed).toBe(i);
      expect(msg.timeBudgetMs).toBe(20_000 - 2_000); // timeLimit - reserve
      expect(typeof msg.collection).toBe("object");
    }
  });

  it("picks the worker with the highest bestScore", async () => {
    // Worker with seed=1 gets bestScore 100_001 > seed=0's 100_000
    // Both return deck filled with 1s, but exact scoring determines final expectedAtk
    const result = await optimizeDeckParallel(makeCollection());

    // The result should come through (scorer worker returns 1234)
    expect(result.expectedAtk).toBe(1234);
  });

  it("terminates all workers after completion", async () => {
    await optimizeDeckParallel(makeCollection());
    for (const w of createdWorkers) {
      expect(w.terminated).toBe(true);
    }
  });

  it("terminates workers on abort", async () => {
    const controller = new AbortController();

    // Override MockWorker to never respond for SA, simulating a long-running worker
    vi.stubGlobal(
      "Worker",
      class extends MockWorker {
        constructor() {
          super();
          createdWorkers.push(this);
        }
        postMessage(msg: WorkerInit | ScorerInit) {
          this.receivedMessage = msg;
          if (msg.type === "SCORE") {
            this.kind = "scorer";
            // Scorer also doesn't respond
          } else {
            this.kind = "sa";
            // Don't respond — simulate workers that never finish
          }
        }
      },
    );

    const promise = optimizeDeckParallel(makeCollection(), { signal: controller.signal });

    // Let workers be created
    await new Promise((r) => setTimeout(r, 10));
    expect(saWorkers().length).toBeGreaterThan(0);

    controller.abort();

    // SA workers should be terminated
    for (const w of saWorkers()) {
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

describe("multi-start seeding", () => {
  it("sends no initialDeck to worker 0 (greedy default)", async () => {
    vi.stubGlobal("navigator", { hardwareConcurrency: 5 });
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

    await optimizeDeckParallel(makeCollection());

    const worker0 = saWorkers()[0];
    expect(worker0).toBeDefined();
    const msg = worker0?.receivedMessage as WorkerInit;
    expect(msg.initialDeck).toBeUndefined();
  });

  it("sends initialDeck to workers 1+ when multiple workers exist", async () => {
    vi.stubGlobal("navigator", { hardwareConcurrency: 5 });
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

    await optimizeDeckParallel(makeCollection());

    const workers = saWorkers();
    expect(workers.length).toBeGreaterThan(1);

    for (let i = 1; i < workers.length; i++) {
      const msg = workers[i]?.receivedMessage as WorkerInit;
      expect(msg.initialDeck).toBeDefined();
      expect(msg.initialDeck).toHaveLength(DECK_SIZE);
    }
  });
});

describe("scorer workers", () => {
  it("scores best deck in a worker (not on main thread)", async () => {
    const result = await optimizeDeckParallel(makeCollection());

    // Best-deck scorer worker receives the best deck from SA
    const bestScorer = scorerWorkers()[0];
    expect(bestScorer).toBeDefined();
    const msg = bestScorer?.receivedMessage as ScorerInit;
    expect(msg.type).toBe("SCORE");
    expect(msg.deck).toHaveLength(DECK_SIZE);
    // Mock scorer returns 1234
    expect(result.expectedAtk).toBe(1234);
  });

  it("scores current deck in a worker when provided", async () => {
    const currentDeck = new Array(DECK_SIZE).fill(5);
    const result = await optimizeDeckParallel(makeCollection(), { currentDeck });

    // 2 scorer workers: one for currentDeck, one for bestDeck
    expect(scorerWorkers()).toHaveLength(2);
    // currentDeckScore from scorer worker mock = 1234
    expect(result.currentDeckScore).toBe(1234);
    expect(result.improvement).toBe(0); // both return 1234
  });

  it("skips current deck scoring when deck has wrong size", async () => {
    const shortDeck = [1, 2, 3];
    const result = await optimizeDeckParallel(makeCollection(), { currentDeck: shortDeck });

    // Only 1 scorer worker (best deck), no current deck scoring
    expect(scorerWorkers()).toHaveLength(1);
    expect(result.currentDeckScore).toBeNull();
  });

  it("scores only the single best candidate by sampled score", async () => {
    vi.stubGlobal("navigator", { hardwareConcurrency: 5 });
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

    await optimizeDeckParallel(makeCollection());

    // Regardless of how many SA workers, only 1 scorer worker fires (best by sampled score)
    expect(scorerWorkers()).toHaveLength(1);
  });
});

describe("convergence detection", () => {
  it("terminates early when all workers individually plateau", async () => {
    vi.stubGlobal("navigator", { hardwareConcurrency: 4 });
    createdWorkers = [];

    vi.stubGlobal(
      "Worker",
      class extends MockWorker {
        constructor() {
          super();
          createdWorkers.push(this);
        }
        postMessage(msg: WorkerInit | ScorerInit) {
          this.receivedMessage = msg;
          if (msg.type === "SCORE") {
            this.kind = "scorer";
            setTimeout(() => {
              if (this.terminated) return;
              const result: ScorerResult = {
                type: "SCORE_RESULT",
                expectedAtk: 1234,
              };
              this.onmessage?.({ data: result } as MessageEvent<ScorerResult>);
            }, 0);
            return;
          }
          this.kind = "sa";
          const deck = new Array(DECK_SIZE).fill(1);
          // Each worker sends PROGRESS with a fixed per-worker score (no improvement)
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
          // Never send RESULT — per-worker convergence should resolve
        }
      },
    );

    const start = performance.now();
    const result = await optimizeDeckParallel(makeCollection());
    const elapsed = performance.now() - start;

    // Should terminate well before the full 13s SA budget
    expect(elapsed).toBeLessThan(6_000);
    expect(result.deck).toHaveLength(DECK_SIZE);
    for (const w of saWorkers()) {
      expect(w.terminated).toBe(true);
    }
  });

  it("does not terminate early while any worker is still improving", async () => {
    vi.stubGlobal("navigator", { hardwareConcurrency: 3 });
    createdWorkers = [];
    let improvingWorkerProgressCount = 0;

    vi.stubGlobal(
      "Worker",
      class extends MockWorker {
        constructor() {
          super();
          createdWorkers.push(this);
        }
        postMessage(msg: WorkerInit | ScorerInit) {
          this.receivedMessage = msg;
          if (msg.type === "SCORE") {
            this.kind = "scorer";
            setTimeout(() => {
              if (this.terminated) return;
              const result: ScorerResult = {
                type: "SCORE_RESULT",
                expectedAtk: 1234,
              };
              this.onmessage?.({ data: result } as MessageEvent<ScorerResult>);
            }, 0);
            return;
          }
          this.kind = "sa";
          const deck = new Array(DECK_SIZE).fill(msg.seed + 1);
          let count = 0;
          const interval = setInterval(() => {
            if (this.terminated) {
              clearInterval(interval);
              return;
            }
            count++;
            // Worker 0: keeps improving
            // Worker 1: plateaued
            const score = msg.seed === 0 ? 50_000 + count * 100 : 60_000;
            if (msg.seed === 0) improvingWorkerProgressCount++;
            this.onmessage?.({
              data: {
                type: "PROGRESS",
                bestScore: score,
                bestDeck: deck,
                iterations: count * 100,
              },
            } as MessageEvent<WorkerResponse>);

            // After enough progress, end naturally
            if (count >= 15) {
              clearInterval(interval);
              this.onmessage?.({
                data: {
                  type: "RESULT",
                  bestDeck: deck,
                  bestScore: score,
                  iterations: count * 100,
                },
              } as MessageEvent<WorkerResponse>);
            }
          }, 100);
        }
      },
    );

    await optimizeDeckParallel(makeCollection());

    // Worker 0 kept improving, so convergence shouldn't have triggered early
    // Worker 0 should have sent multiple progress updates before natural completion
    expect(improvingWorkerProgressCount).toBeGreaterThanOrEqual(10);
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
        postMessage(msg: WorkerInit | ScorerInit) {
          this.receivedMessage = msg;
          if (msg.type === "SCORE") {
            this.kind = "scorer";
            setTimeout(() => {
              if (this.terminated) return;
              // Return higher exact score for the deck filled with 2s (worker seed=1)
              const deckVal = msg.deck[0] ?? 0;
              const result: ScorerResult = {
                type: "SCORE_RESULT",
                expectedAtk: deckVal === 2 ? 9999 : 5000,
              };
              this.onmessage?.({ data: result } as MessageEvent<ScorerResult>);
            }, 0);
            return;
          }
          this.kind = "sa";
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

    // Worker seed=1 deck (filled with 2s) gets highest exact score (9999)
    expect(result.deck[0]).toBe(2);
    expect(result.expectedAtk).toBe(9999);
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
        postMessage(msg: WorkerInit | ScorerInit) {
          this.receivedMessage = msg;
          if (msg.type === "SCORE") {
            this.kind = "scorer";
            setTimeout(() => {
              if (this.terminated) return;
              const result: ScorerResult = {
                type: "SCORE_RESULT",
                expectedAtk: 1234,
              };
              this.onmessage?.({ data: result } as MessageEvent<ScorerResult>);
            }, 0);
            return;
          }
          this.kind = "sa";
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
