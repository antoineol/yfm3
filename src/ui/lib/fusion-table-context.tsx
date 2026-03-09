import { createContext, type ReactNode, useContext, useRef } from "react";
import cardsCsvRaw from "../../../data/rp-cards.csv?raw";
import fusionsCsvRaw from "../../../data/rp-fusions1.csv?raw";
import { buildFusionTable } from "../../engine/data/build-fusion-table.ts";
import { addCard, type CardDb } from "../../engine/data/game-db.ts";
import { parseCardCsv } from "../../engine/data/parse-cards.ts";
import { parseFusionCsv } from "../../engine/data/parse-fusions.ts";
import { FUSION_NONE, MAX_CARD_ID } from "../../engine/types/constants.ts";

export interface FusionTableData {
  fusionTable: Int16Array;
  cardAtk: Int16Array;
  maxCardId: number;
}

/**
 * Build the fusion table and cardAtk arrays from CSV data.
 * Mirrors the data-loading path in load-game-data-core.ts but without
 * the full OptBuffers allocation (only fusionTable + cardAtk are needed).
 */
export function buildFusionTableData(): FusionTableData {
  const cardDb = parseCardCsv(cardsCsvRaw);
  const fusionDb = parseFusionCsv(fusionsCsvRaw);
  registerFusionOnlyCards(cardDb, fusionDb.fusions);

  const cardAtk = new Int16Array(MAX_CARD_ID);
  for (const card of cardDb.cards) {
    cardAtk[card.id] = card.attack;
  }

  const fusionTable = new Int16Array(MAX_CARD_ID * MAX_CARD_ID);
  fusionTable.fill(FUSION_NONE);
  buildFusionTable(cardDb.cards, fusionDb.fusions, fusionTable, cardAtk);

  return { fusionTable, cardAtk, maxCardId: MAX_CARD_ID };
}

/**
 * Register fusion-only cards (results that don't appear in rp-cards.csv)
 * so they get valid IDs and can participate in fusions.
 * Simplified version of registerFusionOnlyCards from load-game-data-core.ts.
 */
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

const FusionTableContext = createContext<FusionTableData | null>(null);

export function FusionTableProvider({ children }: { children: ReactNode }) {
  const dataRef = useRef<FusionTableData | null>(null);
  if (!dataRef.current) {
    dataRef.current = buildFusionTableData();
  }

  return (
    <FusionTableContext.Provider value={dataRef.current}>{children}</FusionTableContext.Provider>
  );
}

export function useFusionTable(): FusionTableData {
  const data = useContext(FusionTableContext);
  if (!data) {
    throw new Error("useFusionTable must be used within a FusionTableProvider");
  }
  return data;
}
