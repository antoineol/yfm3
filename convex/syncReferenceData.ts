"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  createGoogleSheetsClient,
  readServiceAccountFromEnv,
} from "../src/server/reference/google-sheets-client";

type CardRow = {
  cardId: number;
  name: string;
  attack: number;
  defense: number;
  kind1?: string;
  kind2?: string;
  kind3?: string;
  color?: string;
};

type FusionRow = {
  materialA: string;
  materialB: string;
  resultName: string;
  resultAttack: number;
  resultDefense: number;
};

export const syncFromSheets = action({
  args: {},
  handler: async (ctx): Promise<{ importedAt: number }> => {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID_REFERENCE ?? "";
    if (!spreadsheetId) throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID_REFERENCE");

    const client = createGoogleSheetsClient(readServiceAccountFromEnv(process.env));
    const cardsRange = process.env.GOOGLE_SHEETS_CARDS_RANGE ?? "Cards!A:Z";
    const fusionsRange = process.env.GOOGLE_SHEETS_FUSIONS_RANGE ?? "Fusions!A:Z";

    const [cardsGrid, fusionsGrid] = await Promise.all([
      client.getValues(spreadsheetId, cardsRange),
      client.getValues(spreadsheetId, fusionsRange),
    ]);

    const cards = parseCardsGrid(cardsGrid);
    const fusions = parseFusionsGrid(fusionsGrid);

    return await ctx.runMutation(internal.referenceData.replaceReferenceData, { cards, fusions });
  },
});

// Grid → typed-row parsing (Sheets structure). Domain-level validation
// (duplicates, name normalization, fusion registration) happens in
// parse-reference-cards.ts / parse-reference-fusions.ts after Convex stores
// these intermediate rows.
function parseCardsGrid(grid: string[][]): CardRow[] {
  const [headerRow = [], ...dataRows] = grid;
  const headers = headerRow.map((h) => h.trim());

  const seenIds = new Set<number>();
  return dataRows
    .filter((row) => row.some((cell) => cell.trim() !== ""))
    .flatMap((row, i) => {
      const get = (name: string) => row[headers.indexOf(name)]?.trim() ?? "";
      const lineNum = i + 2;

      const idStr = get("id");
      if (!idStr) return []; // skip rows without an assigned id
      const cardId = Number.parseInt(idStr, 10);
      if (Number.isNaN(cardId)) throw new Error(`Row ${lineNum}: invalid id "${idStr}"`);
      if (seenIds.has(cardId)) throw new Error(`Row ${lineNum}: duplicate id ${cardId}`);
      seenIds.add(cardId);

      const name = get("name");
      if (!name) throw new Error(`Row ${lineNum}: missing name`);

      const attackStr = get("attack");
      const attack = Number.parseInt(attackStr, 10);
      if (!attackStr || Number.isNaN(attack)) return []; // skip non-monster cards (no attack)

      const defenseStr = get("defense");
      const defense = Number.parseInt(defenseStr, 10);
      if (!defenseStr || Number.isNaN(defense)) return []; // skip non-monster cards (no defense)

      const kind1 = get("kind1") || undefined;
      const kind2 = get("kind2") || undefined;
      const kind3 = get("kind3") || undefined;
      const color = get("color") || undefined;

      return [{ cardId, name, attack, defense, kind1, kind2, kind3, color }];
    });
}

function parseFusionsGrid(grid: string[][]): FusionRow[] {
  const [headerRow = [], ...dataRows] = grid;
  const headers = headerRow.map((h) => h.trim());

  return dataRows
    .filter((row) => row.some((cell) => cell.trim() !== ""))
    .map((row, i) => {
      const get = (name: string) => row[headers.indexOf(name)]?.trim() ?? "";
      const lineNum = i + 2;

      const materialA = get("materialA");
      if (!materialA) throw new Error(`Row ${lineNum}: missing materialA`);

      const materialB = get("materialB");
      if (!materialB) throw new Error(`Row ${lineNum}: missing materialB`);

      const resultName = get("resultName");
      if (!resultName) throw new Error(`Row ${lineNum}: missing resultName`);

      const resultAttack = Number.parseInt(get("resultAttack"), 10);
      if (Number.isNaN(resultAttack)) throw new Error(`Row ${lineNum}: invalid resultAttack`);

      const resultDefense = Number.parseInt(get("resultDefense"), 10);
      if (Number.isNaN(resultDefense)) throw new Error(`Row ${lineNum}: invalid resultDefense`);

      return { materialA, materialB, resultName, resultAttack, resultDefense };
    });
}
