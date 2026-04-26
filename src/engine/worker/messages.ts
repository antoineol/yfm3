import type { EngineConfig } from "../config.ts";
import type { ModId } from "../mods.ts";
import type { RankFactorDefinition } from "../ranking/rank-scoring.ts";

/** A card extracted from the game disc image by the bridge. */
export type BridgeCard = {
  id: number;
  name: string;
  atk: number;
  def: number;
  gs1: string;
  gs2: string;
  type: string;
  color: string;
  level: number;
  attribute: string;
  description: string;
  starchipCost: number;
  password: string;
};

/** A duelist extracted from the game disc image by the bridge. */
export type BridgeDuelist = {
  id: number;
  name: string;
  deck: number[];
  saPow: number[];
  bcd: number[];
  saTec: number[];
};

export type BridgeRankScoringData = {
  source: "bin-majority";
  tableCount: number;
  selectedCount: number;
  variantCount: number;
  factors: RankFactorDefinition[];
};

/**
 * Game data received from the emulator bridge (all game tables from disc image + RAM).
 *
 * Every field is **required**: the boundary parser must set each one. Nullable
 * fields encode "not present for this mod" (e.g. vanilla has no deck-limit
 * dispatcher, so `deckLimits` is `null`). This distinguishes "legitimately
 * absent" (null) from "silently dropped in transit" (which would now be a
 * type error instead of a runtime no-op — that exact bug is what this shape
 * prevents).
 */
export type BridgeGameData = {
  cards: BridgeCard[];
  duelists: BridgeDuelist[];
  fusionTable: Array<{ material1: number; material2: number; result: number }>;
  equipTable: Array<{ equipId: number; monsterIds: number[] }>;
  /** Equip bonus values from the EXE, or null if detection failed. */
  equipBonuses: { equipBonus: number; megamorphId: number; megamorphBonus: number } | null;
  /** Per-equip ATK bonuses parsed from card descriptions, or null if unavailable. */
  perEquipBonuses: Record<number, number> | null;
  /**
   * Per-card deck-copy limit from the SLUS dispatcher table. cardId → 1 or 2
   * (sparse — absent IDs default to 3). `null` when the running mod has no
   * dispatcher (e.g. vanilla).
   */
  deckLimits: { byCard: Record<number, number> } | null;
  /** Rank threshold table extracted from the active disc image, or null if unavailable. */
  rankScoring: BridgeRankScoringData | null;
  /**
   * Field bonus table from RAM: 120 signed bytes (20 monster types × 6
   * non-Normal terrains, indexed as type * 6 + (terrain - 1)). null when not
   * found in RAM.
   */
  fieldBonusTable: number[] | null;
  /**
   * Per-disc artwork cache key (gameDataHash[0:12]-pathHash[0:8]). Goes in
   * bridge artwork URLs so each mod/disc has its own URL space — without it,
   * the browser HTTP cache returns the previous mod's PNG when the user swaps
   * ROMs (URL is identical, on-disk dir differs).
   */
  artworkKey: string;
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

/** Main thread → Farm Worker: discover farmable fusions (both POW and TEC). */
export type FarmWorkerInit = {
  type: "FARM";
  collection: Record<number, number>;
  deckScore: number;
  fusionDepth: number;
  modId: ModId;
  gameData?: BridgeGameData;
  /** Duelist IDs unlocked for free duel. Omit to include all duelists. */
  unlockedDuelists?: number[];
};

/** Farm Worker → Main thread: discovery results for both drop modes. */
export type FarmWorkerResult = {
  type: "FARM_RESULT";
  pow: SerializedFarmDiscoveryResult;
  tec: SerializedFarmDiscoveryResult;
};

/** Serializable version of FarmDiscoveryResult (Maps → plain objects). */
export type SerializedFarmDiscoveryResult = {
  fusions: SerializedFarmableFusion[];
  duelistRanking: Array<{
    duelistId: number;
    duelistName: string;
    fusionCount: number;
    bestAtk: number;
    totalAtk: number;
  }>;
};

export type SerializedFarmableFusion = {
  resultCardId: number;
  resultAtk: number;
  resultName: string;
  depth: number;
  materials: number[];
  missingMaterials: number[];
  /** cardId (as string key) → DropSource[]. Maps don't survive structured clone in all envs. */
  dropSources: Record<string, Array<{ duelistId: number; duelistName: string; weight: number }>>;
};

/** Farm Worker → Main thread: computation failed. */
export type FarmWorkerError = {
  type: "FARM_ERROR";
  message: string;
};

export type FarmWorkerMessage = FarmWorkerInit;
export type FarmWorkerResponse = FarmWorkerResult | FarmWorkerError;
