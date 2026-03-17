import { buildFusionTable } from "../data/build-fusion-table.ts";
import { addCard, type CardDb } from "../data/game-db.ts";
import { FUSION_NONE, MAX_CARD_ID } from "../types/constants.ts";
import { parseReferenceCards, type ReferenceCardRow } from "./parse-reference-cards.ts";
import { parseReferenceFusions, type ReferenceFusionRow } from "./parse-reference-fusions.ts";

export interface ReferenceDataRows {
  cards: ReferenceCardRow[];
  fusions: ReferenceFusionRow[];
}

export interface ReferenceTableData {
  fusionTable: Int16Array;
  cardAtk: Int16Array;
  cardDb: CardDb;
  maxCardId: number;
}

export function buildReferenceTableData(rows: ReferenceDataRows): ReferenceTableData {
  const cardDb = parseReferenceCards(rows.cards);
  const fusions = parseReferenceFusions(rows.fusions);
  registerFusionOnlyCards(cardDb, fusions);

  const cardAtk = new Int16Array(MAX_CARD_ID);
  for (const card of cardDb.cards) {
    cardAtk[card.id] = card.attack;
  }

  const fusionTable = new Int16Array(MAX_CARD_ID * MAX_CARD_ID);
  fusionTable.fill(FUSION_NONE);
  buildFusionTable(cardDb.cards, fusions, fusionTable, cardAtk);

  return { fusionTable, cardAtk, cardDb, maxCardId: MAX_CARD_ID };
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
