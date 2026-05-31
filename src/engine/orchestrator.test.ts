import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetConfig } from "./config.ts";
import { optimizeDeckParallel } from "./orchestrator.ts";
import { DECK_SIZE } from "./types/constants.ts";
import type {
  BridgeGameData,
  ScorerInit,
  ScorerResult,
  WorkerInit,
  WorkerResponse,
  WorkerResult,
} from "./worker/messages.ts";

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
          expectedAtk: 1234,
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
    // Exact score comes back from the SA worker; no extra best-deck scorer.
    expect(scorerWorkers()).toHaveLength(0);
  });

  it("sends correct INIT messages to SA workers", async () => {
    await optimizeDeckParallel(makeCollection(), { timeLimit: 20_000 });

    for (let i = 0; i < saWorkers().length; i++) {
      const msg = saWorkers()[i]?.receivedMessage as WorkerInit;
      expect(msg.type).toBe("INIT");
      expect(msg.seed).toBe(i);
      expect(msg.timeBudgetMs).toBe(20_000);
      expect(msg.exactScoringReserveMs).toBe(2_000);
      expect(typeof msg.collection).toBe("object");
    }
  });

  it("returns the exact score from the best worker", async () => {
    const result = await optimizeDeckParallel(makeCollection());
    expect(result.expectedAtk).toBe(1234);
  });

  it("falls back to unweighted seeds when seed game data preparation fails", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const malformedGameData = { cards: undefined } as unknown as BridgeGameData;

    const result = await optimizeDeckParallel(makeCollection(), { gameData: malformedGameData });

    expect(result.expectedAtk).toBe(1234);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("Seed diversity disabled"),
      expect.anything(),
    );
    warn.mockRestore();
  });

  it("terminates all workers after completion", async () => {
    await optimizeDeckParallel(makeCollection());
    for (const w of createdWorkers) {
      expect(w.terminated).toBe(true);
    }
  });

  it("rejects on abort before any worker reports progress", async () => {
    const controller = new AbortController();

    // Override MockWorker to never respond for SA, simulating a long-running worker.
    // Scorer responds immediately so the pipeline can complete after abort.
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
              this.onmessage?.({
                data: { type: "SCORE_RESULT", expectedAtk: 0 },
              } as MessageEvent<ScorerResult>);
            }, 0);
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

    await expect(promise).rejects.toThrow(/before any worker reported progress/);
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

  it("uses the current deck as the first override seed when sizes match", async () => {
    vi.stubGlobal("navigator", { hardwareConcurrency: 3 });
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
    const currentDeck = Array.from({ length: DECK_SIZE }, (_, i) => i + 1);

    await optimizeDeckParallel(makeCollection(), { currentDeck });

    const msg = saWorkers()[1]?.receivedMessage as WorkerInit;
    expect(msg.initialDeck).toEqual(currentDeck);
  });
});

