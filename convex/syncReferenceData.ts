import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { getGoogleAccessToken } from "./googleAuth";

export type SyncResult = { importedAt: number; skipped: boolean };

export const syncFromSheets = action({
  args: {},
  handler: async (ctx): Promise<SyncResult> => {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID_REFERENCE ?? "";
    if (!spreadsheetId) throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID_REFERENCE");
    const token = await getGoogleAccessToken();

    const lastImportedAt = await ctx.runQuery(internal.referenceData.getLastImportedAt);
    if (lastImportedAt !== null) {
      const modifiedMs = await fetchSpreadsheetModifiedTime(spreadsheetId, token);
      if (modifiedMs <= lastImportedAt) {
        return { importedAt: lastImportedAt, skipped: true };
      }
    }

    const [cardsGrid, fusionsGrid] = await Promise.all([
      fetchSheetValues(spreadsheetId, token, process.env.GOOGLE_SHEETS_CARDS_RANGE ?? "Cards!A:Z"),
      fetchSheetValues(spreadsheetId, token, process.env.GOOGLE_SHEETS_FUSIONS_RANGE ?? "Fusions!A:Z"),
    ]);
    const cards = parseCardsGrid(cardsGrid);
    const fusions = parseFusionsGrid(fusionsGrid);
    if (cards.length === 0) throw new Error("Parsed zero cards — check sheet column headers");
    if (fusions.length === 0) throw new Error("Parsed zero fusions — check sheet column headers");
    const result = await ctx.runMutation(internal.referenceData.replaceReferenceData, { cards, fusions });
    return { ...result, skipped: false };
  },
});

async function fetchSpreadsheetModifiedTime(spreadsheetId: string, token: string): Promise<number> {
  const url = `https://www.googleapis.com/drive/v3/files/${spreadsheetId}?fields=modifiedTime`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Drive API failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { modifiedTime: string };
  return new Date(data.modifiedTime).getTime();
}

async function fetchSheetValues(spreadsheetId: string, token: string, range: string): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Sheets API failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { values?: string[][] };
  return data.values ?? [];
}

// --- Grid parsing: cell helpers then flat parsers ---

function cell(row: string[], headers: string[], col: string): string {
  return row[headers.indexOf(col)]?.trim() ?? "";
}

function str(row: string[], headers: string[], col: string, ln: number): string {
  const v = cell(row, headers, col).replace(/\s+/g, " ");
  if (!v) throw new Error(`Row ${ln}: missing ${col}`);
  return v;
}

function int(row: string[], headers: string[], col: string, ln: number): number {
  const v = Number.parseInt(cell(row, headers, col), 10);
  if (Number.isNaN(v)) throw new Error(`Row ${ln}: invalid ${col}`);
  return v;
}

/** @internal exported for tests */
export function parseCardsGrid(grid: string[][]) {
  const [headerRow = [], ...rows] = grid;
  const h = headerRow.map((v) => v.trim());
  const seenIds = new Set<number>();
  const seenNames = new Set<string>();
  const cards = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]!, ln = i + 2;
    if (!r.some((c) => c.trim())) continue;
    if (!cell(r, h, "id")) continue;
    const cardId = int(r, h, "id", ln);
    if (seenIds.has(cardId)) throw new Error(`Row ${ln}: duplicate id ${cardId}`);
    seenIds.add(cardId);
    const name = str(r, h, "name", ln);
    if (seenNames.has(name.toLowerCase())) throw new Error(`Row ${ln}: duplicate name "${name}"`);
    seenNames.add(name.toLowerCase());
    if (!cell(r, h, "attack") || !cell(r, h, "defense")) continue;
    const opt = (col: string) => cell(r, h, col).replace(/\s+/g, " ") || undefined;
    cards.push({
      cardId, name, attack: int(r, h, "attack", ln), defense: int(r, h, "defense", ln),
      kind1: opt("kind1"), kind2: opt("kind2"), kind3: opt("kind3"),
      color: cell(r, h, "color").toLowerCase() || undefined,
    });
  }
  return cards;
}

/** @internal exported for tests */
export function parseFusionsGrid(grid: string[][]) {
  const [headerRow = [], ...rows] = grid;
  const h = headerRow.map((v) => v.trim());
  const fusions = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]!, ln = i + 2;
    if (!r.some((c) => c.trim())) continue;
    fusions.push({
      materialA: str(r, h, "materialA", ln), materialB: str(r, h, "materialB", ln),
      resultName: str(r, h, "resultName", ln),
      resultAttack: int(r, h, "resultAttack", ln), resultDefense: int(r, h, "resultDefense", ln),
    });
  }
  return fusions;
}
