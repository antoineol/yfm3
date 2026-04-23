import type { OptBuffers } from "../types/buffers.ts";
import { FUSION_NONE, MAX_CARD_ID, MAX_COPIES } from "../types/constants.ts";
import type { BridgeCard } from "../worker/messages.ts";
import { type CardSpec, nonMonsterTypes } from "./card-model.ts";
import { addCard, createCardDb } from "./game-db.ts";

/**
 * Load game data from CSV strings and populate buffers.
 *
 * Cards CSV format:   id,name,atk,def,guardian_star_1,guardian_star_2,type,color
 * Fusions CSV format: material1_id,material2_id,result_id,result_atk
 * Equips CSV format:  equip_id,monster_id
 *
 * Fills buf.cardAtk, buf.fusionTable, and buf.equipCompat.
 * Returns all cards for deck building.
 */
export function loadGameDataFromStrings(
  buf: OptBuffers,
  cardsCsvContent: string,
  fusionsCsvContent: string,
  equipsCsvContent: string,
  deckLimitsCsvContent?: string,
): CardSpec[] {
  const cardDb = createCardDb();

  for (const cols of parseCsvRows(cardsCsvContent)) {
    const id = parseInt(cols[0] ?? "", 10);
    const name = cols[1] ?? "";
    const atk = parseInt(cols[2] ?? "", 10);
    const def = parseInt(cols[3] ?? "", 10);
    const type = cols[6] ?? "";
    if (!Number.isFinite(id) || id < 1 || id >= MAX_CARD_ID) continue;
    addCard(cardDb, {
      id,
      name: name || `Card #${id}`,
      attack: atk,
      defense: def,
      cardType: type || undefined,
      kinds: [],
      isMonster: !nonMonsterTypes.has(type),
    });
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

  for (const [eqs = "", ms = ""] of parseCsvRows(equipsCsvContent)) {
    const equipId = parseInt(eqs, 10);
    const monsterId = parseInt(ms, 10);
    if (!Number.isFinite(equipId) || !Number.isFinite(monsterId)) continue;
    if (equipId < 1 || equipId >= MAX_CARD_ID || monsterId < 1 || monsterId >= MAX_CARD_ID)
      continue;
    buf.equipCompat[equipId * MAX_CARD_ID + monsterId] = 1;
  }

  populateDeckLimitsFromCsv(buf, deckLimitsCsvContent);

  return cardDb.cards;
}

function populateDeckLimitsFromCsv(buf: OptBuffers, csv: string | undefined): void {
  buf.maxCopies.fill(MAX_COPIES);
  if (!csv) return;
  for (const [idStr = "", maxStr = ""] of parseCsvRows(csv)) {
    const id = parseInt(idStr, 10);
    const max = parseInt(maxStr, 10);
    if (!Number.isFinite(id) || id < 1 || id >= MAX_CARD_ID) continue;
    if (!Number.isFinite(max) || max < 1 || max > MAX_COPIES) continue;
    buf.maxCopies[id] = max;
  }
}

/**
 * Load game data entirely from bridge-provided data (cards, fusions, equips).
 * No CSV fallback — all data comes from the emulator bridge's disc extraction.
 */
export function loadGameDataWithBridgeTables(
  buf: OptBuffers,
  cards: BridgeCard[],
  fusions: Array<{ material1: number; material2: number; result: number }>,
  equips: Array<{ equipId: number; monsterIds: number[] }>,
  deckLimits: { byCard: Record<number, number> } | null,
): CardSpec[] {
  const cardDb = createCardDb();

  for (const c of cards) {
    if (c.id < 1 || c.id >= MAX_CARD_ID) continue;
    addCard(cardDb, {
      id: c.id,
      name: c.name || `Card #${c.id}`,
      attack: c.atk,
      defense: c.def,
      cardType: c.type || undefined,
      kinds: [],
      isMonster: !nonMonsterTypes.has(c.type),
    });
  }

  for (const card of cardDb.cards) {
    buf.cardAtk[card.id] = card.attack;
  }

  buf.fusionTable.fill(FUSION_NONE);
  for (const f of fusions) {
    if (
      f.material1 >= 1 &&
      f.material1 < MAX_CARD_ID &&
      f.material2 >= 1 &&
      f.material2 < MAX_CARD_ID
    ) {
      buf.fusionTable[f.material1 * MAX_CARD_ID + f.material2] = f.result;
      buf.fusionTable[f.material2 * MAX_CARD_ID + f.material1] = f.result;
    }
  }

  for (const e of equips) {
    if (e.equipId < 1 || e.equipId >= MAX_CARD_ID) continue;
    for (const monsterId of e.monsterIds) {
      if (monsterId >= 1 && monsterId < MAX_CARD_ID) {
        buf.equipCompat[e.equipId * MAX_CARD_ID + monsterId] = 1;
      }
    }
  }

  populateDeckLimitsFromBridge(buf, deckLimits);

  return cardDb.cards;
}

function populateDeckLimitsFromBridge(
  buf: OptBuffers,
  deckLimits: { byCard: Record<number, number> } | null,
): void {
  buf.maxCopies.fill(MAX_COPIES);
  if (!deckLimits) return;
  for (const [idStr, max] of Object.entries(deckLimits.byCard)) {
    const id = Number(idStr);
    if (!Number.isFinite(id) || id < 1 || id >= MAX_CARD_ID) continue;
    if (!Number.isFinite(max) || max < 1 || max > MAX_COPIES) continue;
    buf.maxCopies[id] = max;
  }
}

function parseCsvRows(csvContent: string): string[][] {
  return csvContent
    .split("\n")
    .slice(1)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map(splitCsvLine);
}

/** Split a CSV line respecting quoted fields (handles commas inside quotes). */
function splitCsvLine(line: string): string[] {
  const cols: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      const end = line.indexOf('"', i + 1);
      cols.push(line.slice(i + 1, end === -1 ? line.length : end));
      i = end === -1 ? line.length : end + 2; // skip closing quote + comma
    } else {
      const next = line.indexOf(",", i);
      cols.push(next === -1 ? line.slice(i) : line.slice(i, next));
      i = next === -1 ? line.length : next + 1;
    }
  }
  return cols;
}
