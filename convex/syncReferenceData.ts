"use node";

import { GoogleAuth } from "google-auth-library";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

export const syncFromSheets = action({
  args: {},
  handler: async (ctx): Promise<{ importedAt: number }> => {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID_REFERENCE ?? "";
    if (!spreadsheetId) throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID_REFERENCE");
    const [cardsGrid, fusionsGrid] = await Promise.all([
      fetchSheetValues(spreadsheetId, process.env.GOOGLE_SHEETS_CARDS_RANGE ?? "Cards!A:Z"),
      fetchSheetValues(spreadsheetId, process.env.GOOGLE_SHEETS_FUSIONS_RANGE ?? "Fusions!A:Z"),
    ]);
    const cards = parseCardsGrid(cardsGrid);
    const fusions = parseFusionsGrid(fusionsGrid);
    if (cards.length === 0) throw new Error("Parsed zero cards — check sheet column headers");
    if (fusions.length === 0) throw new Error("Parsed zero fusions — check sheet column headers");
    return await ctx.runMutation(internal.referenceData.replaceReferenceData, { cards, fusions });
  },
});

async function fetchSheetValues(spreadsheetId: string, range: string): Promise<string[][]> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "";
  const key = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
  if (!email || !key) throw new Error("Missing Google service account credentials");

  const auth = new GoogleAuth({
    credentials: { client_email: email, private_key: key },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const client = await auth.getClient();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  const res = await client.request<{ values?: string[][] }>({ url });
  return res.data.values ?? [];
}

// --- Grid parsing helpers ---

function norm(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

function cellStr(get: (col: string) => string, ln: number, col: string): string {
  const v = norm(get(col));
  if (!v) throw new Error(`Row ${ln}: missing ${col}`);
  return v;
}

function cellInt(get: (col: string) => string, ln: number, col: string): number {
  const v = Number.parseInt(get(col), 10);
  if (Number.isNaN(v)) throw new Error(`Row ${ln}: invalid ${col}`);
  return v;
}

// --- Parsers ---

function parseCardsGrid(grid: string[][]) {
  const [headerRow = [], ...rows] = grid;
  const headers = headerRow.map((h) => h.trim());
  const seenIds = new Set<number>();
  const seenNames = new Set<string>();

  return rows.flatMap((row, i) => {
    const ln = i + 2;
    if (!row.some((c) => c.trim())) return [];
    const get = (col: string) => row[headers.indexOf(col)]?.trim() ?? "";

    if (!get("id")) return []; // skip rows without an assigned id
    const cardId = cellInt(get, ln, "id");
    if (seenIds.has(cardId)) throw new Error(`Row ${ln}: duplicate id ${cardId}`);
    seenIds.add(cardId);

    const name = cellStr(get, ln, "name");
    if (seenNames.has(name.toLowerCase())) throw new Error(`Row ${ln}: duplicate name "${name}"`);
    seenNames.add(name.toLowerCase());

    if (!get("attack") || !get("defense")) return []; // skip non-monsters
    return [{
      cardId, name, attack: cellInt(get, ln, "attack"), defense: cellInt(get, ln, "defense"),
      kind1: norm(get("kind1")) || undefined,
      kind2: norm(get("kind2")) || undefined,
      kind3: norm(get("kind3")) || undefined,
      color: get("color").toLowerCase() || undefined,
    }];
  });
}

function parseFusionsGrid(grid: string[][]) {
  const [headerRow = [], ...rows] = grid;
  const headers = headerRow.map((h) => h.trim());

  return rows.flatMap((row, i) => {
    const ln = i + 2;
    if (!row.some((c) => c.trim())) return [];
    const get = (col: string) => row[headers.indexOf(col)]?.trim() ?? "";
    return [{
      materialA: cellStr(get, ln, "materialA"),
      materialB: cellStr(get, ln, "materialB"),
      resultName: cellStr(get, ln, "resultName"),
      resultAttack: cellInt(get, ln, "resultAttack"),
      resultDefense: cellInt(get, ln, "resultDefense"),
    }];
  });
}
