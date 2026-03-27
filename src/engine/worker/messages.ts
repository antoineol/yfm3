import type { EngineConfig } from "../config.ts";
import type { ModId } from "../mods.ts";

/** Game data received from the emulator bridge (fusion/equip tables from disc image). */
export type BridgeGameData = {
  fusionTable: Array<{ material1: number; material2: number; result: number }>;
  equipTable: Array<{ equipId: number; monsterIds: number[] }>;
};

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
  /** Which game mod's data to load. */
  modId: ModId;
  /** Bridge game data — overrides CSV fusions/equips when provided. */
  gameData?: BridgeGameData;
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
  /** Which game mod's data to load. */
  modId: ModId;
  /** Bridge game data — overrides CSV fusions/equips when provided. */
  gameData?: BridgeGameData;
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
  /** Which game mod's data to load. */
  modId: ModId;
  /** Bridge game data — overrides CSV fusions/equips when provided. */
  gameData?: BridgeGameData;
};

/** Explainer Worker → Main thread: score explanation result. */
export type ExplainerResult = {
  type: "EXPLAIN_RESULT";
  expectedAtk: number;
  distribution: { atk: number; count: number; probabilityMax: number }[];
};

export type ScorerMessage = ScorerInit;
export type ScorerResponse = ScorerResult;
export type ExplainerMessage = ExplainerInit;
export type ExplainerResponse = ExplainerResult;
