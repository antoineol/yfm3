import type { Color } from "../data/card-model.ts";
import { addCard, type CardDb, createCardDb } from "../data/game-db.ts";
import { cardKinds, colors } from "../data/rp-types.ts";

export interface ReferenceCardRow {
  cardId: number;
  name: string;
  attack: number;
  defense: number;
  kind1?: string;
  kind2?: string;
  kind3?: string;
  color?: string;
}

export function parseReferenceCards(rows: ReferenceCardRow[]): CardDb {
  const cardDb = createCardDb();
  const seenIds = new Set<number>();
  const seenNames = new Set<string>();

  for (const row of rows) {
    if (seenIds.has(row.cardId)) {
      throw new Error(`Duplicate cardId: ${row.cardId}`);
    }
    const normalizedName = normalizeName(row.name).toLowerCase();
    if (seenNames.has(normalizedName)) {
      throw new Error(`Duplicate card name: ${row.name}`);
    }
    seenIds.add(row.cardId);
    seenNames.add(normalizedName);

    const color = row.color?.trim().toLowerCase();
    addCard(cardDb, {
      id: row.cardId,
      name: normalizeName(row.name),
      attack: row.attack,
      defense: row.defense,
      kinds: [row.kind1, row.kind2, row.kind3]
        .filter((v): v is string => Boolean(v))
        .map(normalizeName)
        .filter(isCardKind),
      ...(color && isColor(color) ? { color } : {}),
    });
  }

  return cardDb;
}

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

function isCardKind(value: string): value is (typeof cardKinds)[number] {
  return (cardKinds as readonly string[]).includes(value);
}

function isColor(value: string): value is Color {
  return (colors as readonly string[]).includes(value);
}
