import type { CardDb } from "../data/game-db.ts";
import type { RefDuelistCard, RefFusion } from "../reference/build-reference-table.ts";
import { FUSION_NONE, MAX_CARD_ID } from "../types/constants.ts";

// ── Types ────────────────────────────────────────────────────────────

/** POW = max(saPow, bcd) per card — default power-based farming. TEC = saTec only. */
export type DropMode = "pow" | "tec";

export interface DropSource {
  duelistId: number;
  duelistName: string;
  /** Best raw weight out of 2048 (max(saPow, bcd) for POW, saTec for TEC). */
  weight: number;
}

export interface FarmableFusion {
  resultCardId: number;
  resultAtk: number;
  resultName: string;
  /** 0 = standalone droppable card, 1 = direct fusion (2 materials), 2+ = chain. */
  depth: number;
  /** Original material card IDs consumed. Empty for depth-0. */
  materials: number[];
  /** Subset of materials not in collection (+ the card itself for depth-0). */
  missingMaterials: number[];
  /** For each missing material cardId → list of duelists that drop it. */
  dropSources: Map<number, DropSource[]>;
}

export interface DuelistFarmValue {
  duelistId: number;
  duelistName: string;
  /** Number of unique farmable fusions this duelist helps unlock. */
  fusionCount: number;
  /** Best result ATK among those fusions. */
  bestAtk: number;
  /** Sum of result ATK across unique fusions. */
  totalAtk: number;
}

export interface FarmDiscoveryResult {
  fusions: FarmableFusion[];
  duelistRanking: DuelistFarmValue[];
}

// ── Main entry point ─────────────────────────────────────────────────

export function discoverFarmableFusions(
  collection: ReadonlyMap<number, number>,
  fusionTable: Int16Array,
  cardAtk: Int16Array,
  cardDb: CardDb,
  fusionDepth: number,
  deckScore: number,
  duelists: RefDuelistCard[],
  fusions: RefFusion[],
  dropMode: DropMode,
  unlockedDuelists?: ReadonlySet<number>,
): FarmDiscoveryResult {
  const { droppableCards, collectionSet, reachablePool } = buildLookups(
    collection,
    duelists,
    dropMode,
    unlockedDuelists,
  );

  const candidates = findCandidates(
    collectionSet,
    reachablePool,
    droppableCards,
    fusionTable,
    cardAtk,
    cardDb,
    fusionDepth,
    deckScore,
    fusions,
  );

  const duelistRanking = aggregateByDuelist(candidates);
  return { fusions: candidates, duelistRanking };
}

// ── Phase 0: Build lookups ───────────────────────────────────────────

function buildLookups(
  collection: ReadonlyMap<number, number>,
  duelists: RefDuelistCard[],
  dropMode: DropMode,
  unlockedDuelists?: ReadonlySet<number>,
): {
  droppableCards: Map<number, DropSource[]>;
  collectionSet: Set<number>;
  reachablePool: Set<number>;
} {
  const droppableCards = new Map<number, DropSource[]>();

  for (const row of duelists) {
    if (unlockedDuelists && !unlockedDuelists.has(row.duelistId)) continue;
    const weight = dropMode === "pow" ? Math.max(row.saPow, row.bcd) : row.saTec;
    if (weight <= 0) continue;

    let sources = droppableCards.get(row.cardId);
    if (!sources) {
      sources = [];
      droppableCards.set(row.cardId, sources);
    }
    sources.push({
      duelistId: row.duelistId,
      duelistName: row.duelistName,
      weight,
    });
  }

  const collectionSet = new Set<number>();
  for (const [cardId, count] of collection) {
    if (count > 0) collectionSet.add(cardId);
  }

  const reachablePool = new Set(collectionSet);
  for (const cardId of droppableCards.keys()) {
    reachablePool.add(cardId);
  }

  return { droppableCards, collectionSet, reachablePool };
}

// ── Phase 1-4: Find and filter candidates ────────────────────────────

