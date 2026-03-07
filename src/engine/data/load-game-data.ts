import fs from "node:fs";
import path from "node:path";
import type { OptBuffers } from "../types/buffers.ts";
import { FUSION_NONE } from "../types/constants.ts";
import { buildFusionTable } from "./build-fusion-table.ts";
import type { CardSpec } from "./card-model.ts";
import { parseCardCsv } from "./parse-cards.ts";
import { parseFusionCsv } from "./parse-fusions.ts";

const DATA_DIR = path.resolve(import.meta.dirname, "../../../data");
const cardsCsv = fs.readFileSync(path.join(DATA_DIR, "rp-cards.csv"), "utf-8");
const fusionsCsv = fs.readFileSync(path.join(DATA_DIR, "rp-fusions1.csv"), "utf-8");

/**
 * Load game data from CSV files and populate buffers.
 *
 * Fills buf.cardAtk and buf.fusionTable from the parsed CSV data.
 * Returns the parsed cards for further use (deck building, etc.).
 */
export function loadGameData(buf: OptBuffers): CardSpec[] {
  const cardDb = parseCardCsv(cardsCsv);

  for (const card of cardDb.cards) {
    buf.cardAtk[card.id] = card.attack;
  }

  const fusionDb = parseFusionCsv(fusionsCsv);

  buf.fusionTable.fill(FUSION_NONE);

  buildFusionTable(cardDb.cards, fusionDb.fusions, buf.fusionTable, buf.cardAtk);

  return cardDb.cards;
}
