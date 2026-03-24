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
