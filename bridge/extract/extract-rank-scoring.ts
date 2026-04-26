import type { RankFactorKey, RankScoringData, RankScoringFactor } from "./types.ts";

type RawRankRow = {
  limits: number[];
  points: number[];
};

const ROW_COUNT = 10;
const PAIRS_PER_ROW = 5;
const PAIR_SIZE = 4;
const ROW_SIZE = PAIRS_PER_ROW * PAIR_SIZE;
const TABLE_SIZE = ROW_COUNT * ROW_SIZE;
const OPEN_LIMIT = 0x7fff;
const STARTING_DECK_SIZE = 40;

const FIRST_ROW_SIGNATURE = Buffer.from([
  0x05, 0x00, 0x0c, 0x00, 0x09, 0x00, 0x08, 0x00, 0x1d, 0x00, 0x00, 0x00, 0x21, 0x00, 0xf8, 0xff,
  0xff, 0x7f, 0xf4, 0xff,
]);

const GAME_TO_APP_FACTORS: readonly {
  gameIndex: number;
  key: RankFactorKey;
  name: string;
  usesCardsRemaining?: boolean;
}[] = [
  { gameIndex: 0, key: "turns", name: "Turns" },
  { gameIndex: 1, key: "effectiveAttacks", name: "Eff. attacks" },
  { gameIndex: 2, key: "defensiveWins", name: "Def. wins" },
  { gameIndex: 3, key: "faceDownPlays", name: "Face-downs" },
  { gameIndex: 8, key: "fusionsInitiated", name: "Fusions" },
  { gameIndex: 9, key: "equipMagicUsed", name: "Equips" },
  { gameIndex: 4, key: "pureMagicUsed", name: "Magic" },
  { gameIndex: 5, key: "trapsTriggered", name: "Traps" },
  { gameIndex: 6, key: "remainingCards", name: "Cards left", usesCardsRemaining: true },
  { gameIndex: 7, key: "remainingLp", name: "Remaining LP" },
];

export function extractRankScoring(image: Buffer | Uint8Array): RankScoringData | null {
  const buffer = Buffer.isBuffer(image)
    ? image
    : Buffer.from(image.buffer, image.byteOffset, image.byteLength);
  const tables = findRankTables(buffer);
  if (tables.length === 0) return null;

  const variants = countVariants(tables);
  const [selectedKey, selectedCount] = [...variants.entries()].sort((a, b) => b[1] - a[1])[0] ?? [
    "",
    0,
  ];
  const selected = tables.find((table) => serializeRows(table) === selectedKey);
  if (!selected) return null;

  if (selectedCount !== tables.length) {
    console.warn(
      `Rank scoring extraction found ${variants.size} table variants; using majority ` +
        `(${selectedCount}/${tables.length})`,
    );
  }

  return {
    source: "bin-majority",
    tableCount: tables.length,
    selectedCount,
    variantCount: variants.size,
    factors: toAppFactors(selected),
  };
}

function findRankTables(buffer: Buffer): RawRankRow[][] {
  const tables: RawRankRow[][] = [];
  let offset = buffer.indexOf(FIRST_ROW_SIGNATURE);
  while (offset !== -1) {
    const table = parseTable(buffer, offset);
    if (table) tables.push(table);
    offset = buffer.indexOf(FIRST_ROW_SIGNATURE, offset + 1);
  }
  return tables;
}

function parseTable(buffer: Buffer, offset: number): RawRankRow[] | null {
  if (offset < 0 || offset + TABLE_SIZE > buffer.length) return null;

  const rows: RawRankRow[] = [];
  for (let rowIndex = 0; rowIndex < ROW_COUNT; rowIndex++) {
    const rowOffset = offset + rowIndex * ROW_SIZE;
    const row = parseRow(buffer, rowOffset);
    if (!row) return null;
    rows.push(row);
  }
  return rows;
}

function parseRow(buffer: Buffer, offset: number): RawRankRow | null {
  const limits: number[] = [];
  const points: number[] = [];

  for (let pairIndex = 0; pairIndex < PAIRS_PER_ROW; pairIndex++) {
    const pairOffset = offset + pairIndex * PAIR_SIZE;
    limits.push(buffer.readInt16LE(pairOffset));
    points.push(buffer.readInt16LE(pairOffset + 2));
  }

  if (limits[limits.length - 1] !== OPEN_LIMIT) return null;
  for (let i = 1; i < limits.length; i++) {
    const previous = limits[i - 1];
    const current = limits[i];
    if (previous === undefined || current === undefined || current <= previous) return null;
  }
  if (points.some((point) => point < -100 || point > 100)) return null;

  return { limits, points };
}

function countVariants(tables: readonly RawRankRow[][]): Map<string, number> {
  const variants = new Map<string, number>();
  for (const table of tables) {
    const key = serializeRows(table);
    variants.set(key, (variants.get(key) ?? 0) + 1);
  }
  return variants;
}

function serializeRows(rows: readonly RawRankRow[]): string {
  return JSON.stringify(rows);
}

function toAppFactors(rows: readonly RawRankRow[]): RankScoringFactor[] {
  return GAME_TO_APP_FACTORS.map(({ gameIndex, key, name, usesCardsRemaining }) => {
    const row = rows[gameIndex];
    if (!row) {
      throw new Error(`Rank scoring table is missing row ${gameIndex}`);
    }
    const scoring = usesCardsRemaining ? cardsUsedToCardsRemaining(row) : directRow(row);
    return { key, name, thresholds: scoring.thresholds, points: scoring.points };
  });
}

function directRow(row: RawRankRow): { thresholds: number[]; points: number[] } {
  return {
    thresholds: row.limits.slice(0, -1),
    points: [...row.points],
  };
}

function cardsUsedToCardsRemaining(row: RawRankRow): { thresholds: number[]; points: number[] } {
  return {
    thresholds: row.limits
      .slice(0, -1)
      .reverse()
      .map((limit) => STARTING_DECK_SIZE - limit + 1),
    points: [...row.points].reverse(),
  };
}
