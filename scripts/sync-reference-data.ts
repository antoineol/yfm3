import { writeFile } from "node:fs/promises";
import {
  createGoogleSheetsClient,
  readServiceAccountFromEnv,
} from "../src/server/reference/google-sheets-client.ts";
import { getReferenceDataConfig } from "../src/shared/reference-data-config.ts";

type Row = Record<string, string>;

async function main() {
  const config = getReferenceDataConfig();
  if (!config.spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID_REFERENCE");
  }

  const client = createGoogleSheetsClient(readServiceAccountFromEnv());
  const [cardsGrid, fusionsGrid] = await Promise.all([
    client.getValues(config.spreadsheetId, config.cardsRange),
    client.getValues(config.spreadsheetId, config.fusionsRange),
  ]);

  const cards = parseGrid(cardsGrid);
  const fusions = parseGrid(fusionsGrid);
  validateCards(cards);
  validateFusions(fusions);

  await writeFile(config.cardsSnapshotPath, toCsv(cards), "utf8");
  await writeFile(config.fusionsSnapshotPath, toCsv(fusions), "utf8");

  console.log(
    `Synced reference data snapshots: ${cards.length} cards -> ${config.cardsSnapshotPath}, ${fusions.length} fusions -> ${config.fusionsSnapshotPath}`,
  );
}

function parseGrid(grid: string[][]): Row[] {
  const [headerRow = [], ...rows] = grid;
  const headers = headerRow.map((value) => value.trim()).filter((value) => value.length > 0);
  return rows
    .filter((row) => row.some((cell) => cell.trim() !== ""))
    .map((row) => {
      const out: Row = {};
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        if (!header) continue;
        out[header] = row[i]?.trim() ?? "";
      }
      return out;
    });
}

function validateCards(cards: Row[]) {
  const ids = new Set<string>();
  for (const card of cards) {
    for (const key of ["cardId", "name", "attack", "defense", "status"]) {
      if (!card[key]) {
        throw new Error(`Cards row missing ${key}`);
      }
    }
    const cardId = card.cardId ?? "";
    if (ids.has(cardId)) {
      throw new Error(`Duplicate cardId in cards sheet: ${cardId}`);
    }
    ids.add(cardId);
  }
}

function validateFusions(fusions: Row[]) {
  const keys = new Set<string>();
  for (const fusion of fusions) {
    for (const key of [
      "materialA",
      "materialB",
      "resultName",
      "resultAttack",
      "resultDefense",
      "status",
    ]) {
      if (!fusion[key]) {
        throw new Error(`Fusions row missing ${key}`);
      }
    }
    const key = [fusion.materialA ?? "", fusion.materialB ?? "", fusion.resultName ?? ""]
      .map((value) => (value ?? "").toLowerCase())
      .sort()
      .join("|");
    if (keys.has(key)) {
      throw new Error(
        `Duplicate fusion pair in fusions sheet: ${fusion.materialA} + ${fusion.materialB}`,
      );
    }
    keys.add(key);
  }
}

function toCsv(rows: Row[]): string {
  if (rows.length === 0) {
    return "";
  }
  const firstRow = rows[0];
  if (!firstRow) return "";
  const headers = Object.keys(firstRow);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header] ?? "")).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

await main();
