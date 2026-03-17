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

export function loadReferenceCsv(cardsCsvRaw: string, fusionsCsvRaw: string): ReferenceTableData {
  return buildReferenceTableData({
    cards: parseCardsSnapshotCsv(cardsCsvRaw),
    fusions: parseFusionsSnapshotCsv(fusionsCsvRaw),
  });
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

function parseCardsSnapshotCsv(csv: string): ReferenceCardRow[] {
  const [headerLine, ...lines] = csv.split("\n").filter((line) => line.trim().length > 0);
  if (!headerLine) {
    throw new Error("Cards CSV is empty");
  }
  const headers = headerLine.split(",").map((value) => value.trim());

  return lines.map((line) => {
    const cells = line.split(",");
    return {
      cardId: parseInteger(cells[indexOfHeader(headers, "cardId")], "cardId"),
      name: cells[indexOfHeader(headers, "name")]?.trim() ?? "",
      attack: parseInteger(cells[indexOfHeader(headers, "attack")], "attack"),
      defense: parseInteger(cells[indexOfHeader(headers, "defense")], "defense"),
      kind1: cells[indexOfHeader(headers, "kind1")]?.trim() || undefined,
      kind2: cells[indexOfHeader(headers, "kind2")]?.trim() || undefined,
    };
  });
}

function parseFusionsSnapshotCsv(csv: string): ReferenceFusionRow[] {
  const [headerLine, ...lines] = csv.split("\n").filter((line) => line.trim().length > 0);
  if (!headerLine) {
    throw new Error("Fusions CSV is empty");
  }
  const headers = headerLine.split(",").map((value) => value.trim());

  return lines.map((line) => {
    const cells = line.split(",");
    return {
      materialA: cells[indexOfHeader(headers, "materialA")]?.trim() ?? "",
      materialB: cells[indexOfHeader(headers, "materialB")]?.trim() ?? "",
      resultName: cells[indexOfHeader(headers, "resultName")]?.trim() ?? "",
      resultAttack: parseInteger(cells[indexOfHeader(headers, "resultAttack")], "resultAttack"),
      resultDefense: parseInteger(cells[indexOfHeader(headers, "resultDefense")], "resultDefense"),
    };
  });
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

function indexOfHeader(headers: string[], name: string): number {
  const index = headers.indexOf(name);
  if (index === -1) {
    throw new Error(`Missing required header: ${name}`);
  }
  return index;
}

function parseInteger(value: string | undefined, fieldName: string): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid integer for ${fieldName}: ${value}`);
  }
  return parsed;
}
