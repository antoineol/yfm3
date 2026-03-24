// ---------------------------------------------------------------------------
// Public API: loadDiscData(), extractAllCsvs(), extractAllArtwork()
// ---------------------------------------------------------------------------

import fs from "node:fs";
import { cardsToCsv, duelistsToCsv, equipsToCsv, fusionsToCsv } from "./csv.ts";
import { detectAttributeMapping, detectExeLayout } from "./detect-exe.ts";
import { detectWaMrgLayout } from "./detect-wamrg.ts";
import { extractCards } from "./extract-cards.ts";
import { extractDuelists } from "./extract-duelists.ts";
import { extractEquips } from "./extract-equips.ts";
import { extractFusions } from "./extract-fusions.ts";
import {
  findFile,
  PVD_SECTOR,
  parseDirectory,
  readIsoFile,
  readSector,
  readSectors,
  SECTOR_DATA_SIZE,
} from "./iso9660.ts";
import type { WaMrgTextBlock } from "./types.ts";

// Re-export for consumers
export { extractAllArtwork, FULL_IMG_HEIGHT, FULL_IMG_WIDTH } from "./extract-images.ts";
export type { CardStats, DuelistData, EquipEntry, Fusion, WaMrgLayout } from "./types.ts";

// ---------------------------------------------------------------------------
// WA_MRG text block scanning (PAL/EU versions)
// ---------------------------------------------------------------------------

/** Binary signature at the start of every card description section.
 *  Appears exactly once per language in PAL WA_MRG. */
const DESC_HEADER_MARKER = Buffer.from([0x31, 0xf8, 0x03, 0x8c, 0xf8, 0x1b, 0x80]);

/** Find ALL PAL text blocks in WA_MRG (one per language).
 *  Returns an array of up to 5 blocks sorted by offset, or an empty array
 *  if the file doesn't contain embedded text (US/RP versions). */
function findAllWaMrgTextBlocks(waMrg: Buffer): WaMrgTextBlock[] {
  const blocks: WaMrgTextBlock[] = [];

  // Step 1: Find all occurrences of the description header marker
  const descStarts: number[] = [];
  for (let i = 0; i < waMrg.length - DESC_HEADER_MARKER.length; i++) {
    if (waMrg.subarray(i, i + DESC_HEADER_MARKER.length).equals(DESC_HEADER_MARKER)) {
      const end = waMrg.indexOf(0xff, i);
      if (end !== -1 && end - i < 200) {
        descStarts.push(i);
      }
    }
  }

  if (descStarts.length === 0) return [];

  // Step 2: For each description marker, find the corresponding name block
  for (const descStart of descStarts) {
    let pos = descStart;
    let strCount = 0;
    while (pos < waMrg.length && strCount < 800) {
      const end = waMrg.indexOf(0xff, pos);
      if (end === -1 || end - pos > 500) break;
      strCount++;
      pos = end + 1;
    }

    let nameStart = -1;
    let scanPos = pos;
    while (scanPos < waMrg.length && scanPos < descStart + 0x30000) {
      const runStart = scanPos;
      let runLen = 0;
      let p = scanPos;
      while (p < waMrg.length && runLen < 900) {
        const end = waMrg.indexOf(0xff, p);
        if (end === -1 || end - p > 500) break;
        runLen++;
        p = end + 1;
      }
      if (runLen >= 800) {
        nameStart = runStart;
        break;
      }
      scanPos = p;
      while (scanPos < waMrg.length) {
        const end = waMrg.indexOf(0xff, scanPos);
        if (end === -1) break;
        if (end - scanPos < 500) break;
        scanPos = end + 1;
      }
    }

    if (nameStart !== -1) {
      blocks.push({ descBlockStart: descStart, nameBlockStart: nameStart });
    }
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// Disc loading
// ---------------------------------------------------------------------------

export function loadDiscData(binPath: string): { slus: Buffer; waMrg: Buffer } {
  const bin = fs.readFileSync(binPath);

  const pvd = readSector(bin, PVD_SECTOR);
  if (pvd.subarray(1, 6).toString("ascii") !== "CD001") {
    throw new Error("Not a valid ISO 9660 disc image");
  }

  const rootRecord = pvd.subarray(156, 190);
  const rootExtent = rootRecord.readUInt32LE(2);
  const rootSize = rootRecord.readUInt32LE(10);
  const rootData = readSectors(bin, rootExtent, Math.ceil(rootSize / SECTOR_DATA_SIZE));
  const rootFiles = parseDirectory(rootData, rootSize);

  const exeEntry = rootFiles.find((f) => /^S[CL][A-Z]{2}_\d/.test(f.name));
  if (!exeEntry) {
    throw new Error(
      `No PS1 executable found in disc image (files: ${rootFiles.map((f) => f.name).join(", ")})`,
    );
  }

  return { slus: readIsoFile(bin, exeEntry), waMrg: findFile(bin, rootFiles, "DATA/WA_MRG.MRG") };
}

// ---------------------------------------------------------------------------
// Full CSV extraction
// ---------------------------------------------------------------------------

export function extractAllCsvs(slus: Buffer, waMrg: Buffer): Record<string, string> {
  const exeLayout = detectExeLayout(slus);
  const waMrgLayout = detectWaMrgLayout(waMrg);
  const cardAttributes = detectAttributeMapping(slus, exeLayout);
  const waMrgTextBlocks = exeLayout.nameOffsetTable === -1 ? findAllWaMrgTextBlocks(waMrg) : [];

  const cards = extractCards(slus, waMrg, exeLayout, waMrgLayout, cardAttributes, waMrgTextBlocks);
  const fusions = extractFusions(waMrg, waMrgLayout);
  const equips = extractEquips(waMrg, waMrgLayout);
  const duelists = extractDuelists(slus, waMrg, exeLayout, waMrgLayout, waMrgTextBlocks);
  const cardAtk = new Map(cards.map((c) => [c.id, c.atk]));

  return {
    "cards.csv": cardsToCsv(cards),
    "fusions.csv": fusionsToCsv(fusions, cardAtk),
    "equips.csv": equipsToCsv(equips),
    "duelists.csv": duelistsToCsv(duelists),
  };
}

/** Detect layout and return the artwork block size (needed by CLI for artwork extraction). */
export function detectArtworkBlockSize(waMrg: Buffer): number {
  return detectWaMrgLayout(waMrg).artworkBlockSize;
}
