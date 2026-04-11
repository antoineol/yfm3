// ---------------------------------------------------------------------------
// Public API: loadDiscData(), extractAllCsvs(), extractAllArtwork()
// ---------------------------------------------------------------------------

import fs from "node:fs";
import { cardsToCsv, duelistsToCsv, equipsToCsv, fusionsToCsv } from "./csv.ts";
import { detectAttributeMapping, detectExeLayout } from "./detect-exe.ts";
import { detectWaMrgLayout } from "./detect-wamrg.ts";
import { findAllWaMrgTextBlocks } from "./detect-wamrg-text.ts";
import { extractCards } from "./extract-cards.ts";
import { extractDuelists } from "./extract-duelists.ts";
import { extractEquips } from "./extract-equips.ts";
import { extractFusions } from "./extract-fusions.ts";
import {
  detectDiscFormat,
  findFile,
  PVD_SECTOR,
  parseDirectory,
  readIsoFile,
  readSector,
  readSectors,
  SECTOR_DATA_SIZE,
} from "./iso9660.ts";

// Re-export for consumers
export { extractAllArtwork, FULL_IMG_HEIGHT, FULL_IMG_WIDTH } from "./extract-images.ts";
export type { CardStats, DuelistData, EquipEntry, Fusion, WaMrgLayout } from "./types.ts";

// ---------------------------------------------------------------------------
// Disc loading
// ---------------------------------------------------------------------------

export function loadDiscData(discPath: string): {
  slus: Buffer;
  waMrg: Buffer;
  /** Disc serial extracted from the PS1 executable filename (e.g. "SLES_039.48"). */
  serial: string;
} {
  const bin = fs.readFileSync(discPath);
  const fmt = detectDiscFormat(bin);

  const pvd = readSector(bin, PVD_SECTOR, fmt);
  if (pvd.subarray(1, 6).toString("ascii") !== "CD001") {
    throw new Error("Not a valid ISO 9660 disc image");
  }

  const rootRecord = pvd.subarray(156, 190);
  const rootExtent = rootRecord.readUInt32LE(2);
  const rootSize = rootRecord.readUInt32LE(10);
  const rootData = readSectors(bin, rootExtent, Math.ceil(rootSize / SECTOR_DATA_SIZE), fmt);
  const rootFiles = parseDirectory(rootData, rootSize);

  const exeEntry = rootFiles.find((f) => /^S[CL][A-Z]{2}_\d/.test(f.name));
  if (!exeEntry) {
    throw new Error(
      `No PS1 executable found in disc image (files: ${rootFiles.map((f) => f.name).join(", ")})`,
    );
  }

  // Strip ISO 9660 version suffix (";1") to get the bare serial
  const serial = exeEntry.name.replace(/;.*$/, "");

  return {
    slus: readIsoFile(bin, exeEntry, fmt),
    waMrg: findFile(bin, rootFiles, "DATA/WA_MRG.MRG", fmt),
    serial,
  };
}

// ---------------------------------------------------------------------------
// Disc serial → PAL language block index
// ---------------------------------------------------------------------------

/**
 * Maps known PAL disc serials to the WA_MRG text block index (0=EN, 1=FR, 2=DE, 3=IT, 4=ES).
 * NTSC-U serials are absent — they use EXE-embedded text, not WA_MRG blocks.
 */
const SERIAL_LANG_IDX: Record<string, number> = {
  SLES_039_47: 0, // PAL English
  SLES_039_48: 1, // PAL French
  SLES_039_49: 2, // PAL German
  SLES_039_50: 3, // PAL Italian
  SLES_039_51: 4, // PAL Spanish
};

/** Resolve a disc serial to a PAL language block index, or undefined for NTSC-U / unknown. */
export function langIdxForSerial(serial: string): number | undefined {
  // Normalize: "SLES_039.48" → "SLES_039_48"
  const key = serial.replace(".", "_");
  return SERIAL_LANG_IDX[key];
}

// ---------------------------------------------------------------------------
// Full CSV extraction
// ---------------------------------------------------------------------------

/**
 * Extract all CSVs from disc data.
 * @param langIdx - PAL language block index (0–4). When undefined, uses block 0
 *   for PAL discs. Ignored for NTSC-U (text comes from the EXE, not WA_MRG).
 */
export function extractAllCsvs(
  slus: Buffer,
  waMrg: Buffer,
  langIdx?: number,
): Record<string, string> {
  const exeLayout = detectExeLayout(slus);
  const waMrgLayout = detectWaMrgLayout(waMrg);
  const cardAttributes = detectAttributeMapping(slus, exeLayout, langIdx);
  const waMrgTextBlocks = exeLayout.nameOffsetTable === -1 ? findAllWaMrgTextBlocks(waMrg) : [];

  const cards = extractCards(
    slus,
    waMrg,
    exeLayout,
    waMrgLayout,
    cardAttributes,
    waMrgTextBlocks,
    langIdx,
  );
  const fusions = extractFusions(waMrg, waMrgLayout);
  const equips = extractEquips(waMrg, waMrgLayout);
  const duelists = extractDuelists(slus, waMrg, exeLayout, waMrgLayout, waMrgTextBlocks, langIdx);
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