function findCandidates(
  collectionSet: Set<number>,
  reachablePool: Set<number>,
  droppableCards: Map<number, DropSource[]>,
  fusionTable: Int16Array,
  cardAtk: Int16Array,
  cardDb: CardDb,
  fusionDepth: number,
  deckScore: number,
  fusions: RefFusion[],
): FarmableFusion[] {
  // Key: `resultCardId_depth` → best candidate (fewest missing materials)
  const bestByKey = new Map<string, FarmableFusion>();

  // Phase 1: Depth-0 (standalone droppable cards with ATK > deckScore)
  for (const [cardId, sources] of droppableCards) {
    if (collectionSet.has(cardId)) continue;
    const atk = cardAtk[cardId] ?? 0;
    if (atk <= deckScore) continue;

    const card = cardDb.cardsById.get(cardId);
    recordCandidate(bestByKey, {
      resultCardId: cardId,
      resultAtk: atk,
      resultName: card?.name ?? `Card #${String(cardId)}`,
      depth: 0,
      materials: [],
      missingMaterials: [cardId],
      dropSources: new Map([[cardId, sources]]),
    });
  }

  if (fusionDepth < 1) {
    return sortCandidates(bestByKey);
  }

  // Phase 2: Depth-1 fusions (scan the fusions array)
  interface RawCandidate {
    resultId: number;
    materials: number[];
    depth: number;
  }

  const depth1Candidates: RawCandidate[] = [];

  for (const f of fusions) {
    if (!reachablePool.has(f.material1Id) || !reachablePool.has(f.material2Id)) continue;
    depth1Candidates.push({
      resultId: f.resultId,
      materials: [f.material1Id, f.material2Id],
      depth: 1,
    });
  }

  // Try to promote depth-1 candidates immediately
  for (const c of depth1Candidates) {
    tryRecord(
      c.resultId,
      c.materials,
      c.depth,
      deckScore,
      cardAtk,
      cardDb,
      collectionSet,
      droppableCards,
      bestByKey,
    );
  }

  // Phase 3: Chain extension (depth 2..fusionDepth)
  let currentLevel = depth1Candidates;
  const poolArray = Array.from(reachablePool);

  for (let depth = 2; depth <= fusionDepth; depth++) {
    const nextLevel: RawCandidate[] = [];

    for (const candidate of currentLevel) {
      const usedSet = new Set(candidate.materials);

      for (const cardId of poolArray) {
        if (usedSet.has(cardId)) continue;

        const resultId = fusionTable[candidate.resultId * MAX_CARD_ID + cardId] ?? FUSION_NONE;
        if (resultId === FUSION_NONE) continue;

        const newMaterials = [...candidate.materials, cardId];
        const raw: RawCandidate = {
          resultId,
          materials: newMaterials,
          depth,
        };
        nextLevel.push(raw);

        tryRecord(
          resultId,
          newMaterials,
          depth,
          deckScore,
          cardAtk,
          cardDb,
          collectionSet,
          droppableCards,
          bestByKey,
        );
      }
    }

    currentLevel = nextLevel;
  }

  return sortCandidates(bestByKey);
}

function tryRecord(
  resultId: number,
  materials: number[],
  depth: number,
  deckScore: number,
  cardAtk: Int16Array,
  cardDb: CardDb,
  collectionSet: Set<number>,
  droppableCards: Map<number, DropSource[]>,
  bestByKey: Map<string, FarmableFusion>,
): void {
  const atk = cardAtk[resultId] ?? 0;
  if (atk <= deckScore) return;

  const missingMaterials = materials.filter((m) => !collectionSet.has(m));
  if (missingMaterials.length === 0) return;

  // Every missing material must be droppable
  const dropSources = new Map<number, DropSource[]>();
  for (const m of missingMaterials) {
    const sources = droppableCards.get(m);
    if (!sources) return; // not droppable → discard
    dropSources.set(m, sources);
  }

  const card = cardDb.cardsById.get(resultId);
  recordCandidate(bestByKey, {
    resultCardId: resultId,
    resultAtk: atk,
    resultName: card?.name ?? `Card #${String(resultId)}`,
    depth,
    materials,
    missingMaterials,
    dropSources,
  });
}

// ── Phase 4: Deduplicate ─────────────────────────────────────────────

function recordCandidate(bestByKey: Map<string, FarmableFusion>, candidate: FarmableFusion): void {
  const key = `${String(candidate.resultCardId)}_${String(candidate.depth)}`;
  const existing = bestByKey.get(key);
  if (!existing || candidate.missingMaterials.length < existing.missingMaterials.length) {
    bestByKey.set(key, candidate);
  }
}

function sortCandidates(bestByKey: Map<string, FarmableFusion>): FarmableFusion[] {
  return Array.from(bestByKey.values()).sort((a, b) => {
    if (a.depth !== b.depth) return a.depth - b.depth;
    return b.resultAtk - a.resultAtk;
  });
}

// ── Phase 5: Aggregate per duelist ──────────────────────────────────

function aggregateByDuelist(fusions: FarmableFusion[]): DuelistFarmValue[] {
  const map = new Map<
    number,
    { duelistName: string; fusionCount: number; bestAtk: number; totalAtk: number }
  >();

  for (const f of fusions) {
    // Collect all duelist IDs that contribute to this fusion
    const contributingDuelists = new Set<number>();
    for (const sources of f.dropSources.values()) {
      for (const s of sources) {
        contributingDuelists.add(s.duelistId);
      }
    }

    for (const duelistId of contributingDuelists) {
      // Find the name from any source
      let duelistName = "";
      for (const sources of f.dropSources.values()) {
        const found = sources.find((s) => s.duelistId === duelistId);
        if (found) {
          duelistName = found.duelistName;
          break;
        }
      }

      const entry = map.get(duelistId);
      if (entry) {
        entry.fusionCount++;
        entry.totalAtk += f.resultAtk;
        if (f.resultAtk > entry.bestAtk) entry.bestAtk = f.resultAtk;
      } else {
        map.set(duelistId, {
          duelistName,
          fusionCount: 1,
          bestAtk: f.resultAtk,
          totalAtk: f.resultAtk,
        });
      }
    }
  }

  return Array.from(map.entries())
    .map(([duelistId, v]) => ({
      duelistId,
      duelistName: v.duelistName,
      fusionCount: v.fusionCount,
      bestAtk: v.bestAtk,
      totalAtk: v.totalAtk,
    }))
    .sort((a, b) => {
      if (a.bestAtk !== b.bestAtk) return b.bestAtk - a.bestAtk;
      return b.totalAtk - a.totalAtk;
    });
}
