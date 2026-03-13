import type { EngineConfig } from "../config.ts";

/** Main thread → Worker: initialize buffers and run SA. */
export type WorkerInit = {
  type: "INIT";
  /** cardId → quantity */
  collection: Record<number, number>;
  seed: number;
  timeBudgetMs: number;
  /** Optional initial deck to override the greedy seed. */
  initialDeck?: number[];
  /** Engine configuration snapshot for this worker. */
  config: EngineConfig;
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
  /** Engine configuration snapshot for this worker. */
  config: EngineConfig;
};

/** Scorer Worker → Main thread: exact scoring result. */
export type ScorerResult = {
  type: "SCORE_RESULT";
  expectedAtk: number;
};

export type WorkerMessage = WorkerInit;
export type WorkerResponse = WorkerResult | WorkerProgress;
/** Main thread → Explainer Worker: explain a deck's score distribution. */
export type ExplainerInit = {
  type: "EXPLAIN";
  collection: Record<number, number>;
  deck: number[];
  /** Engine configuration snapshot for this worker. */
  config: EngineConfig;
};

/** Explainer Worker → Main thread: score explanation result. */
export type ExplainerResult = {
  type: "EXPLAIN_RESULT";
  expectedAtk: number;
  distribution: { atk: number; count: number; probabilityMax: number }[];
};

/** Main thread → Suggestion Worker: find the best one-card deck upgrade. */
export type SuggestionInit = {
  type: "SUGGEST";
  addedCardId: number;
  collection: Record<number, number>;
  deck: number[];
  /** Engine configuration snapshot for this worker. */
  config: EngineConfig;
};

/** Suggestion Worker → Main thread: best swap suggestion, if any. */
export type SuggestionResult = {
  type: "SUGGESTION_RESULT";
  suggestion: {
    removedCardId: number;
    improvement: number;
  } | null;
};

export type ScorerMessage = ScorerInit;
export type ScorerResponse = ScorerResult;
export type ExplainerMessage = ExplainerInit;
export type ExplainerResponse = ExplainerResult;
export type SuggestionMessage = SuggestionInit;
export type SuggestionResponse = SuggestionResult;
