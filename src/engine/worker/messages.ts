/** Main thread → Worker: initialize buffers and run SA. */
export type WorkerInit = {
  type: "INIT";
  /** cardId → quantity */
  collection: Record<number, number>;
  seed: number;
  timeBudgetMs: number;
};

/** Worker → Main thread: SA finished, here's the best result. */
export type WorkerResult = {
  type: "RESULT";
  bestDeck: number[];
  bestScore: number;
  iterations: number;
};

export type WorkerMessage = WorkerInit;
export type WorkerResponse = WorkerResult;
