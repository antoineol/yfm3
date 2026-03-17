export interface ReferenceDataConfig {
  spreadsheetId: string;
  cardsRange: string;
  fusionsRange: string;
  cardsTable: "referenceCards";
  fusionsTable: "referenceFusions";
  importLogTable: "referenceImports";
  cardsSnapshotPath: string;
  fusionsSnapshotPath: string;
  snapshotOnly: boolean;
}

export function getReferenceDataConfig(env: NodeJS.ProcessEnv = process.env): ReferenceDataConfig {
  return {
    spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID_REFERENCE ?? "",
    cardsRange: env.GOOGLE_SHEETS_CARDS_RANGE ?? "Cards!A:Z",
    fusionsRange: env.GOOGLE_SHEETS_FUSIONS_RANGE ?? "Fusions!A:Z",
    cardsTable: "referenceCards",
    fusionsTable: "referenceFusions",
    importLogTable: "referenceImports",
    cardsSnapshotPath: env.REFERENCE_CARDS_SNAPSHOT_PATH ?? "data/reference/cards.csv",
    fusionsSnapshotPath: env.REFERENCE_FUSIONS_SNAPSHOT_PATH ?? "data/reference/fusions.csv",
    snapshotOnly: env.REFERENCE_DATA_SNAPSHOT_ONLY === "1",
  };
}
