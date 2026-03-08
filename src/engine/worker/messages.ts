/** Main thread → Worker: initialize buffers and run SA. */
export type WorkerInit = {
  type: "INIT";
  /** cardId → quantity */
  collection: Record<number, number>;
  seed: number;
  timeBudgetMs: number;
  /** Optional initial deck to override the greedy seed. */
  initialDeck?: number[];
};

/** Worker → Main thread: SA finished, here's the best result. */
export type WorkerResult = {
  type: "RESULT";
  bestDeck: number[];
  bestScore: number;
  iterations: number;
};

/** Worker → Main thread: periodic progress update during SA run. */
export type WorkerProgress = {
  type: "PROGRESS";
  bestScore: number;
  bestDeck: number[];
  iterations: number;
};

/** Main thread → Scorer Worker: score a deck exactly. */
export type ScorerInit = {
  type: "SCORE";
  collection: Record<number, number>;
  deck: number[];
};

/** Scorer Worker → Main thread: exact scoring result. */
export type ScorerResult = {
  type: "SCORE_RESULT";
  expectedAtk: number;
};

export type WorkerMessage = WorkerInit;
export type WorkerResponse = WorkerResult | WorkerProgress;
export type ScorerMessage = ScorerInit;
export type ScorerResponse = ScorerResult;
