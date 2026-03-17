"use node";

import { createSign } from "node:crypto";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

type CardRow = {
  cardId: number; name: string; attack: number; defense: number;
  kind1?: string; kind2?: string; kind3?: string; color?: string;
};
type FusionRow = {
  materialA: string; materialB: string; resultName: string;
  resultAttack: number; resultDefense: number;
};

export const syncFromSheets = action({
  args: {},
  handler: async (ctx): Promise<{ importedAt: number }> => {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID_REFERENCE ?? "";
    if (!spreadsheetId) throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID_REFERENCE");
    const [cardsGrid, fusionsGrid] = await Promise.all([
      fetchSheetValues(spreadsheetId, process.env.GOOGLE_SHEETS_CARDS_RANGE ?? "Cards!A:Z"),
      fetchSheetValues(spreadsheetId, process.env.GOOGLE_SHEETS_FUSIONS_RANGE ?? "Fusions!A:Z"),
    ]);
    return await ctx.runMutation(internal.referenceData.replaceReferenceData, {
      cards: parseCardsGrid(cardsGrid),
      fusions: parseFusionsGrid(fusionsGrid),
    });
  },
});

// --- Google Sheets fetch via service-account JWT ---

function base64Url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function fetchSheetValues(spreadsheetId: string, range: string): Promise<string[][]> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "";
  const key = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
  if (!email || !key) throw new Error("Missing Google service account credentials");

  const now = Math.floor(Date.now() / 1000);
  const h = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const p = base64Url(JSON.stringify({
    iss: email, scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: "https://oauth2.googleapis.com/token", exp: now + 3600, iat: now,
  }));
  const signer = createSign("RSA-SHA256");
  signer.update(`${h}.${p}`);
  const assertion = `${h}.${p}.${base64Url(signer.sign(key))}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  if (!tokenRes.ok) throw new Error(`Google token error: ${tokenRes.status}`);
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
    { headers: { Authorization: `Bearer ${access_token}` } },
  );
  if (!res.ok) throw new Error(`Google Sheets error: ${res.status}`);
  return ((await res.json()) as { values?: string[][] }).values ?? [];
}

// --- Grid parsing (validates + normalizes for Convex storage) ---

function norm(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

function parseCardsGrid(grid: string[][]): CardRow[] {
  const [headerRow = [], ...rows] = grid;
  const headers = headerRow.map((h) => h.trim());
  const get = (row: string[], name: string) => row[headers.indexOf(name)]?.trim() ?? "";
  const seenIds = new Set<number>();
  const seenNames = new Set<string>();

  return rows.filter((r) => r.some((c) => c.trim())).flatMap((row, i) => {
    const ln = i + 2;
    const idStr = get(row, "id");
    if (!idStr) return [];
    const cardId = Number.parseInt(idStr, 10);
    if (Number.isNaN(cardId)) throw new Error(`Row ${ln}: invalid id "${idStr}"`);
    if (seenIds.has(cardId)) throw new Error(`Row ${ln}: duplicate id ${cardId}`);
    seenIds.add(cardId);

    const name = norm(get(row, "name"));
    if (!name) throw new Error(`Row ${ln}: missing name`);
    const lower = name.toLowerCase();
    if (seenNames.has(lower)) throw new Error(`Row ${ln}: duplicate name "${name}"`);
    seenNames.add(lower);

    const attack = Number.parseInt(get(row, "attack"), 10);
    const defense = Number.parseInt(get(row, "defense"), 10);
    if (Number.isNaN(attack) || Number.isNaN(defense)) return [];

    return [{
      cardId, name, attack, defense,
      kind1: norm(get(row, "kind1")) || undefined,
      kind2: norm(get(row, "kind2")) || undefined,
      kind3: norm(get(row, "kind3")) || undefined,
      color: get(row, "color").toLowerCase() || undefined,
    }];
  });
}

function parseFusionsGrid(grid: string[][]): FusionRow[] {
  const [headerRow = [], ...rows] = grid;
  const headers = headerRow.map((h) => h.trim());
  const get = (row: string[], name: string) => row[headers.indexOf(name)]?.trim() ?? "";

  return rows.filter((r) => r.some((c) => c.trim())).map((row, i) => {
    const ln = i + 2;
    const materialA = norm(get(row, "materialA"));
    if (!materialA) throw new Error(`Row ${ln}: missing materialA`);
    const materialB = norm(get(row, "materialB"));
    if (!materialB) throw new Error(`Row ${ln}: missing materialB`);
    const resultName = norm(get(row, "resultName"));
    if (!resultName) throw new Error(`Row ${ln}: missing resultName`);
    const resultAttack = Number.parseInt(get(row, "resultAttack"), 10);
    if (Number.isNaN(resultAttack)) throw new Error(`Row ${ln}: invalid resultAttack`);
    const resultDefense = Number.parseInt(get(row, "resultDefense"), 10);
    if (Number.isNaN(resultDefense)) throw new Error(`Row ${ln}: invalid resultDefense`);
    return { materialA, materialB, resultName, resultAttack, resultDefense };
  });
}
