import type { OptBuffers } from "../types/buffers.ts";
import { FUSION_NONE, MAX_CARD_ID } from "../types/constants.ts";
import type { CardSpec } from "./card-model.ts";
import { addCard, createCardDb } from "./game-db.ts";

/**
 * Load game data from binary CSV strings and populate buffers.
 *
 * Cards CSV format:   id,atk,def,guardian_star_1,guardian_star_2,type
 * Fusions CSV format: material1_id,material2_id,result_id,result_atk
 *
 * Fills buf.cardAtk and buf.fusionTable. Returns all cards for deck building.
 */
export function loadGameDataFromStrings(
  buf: OptBuffers,
  cardsCsvContent: string,
  fusionsCsvContent: string,
): CardSpec[] {
  const cardDb = createCardDb();

  for (const [idS = "", atkS = "", defS = ""] of parseCsvRows(cardsCsvContent)) {
    const id = parseInt(idS, 10);
    const atk = parseInt(atkS, 10);
    const def = parseInt(defS, 10);
    if (!Number.isFinite(id) || id < 1 || id >= MAX_CARD_ID) continue;
    addCard(cardDb, { id, name: `Card #${id}`, attack: atk, defense: def, kinds: [] });
  }

  for (const card of cardDb.cards) {
    buf.cardAtk[card.id] = card.attack;
  }

  buf.fusionTable.fill(FUSION_NONE);
  for (const [m1s = "", m2s = "", rs = ""] of parseCsvRows(fusionsCsvContent)) {
    const mat1 = parseInt(m1s, 10);
    const mat2 = parseInt(m2s, 10);
    const result = parseInt(rs, 10);
    if (!Number.isFinite(mat1) || !Number.isFinite(mat2) || !Number.isFinite(result)) continue;
    buf.fusionTable[mat1 * MAX_CARD_ID + mat2] = result;
    buf.fusionTable[mat2 * MAX_CARD_ID + mat1] = result;
  }

  return cardDb.cards;
}

function parseCsvRows(csvContent: string): string[][] {
  return csvContent
    .split("\n")
    .slice(1)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => l.split(","));
}
