import type { OptBuffers } from "../types/buffers.ts";
import { FUSION_NONE } from "../types/constants.ts";
import { buildFusionTable } from "./build-fusion-table.ts";
import type { CardSpec } from "./card-model.ts";
import { parseCardCsv } from "./parse-card-csv.ts";
import { parseFusionCsv } from "./parse-fusion-csv.ts";

/**
 * Load game data from CSV strings and populate buffers.
 *
 * Fills buf.cardAtk and buf.fusionTable from the parsed CSV data.
 * Returns the parsed cards for further use (deck building, etc.).
 */
export function loadGameData(cardsCsv: string, fusionsCsv: string, buf: OptBuffers): CardSpec[] {
  // Parse cards CSV
  const cardDb = parseCardCsv(cardsCsv);

  // Fill cardAtk from parsed cards
  for (const card of cardDb.cards) {
    buf.cardAtk[card.id] = card.attack;
  }

  // Parse fusions CSV
  const fusionDb = parseFusionCsv(fusionsCsv);

  // Initialize fusion table
  buf.fusionTable.fill(FUSION_NONE);

  // Resolve fusions to card ID pairs and fill fusion table
  buildFusionTable(cardDb.cards, fusionDb.fusions, buf.fusionTable, buf.cardAtk);

  return cardDb.cards;
}
