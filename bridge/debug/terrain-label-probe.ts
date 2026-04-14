/**
 * Probe: find the 6-entry HUD terrain label table in the PS1 executable
 * and/or WA_MRG. These are the short strings shown in the in-battle FIELD
 * overlay ("FOREST / WASTELAND / MOUNTAIN / MEADOW / SEA / DARK" in vanilla),
 * which differ from the field-card names (card IDs 330–335).
 *
 * Usage:
 *   cd bridge && bun debug/terrain-label-probe.ts ../gamedata/vanilla-bin/*.bin
 *   cd bridge && bun debug/terrain-label-probe.ts ../gamedata/rp-bin/*.bin
 */

import { detectExeLayout } from "../extract/detect-exe.ts";
import { loadDiscData } from "../extract/index.ts";
import {
  CHAR_TABLE,
  decodeTblString,
  isTblString,
  PAL_CHAR_TABLE,
} from "../extract/text-decoding.ts";

const VANILLA_LABELS = [
  "FOREST",
  "WASTELAND",
  "MOUNTAIN",
  "MEADOW",
  "SEA",
  "DARK",
  "CHAOS",
  "CANYON",
  "GAIA",
  "RAVINE",
  "TOON",
  "Chaos",
  "Canyon",
  "Gaia",
  "Ravine",
  "Toon",
  "chaos",
  "canyon",
  "Umiiruka",
];
const LABEL_MIN_LEN = 3;
const LABEL_MAX_LEN = 16;

function buildReverseTable(table: readonly string[]): Map<string, number> {
  const rev = new Map<string, number>();
  for (let b = 0; b < table.length; b++) {
    const ch = table[b];
    if (ch !== undefined && !rev.has(ch)) rev.set(ch, b);
  }
  return rev;
}

function encodeTbl(s: string, rev: Map<string, number>, terminator = true): Buffer | null {
  const bytes: number[] = [];
  for (const ch of s) {
    const b = rev.get(ch);
    if (b === undefined) return null;
    bytes.push(b);
  }
  if (terminator) bytes.push(0xff);
  return Buffer.from(bytes);
}

function findAll(buf: Buffer, needle: Buffer): number[] {
  const hits: number[] = [];
  let pos = 0;
  for (;;) {
    const next = buf.indexOf(needle, pos);
    if (next === -1) break;
    hits.push(next);
    pos = next + 1;
  }
  return hits;
}

function readRun(
  buf: Buffer,
  start: number,
  count: number,
  charTable: readonly string[],
): { strings: string[]; end: number } | null {
  const strings: string[] = [];
  let pos = start;
  for (let i = 0; i < count; i++) {
    if (!isTblString(buf, pos, LABEL_MAX_LEN + 2)) return null;
    const end = buf.indexOf(0xff, pos);
    if (end === -1) return null;
    const len = end - pos;
    if (len < LABEL_MIN_LEN || len > LABEL_MAX_LEN) return null;
    strings.push(decodeTblString(buf, pos, len, charTable as string[]));
    pos = end + 1;
  }
  return { strings, end: pos };
}

function probeWithTable(
  buf: Buffer,
  bufLabel: string,
  charTable: readonly string[],
  tableLabel: string,
  cardStats: number,
): void {
  const rev = buildReverseTable(charTable);

  // Approach 1: find the label bytes (no terminator — may be tile-indexed or
  // fixed-length), then report every match.
  for (const candidate of VANILLA_LABELS) {
    const needle = encodeTbl(candidate, rev, false);
    if (!needle) continue;
    const hits = findAll(buf, needle);
    for (const hit of hits) {
      const run = readRun(buf, hit, 6, charTable);
      if (!run) continue;
      // Must look like a terrain label run: all upper-case-ish short strings
      if (!run.strings.every((s) => /^[A-Z' -]{3,16}$/.test(s))) continue;
      const rel =
        cardStats >= 0
          ? ` (cardStats ${hit - cardStats >= 0 ? "+" : ""}0x${(hit - cardStats).toString(16)})`
          : "";
      console.log(
        `[${bufLabel}/${tableLabel}] match at 0x${hit.toString(16)}${rel}: ${run.strings.map((s) => `"${s}"`).join(", ")}`,
      );
    }

    if (hits.length > 0) {
      console.log(`[${bufLabel}/${tableLabel}] "${candidate}" total hits: ${hits.length}`);
      for (const hit of hits.slice(0, 8)) {
        const rel =
          cardStats >= 0
            ? ` (cardStats ${hit - cardStats >= 0 ? "+" : ""}0x${(hit - cardStats).toString(16)})`
            : "";
        console.log(`  at 0x${hit.toString(16)}${rel}`);
      }
    }
  }
}

function probe(path: string): void {
  console.log(`\n=== ${path} ===`);
  const { slus, waMrg, serial } = loadDiscData(path);
  console.log(`serial=${serial} slus=${slus.length} waMrg=${waMrg.length}`);

  let cardStats = -1;
  try {
    const layout = detectExeLayout(slus);
    cardStats = layout.cardStats;
    console.log(
      `cardStats=0x${cardStats.toString(16)} typeNames=0x${layout.typeNamesTable.toString(16)} gsNames=0x${layout.gsNamesTable.toString(16)}`,
    );
  } catch (err) {
    console.log(`detectExeLayout failed: ${(err as Error).message}`);
  }

  probeWithTable(slus, "SLUS", CHAR_TABLE, "CHAR_TABLE", cardStats);
  probeWithTable(slus, "SLUS", PAL_CHAR_TABLE, "PAL_CHAR_TABLE", cardStats);
  probeWithTable(waMrg, "WA_MRG", PAL_CHAR_TABLE, "PAL_CHAR_TABLE", -1);
  probeWithTable(waMrg, "WA_MRG", CHAR_TABLE, "CHAR_TABLE", -1);
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: bun debug/terrain-label-probe.ts <disc.bin> [<disc.bin>...]");
  process.exit(1);
}
for (const p of args) probe(p);
