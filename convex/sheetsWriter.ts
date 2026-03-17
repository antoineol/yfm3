const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

// --- Public helpers: find, append, update, delete ---

export async function findCardRow(
  spreadsheetId: string,
  token: string,
  name: string,
): Promise<number | null> {
  const values = await fetchRange(spreadsheetId, token, "Cards!B:B");
  return findRowIndex(values, (cell) => cell.trim().toLowerCase() === name.trim().toLowerCase());
}

export async function findFusionRow(
  spreadsheetId: string,
  token: string,
  materialA: string,
  materialB: string,
): Promise<number | null> {
  const values = await fetchRange(spreadsheetId, token, "Fusions!A:B");
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
  token: string,
  sheetRange: string,
  values: string[],
): Promise<void> {
  const url = `${SHEETS_BASE}/${spreadsheetId}/values/${encodeURIComponent(sheetRange)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  await sheetsRequest(url, token, "POST", { values: [values] });
}

export async function updateRow(
  spreadsheetId: string,
  token: string,
  sheetRange: string,
  values: string[],
): Promise<void> {
  const url = `${SHEETS_BASE}/${spreadsheetId}/values/${encodeURIComponent(sheetRange)}?valueInputOption=RAW`;
  await sheetsRequest(url, token, "PUT", { values: [values] });
}

export async function deleteRow(
  spreadsheetId: string,
  token: string,
  sheetName: string,
  rowIndex: number,
): Promise<void> {
  const sheetId = await resolveSheetId(spreadsheetId, token, sheetName);
  const url = `${SHEETS_BASE}/${spreadsheetId}:batchUpdate`;
  await sheetsRequest(url, token, "POST", {
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
  });
}

// --- Internal helpers ---

async function fetchRange(spreadsheetId: string, token: string, range: string): Promise<string[][]> {
  const url = `${SHEETS_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  const data = await sheetsRequest<{ values?: string[][] }>(url, token);
  return data.values ?? [];
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

async function resolveSheetId(spreadsheetId: string, token: string, sheetName: string): Promise<number> {
  const url = `${SHEETS_BASE}/${spreadsheetId}?fields=sheets.properties`;
  const data = await sheetsRequest<{
    sheets: { properties: { title: string; sheetId: number } }[];
  }>(url, token);
  const sheet = data.sheets.find((s) => s.properties.title.toLowerCase() === sheetName.toLowerCase());
  if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);
  return sheet.properties.sheetId;
}

async function sheetsRequest<T = unknown>(
  url: string,
  token: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(`Sheets API ${method} failed: ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}
