import { parseCardFromCsv } from "./card-line-parser.ts";
import type { CardDb } from "./game-db.ts";
import { addCard, createCardDb } from "./game-db.ts";
import { excludedKinds } from "./rp-types.ts";

export interface ParsedReferenceCards {
  monsterCardDb: CardDb;
  nonMonsterMaterialNames: Set<string>;
}

/**
 * Parse the reference card CSV into monster cards and non-monster material names
 * in a single pass.
 */
export function parseReferenceCardsCsv(csvContent: string): ParsedReferenceCards {
  const dataLines = readCardCsvDataLines(csvContent);
  const monsterCardDb = createCardDb();
  const nonMonsterMaterialNames = new Set<string>();

  for (const line of dataLines) {
    if (line.every((cell) => !cell || cell.trim() === "")) {
      continue;
    }

    if (isNonMonsterCardLine(line)) {
      const name = line[1]?.trim();
      if (name) {
        nonMonsterMaterialNames.add(name);
      }
      continue;
    }

    const card = parseCardFromCsv(line);
    if (card) {
      addCard(monsterCardDb, card);
    }
  }

  return { monsterCardDb, nonMonsterMaterialNames };
}

function readCardCsvDataLines(csvContent: string): string[][] {
  const lines = csvContent
    .split("\n")
    .map((line) => line.split("\t"))
    .filter((cells) => cells.length > 1);

  return lines.slice(1);
}

function isNonMonsterCardLine(line: string[]): boolean {
  for (const kind of line.slice(2, 5)) {
    const normalizedKind = kind?.trim();
    if (!normalizedKind) continue;
    if ((excludedKinds as readonly string[]).includes(normalizedKind)) {
      return true;
    }
  }

  return false;
}
