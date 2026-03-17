import { buildFusionTable } from "../data/build-fusion-table.ts";
import type { Color, FusionMaterials } from "../data/card-model.ts";
import { getMaterialPairKey } from "../data/fusion-utils.ts";
import { addCard, type CardDb, createCardDb } from "../data/game-db.ts";
import { cardKinds, colors } from "../data/rp-types.ts";
import { FUSION_NONE, MAX_CARD_ID } from "../types/constants.ts";

export interface ReferenceTableData {
  fusionTable: Int16Array;
  cardAtk: Int16Array;
  cardDb: CardDb;
  maxCardId: number;
}

interface RefCard {
  cardId: number;
  name: string;
  attack: number;
  defense: number;
  kind1?: string;
  kind2?: string;
  kind3?: string;
  color?: string;
}
interface RefFusion {
  materialA: string;
  materialB: string;
  resultName: string;
  resultAttack: number;
  resultDefense: number;
}

export function buildReferenceTableData(rows: {
  cards: RefCard[];
  fusions: RefFusion[];
}): ReferenceTableData {
  const cardDb = createCardDb();
  for (const c of rows.cards) {
    if (c.cardId < 1 || c.cardId >= MAX_CARD_ID) throw new Error(`cardId ${c.cardId} out of range`);
    const color = c.color?.toLowerCase();
    addCard(cardDb, {
      id: c.cardId,
      name: c.name,
      attack: c.attack,
      defense: c.defense,
      kinds: [c.kind1, c.kind2, c.kind3].filter((v): v is string => Boolean(v)).filter(isCardKind),
      ...(color && isColor(color) ? { color } : {}),
    });
  }

  const byName = new Map<string, FusionMaterials>();
  for (const f of rows.fusions) {
    const key = getMaterialPairKey({ name: f.materialA }, { name: f.materialB });
    const existing = byName.get(f.resultName);
    if (existing) {
      existing.materials.add(key);
      continue;
    }
    byName.set(f.resultName, {
      name: f.resultName,
      materials: new Set([key]),
      attack: f.resultAttack,
      defense: f.resultDefense,
    });
  }
  const fusions = [...byName.values()];

  // Register cards that only appear as fusion results
  const gaps: number[] = [];
  for (let id = 1; id < MAX_CARD_ID; id++) if (!cardDb.cardsById.has(id)) gaps.push(id);
  let gi = 0;
  for (const f of fusions) {
    if (cardDb.cardsByName.has(f.name)) continue;
    const id = gaps[gi++];
    if (id === undefined) throw new Error("No gap IDs left");
    addCard(cardDb, { id, name: f.name, kinds: [], attack: f.attack, defense: f.defense });
  }

  const cardAtk = new Int16Array(MAX_CARD_ID);
  for (const card of cardDb.cards) cardAtk[card.id] = card.attack;
  const fusionTable = new Int16Array(MAX_CARD_ID * MAX_CARD_ID);
  fusionTable.fill(FUSION_NONE);
  buildFusionTable(cardDb.cards, fusions, fusionTable, cardAtk);
  return { fusionTable, cardAtk, cardDb, maxCardId: MAX_CARD_ID };
}

function isCardKind(value: string): value is (typeof cardKinds)[number] {
  return (cardKinds as readonly string[]).includes(value);
}

function isColor(value: string): value is Color {
  return (colors as readonly string[]).includes(value);
}
