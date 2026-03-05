import { parseCardFromCsv } from "./card-line-parser.ts";
import { addCard, createCardDb } from "./game-db.ts";

/**
 * Process card CSV content into structured data
 */
export function parseCardCsv(csvContent: string) {
  const lines = csvContent
    .split("\n")
    .map((line) => line.split("\t"))
    .filter((cells) => cells.length > 1);

  // Skip header line
  const dataLines = lines.slice(1);
  const cardsDb = createCardDb();

  for (const line of dataLines) {
    if (line.every((cell) => !cell || cell.trim() === "")) {
      continue;
    }

    const card = parseCardFromCsv(line);
    if (card) {
      addCard(cardsDb, card);
    }
  }

  return cardsDb;
}
