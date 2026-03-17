export interface ReferenceDataConfig {
  spreadsheetId: string;
  cardsRange: string;
  fusionsRange: string;
}

export function getReferenceDataConfig(env: NodeJS.ProcessEnv = process.env): ReferenceDataConfig {
  return {
    spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID_REFERENCE ?? "",
    cardsRange: env.GOOGLE_SHEETS_CARDS_RANGE ?? "Cards!A:Z",
    fusionsRange: env.GOOGLE_SHEETS_FUSIONS_RANGE ?? "Fusions!A:Z",
  };
}
