import { useQuery } from "convex/react";
import { createContext, type ReactNode, useContext, useMemo } from "react";
import { api } from "../../../convex/_generated/api";
import cardsCsvRaw from "../../../data/rp-cards.csv?raw";
import fusionsCsvRaw from "../../../data/rp-fusions1.csv?raw";
import { buildFusionTable } from "../../engine/data/build-fusion-table.ts";
import { addCard, type CardDb } from "../../engine/data/game-db.ts";
import { parseReferenceCardsCsv } from "../../engine/data/parse-cards.ts";
import { parseFusionCsv } from "../../engine/data/parse-fusions.ts";
import { buildReferenceTableData } from "../../engine/reference/build-reference-table.ts";
import { FUSION_NONE, MAX_CARD_ID } from "../../engine/types/constants.ts";
import { CardDbProvider } from "./card-db-context.tsx";

export interface FusionTableData {
  fusionTable: Int16Array;
  cardAtk: Int16Array;
  cardDb: CardDb;
  maxCardId: number;
}

interface FusionTableContextValue {
  data: FusionTableData;
  loadState: "runtime" | "snapshot";
}

/**
 * Build the fusion table from the legacy bundled CSV files (snapshot fallback).
 */
export function buildFusionTableData(): FusionTableData {
  const { monsterCardDb, nonMonsterMaterialNames } = parseReferenceCardsCsv(cardsCsvRaw);
  const fusionDb = parseFusionCsv(fusionsCsvRaw);
  registerFusionOnlyCards(monsterCardDb, fusionDb.fusions);

  const cardAtk = new Int16Array(MAX_CARD_ID);
  for (const card of monsterCardDb.cards) {
    cardAtk[card.id] = card.attack;
  }

  const fusionTable = new Int16Array(MAX_CARD_ID * MAX_CARD_ID);
  fusionTable.fill(FUSION_NONE);
  buildFusionTable(
    monsterCardDb.cards,
    fusionDb.fusions,
    fusionTable,
    cardAtk,
    nonMonsterMaterialNames,
  );

  return { fusionTable, cardAtk, cardDb: monsterCardDb, maxCardId: MAX_CARD_ID };
}

function registerFusionOnlyCards(
  cardDb: CardDb,
  fusions: { name: string; attack: number; defense: number }[],
): void {
  const usedIds = new Set<number>();
  for (const card of cardDb.cards) usedIds.add(card.id);

  const gaps: number[] = [];
  for (let id = 1; id < MAX_CARD_ID; id++) {
    if (!usedIds.has(id)) gaps.push(id);
  }
  let gapIdx = 0;
  const nextGapId = (): number => {
    const id = gaps[gapIdx++];
    if (id === undefined) throw new Error("No gap IDs left");
    return id;
  };

  for (const card of cardDb.cards) {
    if (card.id >= MAX_CARD_ID) {
      cardDb.cardsById.delete(card.id);
      card.id = nextGapId();
      cardDb.cardsById.set(card.id, card);
    }
  }

  for (const fusion of fusions) {
    if (cardDb.cardsByName.has(fusion.name)) continue;
    addCard(cardDb, {
      id: nextGapId(),
      name: fusion.name,
      kinds: [],
      attack: fusion.attack,
      defense: fusion.defense,
    });
  }
}

const FusionTableContext = createContext<FusionTableContextValue | null>(null);

export function FusionTableProvider({ children }: { children: ReactNode }) {
  const referenceData = useQuery(api.referenceData.getReferenceData);

  const contextValue = useMemo<FusionTableContextValue>(() => {
    if (referenceData && referenceData.cards.length > 0 && referenceData.fusions.length > 0) {
      return {
        data: buildReferenceTableData({
          cards: referenceData.cards,
          fusions: referenceData.fusions,
        }),
        loadState: "runtime",
      };
    }

    return {
      data: buildFusionTableData(),
      loadState: "snapshot",
    };
  }, [referenceData]);

  return (
    <FusionTableContext.Provider value={contextValue}>
      <CardDbProvider cardDb={contextValue.data.cardDb}>{children}</CardDbProvider>
    </FusionTableContext.Provider>
  );
}

export function useFusionTable(): FusionTableData {
  const context = useContext(FusionTableContext);
  if (!context) {
    throw new Error("useFusionTable must be used within a FusionTableProvider");
  }
  return context.data;
}

export function useFusionTableLoadState() {
  const context = useContext(FusionTableContext);
  if (!context) {
    throw new Error("useFusionTableLoadState must be used within a FusionTableProvider");
  }
  return context.loadState;
}
