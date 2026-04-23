import {
  type CardKind,
  type Color,
  type GuardianStar,
  nonMonsterTypes,
} from "../data/card-model.ts";
import { addCard, type CardDb, createCardDb } from "../data/game-db.ts";
import { cardKinds, type colors, excludedKinds, guardianStars } from "../data/rp-types.ts";
import { FUSION_NONE, MAX_CARD_ID } from "../types/constants.ts";

export interface ReferenceTableData {
  fusionTable: Int16Array;
  cardAtk: Int16Array;
  equipCompat: Uint8Array;
  cardDb: CardDb;
  maxCardId: number;
  fusions: RefFusion[];
  duelists: RefDuelistCard[];
}

export interface RefCard {
  id: number;
  atk: number;
  def: number;
  type: string;
  guardianStar1: string;
  guardianStar2: string;
  name: string;
  color?: string;
  level?: number;
  attribute?: string;
  starchipCost?: number;
  password?: number;
  description?: string;
}

export interface RefFusion {
  material1Id: number;
  material2Id: number;
  resultId: number;
  resultAtk: number;
}

export interface RefDuelistCard {
  duelistId: number;
  duelistName: string;
  cardId: number;
  deck: number;
  saPow: number;
  bcd: number;
  saTec: number;
}

const typeToKind = new Map<string, CardKind>([...cardKinds].map((k) => [k, k] as const));
typeToKind.set("Winged Beast", "WingedBeast");
typeToKind.set("Sea Serpent", "SeaSerpent");
typeToKind.set("Beast-Warrior", "Beast");

const validColors = new Set<string>([
  "blue",
  "yellow",
  "orange",
  "red",
  "purple",
  "green",
] satisfies (typeof colors)[number][]);

function parseColor(raw?: string): Color | undefined {
  return raw && validColors.has(raw) ? (raw as Color) : undefined;
}

const validGuardianStars = new Set<string>(guardianStars as readonly string[]);

function parseGuardianStar(raw: string): GuardianStar | undefined {
  return validGuardianStars.has(raw) ? (raw as GuardianStar) : undefined;
}

export interface RefEquip {
  equipId: number;
  monsterId: number;
}

export function buildReferenceTableData(rows: {
  cards: RefCard[];
  fusions: RefFusion[];
  duelists: RefDuelistCard[];
  equips: RefEquip[];
  /** Optional sparse cardId → max copies (1 or 2). Absent cards cap at 3. */
  deckLimits?: Record<number, number>;
}): ReferenceTableData {
  const cardDb = createCardDb();
  if (rows.deckLimits) {
    for (const [idStr, max] of Object.entries(rows.deckLimits)) {
      const id = Number(idStr);
      if (Number.isFinite(id) && Number.isFinite(max)) cardDb.maxCopiesById.set(id, max);
    }
  }
  for (const c of rows.cards) {
    if (c.id < 1 || c.id >= MAX_CARD_ID) throw new Error(`cardId ${c.id} out of range`);
    const kind = typeToKind.get(c.type);
    const isExcluded = (excludedKinds as readonly string[]).includes(c.type);
    addCard(cardDb, {
      id: c.id,
      name: c.name,
      attack: c.atk,
      defense: c.def,
      kinds: kind && !isExcluded ? [kind] : [],
      cardType: c.type || undefined,
      isMonster: !nonMonsterTypes.has(c.type),
      color: parseColor(c.color),
      guardianStar1: parseGuardianStar(c.guardianStar1),
      guardianStar2: parseGuardianStar(c.guardianStar2),
      level: c.level,
      attribute: c.attribute,
      starchipCost: c.starchipCost,
      password: c.password,
      description: c.description,
    });
  }

  const cardAtk = new Int16Array(MAX_CARD_ID);
  for (const card of cardDb.cards) cardAtk[card.id] = card.attack;

  const fusionTable = new Int16Array(MAX_CARD_ID * MAX_CARD_ID);
  fusionTable.fill(FUSION_NONE);
  for (const f of rows.fusions) {
    fusionTable[f.material1Id * MAX_CARD_ID + f.material2Id] = f.resultId;
    fusionTable[f.material2Id * MAX_CARD_ID + f.material1Id] = f.resultId;
  }

  const equipCompat = new Uint8Array(MAX_CARD_ID * MAX_CARD_ID);
  for (const e of rows.equips) {
    if (
      e.equipId >= 1 &&
      e.equipId < MAX_CARD_ID &&
      e.monsterId >= 1 &&
      e.monsterId < MAX_CARD_ID
    ) {
      equipCompat[e.equipId * MAX_CARD_ID + e.monsterId] = 1;
    }
  }

  return {
    fusionTable,
    cardAtk,
    equipCompat,
    cardDb,
    maxCardId: MAX_CARD_ID,
    fusions: rows.fusions,
    duelists: rows.duelists,
  };
}
