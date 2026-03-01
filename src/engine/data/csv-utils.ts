/**
 * Enum representing column indices in the CSV file
 */
export enum CsvColumn {
  A = 0,
  B = 1,
  C = 2,
  D = 3,
  E = 4,
  F = 5,
  G = 6,
  H = 7,
  I = 8,
  J = 9,
  K = 10,
  L = 11,
  M = 12,
  N = 13,
  O = 14,
  P = 15,
  Q = 16,
  R = 17,
  S = 18,
  T = 19,
  U = 20,
  V = 21,
  W = 22,
  X = 23,
  Y = 24,
}

/**
 * Read a string value from a specific column in a CSV line
 */
export function readCol(line: string[], col: keyof typeof CsvColumn): string {
  const colIndex = CsvColumn[col];
  return line[colIndex]?.trim() ?? "";
}

/**
 * Read a numeric value from a specific column in a CSV line
 */
export function readColNum(line: string[], col: keyof typeof CsvColumn): number {
  return +readCol(line, col) || 0;
}
