import type { OptBuffers } from "../types/buffers.ts";
import { FUSION_NONE, MAX_CARD_ID } from "../types/constants.ts";
import { buildFusionTable } from "./build-fusion-table.ts";
import type { CardSpec, FusionDb } from "./card-model.ts";
import { addCard, type CardDb } from "./game-db.ts";
import { parseCardCsv } from "./parse-cards.ts";
import { parseFusionCsv } from "./parse-fusions.ts";

/**
 * Load game data from CSV strings and populate buffers.
 *
 * Fills buf.cardAtk and buf.fusionTable from the parsed CSV data.
 * Returns only base cards (from rp-cards.csv) for deck building / collection.
 * Fusion-only cards (results only in rp-fusions1.csv) are registered internally
 * so they appear in the fusion table and can participate in chain fusions.
 */
export function loadGameDataFromStrings(
  buf: OptBuffers,
  cardsCsvContent: string,
  fusionsCsvContent: string,
): CardSpec[] {
  const cardDb = parseCardCsv(cardsCsvContent);
  const baseCards = [...cardDb.cards];

  const fusionDb = parseFusionCsv(fusionsCsvContent);
  registerFusionOnlyCards(cardDb, fusionDb);

  for (const card of cardDb.cards) {
    buf.cardAtk[card.id] = card.attack;
  }

  buf.fusionTable.fill(FUSION_NONE);
  buildFusionTable(cardDb.cards, fusionDb.fusions, buf.fusionTable, buf.cardAtk);

  return baseCards;
}

/**
 * Assign in-range IDs to out-of-range base cards and register fusion-only
 * cards so they have valid IDs, ATK values, and can be materials/results.
 *
 * Uses gap IDs (unused slots in 1..721) so MAX_CARD_ID stays at 722.
 */
export function registerFusionOnlyCards(cardDb: CardDb, fusionDb: FusionDb): void {
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

  // Reassign out-of-range base card IDs to gap slots
  for (const card of cardDb.cards) {
    if (card.id >= MAX_CARD_ID) {
      cardDb.cardsById.delete(card.id);
      card.id = nextGapId();
      cardDb.cardsById.set(card.id, card);
    }
  }

  // Register fusion-only cards (results not in rp-cards.csv)
  for (const fusion of fusionDb.fusions) {
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
