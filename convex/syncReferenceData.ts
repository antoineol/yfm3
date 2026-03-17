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

// --- Grid parsing ---

function norm(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

interface RowReader {
  /** Trimmed raw cell value, "" if column missing. */
  raw: (col: string) => string;
  /** Normalized string, throws if empty. */
  str: (col: string) => string;
  /** Parsed integer, throws if missing or NaN. */
  int: (col: string) => number;
  /** 1-based sheet row number. */
  ln: number;
}

function parseGrid<T>(grid: string[][], parseRow: (r: RowReader) => T | null): T[] {
  const [headerRow = [], ...rows] = grid;
  const headers = headerRow.map((h) => h.trim());
  return rows.flatMap((row, i) => {
    const ln = i + 2;
    if (!row.some((c) => c.trim())) return [];
    const raw = (col: string) => row[headers.indexOf(col)]?.trim() ?? "";
    const str = (col: string) => {
      const v = norm(raw(col));
      if (!v) throw new Error(`Row ${ln}: missing ${col}`);
      return v;
    };
    const int = (col: string) => {
      const v = Number.parseInt(raw(col), 10);
      if (Number.isNaN(v)) throw new Error(`Row ${ln}: invalid ${col}`);
      return v;
    };
    const result = parseRow({ raw, str, int, ln });
    return result ? [result] : [];
  });
}

function parseCardsGrid(grid: string[][]) {
  const seenIds = new Set<number>();
  const seenNames = new Set<string>();
  return parseGrid(grid, ({ raw, str, int, ln }) => {
    if (!raw("id")) return null; // skip rows without an assigned id
    const cardId = int("id");
    if (seenIds.has(cardId)) throw new Error(`Row ${ln}: duplicate id ${cardId}`);
    seenIds.add(cardId);

    const name = str("name");
    if (seenNames.has(name.toLowerCase())) throw new Error(`Row ${ln}: duplicate name "${name}"`);
    seenNames.add(name.toLowerCase());

    if (!raw("attack") || !raw("defense")) return null; // skip non-monsters
    return {
      cardId, name, attack: int("attack"), defense: int("defense"),
      kind1: norm(raw("kind1")) || undefined,
      kind2: norm(raw("kind2")) || undefined,
      kind3: norm(raw("kind3")) || undefined,
      color: raw("color").toLowerCase() || undefined,
    };
  });
}

function parseFusionsGrid(grid: string[][]) {
  return parseGrid(grid, ({ str, int }) => ({
    materialA: str("materialA"),
    materialB: str("materialB"),
    resultName: str("resultName"),
    resultAttack: int("resultAttack"),
    resultDefense: int("resultDefense"),
  }));
}
