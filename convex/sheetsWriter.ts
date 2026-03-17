"use node";

import type { GoogleAuth } from "google-auth-library";

const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

// --- Public helpers: find, append, update, delete ---

export async function findCardRow(
  spreadsheetId: string,
  auth: GoogleAuth,
  name: string,
): Promise<number | null> {
  const values = await fetchColumn(spreadsheetId, auth, "Cards!B:B");
  return findRowIndex(values, (cell) => cell.trim().toLowerCase() === name.trim().toLowerCase());
}

export async function findFusionRow(
  spreadsheetId: string,
  auth: GoogleAuth,
  materialA: string,
  materialB: string,
): Promise<number | null> {
  const values = await fetchColumns(spreadsheetId, auth, "Fusions!A:B");
  const a = materialA.trim().toLowerCase();
  const b = materialB.trim().toLowerCase();
  return findRowIndex(values, (_, row) => {
    const colA = (row[0] ?? "").trim().toLowerCase();
    const colB = (row[1] ?? "").trim().toLowerCase();
    return colA === a && colB === b;
  });
}

export async function appendRow(
  spreadsheetId: string,
  auth: GoogleAuth,
  sheetRange: string,
  values: string[],
): Promise<void> {
  const client = await auth.getClient();
  const url = `${SHEETS_BASE}/${spreadsheetId}/values/${encodeURIComponent(sheetRange)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  await client.request({ url, method: "POST", body: JSON.stringify({ values: [values] }) });
}

export async function updateRow(
  spreadsheetId: string,
  auth: GoogleAuth,
  sheetRange: string,
  values: string[],
): Promise<void> {
  const client = await auth.getClient();
  const url = `${SHEETS_BASE}/${spreadsheetId}/values/${encodeURIComponent(sheetRange)}?valueInputOption=RAW`;
  await client.request({ url, method: "PUT", body: JSON.stringify({ values: [values] }) });
}

export async function deleteRow(
  spreadsheetId: string,
  auth: GoogleAuth,
  sheetName: string,
  rowIndex: number,
): Promise<void> {
  const sheetId = await resolveSheetId(spreadsheetId, auth, sheetName);
  const client = await auth.getClient();
  const url = `${SHEETS_BASE}/${spreadsheetId}:batchUpdate`;
  await client.request({
    url,
    method: "POST",
    body: JSON.stringify({
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex - 1, // 0-based inclusive
              endIndex: rowIndex, // 0-based exclusive
            },
          },
        },
      ],
    }),
  });
}

// --- Internal helpers ---

async function fetchColumn(
  spreadsheetId: string,
  auth: GoogleAuth,
  range: string,
): Promise<string[][]> {
  const client = await auth.getClient();
  const url = `${SHEETS_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  const res = await client.request<{ values?: string[][] }>({ url });
  return res.data.values ?? [];
}

async function fetchColumns(
  spreadsheetId: string,
  auth: GoogleAuth,
  range: string,
): Promise<string[][]> {
  return fetchColumn(spreadsheetId, auth, range);
}

/** Find the 1-based row number of a match (skips header row). Returns null if not found. */
export function findRowIndex(
  values: string[][],
  predicate: (cell: string, row: string[]) => boolean,
): number | null {
  // Row 0 is the header, data starts at row 1 (1-based row 2)
  for (let i = 1; i < values.length; i++) {
    const row = values[i]!;
    if (predicate(row[0] ?? "", row)) return i + 1; // 1-based row number
  }
  return null;
}

async function resolveSheetId(
  spreadsheetId: string,
  auth: GoogleAuth,
  sheetName: string,
): Promise<number> {
  const client = await auth.getClient();
  const url = `${SHEETS_BASE}/${spreadsheetId}?fields=sheets.properties`;
  const res = await client.request<{
    sheets: { properties: { title: string; sheetId: number } }[];
  }>({ url });
  const sheet = res.data.sheets.find(
    (s) => s.properties.title.toLowerCase() === sheetName.toLowerCase(),
  );
  if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);
  return sheet.properties.sheetId;
}