describe("scorer workers", () => {
  it("scores best deck in a worker (not on main thread)", async () => {
    const result = await optimizeDeckParallel(makeCollection());

    expect(scorerWorkers()).toHaveLength(0);
    expect(result.expectedAtk).toBe(1234);
  });

  it("scores current deck in a worker when provided", async () => {
    const currentDeck = new Array(DECK_SIZE).fill(5);
    const result = await optimizeDeckParallel(makeCollection(), { currentDeck });

    // 1 scorer worker for currentDeck; bestDeck was exact-scored inside the SA worker.
    expect(scorerWorkers()).toHaveLength(1);
    // currentDeckScore from scorer worker mock = 1234
    expect(result.currentDeckScore).toBe(1234);
    expect(result.improvement).toBe(0); // both return 1234
  });

  it("skips current deck scoring when deck has wrong size", async () => {
    const shortDeck = [1, 2, 3];
    const result = await optimizeDeckParallel(makeCollection(), { currentDeck: shortDeck });

    expect(scorerWorkers()).toHaveLength(0);
    expect(result.currentDeckScore).toBeNull();
  });

  it("uses pre-computed currentDeckScore and skips scoring worker", async () => {
    const currentDeck = new Array(DECK_SIZE).fill(5);
    const result = await optimizeDeckParallel(makeCollection(), {
      currentDeck,
      currentDeckScore: 999.9,
    });

    // Current score is reused, but the improving result still gets one cleanup validation worker.
    expect(scorerWorkers()).toHaveLength(1);
    expect(result.currentDeckScore).toBe(999.9);
    expect(result.improvement).toBe(1234 - 999.9);
  });

  it("keeps the original winner when diff cleanup exact score is lower", async () => {
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
              this.onmessage?.({
                data: {
                  type: "SCORE_RESULT",
                  expectedAtk: 1900,
                  deck: new Array(DECK_SIZE).fill(1),
                },
              } as MessageEvent<ScorerResult>);
            }, 0);
            return;
          }
          this.kind = "sa";
          setTimeout(() => {
            if (this.terminated) return;
            this.onmessage?.({
              data: {
                type: "RESULT",
                bestDeck: new Array(DECK_SIZE).fill(9),
                bestScore: 100_000,
                expectedAtk: 2000,
                iterations: 1000,
              },
            } as MessageEvent<WorkerResponse>);
          }, 0);
        }
      },
    );

    const result = await optimizeDeckParallel(makeCollection(), {
      currentDeck: new Array(DECK_SIZE).fill(1),
      currentDeckScore: 1000,
    });

    expect(result.expectedAtk).toBe(2000);
    expect(result.deck[0]).toBe(9);
  });

  it("keeps the cleaned deck when diff cleanup exact score is not lower", async () => {
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
              this.onmessage?.({
                data: {
                  type: "SCORE_RESULT",
                  expectedAtk: 2000,
                  deck: new Array(DECK_SIZE).fill(1),
                },
              } as MessageEvent<ScorerResult>);
            }, 0);
            return;
          }
          this.kind = "sa";
          setTimeout(() => {
            if (this.terminated) return;
            this.onmessage?.({
              data: {
                type: "RESULT",
                bestDeck: new Array(DECK_SIZE).fill(9),
                bestScore: 100_000,
                expectedAtk: 2000,
                iterations: 1000,
              },
            } as MessageEvent<WorkerResponse>);
          }, 0);
        }
      },
    );

    const result = await optimizeDeckParallel(makeCollection(), {
      currentDeck: new Array(DECK_SIZE).fill(1),
      currentDeckScore: 1000,
    });

    expect(result.expectedAtk).toBe(2000);
    expect(result.deck[0]).toBe(1);
  });

  it("picks the best worker by exact score instead of sampled score", async () => {
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
            return;
          }
          this.kind = "sa";
          setTimeout(() => {
            if (this.terminated) return;
            const deck = new Array(DECK_SIZE).fill(msg.seed + 1);
            const result: WorkerResult = {
              type: "RESULT",
              bestDeck: deck,
              bestScore: msg.seed === 0 ? 200_000 : 100_000,
              expectedAtk: msg.seed === 0 ? 1000 : 2000,
              iterations: 1000,
            };
            this.onmessage?.({ data: result } as MessageEvent<WorkerResponse>);
          }, 0);
        }
      },
    );

    const result = await optimizeDeckParallel(makeCollection());

    expect(result.deck[0]).toBe(2);
    expect(result.expectedAtk).toBe(2000);
    expect(scorerWorkers()).toHaveLength(0);
  });

  it("falls back to scoring the sampled winner when workers have no exact score", async () => {
    vi.stubGlobal("navigator", { hardwareConcurrency: 5 });
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
          setTimeout(() => {
            if (this.terminated) return;
            const deck = new Array(DECK_SIZE).fill(msg.seed + 1);
            const result: WorkerResult = {
              type: "RESULT",
              bestDeck: deck,
              bestScore: 100_000 + msg.seed,
              iterations: 1000,
            };
            this.onmessage?.({ data: result } as MessageEvent<WorkerResponse>);
          }, 0);
        }
      },
    );

    await optimizeDeckParallel(makeCollection());

    expect(scorerWorkers()).toHaveLength(1);
  });
});

describe("worker lifecycle", () => {
  it("waits for worker results instead of terminating on a progress plateau", async () => {
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
            this.onmessage?.({
              data: {
                type: "PROGRESS",
                bestScore: 50_000,
                bestDeck: deck,
                iterations: count * 100,
              },
            } as MessageEvent<WorkerResponse>);

            if (count >= 10) {
              clearInterval(interval);
              this.onmessage?.({
                data: {
                  type: "RESULT",
                  bestDeck: deck,
                  bestScore: 50_000,
                  expectedAtk: 1234,
                  iterations: count * 100,
                },
              } as MessageEvent<WorkerResponse>);
            }
          }, 100);
        }
      },
    );

    const result = await optimizeDeckParallel(makeCollection());

    expect(progressCount).toBe(10);
    expect(result.expectedAtk).toBe(1234);
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

    expect(progressCount).toBeGreaterThan(0);
    expect(result.expectedAtk).toBeTypeOf("number");
  });
});

describe("onProgress callback", () => {
  it("receives increasing progress values 0→1 with best score", async () => {
    vi.stubGlobal("navigator", { hardwareConcurrency: 2 });
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
                bestScore: 50_000 + count * 100,
                bestDeck: deck,
                iterations: count * 100,
              },
            } as MessageEvent<WorkerResponse>);

            if (count >= 5) {
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
          }, 50);
        }
      },
    );

    const progressValues: Array<{ progress: number; bestScore: number; bestDeck: number[] }> = [];
    await optimizeDeckParallel(makeCollection(), {
      onProgress: (progress, bestScore, bestDeck) => {
        progressValues.push({ progress, bestScore, bestDeck });
      },
    });

    expect(progressValues.length).toBeGreaterThan(0);
    // Progress values should be between 0 and 1
    for (const pv of progressValues) {
      expect(pv.progress).toBeGreaterThanOrEqual(0);
      expect(pv.progress).toBeLessThanOrEqual(1);
      expect(pv.bestScore).toBeGreaterThan(0);
      expect(pv.bestDeck).toBeInstanceOf(Array);
      expect(pv.bestDeck.length).toBe(DECK_SIZE);
    }
    // Best score should be non-decreasing
    for (let i = 1; i < progressValues.length; i++) {
      const curr = progressValues[i];
      const prev = progressValues[i - 1];
      if (curr && prev) {
        expect(curr.bestScore).toBeGreaterThanOrEqual(prev.bestScore);
      }
    }
  });

  it("cancel aborts and returns partial result (not null)", async () => {
    vi.stubGlobal("navigator", { hardwareConcurrency: 2 });
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
                expectedAtk: 7777,
              };
              this.onmessage?.({ data: result } as MessageEvent<ScorerResult>);
            }, 0);
            return;
          }
          this.kind = "sa";
          const deck = new Array(DECK_SIZE).fill(1);
          let count = 0;
          // Send progress indefinitely, never send RESULT
          const interval = setInterval(() => {
            if (this.terminated) {
              clearInterval(interval);
              return;
            }
            count++;
            this.onmessage?.({
              data: {
                type: "PROGRESS",
                bestScore: 60_000 + count * 10,
                bestDeck: deck,
                iterations: count * 100,
              },
            } as MessageEvent<WorkerResponse>);
          }, 50);
        }
      },
    );

    const controller = new AbortController();
    const resultPromise = optimizeDeckParallel(makeCollection(), {
      signal: controller.signal,
    });

    // Wait for workers to post some progress
    await new Promise((r) => setTimeout(r, 200));
    controller.abort();

    const result = await resultPromise;
    expect(result).not.toBeNull();
    expect(result.deck).toHaveLength(DECK_SIZE);
    expect(result.expectedAtk).toBe(7777);
  });
});
